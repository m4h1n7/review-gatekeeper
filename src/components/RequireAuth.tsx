import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const onboardingDone = useQuery(api.users.hasCompletedOnboarding);

  if (isLoading || onboardingDone === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <Loader2 className="size-6 animate-spin text-[#A1A1AA]" />
      </main>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/auth?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  // Redirect to onboarding if not completed (skip for onboarding page itself)
  if (!onboardingDone && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect away from onboarding if already completed
  if (onboardingDone && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
