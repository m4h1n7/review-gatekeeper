import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Zap, BarChart3, Bell, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { PaywallModal } from "@/components/PaywallModal";

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

  const handleGetStarted = (plan: string) => {
    if (plan === "starter" || plan === "pro") {
      setSelectedPlan(plan as "starter" | "pro");
      setShowPaywall(true);
      return;
    }
    if (isAuthenticated) {
      navigate("/manage");
    } else {
      navigate("/auth?returnTo=/admin");
    }
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

      {/* Pricing Cards */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Starter Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassPanel className="p-8 h-full flex flex-col rounded-3xl">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Starter Plan</h3>
                <p className="text-sm text-[#A1A1AA]">ছোট ক্যাফে / দোকান</p>
              </div>

              <div className="space-y-1 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">৳১,৯৯৯</span>
                  <span className="text-xs text-zinc-500">setup +</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white">৳১,৪৯৯</span>
                  <span className="text-sm text-[#A1A1AA]">/month</span>
                </div>
                <p className="text-xs text-zinc-500">Total first payment: ৳৩,৪৯৮</p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-5">
                <p className="text-xs font-semibold text-zinc-400 mb-1">📦 Hardware</p>
                <p className="text-xs text-zinc-500">১টি প্রিমিয়াম NFC QR কার্ড</p>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {["প্রাইভেট ফিডব্যাক ফিল্টার (১-৩ স্টার ব্লক)", "গ্যাপ রিয়েল-টাইম চার্ট", "বেসিক ড্যাশবোর্ড"].map((feature) => (
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
            </GlassPanel>
          </motion.div>

          {/* Business Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <GlassPanel className="p-8 h-full flex flex-col relative ring-2 ring-[#16A34A]/40 shadow-[0_8px_40px_rgba(22,163,74,0.1)] rounded-3xl">
              {/* Popular badge */}
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
                  <span className="text-3xl font-extrabold text-white">৳২,৯৯৯</span>
                  <span className="text-xs text-zinc-500">setup +</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white">৳২,৪৯৯</span>
                  <span className="text-sm text-[#A1A1AA]">/month</span>
                </div>
                <p className="text-xs text-[#16A34A]">Total first payment: ৳৫,৪৯৮</p>
              </div>

              <div className="p-3 rounded-xl bg-[#16A34A]/[0.06] border border-[#16A34A]/15 mb-5">
                <p className="text-xs font-semibold text-[#16A34A] mb-1">📦 Hardware</p>
                <p className="text-xs text-zinc-400">২টি প্রিমিয়াম NFC কার্ড + ১টি অ্যাক্রিলিক টেবিল স্ট্যান্ডি</p>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {["ডায়নামিক পারফরম্যান্স লাইন চার্ট", "হোয়াটসঅ্যাপ মেসেজ জেনারেটর", "কাস্টম কাস্টমার অফার ব্যানার", "প্রাইওরিটি সাপোর্ট"].map((feature) => (
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
            </GlassPanel>
          </motion.div>
        </div>
      </section>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
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
