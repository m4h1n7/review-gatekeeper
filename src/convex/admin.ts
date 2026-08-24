import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const SUPER_ADMIN_EMAILS = ["mahinhosen870@gmail.com", "atazwar103@gmail.com", "starcatchbd@gmail.com"];
const PRO_MONTHLY_PRICE_BDT = 1000;
const MASTER_PIN = "STAR2026";

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user || !SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) {
    throw new Error("Unauthorized: super admin only");
  }
  return userId;
}

/** High-level KPI cards for the admin command center */
export const adminKPIs = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Total registered businesses
    const allBusinesses = await ctx.db.query("businesses").collect();
    const totalBusinesses = allBusinesses.length;

    // Total interactions (reviews routed) across all time
    const allInteractions = await ctx.db.query("interactions").collect();
    const totalReviewsRouted = allInteractions.length;

    // Subscriptions
    const allSubs = await ctx.db.query("subscriptions").collect();
    const activeProSubs = allSubs.filter(
      (s: any) => s.plan === "pro" && s.status === "active",
    ).length;
    const pendingSubs = allSubs.filter(
      (s: any) => s.status === "pending",
    ).length;

    // Pending payments
    const pendingPayments = await ctx.db
      .query("payments")
      .withIndex("by_status", (q: any) => q.eq("status", "pending"))
      .collect();
    const pendingApprovals = pendingPayments.length;

    // MRR: active Pro subs × monthly price
    const mrr = activeProSubs * PRO_MONTHLY_PRICE_BDT;

    // Total gross revenue: sum of all approved payments
    const approvedPayments = await ctx.db
      .query("payments")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();
    const totalGrossRevenue = approvedPayments.length * PRO_MONTHLY_PRICE_BDT;

    return {
      totalBusinesses,
      activeProSubs,
      pendingApprovals,
      totalReviewsRouted,
      mrr,
      totalGrossRevenue,
      pendingSubs,
    };
  },
});

/** Monthly revenue breakdown for the bar chart */
export const monthlyRevenue = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const approvedPayments = await ctx.db
      .query("payments")
      .withIndex("by_status", (q: any) => q.eq("status", "approved"))
      .collect();

    // Group by month (YYYY-MM)
    const monthMap: Record<string, { count: number; revenue: number }> = {};

    for (const p of approvedPayments) {
      const date = new Date(p.reviewedAt ?? p.submittedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) {
        monthMap[key] = { count: 0, revenue: 0 };
      }
      monthMap[key].count += 1;
      monthMap[key].revenue += PRO_MONTHLY_PRICE_BDT;
    }

    // Also include pending payments as "expected" revenue for current month
    const pendingPayments = await ctx.db
      .query("payments")
      .withIndex("by_status", (q: any) => q.eq("status", "pending"))
      .collect();

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[currentMonthKey]) {
      monthMap[currentMonthKey] = { count: 0, revenue: 0 };
    }
    for (const p of pendingPayments) {
      monthMap[currentMonthKey].count += 1;
      monthMap[currentMonthKey].revenue += PRO_MONTHLY_PRICE_BDT;
    }

    // Sort by month and format
    const months = Object.keys(monthMap).sort();
    return months.map((key) => {
      const [year, month] = key.split("-");
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      return {
        month: key,
        label: `${monthNames[parseInt(month, 10) - 1]} ${year}`,
        count: monthMap[key].count,
        revenue: monthMap[key].revenue,
      };
    });
  },
});

/** Full directory of all registered clients with subscription info */
export const allClients = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    const results = [];

    for (const user of allUsers) {
      // Skip anonymous users
      if (user.isAnonymous) continue;

      // Get subscription
      const sub = await ctx.db
        .query("subscriptions")
        .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
        .first();

      // Get businesses
      const businesses = await ctx.db
        .query("businesses")
        .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
        .collect();

      // Get total interactions across all businesses + last scan timestamp
      let totalInteractions = 0;
      let lastScanAt = 0;
      for (const biz of businesses) {
        const interactions = await ctx.db
          .query("interactions")
          .withIndex("by_businessId", (q: any) =>
            q.eq("businessId", biz._id),
          )
          .collect();
        totalInteractions += interactions.length;
        for (const interaction of interactions) {
          if (interaction.createdAt > lastScanAt) {
            lastScanAt = interaction.createdAt;
          }
        }
      }

      // Check if subscription is expired
      const isExpired =
        sub?.expiresAt !== undefined && sub.expiresAt < Date.now();

      // Calculate days remaining
      const daysRemaining = sub?.expiresAt
        ? Math.max(0, Math.ceil((sub.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

      results.push({
        userId: user._id,
        name: user.name ?? "Unnamed",
        email: user.email ?? "No email",
        accountStatus: (user as any).accountStatus ?? "active",
        archivedAt: (user as any).archivedAt ?? null,
        onboardingCompleted: user.onboardingCompleted ?? false,
        businessCount: businesses.length,
        businessCategory: businesses[0]?.category ?? null,
        businessName: businesses[0]?.name ?? null,
        businessSlug: businesses[0]?.slug ?? null,
        createdAt: businesses[0]?.createdAt ?? 0,
        subscription: sub
          ? {
              plan: sub.plan,
              status: isExpired ? "expired" : sub.status,
              expiresAt: sub.expiresAt,
              proExpiresAt: sub.proExpiresAt,
              createdAt: sub.createdAt,
              daysRemaining,
            }
          : null,
        totalInteractions,
        lastScanAt: lastScanAt || null,
      });
    }

    // Sort by most recent business creation
    results.sort((a, b) => b.createdAt - a.createdAt);

    return results;
  },
});

