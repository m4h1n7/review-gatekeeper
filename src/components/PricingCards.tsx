import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Zap, Star, Gift, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-[#18181B]/70 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.3)] ${className}`}
    >
      {children}
    </div>
  );
}

interface PricingCardsProps {
  /** Called when a paid plan is selected. Receives "starter" | "pro". */
  onPaidPlanSelect?: (plan: "starter" | "pro") => void;
  /** Show full-page layout (GlassPanel wrappers, motion animations). Default: true */
  fullPage?: boolean;
  /** Whether to show the trial card. Default: true */
  showTrial?: boolean;
}

export function PricingCards({
  onPaidPlanSelect,
  fullPage = true,
  showTrial = true,
}: PricingCardsProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [trialLoading, setTrialLoading] = useState(false);
  const [trialError, setTrialError] = useState("");

  const claimTrial = useMutation(api.subscriptions.claimTrial);
  const trialStatus = useQuery(api.subscriptions.hasTrialUsed);
  const subscription = useQuery(api.subscriptions.getCurrent);

  const hasUsedTrial = trialStatus?.used ?? false;
  const hasActiveTrial = subscription?.plan === "trial" && subscription?.status === "active";
  const hasActivePaidPlan =
    (subscription?.plan === "pro" || subscription?.plan === "starter") &&
    subscription?.status === "active";

  const handleGetStarted = (plan: "starter" | "pro") => {
    if (!isAuthenticated) {
      navigate("/auth?returnTo=/pricing");
      return;
    }
    if (onPaidPlanSelect) {
      onPaidPlanSelect(plan);
    } else {
      navigate("/pricing");
    }
  };

  const handleClaimTrial = async () => {
    if (!isAuthenticated) {
      navigate("/auth?returnTo=/pricing");
      return;
    }
    setTrialLoading(true);
    setTrialError("");
    try {
      await claimTrial();
      navigate("/onboarding");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start trial";
      setTrialError(msg);
    } finally {
      setTrialLoading(false);
    }
  };

  const Wrapper = fullPage ? GlassPanel : "div";
  const wrapperClass = fullPage
    ? "p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 relative overflow-hidden ring-1 ring-[#16A34A]/30"
    : "rounded-3xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 relative overflow-hidden ring-1 ring-[#16A34A]/20";

  return (
    <div className={`space-y-6 sm:space-y-8 ${fullPage ? "" : ""}`}>
      {/* 10-Day Free Trial Card */}
      {showTrial && (
        <motion.div
          initial={fullPage ? { opacity: 0, y: 20 } : undefined}
          animate={fullPage ? { opacity: 1, y: 0 } : undefined}
          viewport={fullPage ? undefined : { once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Wrapper className={wrapperClass}>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#16A34A]/8 rounded-full blur-3xl pointer-events-none" />

            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[#16A34A]/15 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-[#16A34A]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">10-Day Free Trial</h3>
                  <p className="text-xs text-[#A1A1AA]">No credit card required</p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-extrabold text-[#16A34A]">৳0</span>
                <span className="text-sm text-[#A1A1AA]">for 10 days</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "Full Business Pro features",
                  "1× Digital QR Code Setup",
                  "Private feedback capture",
                  "Real-time analytics",
                ].map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A] shrink-0" />
                    {feature}
                  </span>
                ))}
              </div>

              {trialError && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{trialError}</span>
                </div>
              )}
            </div>

            <div className="w-full sm:w-auto relative z-10 shrink-0">
              {hasActivePaidPlan ? (
                <Button
                  disabled
                  className="w-full sm:w-auto h-11 bg-white/5 text-zinc-500 font-semibold border border-white/10 cursor-not-allowed"
                >
                  Active Plan
                </Button>
              ) : hasActiveTrial ? (
                <Button
                  disabled
                  className="w-full sm:w-auto h-11 bg-[#16A34A]/20 text-[#16A34A] font-semibold border border-[#16A34A]/30 cursor-not-allowed"
                >
                  Trial Active
                </Button>
              ) : hasUsedTrial ? (
                <Button
                  disabled
                  className="w-full sm:w-auto h-11 bg-white/5 text-zinc-500 font-semibold border border-white/10 cursor-not-allowed"
                >
                  Trial Used
                </Button>
              ) : (
                <Button
                  onClick={handleClaimTrial}
                  disabled={trialLoading}
                  className="w-full sm:w-auto h-11 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold shadow-lg shadow-[#16A34A]/25 transition-all cursor-pointer"
                >
                  {trialLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Starting...
                    </div>
                  ) : (
                    "Start 10-Day Free Trial"
                  )}
                </Button>
              )}
            </div>
          </Wrapper>
        </motion.div>
      )}

      {/* Starter + Pro Plan Grid */}
      <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Starter Plan */}
        <motion.div
          initial={fullPage ? { opacity: 0, y: 20 } : undefined}
          animate={fullPage ? { opacity: 1, y: 0 } : undefined}
          whileInView={fullPage ? undefined : { opacity: 1, y: 0 }}
          viewport={fullPage ? undefined : { once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: fullPage ? 0.4 : 0 }}
        >
          <div className="rounded-3xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-2xl p-8 h-full flex flex-col relative overflow-hidden">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Starter Plan</h3>
              <p className="text-sm text-[#A1A1AA]">ছোট ক্যাফে / দোকান</p>
            </div>

            <div className="space-y-1 mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">৳১,৪৯৯</span>
                <span className="text-xs text-zinc-500">setup +</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">৳১,৪৯৯</span>
                <span className="text-sm text-[#A1A1AA]">/month</span>
              </div>
              <p className="text-xs text-zinc-500">Total first payment: ৳২,৯৯৮</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-5">
              <p className="text-xs font-semibold text-zinc-400 mb-1">📦 Hardware</p>
              <p className="text-xs text-zinc-500">
                ১টি প্রিমিয়াম স্মার্ট NFC কার্ড
              </p>
            </div>

            <div className="space-y-3 mb-8 flex-1">
              {[
                "প্রাইভেট ফিডব্যাক ফিল্টার (১-৩ স্টার ব্লক)",
                "গ্যাপ রিয়েল-টাইম চার্ট",
                "বেসিক ড্যাশবোর্ড",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="text-sm text-[#A1A1AA] font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full h-12 bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/10 transition-all cursor-pointer"
              onClick={() => handleGetStarted("starter")}
            >
              Get Started
            </Button>
          </div>
        </motion.div>

        {/* Business Pro Plan */}
        <motion.div
          initial={fullPage ? { opacity: 0, y: 20 } : undefined}
          animate={fullPage ? { opacity: 1, y: 0 } : undefined}
          whileInView={fullPage ? undefined : { opacity: 1, y: 0 }}
          viewport={fullPage ? undefined : { once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: fullPage ? 0.5 : 0.1 }}
        >
          <div className="rounded-3xl border border-[#16A34A]/30 bg-white/[0.04] backdrop-blur-2xl p-8 h-full flex flex-col relative overflow-hidden ring-1 ring-[#16A34A]/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#16A34A] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-[#16A34A]/25 flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6 mt-2">
              <div className="w-12 h-12 rounded-xl bg-[#16A34A] flex items-center justify-center mb-4 shadow-lg shadow-[#16A34A]/25">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Business Pro Plan</h3>
              <p className="text-sm text-[#A1A1AA]">জনপ্রিয় রেস্তোরাঁ / সেলুন</p>
            </div>

            <div className="space-y-1 mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">৳১,৬৯৯</span>
                <span className="text-xs text-zinc-500">setup +</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">৳২,৪৯৯</span>
                <span className="text-sm text-[#A1A1AA]">/month</span>
              </div>
              <p className="text-xs text-[#16A34A]">Total first payment: ৳৪,১৯৮</p>
            </div>

            <div className="p-3 rounded-xl bg-[#16A34A]/[0.06] border border-[#16A34A]/15 mb-5">
              <p className="text-xs font-semibold text-[#16A34A] mb-1">📦 Hardware</p>
              <p className="text-xs text-zinc-400">
                ২টি প্রিমিয়াম স্মার্ট NFC কার্ড + ১টি অ্যাক্রিলিক টেবিল স্ট্যান্ডি
              </p>
            </div>

            <div className="space-y-3 mb-8 flex-1">
              {[
                "ডায়নামিক পারফরম্যান্স লাইন চার্ট",
                "হোয়াটসঅ্যাপ মেসেজ জেনারেটর",
                "কাস্টম কাস্টমার অফার ব্যানার",
                "প্রাইওরিটি সাপোর্ট",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span className="text-sm text-white font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full h-12 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold shadow-lg shadow-[#16A34A]/25 hover:shadow-[#16A34A]/40 transition-all cursor-pointer"
              onClick={() => handleGetStarted("pro")}
            >
              <Star className="w-5 h-5 mr-2 fill-white" />
              Choose Plan
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
