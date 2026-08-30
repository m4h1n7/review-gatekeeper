import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Settings,
  Smartphone,
  ExternalLink,
  Send,
  CheckCircle2,
  Palette,
  Type,
  Image as ImageIcon,
  User,
  MessageSquare,
  Star,
  Globe,
  Shield,
  Users,
  QrCode,
  Download,
  Eye,
  Heart,
  Bell,
  MessageCircle,
  X,
  ChevronRight,
  Sparkles,
  BarChart3,
  Link,
} from "lucide-react";

/* ─── Types ─── */
type DemoStep =
  | "welcome"
  | "google-redirect"
  | "feedback-form"
  | "thank-you";

interface DemoConfig {
  businessName: string;
  brandColor: string;
  welcomeMessage: string;
  logoUrl: string;
  googleReviewUrl: string;
  staffMember: string;
  staffEnabled: boolean;
  showQR: boolean;
}

const STAFF_MEMBERS = ["Alex", "Sarah", "Rahim", "No Staff Attribution"];
const COLOR_PRESETS = [
  { name: "Green", value: "#16A34A" },
  { name: "Blue", value: "#0284C7" },
  { name: "Violet", value: "#7C3AED" },
  { name: "Amber", value: "#D97706" },
  { name: "Rose", value: "#E11D48" },
  { name: "Slate", value: "#1E293B" },
];