/** Admin mutation: extend a client's subscription by N days */
export const extendSubscription = mutation({
  args: {
    userId: v.string(),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();

    if (!sub) {
      // Create a new Pro subscription
      const expiresAt = Date.now() + args.days * 24 * 60 * 60 * 1000;
      await ctx.db.insert("subscriptions", {
        userId: args.userId,
        plan: "pro",
        status: "active",
        createdAt: Date.now(),
        expiresAt,
        proExpiresAt: expiresAt,
      });
      return { ok: true, action: "created" };
    }

    // Extend existing subscription
    const currentExpiry = sub.expiresAt ?? Date.now();
    // If already expired, start from now
    const startFrom = currentExpiry < Date.now() ? Date.now() : currentExpiry;
    const newExpiry = startFrom + args.days * 24 * 60 * 60 * 1000;

    await ctx.db.patch(sub._id, {
      plan: "pro",
      status: "active",
      expiresAt: newExpiry,
      proExpiresAt: newExpiry,
    });

    await logAuditAction(ctx, "EXTEND_SUBSCRIPTION", args.userId, undefined, `Extended by ${args.days} days`);
    return { ok: true, action: "extended" };
  },
});

/** Admin mutation: cancel a client's subscription */
export const cancelSubscription = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
      .first();

    if (!sub) return { ok: false, reason: "No subscription found" };

    await ctx.db.patch(sub._id, {
      status: "cancelled",
    });

    await logAuditAction(ctx, "CANCEL_SUBSCRIPTION", args.userId);
    return { ok: true };
  },
});

/** Admin mutation: manually create a new client account */
export const createClient = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    businessName: v.string(),
    plan: v.union(v.literal("starter"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check if user with this email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q: any) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error(`A user with email ${args.email} already exists (ID: ${existing._id}). Cannot create duplicate.`);
    }

    // Create a user record directly (bypasses OTP verification)
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email.toLowerCase(),
      emailVerified: true,
      onboardingCompleted: true,
      accountStatus: "active",
    });

    // Create an active subscription
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    await ctx.db.insert("subscriptions", {
      userId: userId as any,
      plan: args.plan,
      status: "active",
      createdAt: Date.now(),
      expiresAt,
      proExpiresAt: expiresAt,
    });

    return { ok: true, userId };
  },
});

/** Admin mutation: suspend a client account */
export const suspendClient = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId as any, { accountStatus: "suspended" });
    await logAuditAction(ctx, "SUSPEND_CLIENT", args.userId);
    return { ok: true };
  },
});

/** Admin mutation: reactivate a suspended client */
export const activateClient = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId as any, { accountStatus: "active" });
    await logAuditAction(ctx, "ACTIVATE_CLIENT", args.userId);
    return { ok: true };
  },
});

/** Admin mutation: archive a client account (30-day soft delete) */
export const archiveClient = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId as any, {
      accountStatus: "archived",
      archivedAt: Date.now(),
    });
    await logAuditAction(ctx, "ARCHIVE_CLIENT", args.userId);
    return { ok: true };
  },
});

/** Admin mutation: restore an archived client account */
export const restoreClient = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId as any, {
      accountStatus: "active",
      archivedAt: undefined,
    });
    return { ok: true };
  },
});

/** Admin mutation: permanently delete an archived account (after 30 days) */
export const permanentDelete = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId as any);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId as any, { accountStatus: "deleted" });
    return { ok: true };
  },
});

/** Announcements query — role-aware access control.
 * Super admins see ALL announcements (active + inactive).
 * Non-admin users see ONLY active/published announcements.
 */
