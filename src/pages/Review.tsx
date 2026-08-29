import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Send,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MessageSquare,
  ShieldCheck,
  Clock,
  Gift,
  AlertTriangle,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

/* ─── Quick Complaint Tags ─── */
const QUICK_TAGS = [
  { label: "Slow Service", emoji: "⏰" },
  { label: "Cleanliness", emoji: "🧹" },
  { label: "Food Quality", emoji: "🍽️" },
  { label: "Staff Behavior", emoji: "😤" },
  { label: "Wait Time", emoji: "⏳" },
  { label: "Other", emoji: "💬" },
];

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
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/* ─── Brand CSS Variables Hook ─── */
function useBrandTheme(brandColor?: string) {
  return useMemo(() => {
    const base = brandColor || "#16A34A";
    const hsl = hexToHSL(base);
    if (!hsl) return { "--brand": base, "--brand-rgb": "22,163,74", classes: "" };
    return {
      "--brand": base,
      "--brand-rgb": `${Math.round((hsl.h / 360) * 255)},${hsl.s},${hsl.l}`,
      classes: "",
    };
  }, [brandColor]);
}

/* ─── Animation Variants ─── */
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

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function Review() {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  const [searchParams] = useSearchParams();
  const staffIdParam = searchParams.get("sid") || undefined;
  const staffInfo = useQuery(
    api.staff.getBySlug,
    staffIdParam ? { slug: staffIdParam } : "skip",
  );
  const effectiveStaffId = staffInfo?.id || staffIdParam || undefined;
  const business = useQuery(
    api.businesses.getBySlug,
    clientSlug ? { slug: clientSlug } : "skip",
  );
  const submitFeedback = useMutation(api.feedback.submit);
  const logPublicReview = useMutation(api.feedback.logPublicReview);
  const sendEmail = useAction(api.notifications.sendNegativeFeedbackEmail);
  const isOwnerSuspended = useQuery(
    api.users.isBusinessOwnerSuspended,
    business && "userId" in business ? { userId: (business as any).userId } : "skip",
  );
  const subStatus = useQuery(
    api.subscriptions.isBusinessActive,
    business && "userId" in business ? { userId: (business as any).userId } : "skip",
  );

  // State
  const [view, setView] = useState<"choice" | "feedback" | "submitted" | "redirecting">("choice");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  // Dynamic brand theme
  const brand = useBrandTheme(business?.brandColor);

  // Countdown for Google redirect
  useEffect(() => {
    if (view !== "redirecting") return;
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (business?.reviewUrl) window.location.href = business.reviewUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [view, business?.reviewUrl]);

  /* ─── Handlers ─── */
  const handlePublicReview = async () => {
    if (business) {
      try {
        await logPublicReview({ businessId: business.id, businessSlug: business.slug, staffId: effectiveStaffId });
      } catch (e) {
        console.error("Failed to log:", e);
      }
    }
    setView("redirecting");
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setIsSubmitting(true);
    try {
      const tagLabels = selectedTags.join(", ");
      const fullMessage = tagLabels
        ? `[${tagLabels}] ${form.message || "No additional details provided."}`
        : form.message || "No details provided.";
      const customerName = form.name.trim() || "Anonymous Customer";
      const customerPhone = form.phone.trim() || "N/A";
      const customerEmail = form.email.trim() || "N/A";

      await submitFeedback({
        businessId: business.id,
        businessSlug: business.slug,
        customerName,
        phone: customerPhone,
        email: customerEmail,
        message: fullMessage,
        rating: 3,
        staffId: effectiveStaffId,
      });

      sendEmail({
        alertEmail: business.alertEmail,
        businessName: business.name,
        businessSlug: business.slug,
        customerName,
        customerPhone,
        customerEmail,
        rating: 3,
        message: fullMessage,
      }).catch(() => {});

      fetch(
        "https://script.google.com/macros/s/AKfycbxGo4rMxugPJAbCJHCgrh6GC625zDZeKbcDOJcdPAKNqCltiVxVzxeF9-D6iZ6wGU_OkQ/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientEmail: business.alertEmail, customerName, customerPhone, feedbackMessage: fullMessage, businessName: business.name }),
        },
      ).catch(() => {});

      setView("submitted");
    } catch (err) {
      console.error("Failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setView("choice");
    setSelectedTags([]);
    setForm({ name: "", phone: "", email: "", message: "" });
  };

  /* ─── Derived ─── */
  const brandColor = business?.brandColor || "#16A34A";
  const welcomeMsg = business?.welcomeMessage || `How was your experience with ${business?.name || "us"} today?`;

  // Loading
  if (!clientSlug || business === undefined) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="fixed inset-0 -z-10 bg-[#0A0A0B]" />
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
          <p className="text-white/40 text-xs tracking-wide">Loading…</p>
        </div>
      </div>
    );
  }

  // Not found
  if (business === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-5" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="fixed inset-0 -z-10 bg-[#0A0A0B]" />
        <motion.div {...scaleIn} className="w-full max-w-sm text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Link Unavailable</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            This review link is invalid or has been deactivated.
          </p>
        </motion.div>
      </div>
    );
  }

  // Subscription inactive
  if (subStatus && !subStatus.active) {
    const isExpired = subStatus.reason === "expired";
    const isCancelled = subStatus.reason === "cancelled";
    const isPending = subStatus.reason === "pending_payment";

    return (
      <div className="min-h-dvh flex items-center justify-center px-5" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="fixed inset-0 -z-10 bg-[#0A0A0B]" />
        <motion.div {...scaleIn} className="w-full max-w-sm text-center">
          <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 ${isExpired || isCancelled ? "bg-red-500/10" : "bg-amber-500/10"}`}>
            <Clock className={`w-6 h-6 ${isExpired || isCancelled ? "text-red-400" : "text-amber-400"}`} />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            {isExpired ? "Trial Expired" : isCancelled ? "Subscription Cancelled" : isPending ? "Payment Under Review" : "Account Inactive"}
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            {isExpired
              ? "This business's free trial has ended. The owner needs to subscribe to continue."
              : isCancelled
                ? "This subscription has been cancelled."
                : isPending
                  ? "Payment is being verified. Reviews will be available shortly."
                  : "This account is currently inactive."}
          </p>
        </motion.div>
      </div>
    );
  }

  // Suspended
  if (isOwnerSuspended === true) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-5" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="fixed inset-0 -z-10 bg-[#0A0A0B]" />
        <motion.div {...scaleIn} className="w-full max-w-sm text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Service Paused</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            This business has temporarily paused review collection.
          </p>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER: MAIN LAYOUT
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-8"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0A0A0B]" />
        {business.heroUrl && !logoFailed ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.07]"
            style={{ backgroundImage: `url(${business.heroUrl})` }}
          />
        ) : (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.04]" style={{ backgroundColor: brandColor }} />
          </>
        )}
      </div>

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {/* ─── CHOICE VIEW ─── */}
          {view === "choice" && (
            <motion.div key="choice" {...fadeSlide}>
              <ChoiceView
                business={business}
                brandColor={brandColor}
                welcomeMsg={welcomeMsg}
                logoFailed={logoFailed}
                onLogoFail={() => setLogoFailed(true)}
                onPublicReview={handlePublicReview}
                onPrivateFeedback={() => setView("feedback")}
              />
            </motion.div>
          )}

          {/* ─── REDIRECTING VIEW ─── */}
          {view === "redirecting" && (
            <motion.div key="redirecting" {...fadeSlide}>
              <RedirectView
                business={business}
                brandColor={brandColor}
                countdown={redirectCountdown}
              />
            </motion.div>
          )}

          {/* ─── FEEDBACK FORM VIEW ─── */}
          {view === "feedback" && (
            <motion.div key="feedback" {...fadeSlide}>
              <FeedbackView
                brandColor={brandColor}
                selectedTags={selectedTags}
                form={form}
                isSubmitting={isSubmitting}
                onToggleTag={toggleTag}
                onFormChange={setForm}
                onSubmit={handleFeedbackSubmit}
                onBack={resetForm}
              />
            </motion.div>
          )}

          {/* ─── SUBMITTED VIEW ─── */}
          {view === "submitted" && (
            <motion.div key="submitted" {...scaleIn}>
              <SubmittedView
                business={business}
                brandColor={brandColor}
                onRestart={resetForm}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Promo Banner */}
        {view === "choice" && business.promoEnabled && business.promoText && (
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
              <p className="text-xs text-amber-300/70 leading-relaxed">{business.promoText}</p>
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

/* ═══════════════════════════════════════════════════════════════════
   SUB-VIEWS
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Choice View ─── */
function ChoiceView({
  business,
  brandColor,
  welcomeMsg,
  logoFailed,
  onLogoFail,
  onPublicReview,
  onPrivateFeedback,
}: {
  business: any;
  brandColor: string;
  welcomeMsg: string;
  logoFailed: boolean;
  onLogoFail: () => void;
  onPublicReview: () => void;
  onPrivateFeedback: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        className="mb-6"
      >
        {business.logoUrl && !logoFailed ? (
          <img
            src={business.logoUrl}
            alt={business.name}
            className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-white/[0.06]"
            onError={onLogoFail}
          />
        ) : (
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg text-white font-bold text-3xl"
            style={{ backgroundColor: brandColor }}
          >
            {business.name?.charAt(0)?.toUpperCase() || "B"}
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
        Choose how you'd like to share your feedback
      </motion.p>

      {/* Two Choice Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="w-full space-y-3"
      >
        {/* Public Review */}
        <motion.button
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={{ scale: 0.985 }}
          onClick={onPublicReview}
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
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill={brandColor}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-white mb-0.5">Submit Public Review</p>
              <p className="text-xs text-white/35 leading-snug">Share your experience on Google</p>
            </div>
            <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
          </div>
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-4 px-2">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[10px] text-white/20 font-medium tracking-widest">OR</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Private Feedback */}
        <motion.button
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={{ scale: 0.985 }}
          onClick={onPrivateFeedback}
          className="w-full group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.04] cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0 group-hover:bg-white/[0.06] transition-colors">
              <MessageCircle className="w-6 h-6 text-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-white mb-0.5">Provide Private Feedback</p>
              <p className="text-xs text-white/35 leading-snug">Speak directly with our management team</p>
            </div>
            <MessageCircle className="w-4 h-4 text-white/15 group-hover:text-white/30 transition-colors shrink-0" />
          </div>
        </motion.button>
      </motion.div>

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-6 flex items-center gap-1.5 text-[11px] text-white/20"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Your choice is completely voluntary — no pressure</span>
      </motion.div>
    </div>
  );
}

/* ─── Redirect View ─── */
function RedirectView({
  business,
  brandColor,
  countdown,
}: {
  business: any;
  brandColor: string;
  countdown: number;
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
      {business.thankYouMessage ? (
        <p className="text-sm text-white/50 leading-relaxed mb-5 max-w-xs">{business.thankYouMessage}</p>
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
        Redirecting in {Math.ceil(countdown / 10)}s…
      </p>
      <a
        href={business.reviewUrl || "#"}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
        style={{ backgroundColor: brandColor }}
      >
        <ExternalLink className="w-4 h-4" />
        Open Google Review
      </a>
    </div>
  );
}

/* ─── Feedback Form View ─── */
function FeedbackView({
  brandColor,
  selectedTags,
  form,
  isSubmitting,
  onToggleTag,
  onFormChange,
  onSubmit,
  onBack,
}: {
  brandColor: string;
  selectedTags: string[];
  form: { name: string; phone: string; email: string; message: string };
  isSubmitting: boolean;
  onToggleTag: (tag: string) => void;
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
        <h2 className="text-lg font-bold text-white mb-1">We're sorry to hear that.</h2>
        <p className="text-sm text-white/35 leading-relaxed max-w-xs mx-auto">
          Have an issue or concern? Speak directly with our management team so we can resolve it within 24 hours.
        </p>
      </div>

      {/* Quick Tags */}
      <div className="mb-5">
        <p className="text-[10px] text-white/25 uppercase tracking-widest font-medium text-center mb-3">
          Quick Select
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_TAGS.map((tag) => {
            const sel = selectedTags.includes(tag.label);
            return (
              <motion.button
                key={tag.label}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleTag(tag.label)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border"
                style={{
                  backgroundColor: sel ? `${brandColor}18` : "rgba(255,255,255,0.02)",
                  borderColor: sel ? `${brandColor}35` : "rgba(255,255,255,0.06)",
                  color: sel ? brandColor : "rgba(255,255,255,0.4)",
                }}
              >
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label className="flex items-center gap-1.5 text-white/30 text-xs font-medium">
            <User className="w-3 h-3" style={{ color: brandColor }} />
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
              <Phone className="w-3 h-3" style={{ color: brandColor }} />
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
              <Mail className="w-3 h-3" style={{ color: brandColor }} />
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
            <MessageSquare className="w-3 h-3" style={{ color: brandColor }} />
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
              Submit Feedback
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

/* ─── Submitted Thank You View ─── */
function SubmittedView({
  business,
  brandColor,
  onRestart,
}: {
  business: any;
  brandColor: string;
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

      {business.promoEnabled && business.promoText && (
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
          <p className="text-xs text-amber-300/70">{business.promoText}</p>
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
