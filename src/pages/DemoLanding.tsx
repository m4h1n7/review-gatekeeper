import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Gift,
  MessageCircle,
  Clock,
} from "lucide-react";

/* ─── Helpers ─── */
function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : (max + min === 0 ? 0 : d / (2 - max - min));
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function useBrandTheme(brandColor?: string) {
  return typeof window !== "undefined"
    ? (() => {
        const base = brandColor || "#16A34A";
        const hsl = hexToHSL(base);
        if (!hsl)
          return { "--brand": base, "--brand-rgb": "22,163,74", classes: "" };
        return {
          "--brand": base,
          "--brand-rgb": `${Math.round((hsl.h / 360) * 255)},${hsl.s},${hsl.l}`,
          classes: "",
        };
      })()
    : { "--brand": "#16A34A", "--brand-rgb": "22,163,74", classes: "" };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim() || "demo";
}

/* ─── Animation variants ─── */
const fadeSlide = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

/* ─── Demo data store (URL search params + in-memory fallback) ─── */
type DemoData = {
  businessName: string;
  reviewUrl: string;
  logoUrl?: string;
  brandColor?: string;
  headline?: string;
  subtitle?: string;
  thankYouMessage?: string;
  promoEnabled?: boolean;
  promoText?: string;
};

const FALLBACK_DEMO: DemoData = {
  businessName: "Demo Business",
  reviewUrl: "https://search.google.com/local/writereview?placeid=PLACE_ID",
  logoUrl: undefined,
  brandColor: "#16A34A",
  headline: "How was your experience with Demo Business today?",
  subtitle: "Tap a star to rate your experience",
  thankYouMessage: "We'd love it if you shared your experience on Google. Thank you!",
  promoEnabled: false,
  promoText: "",
};

function loadDemoData(slug: string | undefined): DemoData {
  if (!slug) return FALLBACK_DEMO;
  // 1) Try reading from URL search params: /demo/:slug?name=...&url=...&logo=...&color=...
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name")?.trim();
  const url = params.get("url")?.trim();
  const logo = params.get("logo")?.trim() || undefined;
  const color = params.get("color")?.trim() || undefined;
  const headline = params.get("headline")?.trim() || undefined;
  const subtitle = params.get("subtitle")?.trim() || undefined;
  const thank = params.get("thankyou")?.trim() || undefined;
  const promo = params.get("promo")?.trim() || undefined;

  const out: DemoData = {
    businessName: name || slugify(slug).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || FALLBACK_DEMO.businessName,
    reviewUrl: url || FALLBACK_DEMO.reviewUrl,
    logoUrl: logo || undefined,
    brandColor: color || FALLBACK_DEMO.brandColor,
    headline: headline || FALLBACK_DEMO.headline,
    subtitle: subtitle || FALLBACK_DEMO.subtitle,
    thankYouMessage: thank || FALLBACK_DEMO.thankYouMessage,
    promoEnabled: promo ? true : FALLBACK_DEMO.promoEnabled,
    promoText: promo || FALLBACK_DEMO.promoText,
  };

  // Fallback brand color from slug if user only gave name (e.g. /demo/cafforia-bd?name=...)
  if (!out.brandColor || out.brandColor === "#000000") out.brandColor = FALLBACK_DEMO.brandColor;
  if (!out.reviewUrl || out.reviewUrl === "#") out.reviewUrl = FALLBACK_DEMO.reviewUrl;

  return out;
}

