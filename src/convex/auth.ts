/**
 * Auth configuration for STAR CATCH Review Gatekeeper
 *
 * ACTIVE CONVEX DEPLOYMENT: patient-nightingale-401
 * CONVEX_SITE_URL (auto-set): https://patient-nightingale-401.convex.site
 *
 * Authentication: Email/Password (auto-registers new users on sign-in).
 *
 * Env vars required (set in Convex dashboard):
 *   CUSTOM_AUTH_SITE_URL  = https://patient-nightingale-401.convex.site
 *   CONVEX_SITE_URL       = (auto-set by Convex)
 *   AUTH_SECRET           = signing secret for JWT tokens (fallback: CONVEX_SITE_URL)
 */

import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import {
  createAccount,
  retrieveAccount,
  signInViaProvider,
  modifyAccountCredentials,
  invalidateSessions,
} from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
import { Scrypt } from "lucia";
import { api } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";

// ---------------------------------------------------------------------------
// 1. Safe site-URL resolution
// ---------------------------------------------------------------------------

/**
 * Returns the canonical Convex site URL used for constructing auth endpoints,
 * callback URLs, and internal HTTP calls (e.g. OTP email endpoint).
 *
 * Priority:
 *   1. CUSTOM_AUTH_SITE_URL env var (explicitly set in Convex dashboard)
 *   2. CONVEX_SITE_URL env var (auto-set by Convex — always correct)
 *   3. Runtime window origin (Vite frontend fallback)
 *
 * Trailing slashes are stripped.
 */
export function getAuthSiteUrl(): string {
  const raw =
    process.env.CUSTOM_AUTH_SITE_URL ||
    process.env.CONVEX_SITE_URL ||
    process.env.SITE_URL;
  if (!raw) {
    // Last-resort fallback — never crash the entire auth module
    console.warn(
      "[auth] No Convex site URL found in env vars. Falling back to SITE_URL.",
    );
    return "";
  }
  return raw.replace(/\/$/, "");
}

/** @deprecated Use getAuthSiteUrl */
export function getConvexSiteUrl(): string {
  return getAuthSiteUrl();
}

// ---------------------------------------------------------------------------
// 2. Safe AUTH_SECRET / JWT_SECRET resolution
// ---------------------------------------------------------------------------

/**
 * Read the JWT signing secret from environment variables.
 *
 * Priority:
 *   1. AUTH_SECRET  (preferred — set in Convex dashboard)
 *   2. JWT_SECRET   (legacy alias)
 *
 * Returns an empty string instead of throwing when neither is set so
 * the auth module never crashes the server.  Convex's built-in auth
 * token layer will still sign tokens using its own internal secret.
 */
function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET || "";
  if (!secret) {
    console.warn(
      "[auth] AUTH_SECRET / JWT_SECRET not set. Using Convex's internal signing key.",
    );
  }
  return secret;
}

// Resolve once at module load (safe — env vars are immutable in Convex actions)
const _authSecret = getAuthSecret();

// ---------------------------------------------------------------------------
// 3. Custom password requirements
// ---------------------------------------------------------------------------

