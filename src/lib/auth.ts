/**
 * Auth Base URL Configuration
 *
 * All authentication redirects (Google OAuth callback, password reset, post-login
 * routing) must originate from the production frontend domain — NOT the Convex
 * backend URL (patient-nightingale-401.convex.site).
 *
 * This module centralises the canonical origin so every caller uses the same
 * value. During local dev (localhost) it falls back to window.location.origin.
 *
 * Production: https://starcatchreviews.freebuff.app
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
 * Example:
 *   getAuthUrl("/auth?returnTo=/dashboard")
 *   → "https://starcatchreviews.freebuff.app/auth?returnTo=/dashboard"
 */
export function getAuthUrl(path: string): string {
  const origin = getAuthOrigin();
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The Google OAuth callback URL that must be registered in Google Cloud Console.
 * This is the Convex backend's callback endpoint — Google redirects here after
 * the user consents.
 *
 * This is constructed server-side by Convex Auth using:
 *   ${process.env.CUSTOM_AUTH_SITE_URL ?? process.env.CONVEX_SITE_URL}/api/auth/callback/google
 *
 * For production, the Convex env var `CUSTOM_AUTH_SITE_URL` should be set to:
 *   https://starcatchreviews.freebuff.app
 */
export const GOOGLE_CALLBACK_URL =
  `${PRODUCTION_AUTH_ORIGIN}/api/auth/callback/google`;
