"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Check if the Nodemailer SMTP credentials are configured.
 * If not, we skip email sending and auto-verify the user's email.
 */
function isSmtpConfigured(): boolean {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

/**
 * Generate a 6-digit OTP, store it in the DB via sendSignupOtp mutation,
 * and send the verification email — all in a single server-side call.
 *
 * DEV MODE BYPASS: If SMTP credentials are not configured, the OTP is
 * still generated and stored, but instead of sending an email we auto-verify
 * the user's email directly. This prevents auth from getting stuck in
 * environments where Nodemailer/Gmail SMTP is not set up.
 *
 * The OTP is NEVER returned to the client.
 */
export const sendOtpEmail = action({
  args: {},
  handler: async (ctx) => {
    // 1. Generate + store OTP via mutation (returns the OTP only for email use)
    const { otp } = await ctx.runMutation(api.users.sendSignupOtp);

    // 2. Get the user's email
    const user = await ctx.runQuery(api.users.currentUser);
    if (!user?.email) {
      throw new Error("No email address found for the current user.");
    }

    // 3. If SMTP is not configured → skip email, auto-verify, return bypass flag
    if (!isSmtpConfigured()) {
      await ctx.runMutation(api.users.verifySignupOtp, { otp });
      return { ok: true, bypassed: true };
    }

    // 4. SMTP is configured → send the OTP email
    try {
      const emailResult = await ctx.runAction(api.email.sendOtp, {
        to: user.email,
        otp,
        appName: "STAR CATCH Reviews",
      });

      if (!emailResult.ok) {
        // Email failed but don't block auth — auto-verify as fallback
        await ctx.runMutation(api.users.verifySignupOtp, { otp });
        return { ok: true, bypassed: true, emailFailed: true };
      }
    } catch {
      // Nodemailer crashed — auto-verify as fallback
      await ctx.runMutation(api.users.verifySignupOtp, { otp });
      return { ok: true, bypassed: true, emailFailed: true };
    }

    return { ok: true };
  },
});

/**
 * Resend OTP email: regenerates a fresh 6-digit code (invalidating the old one)
 * and sends it again. Same dev-mode bypass logic as sendOtpEmail.
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

    // 3. If SMTP is not configured → skip email, auto-verify
    if (!isSmtpConfigured()) {
      await ctx.runMutation(api.users.verifySignupOtp, { otp });
      return { ok: true, bypassed: true };
    }

    // 4. SMTP configured → send fresh OTP email
    try {
      const emailResult = await ctx.runAction(api.email.sendOtp, {
        to: user.email,
        otp,
        appName: "STAR CATCH Reviews",
      });

      if (!emailResult.ok) {
        await ctx.runMutation(api.users.verifySignupOtp, { otp });
        return { ok: true, bypassed: true, emailFailed: true };
      }
    } catch {
      await ctx.runMutation(api.users.verifySignupOtp, { otp });
      return { ok: true, bypassed: true, emailFailed: true };
    }

    return { ok: true };
  },
});
