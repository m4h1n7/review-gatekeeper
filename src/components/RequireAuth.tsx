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
 *  5. Otherwise → render children (dashboard handles its own paywall)
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const onboardingDone = useQuery(api.users.hasCompletedOnboarding);
  const user = useQuery(api.users.currentUser);
  const accountStatus = useQuery(api.users.getAccountStatus);

  // ── CRITICAL: Never redirect while any loading state is still true ──
  // This prevents the auth-loop where isAuthenticated hasn't propagated yet.
  if (
    isLoading ||
    onboardingDone === undefined ||
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

  // ── 2. Suspended / Archived / Deleted → redirect to dedicated page ──
  if (
    accountStatus === "suspended" ||
    accountStatus === "deleted"
  ) {
    const targetPath = accountStatus === "suspended"
      ? "/account-suspended"
      : "/account-archived";
    return (
      <Navigate to={targetPath} replace />
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

  // ── 5. Always allow /pricing ──
  if (location.pathname === "/pricing") {
    return children;
  }

  // ── 6. Authenticated user → render children ──
  // No subscription check here — the Dashboard itself renders a paywall
  // overlay for users without an active plan, so they can still see
  // the dashboard but features are locked.
  return children;
}
