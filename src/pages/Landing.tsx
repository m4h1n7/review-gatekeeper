import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Star,
  Shield,
  ArrowRight,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Eye,
  Bell,
  Smartphone,
  Zap,
  BarChart3,
  LayoutDashboard,
} from "lucide-react";

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.3)] ${className}`}
    >
      {children}
    </div>
  );
}

function StarCatchLogo({ size = "normal" }: { size?: "normal" | "small" }) {
  const iconSize = size === "small" ? "w-3.5 h-3.5" : "w-5 h-5";
  const boxSize = size === "small" ? "w-6 h-6" : "w-9 h-9";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${boxSize} rounded-xl bg-[#16A34A] flex items-center justify-center shadow-lg shadow-[#16A34A]/25`}>
        <Star className={`${iconSize} text-white fill-white`} />
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
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Dark background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#16A34A]/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 px-4 sm:px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <StarCatchLogo />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/pricing")}
              className="text-zinc-400 hover:text-white cursor-pointer hidden sm:flex"
            >
              Pricing
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/manage")}
              className="text-zinc-400 hover:text-white cursor-pointer hidden sm:flex"
            >
              Admin
            </Button>
            {isAuthenticated ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold shadow-lg shadow-[#16A34A]/25 hover:shadow-[#16A34A]/40 transition-all cursor-pointer"
              >
                Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold shadow-lg shadow-[#16A34A]/25 hover:shadow-[#16A34A]/40 transition-all cursor-pointer"
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16A34A]/10 backdrop-blur-sm border border-[#16A34A]/20 text-[#16A34A] text-sm font-medium mb-8">
              <Shield className="w-4 h-4" />
              Protect your Google rating
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            Shield Your
            <br />
            <span className="bg-gradient-to-r from-[#16A34A] via-emerald-400 to-green-300 bg-clip-text text-transparent">
              Google Rating
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 sm:mt-8 text-lg sm:text-xl text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed"
          >
            A review gatekeeper for local businesses. Satisfied customers are
            redirected to leave a public Google review. Others are guided to a
            private feedback form — keeping your public rating protected.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
              className="h-14 px-8 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-base shadow-xl shadow-[#16A34A]/25 hover:shadow-[#16A34A]/40 transition-all cursor-pointer"
            >
              <Star className="w-5 h-5 mr-2 fill-white" />
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/demo")}
              className="h-14 px-8 bg-white/[0.04] backdrop-blur-sm border-white/[0.08] text-zinc-300 font-semibold hover:bg-white/[0.08] cursor-pointer"
            >
              <Eye className="w-5 h-5 mr-2" />
              Try Demo Dashboard
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative z-10 px-4 sm:px-6 py-16 sm:py-24"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="text-sm font-semibold text-[#16A34A] uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Three simple steps
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                icon: <MessageSquare className="w-6 h-6" />,
                title: "Set Up Your Profile",
                desc: "Add your business name, logo, and Google Review URL. It takes less than a minute.",
                color: "from-[#16A34A] to-emerald-600",
              },
              {
                step: "02",
                icon: <Star className="w-6 h-6" />,
                title: "Share Your Link",
                desc: "Send customers your unique review URL. It works seamlessly on any device.",
                color: "from-emerald-500 to-green-400",
              },
              {
                step: "03",
                icon: <Shield className="w-6 h-6" />,
                title: "Protect Your Rating",
                desc: "Satisfied customers are directed to Google. Others submit private feedback to you.",
                color: "from-green-500 to-emerald-500",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassPanel className="p-6 sm:p-8 h-full">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-5 shadow-lg`}
                  >
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    Step {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    {item.desc}
                  </p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="text-sm font-semibold text-[#16A34A] uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Built for local businesses
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: <Star className="w-5 h-5" />,
                title: "Smart Star Routing",
                desc: "Customers who rate 4–5 stars are sent to Google. Those who rate 1–3 are given a private channel.",
              },
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                title: "Private Feedback Collection",
                desc: "Capture dissatisfied customer feedback before it reaches your public profile.",
              },
              {
                icon: <Eye className="w-5 h-5" />,
                title: "Rating Visibility Control",
                desc: "Keep your Google Business rating accurate by filtering reviews at the source.",
              },
              {
                icon: <BarChart3 className="w-5 h-5" />,
                title: "Analytics Dashboard",
                desc: "Track visits, redirects, and feedback trends across all your business profiles.",
              },
              {
                icon: <Bell className="w-5 h-5" />,
                title: "Instant Email Alerts",
                desc: "Receive email notifications the moment someone submits private feedback.",
              },
              {
                icon: <Smartphone className="w-5 h-5" />,
                title: "Mobile Optimized",
                desc: "Large tap targets and fluid layouts designed for customers on any device.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <GlassPanel className="p-6 h-full hover:bg-white/[0.06] transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 flex items-center justify-center text-[#16A34A] mb-4 group-hover:bg-[#16A34A]/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-white mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    {feature.desc}
                  </p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <GlassPanel className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16A34A]/10 backdrop-blur-sm border border-[#16A34A]/20 text-[#16A34A] text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Start free, upgrade anytime
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Simple, transparent pricing
              </h2>
              <p className="text-[#A1A1AA] text-base max-w-lg mx-auto mb-4">
                Free trial with 1 profile and 15 feedbacks. Pro plan at $10/month
                for unlimited profiles, analytics, and automated email alerts.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate("/pricing")}
                  className="h-14 px-10 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-base shadow-xl shadow-[#16A34A]/25 hover:shadow-[#16A34A]/40 transition-all cursor-pointer"
                >
                  <Star className="w-5 h-5 mr-2 fill-white" />
                  View Pricing
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-8 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <StarCatchLogo size="small" />
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} STAR CATCH Reviews and Feedback Agency Bd. Protect your
            reputation.
          </p>
        </div>
      </footer>
    </div>
  );
}
