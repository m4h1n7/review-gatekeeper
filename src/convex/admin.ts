import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const SUPER_ADMIN_EMAILS = ["mahinhosen870@gmail.com", "atazwar103@gmail.com", "starcatchbd@gmail.com"];
const PRO_MONTHLY_PRICE_BDT = 1000;

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

      // Get total interactions across all businesses
      let totalInteractions = 0;
      for (const biz of businesses) {
        const interactions = await ctx.db
          .query("interactions")
          .withIndex("by_businessId", (q: any) =>
            q.eq("businessId", biz._id),
          )
          .collect();
        totalInteractions += interactions.length;
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

/** Admin: get all active announcements */
export const getAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("announcements")
      .order("desc")
      .collect();
    return all.map((a) => ({
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
