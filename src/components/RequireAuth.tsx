import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { isAdminEmail } from "@/lib/routing";

/**
 * RequireAuth — the single auth gate for all protected routes.
 *
 * Routing priority:
 *  1. Unauthenticated → /auth?returnTo=...
 *  2. Suspended / deleted → blocked page
 *  3. Super admin on /dashboard or /onboarding → /admin
 *  4. Onboarding done + on /onboarding → /dashboard
 *  5. Subscription expired → /pricing
 *  6. Otherwise → render children
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const onboardingDone = useQuery(api.users.hasCompletedOnboarding);
  const subscription = useQuery(api.subscriptions.getCurrent);
  const user = useQuery(api.users.currentUser);
  const accountStatus = useQuery(api.users.getAccountStatus);

  // ── CRITICAL: Never redirect while any loading state is still true ──
  // This prevents the auth-loop where isAuthenticated hasn't propagated yet.
  // isLoading = isAuthLoading || user === undefined (from useAuth)
  // We also guard on onboardingDone/subscription/user queries.
  if (
    isLoading ||
    onboardingDone === undefined ||
    subscription === undefined ||
    user === undefined
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-[#A1A1AA]" />
          <p className="text-xs text-[#A1A1AA]">Loading your account…</p>
        </div>
      </main>
    );
  }

  // ── 1. Unauthenticated → send to login ──
  // Only reachable AFTER all loading states resolved and user data fetched.
  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  const admin = isAdminEmail(user?.email) || user?.role === "admin";

  // ── 2. Suspended / Archived / Deleted → block access ──
  if (
    accountStatus === "suspended" ||
    accountStatus === "deleted"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <div className="max-w-md text-center px-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⛔</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Account {accountStatus === "suspended" ? "Suspended" : "Deactivated"}</h1>
          <p className="text-sm text-[#A1A1AA] mb-4">
            Your account has been {accountStatus === "suspended" ? "suspended" : "deactivated"} by the administrator. Please contact support to resolve this issue.
          </p>
          <a href="https://wa.me/8801791130633" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:bg-[#128C7E] transition-colors">
            Contact Support on WhatsApp
          </a>
        </div>
      </main>
    );
  }

  // ── 3. Super admin: /dashboard, /dashboard/*, and /onboarding → /admin ──
  if (admin && (
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/dashboard/") ||
    location.pathname === "/onboarding"
  )) {
    return <Navigate to="/admin" replace />;
  }

  // ── 4. Onboarding done but on /onboarding → /dashboard ──
  if (onboardingDone === true && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  // ── 5. Subscription expired → /pricing (allow /pricing page even when expired) ──
  if (location.pathname === "/pricing") {
    return children;
  }

  const now = Date.now();
  const plan = subscription?.plan;
  const status = subscription?.status;
  const expiresAt = subscription?.expiresAt;

  // Active paid subscription (starter/pro) — not expired → full access
  const isActivePaid =
    (plan === "starter" || plan === "pro") &&
    status === "active" &&
    (expiresAt === undefined || expiresAt === null || expiresAt > now);

  // Active trial — not expired → full access
  const isActiveTrial =
    plan === "trial" &&
    status === "active" &&
    (expiresAt === undefined || expiresAt === null || expiresAt > now);

  // Pending payment → allow dashboard (shows pending banner)
  const isPending = status === "pending";

  if (isActivePaid || isActiveTrial || isPending) {
    return children;
  }

  // Expired / no subscription / cancelled → redirect to pricing
  return <Navigate to="/pricing" replace />;
}
