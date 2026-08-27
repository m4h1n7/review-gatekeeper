/**
 * Centralized platform constants.
 * Admin email logic lives in @/lib/routing.ts (single source of truth).
 * This file re-exports for convenience.
 */
export { isAdminEmail as isSuperAdminEmail } from "@/lib/routing";

/** Hard-coded super admin emails. */
const SUPER_ADMIN_EMAILS = ["mahinhosen870@gmail.com", "atazwar103@gmail.com", "starcatchbd@gmail.com"];
export { SUPER_ADMIN_EMAILS };

/** Subscription plan tiers (matches Convex schema). */
export type PlanTier = "free" | "trial" | "starter" | "pro";

/** Whether a plan tier grants access to the dashboard. */
export function isActivePlan(plan?: string | null): boolean {
  return plan === "trial" || plan === "starter" || plan === "pro";
}
