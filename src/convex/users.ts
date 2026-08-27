import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// Mirror of src/lib/constants.ts — backend can't import client code
const SUPER_ADMIN_EMAILS = ["mahinhosen870@gmail.com", "atazwar103@gmail.com", "starcatchbd@gmail.com"];

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
 * Get the current user's account status (active, suspended, deleted).
 */
export const getAccountStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Super admins are always active
    if (SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) return "active";

    return (user as any).accountStatus ?? "active";
  },
});

/**
 * Get the currently active system announcement (shown on all dashboards).
 */
export const getActiveAnnouncement = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("announcements")
      .withIndex("by_active", (q) => q.eq("active", true))
      .first();
    if (!active) return null;
    return {
      title: active.title,
      message: active.message,
    };
  },
});

/**
 * Check if a business owner's account is suspended (for public review pages).
 */
export const isBusinessOwnerSuspended = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = (await ctx.db.get(args.userId as any)) as any;
    if (!user) return false;
    // Super admins are never suspended
    if (SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) return false;
    return user.accountStatus === "suspended";
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

/**
 * Check if the current user's email has been verified via OTP.
 */
export const isEmailVerified = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    if (!user) return false;

    // Super admin emails are auto-verified
    if (SUPER_ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")) return true;

    return user.emailVerified === true;
  },
});

/**
 * Generate and store a 6-digit OTP for email verification after signup.
 * The actual email is sent via the HTTP endpoint /api/send-otp.
 * This mutation stores the OTP on the user record for later verification.
 */
export const sendSignupOtp = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    await ctx.db.patch(userId, {
      signupOtp: otp,
      signupOtpExpiry: expiry,
    });

    return { ok: true, otp };
  },
});

/**
 * Get the current user's role and routing info.
 * Returns: { role, isAdmin, email } for role-based redirect decisions.
 */
export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { role: null, isAdmin: false, email: null };

    const user = await ctx.db.get(userId);
    if (!user) return { role: null, isAdmin: false, email: null };

    const email = user.email?.toLowerCase() ?? "";
    const isAdmin = SUPER_ADMIN_EMAILS.includes(email) || user.role === "admin";

    return {
      role: user.role ?? (isAdmin ? "admin" : "client"),
      isAdmin,
      email: user.email ?? null,
    };
  },
});

/**
 * Verify the signup OTP and mark the user's email as verified.
 */
export const verifySignupOtp = mutation({
  args: { otp: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.signupOtp !== args.otp) {
      throw new Error("Invalid verification code");
    }

    if (!user.signupOtpExpiry || user.signupOtpExpiry < Date.now()) {
      throw new Error("Verification code has expired. Please request a new one.");
    }

    await ctx.db.patch(userId, {
      emailVerified: true,
      signupOtp: undefined,
      signupOtpExpiry: undefined,
    });

    return { ok: true };
  },
});
