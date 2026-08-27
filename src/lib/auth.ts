/**
 * Auth Base URL Configuration
 *
 * ACTIVE CONVEX DEPLOYMENT: vibrant-chickadee-257
 * CONVEX_SITE_URL: https://vibrant-chickadee-257.convex.site
 *
 * Google OAuth involves two distinct URLs:
 *
 * 1. OAUTH CALLBACK URL (redirect_uri sent to Google):
 *    Constructed SERVER-SIDE by @convex-dev/auth using:
 *      ${CUSTOM_AUTH_SITE_URL ?? CONVEX_SITE_URL}/api/auth/callback/google
 *    This MUST point to the Convex backend where auth.addHttpRoutes handles it.
 *    Exact URL: https://vibrant-chickadee-257.convex.site/api/auth/callback/google
 *
 * 2. POST-LOGIN REDIRECT (redirectTo parameter):
 *    Passed as a RELATIVE PATH from the client signIn() call.
 *    The server validates it against the SITE_URL env var and prepends SITE_URL.
 *    Example: redirectTo = "/auth?returnTo=/dashboard"
 *
 * Production frontend: https://starcatchreviews.freebuff.app
 */

const PRODUCTION_AUTH_ORIGIN = "https://starcatchreviews.freebuff.app";

/**
 * Returns the canonical frontend origin used for auth redirects.
 *
 * - On the production domain → always returns PRODUCTION_AUTH_ORIGIN
 * - On localhost / dev preview → returns window.location.origin (so local dev still works)
 */
export function getAuthOrigin(): string {
  if (typeof window === "undefined") {
    return PRODUCTION_AUTH_ORIGIN;
  }

  const hostname = window.location.hostname;

  // Local dev — use whatever Vite/dev server is running on
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return window.location.origin;
  }

  // Freebuff dev preview — always redirect back to production domain
  if (hostname.endsWith(".vly.sh")) {
    return PRODUCTION_AUTH_ORIGIN;
  }

  // Production — use the actual domain (handles custom domains gracefully)
  return window.location.origin || PRODUCTION_AUTH_ORIGIN;
}

/**
 * Build a full auth URL path on the canonical origin.
 *
 * Use this for any client-side navigation that must land on the production domain
 * (e.g. OTP email links). Do NOT use for the signIn() redirectTo parameter —
 * that should always be a relative path.
 *
 * Example:
 *   getAuthUrl("/auth?returnTo=/dashboard")
 *   → "https://starcatchreviews.freebuff.app/auth?returnTo=/dashboard"
 */
export function getAuthUrl(path: string): string {
  const origin = getAuthOrigin();
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The Google OAuth callback URL — must match exactly what Convex Auth sends to Google.
 *
 * Constructed server-side by @convex-dev/auth:
 *   ${CUSTOM_AUTH_SITE_URL ?? CONVEX_SITE_URL}/api/auth/callback/google
 *
 * For this deployment (vibrant-chickadee-257):
 *   https://vibrant-chickadee-257.convex.site/api/auth/callback/google
 *
 * Register this exact URL in Google Cloud Console → Credentials → OAuth 2.0:
 *   https://vibrant-chickadee-257.convex.site/api/auth/callback/google
 */
export const GOOGLE_CALLBACK_URL =
  "https://vibrant-chickadee-257.convex.site/api/auth/callback/google";
