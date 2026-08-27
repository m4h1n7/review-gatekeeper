// Auth providers for Review Gatekeeper
//
// ACTIVE CONVEX DEPLOYMENT: vibrant-chickadee-257
// CONVEX_SITE_URL (auto-set): https://vibrant-chickadee-257.convex.site
//
// Authentication: Email/Password only (no Google OAuth).
//
// Convex Environment Variables (set in Dashboard → Settings → Env Vars):
//   CUSTOM_AUTH_SITE_URL = https://vibrant-chickadee-257.convex.site
//   SITE_URL            = https://vibrant-chickadee-257.convex.site
import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

/**
 * Hardcoded active Convex deployment site URL.
 * Used for constructing internal callback URLs (OTP email endpoint, etc.)
 */
const ACTIVE_CONVEX_SITE_URL = "https://vibrant-chickadee-257.convex.site";

/**
 * Returns the canonical Convex site URL used for OAuth callback construction.
 *
 * Priority:
 *  1. CUSTOM_AUTH_SITE_URL env var (if explicitly set in Convex dashboard)
 *  2. Hardcoded ACTIVE_CONVEX_SITE_URL (always correct for this deployment)
 *  3. CONVEX_SITE_URL env var (auto-set by Convex, but may lag after migration)
 *
 * Trailing slashes are stripped.
 */
export function getAuthSiteUrl(): string {
  const raw =
    process.env.CUSTOM_AUTH_SITE_URL ||
    ACTIVE_CONVEX_SITE_URL ||
    process.env.CONVEX_SITE_URL;
  if (!raw) {
    throw new Error(
      "No Convex site URL configured. Set CUSTOM_AUTH_SITE_URL env var.",
    );
  }
  return raw.replace(/\/$/, "");
}

/**
 * Returns the EXACT Google OAuth callback URL for this deployment.
 *
 * This is the redirect_uri sent to Google during the OAuth flow.
 * It must be registered as an "Authorized redirect URI" in Google Cloud Console:
 *   https://vibrant-chickadee-257.convex.site/api/auth/callback/google
 *
 * Constructed as: ${getAuthSiteUrl()}/api/auth/callback/google
 * No trailing slashes, no extra query parameters.
 */
export function getGoogleCallbackUrl(): string {
  const base = getAuthSiteUrl();
  return `${base}/api/auth/callback/google`;
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