/* ─── Main Component ─── */
export default function LiveDemoPreview() {
  const [activeView, setActiveView] = useState<"customer" | "admin">("customer");
  const [step, setStep] = useState<DemoStep>("welcome");
  const [config, setConfig] = useState<DemoConfig>({
    businessName: "Green Leaf Cafe",
    brandColor: "#16A34A",
    welcomeMessage: "How was your experience with us today?",
    logoUrl: "",
    googleReviewUrl: "https://g.page/r/your-google-review-link",
    staffMember: "No Staff Attribution",
    staffEnabled: false,
    showQR: false,
  });
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackWhatsapp, setFeedbackWhatsapp] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [platformIcon, setPlatformIcon] = useState<string>("");

  /* ─── Quick Feedback Tags ─── */
  const QUICK_TAGS = [
    { label: "Service Quality", emoji: "✨" },
    { label: "Staff Behavior", emoji: "👥" },
    { label: "Pricing / Value", emoji: "💎" },
    { label: "Wait Time", emoji: "⏱️" },
    { label: "Cleanliness", emoji: "🌿" },
    { label: "Product Issue", emoji: "⚠️" },
  ];

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  /* ─── Derived ─── */

  /* ─── Handlers ─── */
  const resetDemo = useCallback(() => {
    setStep("welcome");
    setFeedbackName("");
    setFeedbackWhatsapp("");
    setFeedbackMessage("");
    setSelectedTags([]);
    setShowAlert(false);
    setPlatformIcon("");
    setSubmittedAt(null);
    setFocusedField(null);
  }, []);

  const handlePublicReview = useCallback(() => {
    setPlatformIcon("google");
    setStep("google-redirect");
    setTimeout(() => setStep("thank-you"), 2000);
  }, []);

  const handleFeedbackSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmittedAt(Date.now());
      setStep("thank-you");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 4000);
    },
    [],
  );



  /* ─── Config Updater ─── */
  const updateConfig = useCallback((patch: Partial<DemoConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  /* ─── Auto reset when admin config changes and user is on customer view ─── */
  useEffect(() => {
    if (activeView === "customer" && step !== "welcome") {
      resetDemo();
    }
  }, [config.brandColor, config.businessName, config.welcomeMessage]);

  /* ─── Reset logo loaded state when logo URL changes ─── */
  useEffect(() => {
    setLogoLoaded(false);
  }, [config.logoUrl]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* ─── View Switcher ─── */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setActiveView("customer")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeView === "customer"
              ? "bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/25"
              : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-white hover:bg-white/10"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Customer View
        </button>
        <button
          onClick={() => setActiveView("admin")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeView === "admin"
              ? "bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/25"
              : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-white hover:bg-white/10"
          }`}
        >
          <Settings className="w-4 h-4" />
          Dashboard View
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ═══════════════════════════════════════════════════════
            VIEW A: CUSTOMER MOBILE SIMULATION
            ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className={`${activeView === "admin" ? "hidden lg:block" : ""}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#16A34A]/10 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Customer Experience</p>
              <p className="text-[10px] text-[#A1A1AA]">What your customers see</p>
            </div>
            <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] text-green-400 font-medium">LIVE</span>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="relative mx-auto max-w-[320px]">
            {/* Phone Frame */}
            <div className="relative rounded-[2.5rem] bg-[#1a1a1e] p-3 shadow-2xl border border-white/5">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#1a1a1e] rounded-b-2xl z-10" />

              {/* Screen */}
              <div
                className="relative overflow-hidden rounded-[2rem] bg-[#0A0A0B] min-h-[520px]"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                {/* Screen Content */}
                <AnimatePresence mode="wait">
                  {step === "welcome" && (
                    <motion.div
                      key="welcome"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center justify-center p-6 text-center min-h-[520px]"
                    >
                      {/* Logo */}
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="mb-5"
                      >
                        {config.logoUrl ? (
                          <img
                            src={config.logoUrl}
                            alt={config.businessName}
                            className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-white/5"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                            style={{ backgroundColor: config.brandColor }}
                          >
                            {config.businessName.charAt(0)}
                          </div>
                        )}
                      </motion.div>

                      {/* Stars decoration */}
                      <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      {/* Welcome Text */}
                      <h3 className="text-base font-bold text-white mb-1 leading-snug px-2">
                        {config.welcomeMessage}
                      </h3>
                      <p className="text-[11px] text-white/35 mb-6">
                        Choose how you'd like to share your experience
                      </p>

                      {/* Two Choice Buttons */}
                      <div className="w-full space-y-3">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={handlePublicReview}
                          className="w-full rounded-2xl p-4 text-left transition-all cursor-pointer border"
                          style={{
                            backgroundColor: `${config.brandColor}08`,
                            borderColor: `${config.brandColor}30`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${config.brandColor}20` }}
                            >
                              <ExternalLink className="w-5 h-5" style={{ color: config.brandColor }} />
                            </div>
                            <div className="flex-1">
                              <p className="text-[13px] font-semibold text-white">Share Public Review</p>
                              <p className="text-[10px] text-white/30">Leave a review on your preferred platform</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20" />
                          </div>
                        </motion.button>

                        <div className="flex items-center gap-3 px-3">
                          <div className="flex-1 h-px bg-white/[0.06]" />
                          <span className="text-[9px] text-white/20 font-medium tracking-widest">OR</span>
                          <div className="flex-1 h-px bg-white/[0.06]" />
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setStep("feedback-form")}
                          className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.04]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                              <MessageCircle className="w-5 h-5 text-white/40" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[13px] font-semibold text-white">Send Private Feedback</p>
                              <p className="text-[10px] text-white/30">Message management directly & privately</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/15" />
                          </div>
                        </motion.button>
                      </div>

                      {/* Google Badge */}
                      <div className="flex items-center gap-2 mt-5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-white/5 border border-white/8 text-white/30">
                          ⭐ Google Reviews
                        </span>
                      </div>

                      {/* Staff Attribution */}
                      {config.staffEnabled && config.staffMember !== "No Staff Attribution" && (
                        <p className="text-[9px] text-white/15 mt-3">
                          Staff: {config.staffMember}
                        </p>
                      )}

                      <p className="text-[9px] text-white/15 mt-4 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Your choice is completely voluntary
                      </p>
                    </motion.div>
                  )}



                  {step === "google-redirect" && (
                    <motion.div
                      key="redirect"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center p-6 text-center min-h-[520px] justify-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                          style={{ backgroundColor: `${config.brandColor}15` }}
                        >
                          <CheckCircle2 className="w-8 h-8" style={{ color: config.brandColor }} />
                        </div>
                      </motion.div>
                      <h3 className="text-lg font-bold text-white mb-2">Thank you for sharing!</h3>
                      <p className="text-[11px] text-white/40 mb-5 max-w-xs">Redirecting to Google Reviews...</p>
                      <div className="w-32 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: config.brandColor }}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === "feedback-form" && (
                    <motion.div
                      key="feedback"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                      className="p-5 min-h-[520px]"
                    >
                      {/* Back button */}
                      <button
                        onClick={() => setStep("welcome")}
                        className="flex items-center gap-1 text-white/25 text-[11px] mb-5 hover:text-white/45 transition-all cursor-pointer group"
                      >
                        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                        Back to options
                      </button>

                      {/* ─── Animated Logo Avatar ─── */}
                      <div className="text-center mb-6">
                        {config.logoUrl ? (
                          <motion.div
                            className="relative mx-auto mb-4 w-14 h-14"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          >
                            {/* Pulsing glow ring */}
                            <div
                              className="absolute -inset-1 rounded-full animate-pulse"
                              style={{
                                background: `radial-gradient(circle, ${config.brandColor}20 0%, transparent 70%)`,
                              }}
                            />
                            {/* Skeleton while loading */}
                            {!logoLoaded && (
                              <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse" />
                            )}
                            <div
                              className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-2 backdrop-blur-sm"
                              style={{
                                borderColor: `${config.brandColor}40`,
                                boxShadow: `0 0 24px ${config.brandColor}20, inset 0 0 12px rgba(255,255,255,0.03)`,
                                opacity: logoLoaded ? 1 : 0,
                                transition: "opacity 0.5s ease-in-out",
                              }}
                            >
                              <img
                                ref={logoRef}
                                src={config.logoUrl}
                                alt="Business logo"
                                className="w-full h-full object-cover"
                                onLoad={() => setLogoLoaded(true)}
                                onError={() => setLogoLoaded(false)}
                              />
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm relative"
                            style={{
                              background: `linear-gradient(135deg, ${config.brandColor}10 0%, ${config.brandColor}05 100%)`,
                            }}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          >
                            {/* Ambient neon glow */}
                            <div
                              className="absolute -inset-2 rounded-full animate-pulse opacity-40"
                              style={{
                                background: `radial-gradient(circle, ${config.brandColor}15 0%, transparent 70%)`,
                              }}
                            />
                            <Heart
                              className="w-6 h-6 relative z-10"
                              style={{ color: `${config.brandColor}90` }}
                            />
                          </motion.div>
                        )}

                        <h3 className="text-[13px] font-bold text-white mb-1.5 tracking-tight">
                          We're sorry to hear that.
                        </h3>
                        <p className="text-[10px] text-white/30 leading-relaxed max-w-[220px] mx-auto">
                          Have an issue? Message management directly for a 24-hour response.
                        </p>
                      </div>

                      {/* ─── Feedback Form ─── */}
                      <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                        {/* Name Field */}
                        <div className="relative group">
                          <div
                            className="absolute -inset-[1px] rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
                            style={{ background: `linear-gradient(135deg, ${config.brandColor}30, ${config.brandColor}10)` }}
                          />
                          <div className="relative flex items-center">
                            <User className="absolute left-3 w-3.5 h-3.5 text-white/20 group-focus-within:text-white/40 transition-colors" />
                            <input
                              value={feedbackName}
                              onChange={(e) => setFeedbackName(e.target.value)}
                              onFocus={() => setFocusedField("name")}
                              onBlur={() => setFocusedField(null)}
                              placeholder="Name (optional)"
                              className="relative w-full h-11 pl-9 pr-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white text-[11px] placeholder:text-white/20 focus:outline-none transition-all"
                              style={
                                focusedField === "name"
                                  ? { borderColor: `${config.brandColor}35`, boxShadow: `0 0 20px ${config.brandColor}10` }
                                  : {}
                              }
                            />
                          </div>
                        </div>

                        {/* WhatsApp Field with Country Flag */}
                        <div className="relative group">
                          <div
                            className="absolute -inset-[1px] rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
                            style={{ background: `linear-gradient(135deg, ${config.brandColor}30, ${config.brandColor}10)` }}
                          />
                          <div className="relative flex items-center">
                            <div className="absolute left-3 flex items-center gap-1.5">
                              <span className="text-[13px]">🇧🇩</span>
                              <span className="text-[10px] text-white/25 font-medium">+880</span>
                            </div>
                            <input
                              value={feedbackWhatsapp}
                              onChange={(e) => setFeedbackWhatsapp(e.target.value)}
                              onFocus={() => setFocusedField("whatsapp")}
                              onBlur={() => setFocusedField(null)}
                              placeholder="WhatsApp (optional)"
                              className="relative w-full h-11 pl-[62px] pr-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white text-[11px] placeholder:text-white/20 focus:outline-none transition-all"
                              style={
                                focusedField === "whatsapp"
                                  ? { borderColor: `${config.brandColor}35`, boxShadow: `0 0 20px ${config.brandColor}10` }
                                  : {}
                              }
                            />
                          </div>
                        </div>

                        {/* ─── Quick Selection Tags ─── */}
                        <div>
                          <p className="text-[9px] text-white/25 uppercase tracking-[0.2em] font-semibold mb-2">
                            What can we improve?
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {QUICK_TAGS.map((tag) => {
                              const isActive = selectedTags.includes(tag.label);
                              return (
                                <motion.button
                                  key={tag.label}
                                  type="button"
                                  onClick={() => toggleTag(tag.label)}
                                  whileTap={{ scale: 0.92 }}
                                  whileHover={{ scale: 1.04 }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium border backdrop-blur-sm cursor-pointer select-none"
                                  style={{
                                    backgroundColor: isActive
                                      ? `${config.brandColor}18`
                                      : "rgba(255,255,255,0.03)",
                                    borderColor: isActive
                                      ? `${config.brandColor}40`
                                      : "rgba(255,255,255,0.06)",
                                    color: isActive ? config.brandColor : "rgba(255,255,255,0.3)",
                                    boxShadow: isActive
                                      ? `0 0 12px ${config.brandColor}15, inset 0 0 8px ${config.brandColor}08`
                                      : "none",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  <span className="text-[11px]">{tag.emoji}</span>
                                  <span>{tag.label}</span>
                                  {isActive && (
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="ml-0.5"
                                    >
                                      <CheckCircle2 className="w-2.5 h-2.5" style={{ color: config.brandColor }} />
                                    </motion.span>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Message Textarea */}
                        <div className="relative group">
                          <div
                            className="absolute -inset-[1px] rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
                            style={{ background: `linear-gradient(135deg, ${config.brandColor}30, ${config.brandColor}10)` }}
                          />
                          <div className="relative">
                            <textarea
                              value={feedbackMessage}
                              onChange={(e) => setFeedbackMessage(e.target.value)}
                              onFocus={() => setFocusedField("message")}
                              onBlur={() => setFocusedField(null)}
                              placeholder="Tell us more..."
                              className="relative w-full h-24 px-4 pt-3 pb-2 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white text-[11px] placeholder:text-white/20 focus:outline-none transition-all resize-none"
                              style={
                                focusedField === "message"
                                  ? { borderColor: `${config.brandColor}35`, boxShadow: `0 0 20px ${config.brandColor}10` }
                                  : {}
                              }
                            />
                          </div>
                        </div>

                        {/* ─── Premium Submit Button ─── */}
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.97 }}
                          className="relative w-full h-12 rounded-2xl text-white text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer overflow-hidden group"
                          style={{
                            background: `linear-gradient(135deg, ${config.brandColor}, ${config.brandColor}DD)`,
                            boxShadow: `0 4px 20px ${config.brandColor}30, 0 0 40px ${config.brandColor}10`,
                          }}
                        >
                          {/* Shimmer overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                          <Send className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          <span className="relative z-10">Submit Feedback</span>
                        </motion.button>

                        {/* Confidential badge */}
                        <div className="flex items-center justify-center gap-1.5 pt-1">
                          <Shield className="w-2.5 h-2.5 text-white/15" />
                          <span className="text-[9px] text-white/15 font-medium">100% Confidential</span>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {step === "thank-you" && (
                    <motion.div
                      key="thank-you"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center p-6 text-center min-h-[520px] justify-center relative overflow-hidden"
                    >
                      {/* ─── Confetti Particles ─── */}
                      {[...Array(18)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            width: Math.random() * 6 + 3,
                            height: Math.random() * 6 + 3,
                            left: `${15 + Math.random() * 70}%`,
                            top: `${20 + Math.random() * 30}%`,
                            backgroundColor: [
                              config.brandColor,
                              "#FBBF24",
                              "#F87171",
                              "#60A5FA",
                              "#A78BFA",
                              "#34D399",
                              "#FB923C",
                            ][i % 7],
                          }}
                          initial={{ opacity: 1, scale: 0, y: 0 }}
                          animate={{
                            opacity: [1, 1, 0],
                            scale: [0, 1.2, 0.8],
                            y: [0, -40 - Math.random() * 60, 60 + Math.random() * 40],
                            x: [
                              0,
                              (Math.random() - 0.5) * 120,
                              (Math.random() - 0.5) * 160,
                            ],
                            rotate: [0, Math.random() * 360, Math.random() * 720],
                          }}
                          transition={{
                            duration: 1.2 + Math.random() * 0.6,
                            delay: i * 0.04,
                            ease: "easeOut",
                          }}
                        />
                      ))}

                      {/* Animated checkmark circle */}
                      <motion.div
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
                        className="relative mb-6"
                      >
                        {/* Glow ring */}
                        <div
                          className="absolute -inset-3 rounded-full animate-pulse"
                          style={{
                            background: `radial-gradient(circle, ${config.brandColor}25 0%, transparent 70%)`,
                          }}
                        />
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-sm border"
                          style={{
                            borderColor: `${config.brandColor}30`,
                            background: `linear-gradient(135deg, ${config.brandColor}12 0%, ${config.brandColor}05 100%)`,
                            boxShadow: `0 0 30px ${config.brandColor}15`,
                          }}
                        >
                          <motion.div
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                          >
                            <CheckCircle2
                              className="w-9 h-9"
                              style={{ color: config.brandColor }}
                            />
                          </motion.div>
                        </div>
                      </motion.div>

                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="text-base font-bold text-white mb-2 tracking-tight"
                      >
                        Thank you!
                      </motion.h3>

                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="text-[11px] text-white/40 leading-relaxed max-w-[240px] mb-4"
                      >
                        Thank you for helping us improve! Management will reach out within 24 hours.
                      </motion.p>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.55, duration: 0.35 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-sm mb-6"
                        style={{
                          borderColor: `${config.brandColor}20`,
                          background: `${config.brandColor}08`,
                        }}
                      >
                        <Shield className="w-3 h-3" style={{ color: `${config.brandColor}80` }} />
                        <span className="text-[10px] text-white/35 font-medium">
                          Your feedback is confidential
                        </span>
                      </motion.div>

                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={resetDemo}
                        className="text-[11px] font-semibold transition-all cursor-pointer px-4 py-2 rounded-xl border"
                        style={{
                          color: `${config.brandColor}B0`,
                          borderColor: `${config.brandColor}20`,
                          background: `${config.brandColor}08`,
                        }}
                      >
                        ← Try again
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/10" />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {["welcome", "choice", "result"].map((s, i) => (
                <div
                  key={s}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    (step === "welcome" && i === 0) ||
                    (step === "feedback-form" && i === 1) ||
                    (step === "thank-you" && i === 2)
                      ? "w-8 bg-[#16A34A]"
                      : "w-2 bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════
            VIEW B: ADMIN DASHBOARD CUSTOMIZER
            ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${activeView === "customer" ? "hidden lg:block" : ""}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Business Dashboard</p>
              <p className="text-[10px] text-[#A1A1AA]">Customize what customers see — in real-time</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-5">
            {/* Business Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-1.5">
                <Type className="w-3 h-3" />
                Business Name
              </label>
              <input
                value={config.businessName}
                onChange={(e) => updateConfig({ businessName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/20 transition-all"
              />
            </div>

            {/* Welcome Message */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-1.5">
                <MessageSquare className="w-3 h-3" />
                Welcome Message
              </label>
              <input
                value={config.welcomeMessage}
                onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/20 transition-all"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-1.5">
                <ImageIcon className="w-3 h-3" />
                Logo URL (optional)
              </label>
              <input
                value={config.logoUrl}
                onChange={(e) => updateConfig({ logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/20 transition-all"
              />
            </div>

            {/* Brand Color */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-2">
                <Palette className="w-3 h-3" />
                Brand Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateConfig({ brandColor: c.value })}
                    className="w-8 h-8 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center"
                    style={{
                      backgroundColor: c.value,
                      borderColor: config.brandColor === c.value ? "white" : "transparent",
                    }}
                    title={c.name}
                  >
                    {config.brandColor === c.value && (
                      <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                    )}
                  </button>
                ))}
                <input
                  type="color"
                  value={config.brandColor}
                  onChange={(e) => updateConfig({ brandColor: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  title="Custom color"
                />
              </div>
            </div>

            {/* Review Platform — Google Only */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-2">
                <Globe className="w-3 h-3" />
                Review Platform
              </label>
              {/* Google Reviews — Active by Default */}
              <div className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-[#16A34A]/30 bg-[#16A34A]/5">
                <span className="text-sm">⭐</span>
                <span className="text-xs font-medium text-white flex-1 text-left">Google Reviews</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30">
                  Active by Default
                </span>
              </div>
              {/* Google Review URL Input */}
              <div className="mt-2">
                <label className="flex items-center gap-1.5 text-[10px] text-[#A1A1AA]/60 mb-1">
                  <Link className="w-2.5 h-2.5" />
                  Your Google Review Link
                </label>
                <input
                  value={config.googleReviewUrl}
                  onChange={(e) => updateConfig({ googleReviewUrl: e.target.value })}
                  placeholder="https://g.page/r/your-google-review-link"
                  className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/20 transition-all"
                />
              </div>
            </div>

            {/* Staff Attribution */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-2">
                <Users className="w-3 h-3" />
                Staff Attribution
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => updateConfig({ staffEnabled: !config.staffEnabled })}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/10 transition-all cursor-pointer"
                >
                  <span className="text-xs font-medium text-white flex-1 text-left">Enable Staff Tracking</span>
                  <div
                    className={`w-8 h-5 rounded-full transition-all flex items-center ${
                      config.staffEnabled ? "bg-[#16A34A] justify-end" : "bg-white/10 justify-start"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow mx-0.5" />
                  </div>
                </button>

                {config.staffEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {STAFF_MEMBERS.map((name) => (
                      <button
                        key={name}
                        onClick={() => updateConfig({ staffMember: name })}
                        className={`p-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                          config.staffMember === name
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                            : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/60"
                        }`}
                      >
                        {name === "No Staff Attribution" ? "None" : name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* QR Poster Preview */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-2">
                <QrCode className="w-3 h-3" />
                QR Poster Preview
              </label>
              <button
                onClick={() => updateConfig({ showQR: !config.showQR })}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  config.showQR
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                }`}
              >
                <span className="text-xs font-medium text-white flex-1 text-left">Show Print-Ready Poster</span>
                <div
                  className={`w-8 h-5 rounded-full transition-all flex items-center ${
                    config.showQR ? "bg-amber-500 justify-end" : "bg-white/10 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow mx-0.5" />
                </div>
              </button>

              {config.showQR && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 p-4 rounded-xl bg-white border border-gray-100 text-center"
                >
                  <div className="mb-2 flex justify-center">
                    <QRCodeSVG
                      value="https://starcatchreviews.freebuff.app/review/demo"
                      size={120}
                      bgColor="#FFFFFF"
                      fgColor={config.brandColor}
                      level="H"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-gray-800">{config.businessName}</p>
                  <p className="text-[9px] text-gray-500">Tap or Scan to Share Your Experience</p>
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    <QrCode className="w-2.5 h-2.5 text-gray-400" />
                    <span className="text-[8px] text-gray-400 font-medium">Powered by STAR CATCH</span>
                  </div>
                  <button className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-1.5 rounded-lg bg-[#16A34A] text-white text-[10px] font-semibold">
                    <Download className="w-3 h-3" />
                    Download Poster
                  </button>
                </motion.div>
              )}
            </div>

            {/* Status Preview */}
            <div className="p-3 rounded-xl bg-[#16A34A]/[0.04] border border-[#16A34A]/15">
              <p className="text-[10px] font-semibold text-[#16A34A] uppercase tracking-wider mb-2">Quick Stats Preview</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-white">247</p>
                  <p className="text-[9px] text-white/40">Total Scans</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#16A34A]">89%</p>
                  <p className="text-[9px] text-white/40">Google Redirects</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-400">11%</p>
                  <p className="text-[9px] text-white/40">Private Feedback</p>
                </div>
              </div>
            </div>

            {/* ─── AI Auto-Reply Simulator ─── */}
            <div className="p-3 rounded-xl bg-purple-500/[0.04] border border-purple-500/15">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">AI Auto-Reply Assistant</p>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[9px] text-white/30 mb-1">Incoming Review (5★)</p>
                  <p className="text-[10px] text-white/60">"Amazing food and great service! Will definitely come back."</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-purple-500/40" />
                  <p className="text-[9px] text-purple-300/70 italic">AI Drafting Reply...</p>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-500/[0.06] border border-purple-500/20">
                  <p className="text-[9px] text-purple-300/60 mb-1">Auto-Generated Response:</p>
                  <p className="text-[10px] text-white/70">"Thank you so much for your kind words! We're thrilled you enjoyed your experience. See you soon! 🌟"</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 text-[9px] font-medium text-purple-300 cursor-pointer">Approve & Post</button>
                  <button className="flex-1 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[9px] font-medium text-white/40 cursor-pointer">Edit Reply</button>
                </div>
              </div>
            </div>

            {/* ─── Staff Performance Leaderboard ─── */}
            <div className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/15">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-3 h-3 text-amber-400" />
                <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Staff Leaderboard</p>
              </div>
              <div className="space-y-1.5">
                {[
                  { name: "Alex", scans: 89, reviews: 72, rank: "🥇" },
                  { name: "Sarah", scans: 74, reviews: 58, rank: "🥈" },
                  { name: "Rahim", scans: 61, reviews: 49, rank: "🥉" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-sm">{s.rank}</span>
                    <span className="text-[11px] font-medium text-white flex-1">{s.name}</span>
                    <span className="text-[9px] text-white/40">{s.scans} scans</span>
                    <span className="text-[9px] text-amber-400/80">{s.reviews} reviews</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Monthly Analytics Chart ─── */}
            <div className="p-3 rounded-xl bg-blue-500/[0.04] border border-blue-500/15">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-3 h-3 text-blue-400" />
                <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Monthly Analytics</p>
              </div>
              {/* Simulated bar chart */}
              <div className="flex items-end gap-1.5 h-20">
                {[40, 65, 50, 80, 70, 95, 60, 85, 75, 90, 70, 88].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm transition-all"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i === 11 ? config.brandColor : `${config.brandColor}40`,
                      }}
                    />
                    <span className="text-[7px] text-white/25">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-white/[0.04]">
                <div className="text-center">
                  <p className="text-[11px] font-bold text-white">1,247</p>
                  <p className="text-[8px] text-white/30">Total Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold text-[#16A34A]">+23%</p>
                  <p className="text-[8px] text-white/30">Growth</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-bold text-amber-400">4.7★</p>
                  <p className="text-[8px] text-white/30">Avg Rating</p>
                </div>
              </div>
            </div>

            {/* ─── WhatsApp Instant Alert Simulator ─── */}
            <div className="p-3 rounded-xl bg-green-500/[0.04] border border-green-500/15">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-3 h-3 text-green-400" />
                <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">WhatsApp Alert Simulator</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#075E54]/20 border border-[#25D366]/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                    <Bell className="w-3 h-3 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-white">STAR CATCH Alerts</p>
                    <p className="text-[7px] text-white/30">Business Notification</p>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                  <p className="text-[9px] text-white/60 leading-relaxed whitespace-pre-line">
                    {"⚠️ New private feedback received!\nRating: 2★ (Private)\nTags: Service Quality, Wait Time\nCustomer: Ahmed\nMessage: \"Waited 45 minutes for our order...\"\n📱 Reply within 24h for best retention."}
                  </p>
                </div>
              </div>
            </div>

            {/* Try It CTA */}
            <button
              onClick={() => setActiveView("customer")}
              className="w-full h-10 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Preview Customer View
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─── Notification Alert Popup ─── */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 40, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 max-w-sm w-[calc(100%-2rem)]"
          >
            <div className="rounded-2xl border border-white/10 bg-[#18181B]/95 backdrop-blur-xl shadow-2xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">Alert Sent to Business Owner</p>
                <p className="text-[10px] text-white/40 mt-0.5">
                  Email notification dispatched to {config.businessName} dashboard. New private feedback requires attention.
                </p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="text-white/30 hover:text-white/60 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
