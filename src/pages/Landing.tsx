import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin } from "@/components/SuperAdminGuard";
import { PricingCards } from "@/components/PricingCards";
import LiveDemoPreview from "@/components/LiveDemoPreview";
import FeatureCard from "@/components/FeatureCard";
import { translations, type Language } from "@/lib/translations";
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
  CheckCircle2,
  QrCode,
  Share2,
  TrendingUp,
  Send,
  StarHalf,
  Link2,
  MessageCircle,
  LogIn,
  Sparkles,
  Languages,
  Wifi,
  MessageCircleWarning,
} from "lucide-react";

function Logo({ size = "normal" }: { size?: "normal" | "small" }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${size === "small" ? "w-7 h-7" : "w-9 h-9"} rounded-xl bg-[#16A34A] flex items-center justify-center shadow-lg shadow-[#16A34A]/25`}>
        <Star className={`${size === "small" ? "w-4 h-4" : "w-5 h-5"} text-white fill-white`} />
      </div>
      <div className="flex flex-col">
        <span className={`font-bold ${size === "small" ? "text-sm" : "text-base"} text-white tracking-wide leading-tight`}>
          STAR CATCH
        </span>
        {size !== "small" && (
          <span className="text-[10px] text-[#A1A1AA] tracking-wider leading-tight">
            Reviews and Feedback Agency Bd
          </span>
        )}
      </div>
    </div>
  );
}

