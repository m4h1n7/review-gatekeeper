import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Get subscription status for the current user */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return sub;
  },
});

/** Check if user can create more profiles (used by admin page) */
export const canCreateProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { allowed: false, reason: "Not signed in" };

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (sub && sub.plan === "pro" && sub.status === "active") {
      return { allowed: true, reason: "Pro plan" };
    }

    // Pending or no subscription: not allowed
    if (sub && sub.status === "pending") {
      return { allowed: false, reason: "Pending payment", currentCount: 0, maxCount: 0 };
    }

    // Free tier: count existing businesses
    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (businesses.length >= 1) {
      return {
        allowed: false,
        reason: "Free plan limited to 1 profile",
        currentCount: businesses.length,
        maxCount: 1,
      };
    }

    return { allowed: true, reason: "Free plan" };
  },
});

/** Check if user can receive more feedback (free trial: 15 max) */
export const canReceiveFeedback = query({
  args: { businessId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { allowed: true };

    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (sub && sub.plan === "pro" && sub.status === "active") {
      return { allowed: true, plan: "pro" };
    }

    // Pending: not allowed
    if (sub && sub.status === "pending") {
      return { allowed: false, reason: "Pending payment", currentCount: 0, maxCount: 0 };
    }

    // Free tier: max 15 total feedbacks across all profiles
    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    let totalFeedback = 0;
    for (const biz of businesses) {
      const feedbacks = await ctx.db
        .query("feedback")
        .withIndex("by_businessId", (q) => q.eq("businessId", biz._id))
        .collect();
      totalFeedback += feedbacks.length;
    }

    if (totalFeedback >= 15) {
      return {
        allowed: false,
        reason: "Free plan limited to 15 feedbacks total",
        currentCount: totalFeedback,
        maxCount: 15,
      };
    }

    return { allowed: true, plan: "free", currentCount: totalFeedback, maxCount: 15 };
  },
});
