import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Zap, BarChart3, Bell, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { PaywallModal } from "@/components/PaywallModal";
import { PricingCards } from "@/components/PricingCards";

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-[#18181B]/70 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.3)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">("pro");

  const handlePaidPlanSelect = (plan: "starter" | "pro") => {
    setSelectedPlan(plan);
    setShowPaywall(true);
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#16A34A]/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#16A34A]/3 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 px-4 sm:px-6 py-5 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl bg-[#16A34A]/15 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#16A34A] fill-[#16A34A]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-wide leading-tight">
                STAR CATCH
              </span>
              <span className="text-[10px] text-[#A1A1AA] tracking-wider leading-tight">
                Reviews and Feedback Agency Bd
              </span>
            </div>
          </div>
          <Button
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
            className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
          >
            {isAuthenticated ? "Dashboard" : "Get Started"}
          </Button>
        </div>
      </nav>

      {/* Header */}
      <section className="relative z-10 px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Simple, transparent pricing
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            Protect your reputation
            <br />
            <span className="text-[#16A34A]">
              with the right plan
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-[#A1A1AA] max-w-xl mx-auto"
          >
            One-time setup fee + monthly subscription. Pay via bKash, Nagad, or card.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards (shared component) */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto">
          <PricingCards onPaidPlanSelect={handlePaidPlanSelect} fullPage={true} showTrial={true} />
        </div>
      </section>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSuccess={() => {
          setShowPaywall(false);
          navigate("/onboarding");
        }}
        reason={`Unlock all features with the ${selectedPlan === "pro" ? "Business Pro" : "Starter"} plan.`}
        plan={selectedPlan}
      />

      {/* Feature comparison */}
      <section className="relative z-10 px-4 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <GlassPanel className="p-8 sm:p-12">
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              Everything included in your plan
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: <BarChart3 className="w-5 h-5" />, title: "Analytics Dashboard", desc: "Track visits, ratings, and feedback trends" },
                { icon: <Bell className="w-5 h-5" />, title: "Smart Routing", desc: "4-5 stars to Google, 1-3 stars to private form" },
                { icon: <Shield className="w-5 h-5" />, title: "Review Protection", desc: "Keep your Google rating accurate" },
                { icon: <Star className="w-5 h-5" />, title: "Mobile Optimized", desc: "Seamless experience on any device" },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 flex items-center justify-center text-[#16A34A] shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#16A34A]/15 flex items-center justify-center">
              <Star className="w-4 h-4 text-[#16A34A] fill-[#16A34A]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-wide leading-tight">
                STAR CATCH
              </span>
              <span className="text-[9px] text-[#A1A1AA]/60 tracking-wider leading-tight">
                Reviews and Feedback Agency Bd
              </span>
            </div>
          </div>
          <p className="text-xs text-[#A1A1AA]/60">
            © {new Date().getFullYear()} STAR CATCH Reviews and Feedback Agency Bd. Protect your reputation.
          </p>
        </div>
      </footer>
    </div>
  );
}
