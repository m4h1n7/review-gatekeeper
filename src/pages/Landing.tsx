import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Star,
  Shield,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Zap,
  ChevronRight,
  Quote,
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
      className={`rounded-3xl border border-white/60 bg-white/45 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function StarRow() {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="w-5 h-5 fill-amber-400 text-amber-400"
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/80 to-violet-50/60" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-200/25 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-violet-100/25 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 px-4 sm:px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">
              ReviewGuard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="text-slate-600 hover:text-slate-900 cursor-pointer hidden sm:flex"
            >
              Admin
            </Button>
            <Button
              onClick={() => navigate("/admin")}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 cursor-pointer"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/60 backdrop-blur-sm border border-blue-200/50 text-blue-700 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Protect your Google rating
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
          >
            Turn Every
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
              Review Into
            </span>
            <br />
            An Opportunity
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 sm:mt-8 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Gate your Google reviews. Happy customers get redirected to leave
            public praise. Unhappy ones are given a private channel to share
            feedback — before it ever hits your public profile.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate("/admin")}
              className="h-14 px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
            >
              Create Your Review Link
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="h-14 px-8 bg-white/50 backdrop-blur-sm border-white/60 text-slate-700 font-semibold hover:bg-white/70 cursor-pointer"
            >
              See How It Works
            </Button>
          </motion.div>

          {/* Social proof preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 sm:mt-20 max-w-3xl mx-auto"
          >
            <GlassPanel className="p-5 sm:p-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                  <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                      4.9
                    </span>
                    <StarRow />
                  </div>
                  <p className="text-sm text-slate-500">
                    Average rating maintained by ReviewGuard users ·{" "}
                    <span className="font-semibold text-slate-700">
                      93% negative feedback intercepted
                    </span>
                  </p>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Three simple steps
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                icon: <MessageSquare className="w-6 h-6" />,
                title: "Set Up Your Profile",
                desc: "Enter your business details, logo, and Google Review URL in under a minute.",
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50/80",
              },
              {
                step: "02",
                icon: <Star className="w-6 h-6" />,
                title: "Share Your Link",
                desc: "Send customers to your unique review gatekeeper page. Works on any device.",
                color: "from-indigo-500 to-violet-500",
                bgColor: "bg-indigo-50/80",
              },
              {
                step: "03",
                icon: <Shield className="w-6 h-6" />,
                title: "Guard Your Rating",
                desc: "Happy customers go to Google. Unhappy ones submit private feedback instead.",
                color: "from-violet-500 to-purple-500",
                bgColor: "bg-violet-50/80",
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
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Step {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
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
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything you need
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                icon: <Star className="w-5 h-5" />,
                title: "Star-Based Routing",
                desc: "4-5 stars redirect to Google. 1-3 stars open a private feedback form.",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Private Feedback",
                desc: "Collect negative feedback privately before it reaches your public profile.",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: "Rating Protection",
                desc: "Shield your Google Business rating from negative public reviews.",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Instant Setup",
                desc: "Create a review link in under a minute. No coding required.",
              },
              {
                icon: <MessageSquare className="w-5 h-5" />,
                title: "Email Alerts",
                desc: "Get notified instantly when someone submits private negative feedback.",
              },
              {
                icon: <ArrowRight className="w-5 h-5" />,
                title: "Mobile-First Design",
                desc: "Optimized for tap interactions on any device, from phones to desktops.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <GlassPanel className="p-6 h-full hover:bg-white/60 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50/80 flex items-center justify-center text-indigo-500 mb-4 group-hover:bg-indigo-100 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <GlassPanel className="p-8 sm:p-12 text-center">
              <Quote className="w-10 h-10 text-blue-300 mx-auto mb-6" />
              <p className="text-xl sm:text-2xl font-semibold text-slate-800 leading-relaxed mb-6">
                "Our Google rating went from 4.1 to 4.8 in just three months
                after using ReviewGuard. The private feedback channel has
                been invaluable."
              </p>
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-sm font-bold">
                  JC
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-900">
                    James Chen
                  </p>
                  <p className="text-xs text-slate-400">
                    Owner, Sunrise Café
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => navigate("/admin")}
                className="h-14 px-10 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer"
              >
                Start Protecting Your Rating
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </GlassPanel>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-8 border-t border-white/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-700">
              ReviewGuard
            </span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} ReviewGuard. Protect your reputation.
          </p>
        </div>
      </footer>
    </div>
  );
}
