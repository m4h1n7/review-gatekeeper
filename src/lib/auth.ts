/**
 * Auth Base URL Configuration
 *
 * Authentication is email/password only (no Google OAuth).
 * This module provides helpers for constructing auth-related URLs on the client.
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
