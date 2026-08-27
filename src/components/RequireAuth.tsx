import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { isSuperAdmin } from "@/components/SuperAdminGuard";

/**
 * RequireAuth — the single auth gate for all protected routes.
 *
 * Routing logic:
 *  1. Unauthenticated → /auth?returnTo=...
 *  2. Super admin on /dashboard → redirect to /admin
 *  3. Suspended account → /pricing (blocked banner)
 *  4. Onboarding already done + on /onboarding → /dashboard
 *  5. Expired subscription → /pricing
 *  6. Otherwise → render children
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const onboardingDone = useQuery(api.users.hasCompletedOnboarding);
  const subscription = useQuery(api.subscriptions.getCurrent);
  const user = useQuery(api.users.currentUser);
  const accountStatus = useQuery(api.users.getAccountStatus);

  if (isLoading || onboardingDone === undefined || subscription === undefined || user === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-[#A1A1AA]" />
          <p className="text-xs text-[#A1A1AA]">Loading your account…</p>
        </div>
      </main>
    );
  }

  // ── Unauthenticated → send to login ──
  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  // ── Super Admin auto-redirect: if an admin lands on /dashboard, send to /admin ──
  if (
    isSuperAdmin(user?.email) &&
    location.pathname === "/dashboard"
  ) {
    return <Navigate to="/admin" replace />;
  }

  // ── Suspended / Archived account → block access ──
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

  // ── Redirect away from onboarding if already completed ──
  if (onboardingDone && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  // ── Subscription expiry: if active plan but expired, redirect to pricing ──
  const isExpired =
    subscription?.status === "active" &&
    (subscription?.plan === "pro" || subscription?.plan === "starter" || subscription?.plan === "trial") &&
    subscription?.expiresAt !== undefined &&
    subscription.expiresAt < Date.now();

  if (isExpired && location.pathname !== "/pricing") {
    return <Navigate to="/pricing" replace />;
  }

  return children;
}