export const getAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    let isAdmin = false;
    if (userId) {
      const user = await ctx.db.get(userId);
      isAdmin = SUPER_ADMIN_EMAILS.includes(user?.email?.toLowerCase() ?? "") || (user as any)?.role === "admin";
    }

    let announcements = await ctx.db
      .query("announcements")
      .order("desc")
      .collect();

    // Non-admin users can only see active announcements
    if (!isAdmin) {
      announcements = announcements.filter((a) => a.active);
    }

    return announcements.map((a) => ({
      id: a._id,
      title: a.title,
      message: a.message,
      active: a.active,
      createdBy: a.createdBy,
      createdAt: a.createdAt,
    }));
  },
});

/** Admin: get the currently active broadcast announcement */
export const getActiveAnnouncement = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("announcements")
      .withIndex("by_active", (q: any) => q.eq("active", true))
      .first();
    if (!active) return null;
    return {
      id: active._id,
      title: active.title,
      message: active.message,
      createdAt: active.createdAt,
    };
  },
});

/** Admin: create a new announcement */
export const createAnnouncement = mutation({
  args: {
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);

    // Deactivate any currently active announcements
    const activeAnnouncements = await ctx.db
      .query("announcements")
      .withIndex("by_active", (q: any) => q.eq("active", true))
      .collect();
    for (const a of activeAnnouncements) {
      await ctx.db.patch(a._id, { active: false });
    }

    // Create new active announcement
    const id = await ctx.db.insert("announcements", {
      title: args.title,
      message: args.message,
      active: true,
      createdBy: adminId as any,
      createdAt: Date.now(),
    });

    return { ok: true, id };
  },
});

/** Admin: toggle an announcement on/off */
export const toggleAnnouncement = mutation({
  args: {
    announcementId: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const doc = await ctx.db.get(args.announcementId as any);
    if (!doc) throw new Error("Announcement not found");

    // If activating, deactivate all others first
    if (args.active) {
      const activeOnes = await ctx.db
        .query("announcements")
        .withIndex("by_active", (q: any) => q.eq("active", true))
        .collect();
      for (const a of activeOnes) {
        if (a._id !== args.announcementId) {
          await ctx.db.patch(a._id, { active: false });
        }
      }
    }

    await ctx.db.patch(args.announcementId as any, { active: args.active });
    return { ok: true };
  },
});

/** Log an admin action to the audit trail */
async function logAuditAction(ctx: any, action: string, targetUser?: string, targetEmail?: string, details?: string) {
  const userId = await getAuthUserId(ctx);
  const user = await ctx.db.get(userId);
  const adminEmail = user?.email ?? "unknown";
  await ctx.db.insert("auditLogs", {
    adminEmail,
    action,
    targetUser,
    targetEmail,
    details,
    createdAt: Date.now(),
  });
}

/** Security audit log query */
export const getAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = args.limit ?? 50;
    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    return logs.map((l) => ({
      id: l._id,
      adminEmail: l.adminEmail,
      action: l.action,
      targetUser: l.targetUser,
      targetEmail: l.targetEmail,
      details: l.details,
      createdAt: l.createdAt,
    }));
  },
});

/** Verify master PIN for critical operations */
export const verifyMasterPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return { valid: args.pin === MASTER_PIN };
  },
});

/** System maintenance mode */
export const getMaintenanceMode = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q: any) => q.eq("key", "maintenanceMode"))
      .first();
    const msgSetting = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q: any) => q.eq("key", "maintenanceMessage"))
      .first();
    return {
      enabled: setting?.value === "true",
      message: msgSetting?.value || "System is currently under maintenance. Please try again later.",
    };
  },
});

export const toggleMaintenanceMode = mutation({
  args: {
    enabled: v.boolean(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const adminId = await requireAdmin(ctx);
    const admin = await ctx.db.get(adminId);

    // Upsert maintenanceMode
    const existing = await ctx.db
      .query("systemSettings")
      .withIndex("by_key", (q: any) => q.eq("key", "maintenanceMode"))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value: String(args.enabled), updatedAt: Date.now(), updatedBy: admin?.email });
    } else {
      await ctx.db.insert("systemSettings", { key: "maintenanceMode", value: String(args.enabled), updatedAt: Date.now(), updatedBy: admin?.email });
    }

    // Upsert maintenanceMessage
    if (args.message !== undefined) {
      const msgExisting = await ctx.db
        .query("systemSettings")
        .withIndex("by_key", (q: any) => q.eq("key", "maintenanceMessage"))
        .first();
      if (msgExisting) {
        await ctx.db.patch(msgExisting._id, { value: args.message, updatedAt: Date.now(), updatedBy: admin?.email });
      } else {
        await ctx.db.insert("systemSettings", { key: "maintenanceMessage", value: args.message, updatedAt: Date.now(), updatedBy: admin?.email });
      }
    }

    await logAuditAction(ctx, args.enabled ? "ENABLE_MAINTENANCE" : "DISABLE_MAINTENANCE", undefined, admin?.email, args.message);
    return { ok: true };
  },
});

