import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const SUPER_ADMIN_EMAILS = ["mahinhosen870@gmail.com", "atazwar103@gmail.com"];

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

/** Update the current user's profile (name, email) */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const updates: Record<string, string> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;

    await ctx.db.patch(userId, updates);
    return { ok: true };
  },
});

/**
 * Auto-assign super_admin role to mahinhosen870@gmail.com.
 * Called after sign-in to ensure the role persists in the database.
 */
export const ensureSuperAdminRole = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const email = user.email?.toLowerCase() ?? "";
    if (SUPER_ADMIN_EMAILS.includes(email) && user.role !== "admin") {
      await ctx.db.patch(userId, { role: "admin" });
      return { assigned: true };
    }

    return { assigned: false };
  },
});

/**
 * Check if the current user has a password account (for "Set Password" vs "Change Password" UI).
 */
export const hasPasswordAccount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    // Query authAccounts for a password provider entry linked to this user
    const account = await ctx.db
      .query("authAccounts")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("provider"), "password"),
        ),
      )
      .first();

    return account !== null;
  },
});

/**
 * Check if the current user is a super admin (role-based, persistent).
 */
export const isSuperAdminUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    if (!user) return false;

    return SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "") || user.role === "admin";
  },
});

/**
 * Check if the current user has completed onboarding.
 */
export const hasCompletedOnboarding = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    if (!user) return false;

    // Super admin skips onboarding
    if (SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) return true;

    return user.onboardingCompleted === true;
  },
});
