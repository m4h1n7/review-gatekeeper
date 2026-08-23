import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const SUPER_ADMIN_EMAIL = "mahinhosen870@gmail.com";
const PRO_MONTHLY_PRICE_BDT = 1000;

async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
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

      results.push({
        userId: user._id,
        name: user.name ?? "Unnamed",
        email: user.email ?? "No email",
        onboardingCompleted: user.onboardingCompleted ?? false,
        businessCount: businesses.length,
        businessCategory: businesses[0]?.category ?? null,
        businessName: businesses[0]?.name ?? null,
        createdAt: businesses[0]?.createdAt ?? 0,
        subscription: sub
          ? {
              plan: sub.plan,
              status: isExpired ? "expired" : sub.status,
              expiresAt: sub.expiresAt,
              proExpiresAt: sub.proExpiresAt,
              createdAt: sub.createdAt,
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
