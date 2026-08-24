import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin } from "@/components/SuperAdminGuard";
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
    return navigate("/pricing");
  };

  const navLabel = !isAuthenticated ? "Login / Sign Up" : admin ? "Admin Portal" : "My Account";

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
                  Join hundreds of businesses protecting their reputation
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
              >
                Get More 5-Star{" "}
                <span className="bg-gradient-to-r from-[#16A34A] via-emerald-400 to-green-300 bg-clip-text text-transparent">
                  Google Reviews
                </span>{" "}
                on Autopilot
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-5 sm:mt-6 text-lg text-[#A1A1AA] max-w-xl leading-relaxed"
              >
                Happy customers are automatically sent to leave a public Google review.
                Unhappy ones are redirected to a private feedback form — so your public
                rating stays protected.
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
                  onClick={() => navigate("/demo")}
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
            <p className="text-sm font-semibold text-[#16A34A] uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Everything you need</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              { icon: <StarHalf className="w-5 h-5" />, title: "Smart Star Routing", desc: "4-5 stars go to Google. 1-3 stars go to a private form. Automated and instant." },
              { icon: <ShieldCheck className="w-5 h-5" />, title: "Private Feedback Inbox", desc: "Capture negative feedback privately before it reaches your public profile." },
              { icon: <BarChart3 className="w-5 h-5" />, title: "Analytics Dashboard", desc: "Track visits, redirects, feedback trends, and your conversion rate over time." },
              { icon: <QrCode className="w-5 h-5" />, title: "Printable QR Codes", desc: "Generate and download print-ready QR codes for your storefront or cards." },
              { icon: <Share2 className="w-5 h-5" />, title: "WhatsApp & SMS Templates", desc: "One-click templates to share your review link with customers." },
              { icon: <Smartphone className="w-5 h-5" />, title: "Mobile Optimized", desc: "Large tap targets and fluid layouts designed for customers on any device." },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl p-6 h-full hover:bg-white/[0.06] transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 flex items-center justify-center text-[#16A34A] mb-4 group-hover:bg-[#16A34A]/20 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-white mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
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

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
            >
              <div className="rounded-3xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-2xl p-8 h-full flex flex-col relative overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-1">Starter Plan</h3>
                <p className="text-sm text-[#A1A1AA] mb-1">ছোট ক্যাফে / দোকান</p>
                <div className="mt-4 mb-1">
                  <span className="text-xs text-zinc-500 line-through">Setup Fee</span>
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-extrabold text-white">৳১,৯৯৯</span>
                  <span className="text-xs text-zinc-500 ml-1">one-time</span>
                </div>
                <div className="mb-1">
                  <span className="text-xs text-zinc-500 line-through">Monthly</span>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-white">৳১,৪৯৯</span>
                  <span className="text-sm text-[#A1A1AA] ml-1">/month</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-5">
                  <p className="text-xs font-semibold text-[#16A34A] mb-1">📦 Hardware Included</p>
                  <p className="text-xs text-zinc-400">১টি প্রিমিয়াম স্মার্ট NFC কার্ড (উইথ QR কোড)</p>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {["প্রাইভেট ফিডব্যাক ফিল্টার (১-৩ স্টার ব্লক)", "গ্যাপ রিয়েল-টাইম চার্ট", "বেসিক ড্যাশবোর্ড"].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                      <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate(isAuthenticated ? "/pricing" : "/auth")}
                  className="w-full h-11 bg-white/10 hover:bg-white/15 text-white font-semibold cursor-pointer border border-white/10"
                >
                  Get Started
                </Button>
              </div>
            </motion.div>

            {/* Business Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="rounded-3xl border border-[#16A34A]/30 bg-white/[0.04] backdrop-blur-2xl p-8 h-full flex flex-col relative overflow-hidden ring-1 ring-[#16A34A]/20">
                <div className="absolute top-0 right-0 px-3 py-1 bg-[#16A34A] text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-lg">
                  ★ Most Popular
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Business Pro Plan</h3>
                <p className="text-sm text-[#A1A1AA] mb-1">জনপ্রিয় রেস্তোরাঁ / সেলুন</p>
                <div className="mt-4 mb-1">
                  <span className="text-xs text-zinc-500 line-through">Setup Fee</span>
                </div>
                <div className="mb-1">
                  <span className="text-3xl font-extrabold text-white">৳২,৯৯৯</span>
                  <span className="text-xs text-zinc-500 ml-1">one-time</span>
                </div>
                <div className="mb-1">
                  <span className="text-xs text-zinc-500 line-through">Monthly</span>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-white">৳২,৪৯৯</span>
                  <span className="text-sm text-[#A1A1AA] ml-1">/month</span>
                </div>
                <div className="p-3 rounded-xl bg-[#16A34A]/[0.06] border border-[#16A34A]/15 mb-5">
                  <p className="text-xs font-semibold text-[#16A34A] mb-1">📦 Hardware Included</p>
                  <p className="text-xs text-zinc-400">২টি প্রিমিয়াম স্মার্ট NFC কার্ড + ১টি অ্যাক্রিলিক টেবিল স্ট্যান্ডি</p>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {["ডায়নামিক পারফরম্যান্স লাইন চার্ট", "হোয়াটসঅ্যাপ মেসেজ জেনারেটর", "কাস্টম কাস্টমার অফার ব্যানার", "প্রাইওরিটি সাপোর্ট"].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate(isAuthenticated ? "/pricing" : "/auth")}
                  className="w-full h-11 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold cursor-pointer shadow-lg shadow-[#16A34A]/25"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Choose Plan
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
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
                Ready to boost your Google reviews?
              </h2>
              <p className="text-[#A1A1AA] text-base max-w-lg mx-auto mb-6">
                Join businesses using STAR CATCH to automatically filter happy customers to Google and capture private feedback from the rest.
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