function InteractiveWidget() {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleRate = (star: number) => {
    setRating(star);
    setSubmitted(false);
  };

  const handleSubmitFeedback = () => {
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-2xl border border-white/10 bg-[#18181B]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#16A34A]/10 border-b border-white/5 px-5 py-4 text-center">
          <div className="w-10 h-10 rounded-full bg-[#16A34A]/20 flex items-center justify-center mx-auto mb-2">
            <Star className="w-5 h-5 text-[#16A34A] fill-[#16A34A]" />
          </div>
          <p className="text-sm font-semibold text-white">How was your experience?</p>
          <p className="text-xs text-[#A1A1AA] mt-0.5">Tap a star to rate us</p>
        </div>

        {/* Stars */}
        <div className="px-5 py-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110 cursor-pointer"
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  star <= (hoveredStar || (rating ?? 0))
                    ? "text-[#16A34A] fill-[#16A34A]"
                    : "text-white/10"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {rating && rating >= 4 && !submitted && (
            <motion.div
              key="google"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 pb-5"
            >
              <div className="rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
                <p className="text-sm font-semibold text-white mb-2">Thank you! We'd love a review.</p>
                <p className="text-xs text-[#A1A1AA] mb-3">Share your experience on Google</p>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#16A34A] text-white text-sm font-semibold hover:bg-[#15803D] transition-colors">
                  <Star className="w-4 h-4 fill-white" />
                  Leave Google Review
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {rating && rating <= 3 && !submitted && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 pb-5"
            >
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                <p className="text-sm font-semibold text-white mb-1">We're sorry to hear that.</p>
                <p className="text-xs text-[#A1A1AA] mb-3">Please share your feedback so we can improve.</p>
                <Input
                  placeholder="Your name"
                  className="h-9 bg-white/5 border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/50 mb-2"
                />
                <Textarea
                  placeholder="Tell us what went wrong..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/50 min-h-[60px] mb-2"
                />
                <button
                  onClick={handleSubmitFeedback}
                  className="w-full py-2 rounded-lg bg-amber-500/80 text-white text-sm font-semibold hover:bg-amber-500 transition-colors cursor-pointer"
                >
                  Submit Feedback
                </button>
              </div>
            </motion.div>
          )}

          {submitted && (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 pb-5"
            >
              <div className="rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">Thank you for your feedback.</p>
                <p className="text-xs text-[#A1A1AA] mt-1">Our team will review it shortly.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 text-center">
          <p className="text-[10px] text-[#A1A1AA]/50">Powered by STAR CATCH Reviews and Feedback Agency Bd</p>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const admin = isSuperAdmin(user?.email);

  const handleNavClick = () => {
    if (!isAuthenticated) return navigate("/auth");
    if (admin) return navigate("/admin");
    return navigate("/dashboard");
  };

  const navLabel = !isAuthenticated ? "Login / Sign Up" : admin ? "Admin Portal" : "Dashboard";
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("sc_lang");
      return saved === "bn" ? "bn" : "en";
    } catch {
      return "en";
    }
  });
  const t = translations[lang];
  const toggleLang = () => {
    const next = lang === "en" ? "bn" : "en";
    setLang(next);
    try { localStorage.setItem("sc_lang", next); } catch {}
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#16A34A]/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navbar */}
      <nav className="relative z-20 px-4 sm:px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="text-zinc-400 hover:text-white cursor-pointer hidden sm:flex"
            >
              How It Works
            </Button>
            <Button
              variant="ghost"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              className="text-zinc-400 hover:text-white cursor-pointer hidden sm:flex"
            >
              Pricing
            </Button>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-all cursor-pointer"
              title={lang === "en" ? "বাংলায় পরিবর্তন করুন" : "Switch to English"}
            >
              <Languages className="w-3.5 h-3.5" />
              {lang === "en" ? "বাং" : "EN"}
            </button>
            <Button
              onClick={handleNavClick}
              className={`font-semibold shadow-lg cursor-pointer ${
                isAuthenticated && admin
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25"
                  : "bg-[#16A34A] hover:bg-[#15803D] shadow-[#16A34A]/25"
              } text-white`}
            >
              {admin && <Shield className="w-4 h-4 mr-1" />}
              {!isAuthenticated && <LogIn className="w-4 h-4 mr-1" />}
              {navLabel}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16A34A]/10 backdrop-blur-sm border border-[#16A34A]/20 text-[#16A34A] text-sm font-medium mb-6">
                  <TrendingUp className="w-4 h-4" />
                  Google ToS Compliant · Non-Gated Review System
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
              >
                Smart Review Gatekeeper
                <br />That Keeps You{' '}
                <span className="bg-gradient-to-r from-[#16A34A] via-emerald-400 to-green-300 bg-clip-text text-transparent">
                  100% Compliant
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-5 sm:mt-6 text-lg text-[#A1A1AA] max-w-xl leading-relaxed"
              >
                Give customers a seamless choice to leave a public Google review or send
                private feedback directly to management — protecting your reputation while
                staying 100% Google ToS Compliant.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-7 flex flex-col sm:flex-row items-start gap-4"
              >
                <Button
                  size="lg"
                  onClick={handleNavClick}
                  className="h-13 px-7 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-base shadow-xl shadow-[#16A34A]/25 cursor-pointer"
                >
                  <Star className="w-5 h-5 mr-2 fill-white" />
                  {navLabel === "Login / Sign Up" ? "Get Started Now" : navLabel}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  className="h-13 px-7 bg-white/[0.04] backdrop-blur-sm border-white/[0.08] text-zinc-300 font-semibold hover:bg-white/[0.08] cursor-pointer"
                >
                  See How It Works
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById("live-demo")?.scrollIntoView({ behavior: "smooth" })}
                  className="h-13 px-7 bg-white/[0.04] backdrop-blur-sm border-[#16A34A]/20 text-[#16A34A] font-semibold hover:bg-[#16A34A]/10 cursor-pointer"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Live Demo
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex items-center gap-4 text-xs text-[#A1A1AA]"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  Setup in 2 minutes
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  Pay only when ready to launch
                </div>
              </motion.div>
            </div>

            {/* Right: Interactive Widget */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <InteractiveWidget />
            </motion.div>
          </div>
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
            <p className="text-sm font-semibold text-[#16A34A] uppercase tracking-widest mb-3">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Three steps to better reviews
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                icon: <Link2 className="w-6 h-6" />,
                title: "Connect your Google profile",
                desc: "Paste your Google Review URL from your Google Business Profile dashboard. We'll create a unique review gateway link for you.",
                color: "from-[#16A34A] to-emerald-600",
              },
              {
                step: "02",
                icon: <QrCode className="w-6 h-6" />,
                title: "Share your link or QR code",
                desc: "Send your custom review link via SMS, WhatsApp, or display the printable QR code at your business.",
                color: "from-emerald-500 to-green-400",
              },
              {
                step: "03",
                icon: <Shield className="w-6 h-6" />,
                title: "Automatically boost your rating",
                desc: "Happy customers are routed to Google. Unhappy ones submit private feedback — keeping your public rating protected.",
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
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-8 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-5 shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    Step {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
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
              {t.featuresLabel}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">{t.featuresTitle}</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* 1. Smart Star Routing */}
            <FeatureCard
              icon={<StarHalf className="w-5 h-5" />}
              title={t.smartStarRoutingTitle}
              desc={t.smartStarRoutingDesc}
              index={0}
              demo={
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#16A34A]/10 border border-[#16A34A]/20">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-[#16A34A] fill-[#16A34A]' : 'text-[#16A34A] fill-[#16A34A]'}`} />
                      ))}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span className="text-xs font-medium text-[#16A34A]">{t.starDemo45}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex gap-0.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-amber-400">{t.starDemo13}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 pt-1">{t.starDemoInfo}</p>
                </div>
              }
            />

            {/* 2. Private Feedback Inbox */}
            <FeatureCard
              icon={<ShieldCheck className="w-5 h-5" />}
              title={t.privateFeedbackTitle}
              desc={t.privateFeedbackDesc}
              index={1}
              demo={
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-semibold text-white">New Complaint</span>
                    <span className="ml-auto text-[10px] text-zinc-500">2 min ago</span>
                  </div>
                  <p className="text-xs text-[#A1A1AA]">"Staff was rude and the food took 40 minutes..."</p>
                  <div className="flex gap-2">
                    <button className="text-[10px] px-2 py-1 rounded bg-[#16A34A]/10 text-[#16A34A] font-medium">Reply via WhatsApp</button>
                    <button className="text-[10px] px-2 py-1 rounded bg-white/5 text-zinc-400 font-medium">Mark Resolved</button>
                  </div>
                </div>
              }
            />

            {/* 3. Analytics Dashboard */}
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title={t.analyticsTitle}
              desc={t.analyticsDesc}
              index={2}
              demo={
                <div className="grid grid-cols-2 gap-2">
                  {[{ label: "Total Scans", value: "1,247", color: "text-white" }, { label: "Google Redirects", value: "89%", color: "text-[#16A34A]" }, { label: "Private Captured", value: "11%", color: "text-amber-400" }, { label: "Staff Leader", value: "Rahim", color: "text-emerald-300" }].map(m => (
                    <div key={m.label} className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-2.5">
                      <p className="text-[10px] text-zinc-500 mb-0.5">{m.label}</p>
                      <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
              }
            />

            {/* 4. Smart NFC Cards & Printable QR */}
            <FeatureCard
              icon={<Wifi className="w-5 h-5" />}
              title={t.qrNfcTitle}
              desc={t.qrNfcDesc}
              index={3}
              demo={
                <div className="flex flex-col items-center gap-3">
                  <div className="w-24 h-32 rounded-xl bg-white/[0.06] border border-white/[0.1] flex flex-col items-center justify-center gap-1.5">
                    <QrCode className="w-10 h-10 text-[#16A34A]" />
                    <span className="text-[10px] text-zinc-500">Scan Me</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                    {t.nfcDemoTitle}
                    <span className="text-zinc-600">|</span>
                    {t.nfcDemoSubtitle}
                  </div>
                  <button className="text-[10px] px-3 py-1.5 rounded-lg bg-[#16A34A]/10 text-[#16A34A] font-semibold">
                    Download Print-Ready PDF
                  </button>
                </div>
              }
            />

            {/* 5. Instant WhatsApp Alerts */}
            <FeatureCard
              icon={<MessageCircleWarning className="w-5 h-5" />}
              title={t.whatsappAlertsTitle}
              desc={t.whatsappAlertsDesc}
              index={4}
              demo={
                <div className="rounded-xl bg-[#075E54] p-3.5 max-w-[220px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[#128C7E] flex items-center justify-center">
                      <MessageCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-white">{t.whatsappDemoTitle}</p>
                      <p className="text-[9px] text-white/60">{t.whatsappDemoTime}</p>
                    </div>
                  </div>
                  <div className="bg-[#054640] rounded-lg p-2.5">
                    <p className="text-[11px] text-white/90">{t.whatsappDemoBody}</p>
                    <p className="text-[10px] text-white/40 mt-1">Star Catch Reviews</p>
                  </div>
                </div>
              }
            />

            {/* 6. Mobile Optimized */}
            <FeatureCard
              icon={<Smartphone className="w-5 h-5" />}
              title={t.mobileTitle}
              desc={t.mobileDesc}
              index={5}
              demo={
                <div className="flex items-center gap-3">
                  {["📱 iPhone 15", "🤖 Samsung S24", "📱 Pixel 8"].map(device => (
                    <div key={device} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                      <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                      <span className="text-[10px] text-zinc-400">{device}</span>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-sm font-semibold text-[#16A34A] uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Choose the right plan for your business</h2>
            <p className="mt-3 text-[#A1A1AA] text-base max-w-lg mx-auto">One-time setup fee + monthly subscription. Pay via bKash or Nagad.</p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <PricingCards fullPage={false} showTrial={true} />
          </div>
        </div>
      </section>

      <section id="live-demo" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-xs font-semibold mb-4">
            <Sparkles className="w-3 h-3" /> Live Business Pro Demo
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
            See the <span className="text-[#16A34A]">Non-Gated</span> Experience
          </h2>
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-xl mx-auto">
            Interact with the full Business Pro feature set — from customer review flow to staff analytics, QR posters, and real-time alerts.
          </p>
        </div>
        <LiveDemoPreview />
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to Protect Your Reputation?
              </h2>
              <p className="text-[#A1A1AA] text-base max-w-lg mx-auto mb-6">
                Join businesses using STAR CATCH's Google-Compliant system to give customers a fair choice while keeping your public rating stellar.
              </p>
              <Button
                size="lg"
                onClick={handleNavClick}
                className="h-14 px-10 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-base shadow-xl shadow-[#16A34A]/25 cursor-pointer"
              >
                <Star className="w-5 h-5 mr-2 fill-white" />
                {navLabel === "Login / Sign Up" ? "Get Started Now" : `Go to ${navLabel}`}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-10 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <Logo size="small" />
              <p className="text-xs text-zinc-500 mt-3 leading-relaxed max-w-xs">
                Protecting your Google rating by routing happy customers to leave public reviews and capturing negative feedback privately.
              </p>
              <div className="mt-3">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Official Support</p>
                <a href="mailto:starcatchbd@gmail.com" className="text-xs text-zinc-400 hover:text-white transition-colors">starcatchbd@gmail.com</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Founders</p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-zinc-300 font-medium">Mahin Hossain</p>
                  <p className="text-xs text-zinc-500">Founder</p>
                  <p className="text-xs text-zinc-500">
                    <a href="tel:+8801791130633" className="hover:text-white transition-colors">+880 1791-130633</a>
                    <span className="text-zinc-600 mx-1">·</span>
                    <a href="mailto:mahinhosen870@gmail.com" className="hover:text-white transition-colors">mahinhosen870@gmail.com</a>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-300 font-medium">Ahnaf Tajwar Alif</p>
                  <p className="text-xs text-zinc-500">Co-Founder</p>
                  <p className="text-xs text-zinc-500">
                    <a href="tel:+8801673903919" className="hover:text-white transition-colors">+880 1673-903919</a>
                    <span className="text-zinc-600 mx-1">·</span>
                    <a href="mailto:atazwar103@gmail.com" className="hover:text-white transition-colors">atazwar103@gmail.com</a>
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/8801673903919?text=${encodeURIComponent("Hi STAR CATCH team, I need help with my review dashboard")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-medium hover:bg-[#25D366]/20 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Contact Support on WhatsApp
              </a>
            </div>
            <div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Legal</p>
              <div className="flex flex-col gap-2 text-xs text-zinc-500">
                <button onClick={() => navigate("/terms")} className="hover:text-white transition-colors cursor-pointer text-left">Terms of Service</button>
                <button onClick={() => navigate("/privacy")} className="hover:text-white transition-colors cursor-pointer text-left">Privacy Policy</button>
                <button onClick={() => navigate("/refund-policy")} className="hover:text-white transition-colors cursor-pointer text-left">Refund &amp; Cancellation Policy</button>
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} STAR CATCH Reviews and Feedback Agency Bd. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <a href="mailto:starcatchbd@gmail.com" className="hover:text-white transition-colors">starcatchbd@gmail.com</a>
              <span>·</span>
              <a href="tel:+8801791130633" className="hover:text-white transition-colors">+880 1791-130633</a>
              <span>·</span>
              <a href="tel:+8801673903919" className="hover:text-white transition-colors">+880 1673-903919</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
