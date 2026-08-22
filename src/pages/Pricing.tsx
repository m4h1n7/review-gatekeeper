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

  const handleGetStarted = (plan: string) => {
    if (plan === "pro") {
      setShowPaywall(true);
      return;
    }
    if (isAuthenticated) {
      navigate("/admin");
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
            <span className="font-bold text-lg text-white tracking-tight">
              STAR CATCH MEDIA
            </span>
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
            Start free,
            <br />
            <span className="text-[#16A34A]">
              scale when ready
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg text-[#A1A1AA] max-w-xl mx-auto"
          >
            Try Review Gatekeeper free with 1 profile and 15 feedbacks.
            Upgrade to Pro when you need more.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 sm:pb-28">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6 lg:gap-8">
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassPanel className="p-8 h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-[#A1A1AA]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  Free Trial
                </h3>
                <p className="text-sm text-[#A1A1AA]">
                  Try it out with no commitment
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">
                  $0
                </span>
                <span className="text-[#A1A1AA] text-sm ml-1">forever</span>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {[
                  "1 active review profile",
                  "Up to 15 feedbacks total",
                  "Smart star routing",
                  "Private feedback collection",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#A1A1AA]/40 shrink-0" />
                    <span className="text-sm text-[#A1A1AA]">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full h-12 border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 cursor-pointer"
                onClick={() => handleGetStarted("free")}
              >
                Get Started Free
              </Button>
            </GlassPanel>
          </motion.div>

          {/* Pro Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassPanel className="p-8 h-full flex flex-col relative ring-2 ring-[#16A34A]/40 shadow-[0_8px_40px_rgba(22,163,74,0.1)]">
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
                <h3 className="text-xl font-bold text-white mb-1">
                  Pro
                </h3>
                <p className="text-sm text-[#A1A1AA]">
                  For businesses that take reputation seriously
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white">
                  $10
                </span>
                <span className="text-[#A1A1AA] text-sm ml-1">/month</span>
                <p className="text-xs text-[#A1A1AA]/50 mt-1">৳1,000/month (BDT)</p>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {[
                  "Unlimited review profiles",
                  "Unlimited analytics & feedback",
                  "Automated email alerts",
                  "Real-time notifications",
                  "Priority support",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span className="text-sm text-white font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className="w-full h-12 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold shadow-lg shadow-[#16A34A]/25 hover:shadow-[#16A34A]/40 transition-all cursor-pointer"
                onClick={() => handleGetStarted("pro")}
              >
                <Star className="w-5 h-5 mr-2 fill-white" />
                Upgrade to Pro
              </Button>
            </GlassPanel>
          </motion.div>
        </div>
      </section>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        reason="Unlock unlimited profiles, analytics, and automated email alerts with the Pro plan."
      />

      {/* Feature comparison */}
      <section className="relative z-10 px-4 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <GlassPanel className="p-8 sm:p-12">
            <h2 className="text-xl font-bold text-white mb-6 text-center">
              What's included in both plans
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
            <span className="font-bold text-sm text-white tracking-tight">
              STAR CATCH MEDIA
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA]/60">
            © {new Date().getFullYear()} Star Catch Media. Protect your reputation.
          </p>
        </div>
      </footer>
    </div>
  );
}
