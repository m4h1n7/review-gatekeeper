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

    // Pro or Starter plan with active status: allow (Starter limited to 1 profile)
    if (sub && (sub.plan === "pro" || sub.plan === "starter") && sub.status === "active") {
      if (sub.plan === "starter") {
        const businesses = await ctx.db
          .query("businesses")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .collect();
        if (businesses.length >= 1) {
          return {
            allowed: false,
            reason: "Starter plan limited to 1 profile",
            currentCount: businesses.length,
            maxCount: 1,
          };
        }
        return { allowed: true, reason: "Starter plan" };
      }
      return { allowed: true, reason: "Pro plan" };
    }

    // Pending or no subscription: not allowed
    if (sub && sub.status === "pending") {
      return { allowed: false, reason: "Pending payment", currentCount: 0, maxCount: 0 };
    }

    return { allowed: false, reason: "No active subscription" };
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

    // Pro plan: unlimited feedback
    if (sub && sub.plan === "pro" && sub.status === "active") {
      return { allowed: true, plan: "pro" };
    }

    // Starter plan: unlimited feedback (1 profile, unlimited feedback)
    if (sub && sub.plan === "starter" && sub.status === "active") {
      return { allowed: true, plan: "starter" };
    }

    // Pending: not allowed
    if (sub && sub.status === "pending") {
      return { allowed: false, reason: "Pending payment", currentCount: 0, maxCount: 0 };
    }

    // No subscription: not allowed
    return { allowed: false, reason: "No active subscription" };
  },
});
