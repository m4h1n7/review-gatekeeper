/**
 * Role-Based + Plan-Aware Routing
 *
 * Centralises every redirect decision so RequireAuth, Auth, and Landing
 * all agree on the same destination for a given user.
 */

const SUPER_ADMIN_EMAILS = [
  "mahinhosen870@gmail.com",
  "atazwar103@gmail.com",
  "starcatchbd@gmail.com",
];

export function isAdminEmail(email?: string | null): boolean {
  return SUPER_ADMIN_EMAILS.includes(email?.toLowerCase() ?? "");
}

interface RoutingContext {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** The user's email (null if not logged in or unknown) */
  email?: string | null;
  /** The user's DB role ("admin" | "user" | null) */
  role?: string | null;
  /** Whether the user has completed onboarding (super admins always skip) */
  onboardingDone?: boolean | null;
  /** Subscription plan: "free" | "trial" | "starter" | "pro" | null */
  plan?: string | null;
  /** Subscription status: "active" | "pending" | "cancelled" | null */
  status?: string | null;
  /** Absolute timestamp when the plan expires */
  expiresAt?: number | null;
  /** Account status: "active" | "suspended" | "deleted" | null */
  accountStatus?: string | null;
}

export type Destination =
  | { path: string; reason: string };

/**
 * Decide where a user should be routed based on their full context.
 *
 * Priority order:
 *  1. Unauthenticated → /auth
 *  2. Suspended / deleted → blocked page (handled by RequireAuth inline)
 *  3. Super admin → /admin
 *  4. No onboarding → /onboarding
 *  5. Expired subscription → /pricing
 *  6. Otherwise → /dashboard (client) or /admin (admin)
 */
export function resolveDestination(ctx: RoutingContext): Destination {
  // 1. Not logged in
  if (!ctx.isAuthenticated) {
    return { path: "/auth", reason: "unauthenticated" };
  }

  const admin =
    isAdminEmail(ctx.email) || ctx.role === "admin";

  // 3. Super admin always → /admin
  if (admin) {
    return { path: "/admin", reason: "super_admin" };
  }

  // 4. Onboarding not completed → /onboarding
  if (ctx.onboardingDone === false) {
    return { path: "/onboarding", reason: "onboarding_pending" };
  }

  // 5. Subscription expired → /pricing
  const now = Date.now();
  const isExpired =
    ctx.expiresAt !== undefined &&
    ctx.expiresAt !== null &&
    ctx.expiresAt < now;

  if (isExpired && ctx.plan !== "free" && ctx.plan !== undefined && ctx.plan !== null) {
    return { path: "/pricing", reason: "subscription_expired" };
  }

  // 6. Default for clients
  return { path: "/dashboard", reason: "default_client" };
}

/**
 * Lightweight helper: should the user see the admin portal CTA?
 */
export function shouldShowAdminCTA(email?: string | null, role?: string | null): boolean {
  return isAdminEmail(email) || role === "admin";
}