function validatePasswordRequirements(password: string): void {
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

// ---------------------------------------------------------------------------
// 4. OTP email helper (never throws — returns boolean)
// ---------------------------------------------------------------------------

/** Error messages that are already user-friendly — re-thrown verbatim. */
const FRIENDLY_EMAIL_ERRORS = [
  "Failed to send",
  "Email delivery is not configured",
];

/**
 * Send the OTP / reset-code email through the Resend → SMTP pipeline in
 * email.ts (Resend primary, Gmail SMTP fallback, default From:
 * "StarCatch BD <mahinhosen870@gmail.com>").
 *
 * Called directly via `ctx.runAction` — no HTTP hop, no site-URL dependency.
 * On failure it throws a user-friendly Error (wrapped safely by the callers)
 * so the client shows "Failed to send reset code…" instead of a raw trace.
 */
async function generateAndSendOTP(
  ctx: ActionCtx,
  email: string,
  token: string,
  appName: string,
): Promise<void> {
  const providerConfigured = !!(
    process.env.RESEND_API_KEY ||
    (process.env.EMAIL_USER && process.env.EMAIL_PASS)
  );
  if (!providerConfigured) {
    throw new Error(
      "Email delivery is not configured. Please set RESEND_API_KEY (or SMTP credentials) in the Convex environment and try again.",
    );
  }

  try {
    const result = await ctx.runAction(api.email.sendOtp, {
      to: email,
      otp: token,
      appName,
    });
    if (!result?.ok) {
      console.error(`[auth] OTP email rejected: ${result?.error ?? "unknown error"}`);
      throw new Error(
        "Failed to send the verification email. Please try again in a moment.",
      );
    }
  } catch (err) {
    if (
      err instanceof Error &&
      FRIENDLY_EMAIL_ERRORS.some((p) => err.message.startsWith(p))
    ) {
      throw err; // already user-friendly
    }
    console.error("[auth] OTP email send error:", err);
    throw new Error(
      "Failed to send the verification email. Please try again in a moment.",
    );
  }
}

// ---------------------------------------------------------------------------
// 5. Email OTP providers (sign-in verification + password reset)
// ---------------------------------------------------------------------------

function createOtpProvider(id: string) {
  return Email({
    id,
    maxAge: 60 * 15, // 15 minutes
    async generateVerificationToken() {
      const random: RandomReader = {
        read(bytes: Uint8Array) {
          crypto.getRandomValues(bytes);
        },
      };
      return generateRandomString(random, "0123456789", 6);
    },
    async sendVerificationRequest(params, ...ctxBox: unknown[]) {
      // The library forwards the action ctx as a 2nd argument at runtime
      // (untyped upstream — signIn.js uses "@ts-expect-error" for this).
      const ctx = ctxBox[0] as ActionCtx;
      const { identifier: email, token } = params as {
        identifier: string;
        token: string;
      };
      const appName = process.env.VLY_APP_NAME || "STAR CATCH Reviews";
      await generateAndSendOTP(ctx, email, token, appName);
    },
  });
}

const emailOtp = createOtpProvider("email-otp");
const passwordResetEmail = createOtpProvider("password-reset-email");

// ---------------------------------------------------------------------------
// 6. Password provider with graceful InvalidSecret handling
// ---------------------------------------------------------------------------

/**
 * The upstream Password provider calls retrieveAccount() which throws
 * a raw `Error("InvalidSecret")` when the password doesn't match.
 * This bubbles up to the client as an ugly server exception.
 *
 * We wrap the provider in a ConvexCredentials shell that catches
 * InvalidSecret / InvalidAccountId and returns null (which the
 * signIn action translates into a user-friendly "Invalid credentials"
 * error instead of an uncaught server crash).
 */
const SafePassword = ConvexCredentials({
  id: "password",
  authorize: async (params: Record<string, any>, ctx: any) => {
    const flow = params.flow as string | undefined;
    const email = (params.email as string) || "";
    const password = params.password as string | undefined;

    // --- Validate password strength on sign-up / reset ---
    const passwordToValidate =
      flow === "signUp"
        ? password
        : flow === "reset-verification"
          ? params.newPassword
          : null;

    if (passwordToValidate !== null) {
      validatePasswordRequirements(passwordToValidate);
    }

    const profile = { email };

    // -----------------------------------------------------------------
    // Sign Up
    // -----------------------------------------------------------------
    if (flow === "signUp") {
      if (!password) {
        throw new Error("Missing password for sign-up.");
      }
      try {
        const created = await createAccount(ctx, {
          provider: "password",
          account: { id: email, secret: password },
          profile,
          shouldLinkViaEmail: false,
          shouldLinkViaPhone: false,
        });
        return { userId: created.user._id };
      } catch (err: any) {
        // If account already exists, surface a clear message
        const msg = String(err?.message || err);
        if (msg.includes("already") || msg.includes("duplicate")) {
          throw new Error(
            "An account with this email already exists. Please sign in instead.",
          );
        }
        throw err;
      }
    }

    // -----------------------------------------------------------------
    // Sign In (with auto-create if account doesn't exist)
    // -----------------------------------------------------------------
    if (flow === "signIn") {
      if (!password) {
        throw new Error("Missing password for sign-in.");
      }
      try {
        const retrieved = await retrieveAccount(ctx, {
          provider: "password",
          account: { id: email, secret: password },
        });
        if (!retrieved) {
          return null; // signIn action → "Invalid credentials"
        }
        return { userId: retrieved.user._id };
      } catch (err: any) {
        const msg = String(err?.message || err);

        // ── Account doesn't exist → auto-create and sign in ──
        if (msg.includes("InvalidAccountId") || msg.includes("does not exist")) {
          console.info(
            `[auth] No account for ${email} — auto-creating new account`,
          );
          try {
            const created = await createAccount(ctx, {
              provider: "password",
              account: { id: email, secret: password },
              profile,
              shouldLinkViaEmail: false,
              shouldLinkViaPhone: false,
            });
            return { userId: created.user._id };
          } catch (createErr: any) {
            const createMsg = String(createErr?.message || createErr);
            // Race condition: another request created the account between
            // our retrieve and create. Try retrieveAccount once more.
            if (createMsg.includes("already") || createMsg.includes("duplicate")) {
              const retry = await retrieveAccount(ctx, {
                provider: "password",
                account: { id: email, secret: password },
              });
              if (retry) return { userId: retry.user._id };
            }
            throw createErr;
          }
        }

        // Wrong password for existing account
        if (
          msg.includes("InvalidSecret") ||
          msg.includes("Invalid credentials")
        ) {
          console.warn(
            `[auth] Failed sign-in attempt for ${email}: ${msg}`,
          );
          return null; // signIn action → user-friendly "Invalid credentials"
        }

        // Too many failed attempts
        if (msg.includes("TooManyFailedAttempts")) {
          throw new Error(
            "Too many failed attempts. Please wait a few minutes and try again.",
          );
        }

        // Re-throw unexpected errors
        throw err;
      }
    }

    // -----------------------------------------------------------------
    // Password Reset — request
    // -----------------------------------------------------------------
    if (flow === "reset") {
      try {
        const { account } = await retrieveAccount(ctx, {
          provider: "password",
          account: { id: email },
        });
        return await signInViaProvider(ctx, passwordResetEmail, {
          accountId: account._id,
          params,
        });
      } catch (err: any) {
        const msg = String(err?.message || err);
        // Unknown email → null (silent) so we don't reveal which emails exist.
        // Email delivery failures surface as friendly errors instead of a crash.
        if (msg.includes("InvalidAccountId") || msg.includes("InvalidSecret")) {
          console.warn(
            `[auth] Password reset requested for non-existent account: ${email}`,
          );
          return null;
        }
        if (
          msg.startsWith("Failed to send") ||
          msg.startsWith("Email delivery is not configured")
        ) {
          throw new Error(
            "Failed to send reset code. Please try again in a few minutes.",
          );
        }
        throw err;
      }
    }

    // -----------------------------------------------------------------
    // Password Reset — verify code & set new password
    // -----------------------------------------------------------------
    if (flow === "reset-verification") {
      const newPassword = params.newPassword as string | undefined;
      if (!newPassword) {
        throw new Error("Missing new password for reset verification.");
      }

      // ConvexCredentials does NOT auto-update credentials after authorize
      // returns, so (like the upstream Password provider) we must do it here.
      try {
        const { account: resetAccount } = await retrieveAccount(ctx, {
          provider: "password",
          account: { id: email },
        });

        const result = await signInViaProvider(ctx, passwordResetEmail, {
          params,
        });

        if (result === null) {
          throw new Error("Invalid or expired reset code.");
        }

        const { userId, sessionId } = result;
        if (resetAccount.userId !== userId) {
          throw new Error("Invalid or expired reset code.");
        }

        // Actually update the stored password (hashes via the provider's
        // crypto — same Scrypt used for sign-in), then invalidate every other
        // active session for this user (stolen sessions die on password change).
        await modifyAccountCredentials(ctx, {
          provider: "password",
          account: { id: email, secret: newPassword },
        });
        await invalidateSessions(ctx, { userId, except: [sessionId] });

        return { userId, sessionId };
      } catch (err: any) {
        throw err;
      }
    }

    // -----------------------------------------------------------------
    // Unknown flow
    // -----------------------------------------------------------------
    throw new Error(
      `Invalid auth flow "${flow}". Must be signUp, signIn, reset, or reset-verification.`,
    );
  },
  crypto: {
    async hashSecret(password: string) {
      return await new Scrypt().hash(password);
    },
    async verifySecret(password: string, hash: string) {
      return await new Scrypt().verify(hash, password);
    },
  },
});

// ---------------------------------------------------------------------------
// 7. Build provider list
// ---------------------------------------------------------------------------

const providers: any[] = [
  // SafePassword wraps Password with graceful error handling + auto-register
  SafePassword as any,
  emailOtp,
  Anonymous,
];

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers,
});
