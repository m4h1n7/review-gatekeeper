// Auth providers for Review Gatekeeper
//
// ACTIVE CONVEX DEPLOYMENT: patient-nightingale-401
// CONVEX_SITE_URL (auto-set): https://patient-nightingale-401.convex.site
//
// Authentication: Email/Password only (no Google OAuth).
//
// Convex Environment Variables (auto-set by Convex):
//   CONVEX_SITE_URL = https://patient-nightingale-401.convex.site
//   SITE_URL        = https://patient-nightingale-401.convex.site
import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

/**
 * Returns the canonical Convex site URL used for constructing auth endpoints,
 * callback URLs, and internal HTTP calls (e.g., OTP email endpoint).
 *
 * Priority:
 *  1. CUSTOM_AUTH_SITE_URL env var (if explicitly set in Convex dashboard)
 *  2. CONVEX_SITE_URL env var (auto-set by Convex — always correct)
 *  3. Fallback error
 *
 * Trailing slashes are stripped.
 */
export function getAuthSiteUrl(): string {
  const raw =
    process.env.CUSTOM_AUTH_SITE_URL ||
    process.env.CONVEX_SITE_URL;
  if (!raw) {
    throw new Error(
      "No Convex site URL configured. Set SITE_URL env var in the Convex dashboard.",
    );
  }
  return raw.replace(/\/$/, "");
}

// Legacy alias
export function getConvexSiteUrl(): string {
  return getAuthSiteUrl();
}

/** Custom password requirements: 8+ chars, 1 uppercase, 1 number, 1 special char */
function validatePasswordRequirements(password: string) {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error("Password must contain at least 1 uppercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    throw new Error("Password must contain at least 1 number.");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new Error("Password must contain at least 1 special character.");
  }
}

/** Send OTP email via the Convex HTTP endpoint (Nodemailer SMTP) */
async function generateAndSendOTP(
  email: string,
  token: string,
  appName: string,
) {
  const siteUrl = getAuthSiteUrl();

  const res = await fetch(`${siteUrl}/api/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp: token, appName }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OTP email failed: ${err}`);
  }
}

/** Email OTP provider for sign-in verification */
const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },
  async sendVerificationRequest({ identifier: email, token }) {
    try {
      const appName = process.env.VLY_APP_NAME || "STAR CATCH Reviews";
      await generateAndSendOTP(email, token, appName);
    } catch (error) {
      throw new Error(
        `Failed to send OTP email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

/** Email OTP provider for password reset flow */
const passwordResetEmail = Email({
  id: "password-reset-email",
  maxAge: 60 * 15, // 15 minutes
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },
  async sendVerificationRequest({ identifier: email, token }) {
    try {
      const appName = process.env.VLY_APP_NAME || "STAR CATCH Reviews";
      await generateAndSendOTP(email, token, appName);
    } catch (error) {
      throw new Error(
        `Failed to send reset code email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      validatePasswordRequirements,
      reset: passwordResetEmail,
    }),
    emailOtp,
    Anonymous,
  ],
});