/** Database backup export — returns anonymized client records */
export const generateBackup = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Export businesses
    const businesses = await ctx.db.query("businesses").collect();
    const backupBusinesses = businesses.map((b: any) => ({
      id: b._id,
      name: b.name,
      slug: b.slug,
      category: b.category || null,
      createdAt: b.createdAt,
      userId: b.userId,
    }));

    // Export feedback (anonymize phone/email)
    const feedbacks = await ctx.db.query("feedback").collect();
    const backupFeedbacks = feedbacks.map((f: any) => ({
      id: f._id,
      businessSlug: f.businessSlug,
      rating: f.rating,
      messageLength: f.message.length,
      hasPhone: !!f.phone,
      hasEmail: !!f.email,
      status: f.status,
      createdAt: f.createdAt,
    }));

    // Export interactions summary
    const interactions = await ctx.db.query("interactions").collect();
    const backupInteractions = interactions.map((i: any) => ({
      businessId: i.businessId,
      rating: i.rating,
      type: i.type,
      createdAt: i.createdAt,
    }));

    // Export payments (mask sensitive data)
    const payments = await ctx.db.query("payments").collect();
    const backupPayments = payments.map((p: any) => ({
      id: p._id,
      gateway: p.gateway,
      status: p.status,
      plan: p.plan,
      setupFee: p.setupFee,
      submittedAt: p.submittedAt,
      reviewedAt: p.reviewedAt,
    }));

    await logAuditAction(ctx, "BACKUP_GENERATED", undefined, undefined, `${backupBusinesses.length} businesses, ${backupFeedbacks.length} feedbacks, ${backupInteractions.length} interactions`);

    return {
      businesses: backupBusinesses,
      feedbacks: backupFeedbacks,
      interactions: backupInteractions,
      payments: backupPayments,
      generatedAt: Date.now(),
      recordCounts: {
        businesses: backupBusinesses.length,
        feedbacks: backupFeedbacks.length,
        interactions: backupInteractions.length,
        payments: backupPayments.length,
      },
    };
  },
});

/** Staff sub-account management (Business Pro) */
export const inviteStaff = mutation({
  args: {
    staffEmail: v.string(),
    staffName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    // Check if user is on Pro plan
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .first();
    if (!sub || sub.plan !== "pro" || sub.status !== "active") {
      throw new Error("Staff accounts are a Business Pro feature. Please upgrade.");
    }

    // Check for duplicate
    const existing = await ctx.db
      .query("staffAccounts")
      .withIndex("by_staffEmail", (q: any) => q.eq("staffEmail", args.staffEmail.toLowerCase()))
      .first();
    if (existing && existing.status !== "revoked") {
      throw new Error("This email already has staff access.");
    }

    // Check staff limit (max 5 per owner)
    const existingStaff = await ctx.db
      .query("staffAccounts")
      .withIndex("by_ownerId", (q: any) => q.eq("ownerId", userId))
      .collect();
    const activeStaff = existingStaff.filter((s: any) => s.status !== "revoked");
    if (activeStaff.length >= 5) {
      throw new Error("Maximum 5 staff accounts per business. Revoke an existing one first.");
    }

    if (existing && existing.status === "revoked") {
      // Reactivate
      await ctx.db.patch(existing._id, {
        status: "active",
        staffName: args.staffName,
        ownerId: userId,
      });
      return { ok: true, action: "reactivated" };
    }

    await ctx.db.insert("staffAccounts", {
      ownerId: userId,
      staffEmail: args.staffEmail.toLowerCase(),
      staffName: args.staffName,
      status: "active",
      createdAt: Date.now(),
    });

    return { ok: true, action: "invited" };
  },
});

export const revokeStaff = mutation({
  args: { staffId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const staff = await ctx.db.get(args.staffId as any);
    if (!staff) throw new Error("Staff account not found");
    if ((staff as any).ownerId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.staffId as any, { status: "revoked" });
    return { ok: true };
  },
});

export const listStaff = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const staff = await ctx.db
      .query("staffAccounts")
      .withIndex("by_ownerId", (q: any) => q.eq("ownerId", userId))
      .collect();

    return staff.map((s: any) => ({
      id: s._id,
      staffEmail: s.staffEmail,
      staffName: s.staffName,
      status: s.status,
      createdAt: s.createdAt,
    }));
  },
});

/** Admin: delete an announcement */
export const deleteAnnouncement = mutation({
  args: {
    announcementId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.announcementId as any);
    return { ok: true };
  },
});
