import { mutation, query } from "./_generated/server";
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

    // Pro, Starter, or Trial plan with active status: allow (Starter limited to 1 profile)
    if (sub && (sub.plan === "pro" || sub.plan === "starter" || sub.plan === "trial") && sub.status === "active") {
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

/** Check if the current user has already used a trial */
export const hasTrialUsed = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { used: false };

    const user = await ctx.db.get(userId);
    if (!user) return { used: false };

    return { used: user.hasUsedTrial === true };
  },
});

/** Claim the 10-day free trial — one per email, no payment required */
export const claimTrial = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in to start a free trial");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Enforce strict one-trial-per-email
    if (user.hasUsedTrial) {
      throw new Error(
        "This Gmail account has already redeemed a 10-Day Free Trial. Please upgrade to Starter or Business Pro plan."
      );
    }

    // Check if there's already an active or pending subscription (paid or trial)
    const existingSub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();
    const trialExpiresAt = now + 10 * 24 * 60 * 60 * 1000; // 10 days

    if (existingSub && (existingSub.status === "active" || existingSub.plan === "trial")) {
      // If they already have an active trial or paid sub, don't allow another
      if (existingSub.plan === "trial" && existingSub.status === "active") {
        throw new Error("You already have an active free trial.");
      }
      throw new Error("You already have an active subscription. Please cancel it before starting a trial.");
    }

    // Mark email as having used trial (permanent, survives account deletion/recreation)
    await ctx.db.patch(userId, { hasUsedTrial: true });

    if (existingSub) {
      // Upgrade existing subscription record to trial
      await ctx.db.patch(existingSub._id, {
        plan: "trial",
        status: "active",
        createdAt: now,
        expiresAt: trialExpiresAt,
        proExpiresAt: trialExpiresAt,
      });
    } else {
      // Create new trial subscription
      await ctx.db.insert("subscriptions", {
        userId,
        plan: "trial",
        status: "active",
        createdAt: now,
        expiresAt: trialExpiresAt,
        proExpiresAt: trialExpiresAt,
      });
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      adminEmail: "system",
      action: "TRIAL_CLAIMED",
      targetUser: userId,
      targetEmail: user.email ?? "unknown",
      details: `Free trial activated, expires: ${new Date(trialExpiresAt).toISOString()}`,
      createdAt: now,
    });

    return { ok: true, expiresAt: trialExpiresAt };
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

    // Trial plan: full Pro features for 10 days
    if (sub && sub.plan === "trial" && sub.status === "active") {
      return { allowed: true, plan: "trial" };
    }

    // No subscription: not allowed
    return { allowed: false, reason: "No active subscription" };
  },
});