export default function DemoLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const demo = loadDemoData(slug);

  const brand = useBrandTheme(demo.brandColor);
  const brandColor = demo.brandColor || "#16A34A";

  // View state
  type ViewState = "rating" | "low-rating-options" | "feedback" | "submitted" | "redirecting";
  const [view, setView] = useState<ViewState>("rating");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(10);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  // Countdown redirect
  useEffect(() => {
    if (view !== "redirecting") return;
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (demo.reviewUrl && demo.reviewUrl !== "#") window.location.href = demo.reviewUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [view, demo.reviewUrl]);

  /* ─── Handlers ─── */
  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
    if (rating >= 4) {
      // 4-5 stars -> redirect to Google Review
      setView("redirecting");
    } else {
      // 1-3 stars -> dual-choice options
      setView("low-rating-options");
    }
  };

  const openPublicReview = () => {
    setView("redirecting");
  };

  const openPrivateFeedback = () => {
    setView("feedback");
  };

  const resetForm = () => {
    setView("rating");
    setSelectedRating(null);
    setForm({ name: "", phone: "", email: "", message: "" });
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Fire-and-forget the Google Apps Script webhook (same pattern as Review.tsx)
      fetch(
        "YOUR_NEW_GOOGLE_WEBHOOK_URL",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessName: demo.businessName,
            clientEmail: "",
            customerName: form.name.trim() || "Anonymous Customer",
            customerPhone: form.phone.trim() || "N/A",
            customerEmail: form.email.trim() || "N/A",
            feedbackMessage:
              form.message ||
              "No details provided.",
          }),
        },
      ).catch(() => {});
      setView("submitted");
    } catch (err) {
      console.error("Demo feedback submit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Derived display text ─── */
  const welcomeMsg =
    demo.headline ||
    `How was your experience with ${demo.businessName} today?`;
  const subtitleMsg = demo.subtitle || "Tap a star to rate your experience";
  const lowRatingHeading = "How would you like to share your feedback?";
  const lowRatingSubtitle = "Choose the option that works best for you";
  const privateLabel = "Inform our manager directly";
  const privateDesc =
    "Speak directly with our management team so we can improve your future experience.";
  const publicLabel = "Proceed to leave a public review";
  const publicDesc = "Share your experience on Google for others to see.";
  const feedbackHeading = "We're sorry to hear that. How can we make it right?";

  /* ─── Loading / not-found is not needed here — demo always renders ─── */

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-8"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0A0A0B]" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.04]"
          style={{ backgroundColor: brandColor }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {/* ─── STAR RATING VIEW ─── */}
          {view === "rating" && (
            <motion.div key="rating" {...fadeSlide}>
              <StarRatingView
                businessName={demo.businessName}
                logoUrl={demo.logoUrl}
                brandColor={brandColor}
                welcomeMsg={welcomeMsg}
                subtitleMsg={subtitleMsg}
                logoFailed={logoFailed}
                onLogoFail={() => setLogoFailed(true)}
                onStarClick={handleStarClick}
              />
            </motion.div>
          )}

          {/* ─── LOW RATING OPTIONS VIEW ─── */}
          {view === "low-rating-options" && (
            <motion.div key="low-options" {...fadeSlide}>
              <LowRatingOptionsView
                brandColor={brandColor}
                showPublicOption={true}
                heading={lowRatingHeading}
                subtitle={lowRatingSubtitle}
                privateLabel={privateLabel}
                privateDesc={privateDesc}
                publicLabel={publicLabel}
                publicDesc={publicDesc}
                onPrivateFeedback={openPrivateFeedback}
                onPublicReview={openPublicReview}
                onBack={resetForm}
              />
            </motion.div>
          )}

          {/* ─── REDIRECTING VIEW ─── */}
          {view === "redirecting" && (
            <motion.div key="redirecting" {...fadeSlide}>
              <RedirectView
                businessName={demo.businessName}
                brandColor={brandColor}
                countdown={redirectCountdown}
                reviewUrl={demo.reviewUrl}
                thankYouMessage={demo.thankYouMessage}
              />
            </motion.div>
          )}

          {/* ─── FEEDBACK FORM VIEW ─── */}
          {view === "feedback" && (
            <motion.div key="feedback" {...fadeSlide}>
              <FeedbackView
                brandColor={brandColor}
                heading={feedbackHeading}
                form={form}
                isSubmitting={isSubmitting}
                onFormChange={setForm}
                onSubmit={handleFeedbackSubmit}
                onBack={() => setView("low-rating-options")}
              />
            </motion.div>
          )}

          {/* ─── SUBMITTED VIEW ─── */}
          {view === "submitted" && (
            <motion.div key="submitted" {...scaleIn}>
              <SubmittedView
                businessName={demo.businessName}
                brandColor={brandColor}
                promoEnabled={demo.promoEnabled}
                promoText={demo.promoText}
                onRestart={resetForm}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Promo Banner (only on rating view) */}
        {view === "rating" && demo.promoEnabled && demo.promoText && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-4"
          >
            <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-3.5 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">Special Offer</span>
              </div>
              <p className="text-xs text-amber-300/70 leading-relaxed">{demo.promoText}</p>
            </div>
          </motion.div>
        )}

        {/* Powered By */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-center text-[10px] text-white/15 tracking-wide"
        >
          Powered by STAR CATCH
        </motion.p>
      </div>
    </div>
  );
}

/* ─── Sub-views ─── */

function StarRatingView({
  businessName,
  logoUrl,
  brandColor,
  welcomeMsg,
  subtitleMsg,
  logoFailed,
  onLogoFail,
  onStarClick,
}: {
  businessName: string;
  logoUrl?: string;
  brandColor: string;
  welcomeMsg: string;
  subtitleMsg: string;
  logoFailed: boolean;
  onLogoFail: () => void;
  onStarClick: (rating: number) => void;
}) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        className="mb-6"
      >
        {logoUrl && !logoFailed ? (
          <img
            src={logoUrl}
            alt={businessName}
            className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-white/[0.06]"
            onError={onLogoFail}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg text-white font-bold text-3xl"
            style={{ backgroundColor: brandColor }}
          >
            {businessName.charAt(0).toUpperCase() || "B"}
          </div>
        )}
      </motion.div>

      {/* Welcome Text */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl sm:text-2xl font-bold text-white text-center leading-snug mb-2 tracking-tight"
      >
        {welcomeMsg}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/35 text-sm mb-8 text-center"
      >
        {subtitleMsg}
      </motion.p>

      {/* Star Rating */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="flex items-center gap-3 sm:gap-5"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isHovered = hoveredStar !== null && star <= hoveredStar;
          return (
            <motion.button
              key={star}
              type="button"
              whileHover={{ scale: 1.2, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              onClick={() => onStarClick(star)}
              className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer transition-all duration-150 rounded-2xl"
              style={{
                backgroundColor: isHovered ? `${brandColor}18` : "transparent",
              }}
            >
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 transition-all duration-150"
                viewBox="0 0 24 24"
                fill={isHovered ? brandColor : "none"}
                stroke={isHovered ? brandColor : "rgba(255,255,255,0.25)"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Star labels */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex items-center justify-between w-full max-w-[300px] sm:max-w-[340px] mt-2 px-1"
      >
        <span className="text-[10px] text-white/20 font-medium">Poor</span>
        <span className="text-[10px] text-white/20 font-medium">Excellent</span>
      </motion.div>

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-8 flex items-center gap-1.5 text-[11px] text-white/20"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Your choice is completely voluntary — no pressure</span>
      </motion.div>
    </div>
  );
}

function LowRatingOptionsView({
  brandColor,
  showPublicOption,
  heading,
  subtitle,
  privateLabel,
  privateDesc,
  publicLabel,
  publicDesc,
  onPrivateFeedback,
  onPublicReview,
  onBack,
}: {
  brandColor: string;
  showPublicOption: boolean;
  heading: string;
  subtitle: string;
  privateLabel: string;
  privateDesc: string;
  publicLabel: string;
  publicDesc: string;
  onPrivateFeedback: () => void;
  onPublicReview: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Back */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1.5 text-white/30 text-xs mb-6 hover:text-white/50 transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Change rating
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${brandColor}12` }}
        >
          <MessageCircle className="w-7 h-7" style={{ color: brandColor }} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug"
        >
          {heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-sm text-white/35 leading-relaxed max-w-xs mx-auto"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Option Cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full space-y-3"
      >
        {/* Choice A: Private Manager Alert */}
        <motion.button
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={{ scale: 0.985 }}
          onClick={onPrivateFeedback}
          className="w-full group relative rounded-2xl p-5 text-left transition-all duration-200 cursor-pointer border"
          style={{
            backgroundColor: `${brandColor}08`,
            borderColor: `${brandColor}30`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = `${brandColor}50`;
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${brandColor}10`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = `${brandColor}30`;
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${brandColor}08`;
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200"
              style={{ backgroundColor: `${brandColor}20` }}
            >
              <MessageCircle className="w-6 h-6" style={{ color: brandColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-white mb-0.5">{privateLabel}</p>
              <p className="text-xs text-white/35 leading-snug">{privateDesc}</p>
            </div>
          </div>
        </motion.button>

        {/* Divider */}
        {showPublicOption && (
          <div className="flex items-center gap-4 px-2">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] text-white/20 font-medium tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
        )}

        {/* Choice B: Proceed to Public Review */}
        {showPublicOption && (
          <motion.button
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.985 }}
            onClick={onPublicReview}
            className="w-full group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04] cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0 group-hover:bg-white/[0.06] transition-colors">
                <svg className="w-6 h-6 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-white mb-0.5">{publicLabel}</p>
                <p className="text-xs text-white/35 leading-snug">{publicDesc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/15 group-hover:text-white/30 transition-colors shrink-0" />
            </div>
          </motion.button>
        )}
      </motion.div>

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex items-center gap-1.5 text-[11px] text-white/20"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Your choice is completely voluntary — no pressure</span>
      </motion.div>
    </div>
  );
}

function RedirectView({
  businessName,
  brandColor,
  countdown,
  reviewUrl,
  thankYouMessage,
}: {
  businessName: string;
  brandColor: string;
  countdown: number;
  reviewUrl: string;
  thankYouMessage?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: `${brandColor}15` }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: brandColor }} />
        </div>
      </motion.div>
      <h2 className="text-xl font-bold text-white mb-2">Thank you for sharing!</h2>
      {thankYouMessage ? (
        <p className="text-sm text-white/50 leading-relaxed mb-5 max-w-xs">{thankYouMessage}</p>
      ) : (
        <p className="text-sm text-white/40 mb-5 max-w-xs">
          We'd love it if you shared your experience on Google. Thank you!
        </p>
      )}
      {/* Progress bar */}
      <div className="w-40 h-1 rounded-full bg-white/[0.06] overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: brandColor }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </div>
      <p className="text-[11px] text-white/25 mb-4">
        Redirecting in {Math.max(1, Math.ceil(countdown / 10))}s…
      </p>
      <a
        href={reviewUrl && reviewUrl !== "#" ? reviewUrl : "#"}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
        style={{ backgroundColor: brandColor }}
      >
        <ExternalLink className="w-4 h-4" />
        Open Google Review
      </a>
    </div>
  );
}

function FeedbackView({
  brandColor,
  heading,
  form,
  isSubmitting,
  onFormChange,
  onSubmit,
  onBack,
}: {
  brandColor: string;
  heading: string;
  form: { name: string; phone: string; email: string; message: string };
  isSubmitting: boolean;
  onFormChange: (f: typeof form) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  const inputClass =
    "h-11 bg-white/[0.03] border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all rounded-xl";

  return (
    <div className="w-full">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-white/30 text-xs mb-5 hover:text-white/50 transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to options
      </button>

      {/* Header */}
      <div className="text-center mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ backgroundColor: `${brandColor}12` }}
        >
          <MessageCircle className="w-6 h-6 text-white/50" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">{heading}</h2>
        <p className="text-sm text-white/35 leading-relaxed max-w-xs mx-auto">
          Have an issue or concern? Speak directly with our management team so we can resolve it.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5 text-white/30 text-xs font-medium">
            <AlertTriangle className="w-3 h-3" style={{ color: brandColor }} />
            Name <span className="text-white/15 font-normal">(Optional)</span>
          </Label>
          <Input
            placeholder="Anonymous Customer"
            value={form.name}
            onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="flex items-center gap-1.5 text-white/30 text-xs font-medium">
              <Clock className="w-3 h-3" style={{ color: brandColor }} />
              Phone
            </Label>
            <Input
              placeholder="01700-000000"
              value={form.phone}
              onChange={(e) => onFormChange({ ...form, phone: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <Label className="flex items-center gap-1.5 text-white/30 text-xs font-medium">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
              Email
            </Label>
            <Input
              placeholder="you@email.com"
              type="email"
              value={form.email}
              onChange={(e) => onFormChange({ ...form, email: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="flex items-center gap-1.5 text-white/30 text-xs font-medium">
            <MessageCircle className="w-3 h-3" style={{ color: brandColor }} />
            Details
          </Label>
          <Textarea
            placeholder="Tell us more if you'd like…"
            value={form.message}
            onChange={(e) => onFormChange({ ...form, message: e.target.value })}
            className="min-h-[72px] bg-white/[0.03] border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all rounded-xl resize-none"
          />
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          style={{
            backgroundColor: brandColor,
            boxShadow: `0 8px 24px ${brandColor}25`,
          }}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Private Feedback
            </>
          )}
        </motion.button>
      </form>

      <p className="mt-4 text-center text-[10px] text-white/15 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        Your feedback is confidential
      </p>
    </div>
  );
}

function SubmittedView({
  businessName,
  brandColor,
  promoEnabled,
  promoText,
  onRestart,
}: {
  businessName: string;
  brandColor: string;
  promoEnabled?: boolean;
  promoText?: string;
  onRestart: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: `${brandColor}12` }}
        >
          <CheckCircle2 className="w-8 h-8" style={{ color: brandColor }} />
        </div>
      </motion.div>
      <h2 className="text-xl font-bold text-white mb-2">Thank you for your feedback.</h2>
      <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-4">
        Our management team has been notified and will reach out to you shortly. We appreciate you taking the time to help us improve.
      </p>
      <div className="flex items-center gap-1.5 text-[11px] text-white/20 mb-6">
        <ShieldCheck className="w-3.5 h-3.5" />
        Your feedback is confidential
      </div>

      {promoEnabled && promoText && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full p-3.5 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] text-center mb-4"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">Special Offer</span>
          </div>
          <p className="text-xs text-amber-300/70">{promoText}</p>
        </motion.div>
      )}

      <button
        onClick={onRestart}
        className="text-xs font-medium transition-colors cursor-pointer"
        style={{ color: `${brandColor}90` }}
      >
        ← Start over
      </button>
    </div>
  );
}
