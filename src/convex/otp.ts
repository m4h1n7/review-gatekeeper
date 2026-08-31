"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

/**
 * Generate a 6-digit OTP, store it in the DB via sendSignupOtp mutation,
 * and send the verification email — all in a single server-side call.
 *
 * The OTP is NEVER returned to the client. It lives only in:
 *   1. The users table (signupOtp field)
 *   2. The email body sent via Nodemailer
 */
export const sendOtpEmail = action({
  args: {},
  handler: async (ctx) => {
    // 1. Generate + store OTP via mutation (returns the OTP only for email use)
    const { otp } = await ctx.runMutation(api.users.sendSignupOtp);

    // 2. Get the user's email to send the OTP to
    const user = await ctx.runQuery(api.users.currentUser);
    if (!user?.email) {
      throw new Error("No email address found for the current user.");
    }

    // 3. Send the OTP email via Nodemailer
    const emailResult = await ctx.runAction(api.email.sendOtp, {
      to: user.email,
      otp,
      appName: "STAR CATCH Reviews",
    });

    if (!emailResult.ok) {
      throw new Error(
        "Failed to send verification email. Please try again.",
      );
    }

    return { ok: true };
  },
});

/**
 * Resend OTP email: regenerates a fresh 6-digit code (invalidating the old one)
 * and sends it again. Used for the "Resend Code" button after cooldown.
 */
export const resendOtpEmail = action({
  args: {},
  handler: async (ctx) => {
    // 1. Generate a fresh OTP (overwrites the previous one in DB)
    const { otp } = await ctx.runMutation(api.users.sendSignupOtp);

    // 2. Get user email
    const user = await ctx.runQuery(api.users.currentUser);
    if (!user?.email) {
      throw new Error("No email address found for the current user.");
    }

    // 3. Send fresh OTP email
    const emailResult = await ctx.runAction(api.email.sendOtp, {
      to: user.email,
      otp,
      appName: "STAR CATCH Reviews",
    });

    if (!emailResult.ok) {
      throw new Error(
        "Failed to resend verification email. Please try again.",
      );
    }

    return { ok: true };
  },
});
