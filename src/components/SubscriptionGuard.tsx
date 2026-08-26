import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useNavigate } from "react-router";
import { Lock, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

type RequiredTier = "starter" | "pro";

const TIER_ORDER: Record<string, number> = {
  free: 0,
  trial: 3,
  starter: 1,
  pro: 2,
};

interface SubscriptionGuardProps {
  children: ReactNode;
  requiredTier?: RequiredTier;
  /** Custom message shown in the lock overlay */
  message?: string;
  /** Whether to show the overlay (default: always check) */
  enabled?: boolean;
}

function hasAccess(plan: string | undefined, status: string | undefined, requiredTier: RequiredTier): boolean {
  if (!plan || !status) return false;
  if (status !== "active") return false;

  const planLevel = TIER_ORDER[plan] ?? 0;
  const requiredLevel = TIER_ORDER[requiredTier] ?? 0;

  return planLevel >= requiredLevel;
}

export function SubscriptionGuard({
  children,
  requiredTier = "starter",
  message,
  enabled = true,
}: SubscriptionGuardProps) {
  const navigate = useNavigate();
  const subscription = useQuery(api.subscriptions.getCurrent);

  if (!enabled) {
    return <>{children}</>;
  }

  // Loading state
  if (subscription === undefined) {
    return (
      <div className="relative">
        <div className="blur-[2px] opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#16A34A]/30 border-t-[#16A34A] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const active = hasAccess(subscription?.plan, subscription?.status, requiredTier);

  if (active) {
    return <>{children}</>;
  }

  // Determine plan label
  const planLabel =
    requiredTier === "pro"
      ? "Business Pro"
      : requiredTier === "starter"
        ? "Starter"
        : "Active Plan";

  const defaultMessage = `Subscribe to ${planLabel} to unlock this feature.`;

  return (
    <div className="relative">
      {/* Blurred content behind */}
      <div className="blur-[3px] opacity-40 pointer-events-none select-none">{children}</div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#0D0D0D]/60 backdrop-blur-[1px] rounded-2xl z-10">
        <div className="text-center px-6 py-8 max-w-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Upgrade Required</h3>
          <p className="text-sm text-[#A1A1AA] mb-5 leading-relaxed">
            {message || defaultMessage}
          </p>
          <Button
            onClick={() => navigate("/pricing")}
            className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold px-6 cursor-pointer"
          >
            <Zap className="w-4 h-4 mr-2" />
            Upgrade Subscription
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Lightweight check: returns whether the current user's subscription meets a tier */
export function useHasAccess(requiredTier: RequiredTier = "starter"): {
  hasAccess: boolean;
  isLoading: boolean;
  plan: string | undefined;
  status: string | undefined;
  isExpired: boolean;
} {
  const subscription = useQuery(api.subscriptions.getCurrent);

  if (subscription === undefined) {
    return { hasAccess: false, isLoading: true, plan: undefined, status: undefined, isExpired: false };
  }

  const plan = subscription?.plan;
  const status = subscription?.status;
  const isExpired =
    subscription?.status === "active" &&
    (subscription?.plan === "pro" || subscription?.plan === "starter" || subscription?.plan === "trial") &&
    subscription?.expiresAt !== undefined &&
    subscription.expiresAt < Date.now();

  const active = hasAccess(plan, status, requiredTier) && !isExpired;

  return { hasAccess: active, isLoading: false, plan, status, isExpired };
}
