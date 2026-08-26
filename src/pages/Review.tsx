import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Star,
  Send,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Sparkles,
  Gift,
} from "lucide-react";

const QUICK_TAGS = [
  { label: "Slow Service", emoji: "⏰" },
  { label: "Cleanliness", emoji: "🧹" },
  { label: "Food Quality", emoji: "🍽️" },
  { label: "Staff Behavior", emoji: "😤" },
  { label: "Wait Time", emoji: "⏳" },
  { label: "Other", emoji: "💬" },
];

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-[#18181B]/80 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] ${className}`}
    >
      {children}
    </div>
  );
}

function StarButton({
  index,
  hoveredStar,
  onClick,
  onHover,
  onLeave,
}: {
  index: number;
  hoveredStar: number | null;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const isFilled = hoveredStar !== null && index <= hoveredStar;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.25, y: -4 }}
      whileTap={{ scale: 0.85 }}
      className="relative focus:outline-none cursor-pointer p-1.5 group"
      aria-label={`Rate ${index} out of 5 stars`}
    >
      <motion.div
        animate={isFilled ? { rotate: [0, -12, 12, -6, 0], scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Star
          className={`w-12 h-12 sm:w-14 sm:h-14 transition-all duration-300 ${
            isFilled
              ? "fill-amber-400 text-amber-400 drop-shadow-[0_3px_12px_rgba(251,191,36,0.5)]"
              : "fill-transparent text-[#A1A1AA]/25 group-hover:text-amber-300/40"
          }`}
          strokeWidth={1.5}
        />
      </motion.div>
      {/* Glow effect on hover */}
      {isFilled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 rounded-full bg-amber-400/10 blur-xl -z-10"
        />
      )}
    </motion.button>
  );
}

export default function Review() {
  const { clientSlug } = useParams<{ clientSlug: string }>();
  const business = useQuery(
    api.businesses.getBySlug,
    clientSlug ? { slug: clientSlug } : "skip",
  );
  const submitFeedback = useMutation(api.feedback.submit);
  const logRedirect = useMutation(api.feedback.logRedirect);
  const sendEmail = useAction(api.notifications.sendNegativeFeedbackEmail);
  const isOwnerSuspended = useQuery(
    api.users.isBusinessOwnerSuspended,
    business && "userId" in business ? { userId: (business as any).userId } : "skip",
  );

  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [redirectToGoogle, setRedirectToGoogle] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  // 1-second countdown for Google redirect
  useEffect(() => {
    if (!redirectToGoogle) return;
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (business?.reviewUrl) {
            window.location.href = business.reviewUrl;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [redirectToGoogle, business?.reviewUrl]);

  const handleStarClick = useCallback(
    async (rating: number) => {
      setSelectedRating(rating);
      if (rating >= 4) {
        if (business) {
          try {
            await logRedirect({ businessId: business.id, businessSlug: business.slug, rating });
          } catch (e) {
            console.error("Failed to log redirect:", e);
          }
        }
        setRedirectToGoogle(true);
      }
    },
    [business?.id, business?.slug, logRedirect],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
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

      // Anonymous fallback — use default values when fields are left blank
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
        rating: selectedRating ?? 0,
      });

      sendEmail({
        alertEmail: business.alertEmail,
        businessName: business.name,
        businessSlug: business.slug,
        customerName,
        customerPhone,
        customerEmail,
        rating: selectedRating ?? 0,
        message: fullMessage,
      }).catch(() => {});

      fetch(
        "https://script.google.com/macros/s/AKfycbxGo4rMxugPJAbCJHCgrh6GC625zDZeKbcDOJcdPAKNqCltiVxVzxeF9-D6iZ6wGU_OkQ/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientEmail: business.alertEmail,
            customerName,
            customerPhone,
            feedbackMessage: fullMessage,
            businessName: business.name,
          }),
        },
      ).catch(() => {});

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-12 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A] focus:ring-[#16A34A]/20 transition-all";

  // Loading
  if (!clientSlug || business === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-[#0D0D0D]" /></div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#16A34A]/30 border-t-[#16A34A] rounded-full animate-spin" />
          <p className="text-[#A1A1AA] text-sm">Loading review page...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (business === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-[#0D0D0D]" /></div>
        <GlassPanel className="p-8 sm:p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-5">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Business Not Found</h1>
          <p className="text-[#A1A1AA] text-sm leading-relaxed">
            This review link is invalid or has been deactivated. Please contact the business directly.
          </p>
        </GlassPanel>
      </div>
    );
  }

  // Service Paused — owner account suspended
  if (isOwnerSuspended === true) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[#0D0D0D]" />
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-3xl" />
        </div>
        <GlassPanel className="p-8 sm:p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-5">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Service Paused</h1>
          <p className="text-[#A1A1AA] text-sm leading-relaxed">
            This business has temporarily paused its review collection. Please try again later or contact the business directly.
          </p>
        </GlassPanel>
      </div>
    );
  }

  // Redirecting to Google
  if (redirectToGoogle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[#0D0D0D]" />
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-[#16A34A]/8 rounded-full blur-3xl" />
        </div>
        <GlassPanel className="p-8 sm:p-10 text-center max-w-md w-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
            <CheckCircle2 className="w-16 h-16 text-[#16A34A] mx-auto mb-5" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank you for your kind rating!</h2>
          {business.thankYouMessage ? (
            <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-300/90 leading-relaxed">{business.thankYouMessage}</p>
            </div>
          ) : (
            <p className="text-[#A1A1AA] text-sm mb-4">
              We'd love it if you shared your experience on Google.
            </p>
          )}
          <div className="w-48 h-1.5 mx-auto rounded-full bg-white/10 overflow-hidden mb-4">
            <motion.div
              className="h-full bg-[#16A34A] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </div>
          <p className="text-xs text-[#A1A1AA]/60">Redirecting in {Math.ceil(redirectCountdown / 10)}s...</p>
          <Button
            onClick={() => { if (business?.reviewUrl) window.location.href = business.reviewUrl; }}
            className="mt-4 h-11 px-6 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
          >
            <Star className="w-4 h-4 mr-2 fill-white" />
            Leave Google Review Now
          </Button>
        </GlassPanel>
      </div>
    );
  }

  // Submitted thank-you
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[#0D0D0D]" />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#16A34A]/5 rounded-full blur-3xl" />
        </div>
        <GlassPanel className="p-8 sm:p-10 text-center max-w-md w-full">
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#16A34A]/10 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">Thank you for your feedback.</h2>
          <p className="text-[#A1A1AA] text-sm leading-relaxed">
            Our management team has been notified and will reach out to you shortly. We appreciate you taking the time to help us improve.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#A1A1AA]/60">
            <ShieldCheck className="w-4 h-4" />
            Your feedback is confidential
          </div>
          {business.promoEnabled && business.promoText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Special Offer</span>
              </div>
              <p className="text-sm text-amber-300/90">{business.promoText}</p>
            </motion.div>
          )}
        </GlassPanel>
      </div>
    );
  }

  // Main view
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        {business.heroUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${business.heroUrl})` }}
          />
        ) : (
          <>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#16A34A]/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#16A34A]/3 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
          </>
        )}
      </div>

      <div className="w-full max-w-lg relative z-10">
        <AnimatePresence mode="wait">
          {/* ─── RATING STEP ─── */}
          {selectedRating === null && (
            <motion.div key="rating" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <GlassPanel className="p-8 sm:p-10 text-center">
                {/* Business Logo */}
                <motion.img
                  src={business.logoUrl}
                  alt={business.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover mx-auto mb-6 shadow-xl border-2 border-white/10 bg-white/5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect fill='%2318181B' width='96' height='96' rx='16'/%3E%3Ctext x='48' y='58' text-anchor='middle' fill='%23A1A1AA' font-size='28'%3E%F0%9F%8F%BA%3C/text%3E%3C/svg%3E";
                  }}
                />

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug"
                >
                  How was your experience
                  <br />
                  with{" "}
                  <span className="text-[#16A34A]">{business.name}</span>{" "}
                  today?
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-[#A1A1AA] text-sm mb-8"
                >
                  Tap a star to rate us
                </motion.p>

                {/* Stars */}
                <motion.div
                  className="flex items-center justify-center gap-3 sm:gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarButton
                      key={star}
                      index={star}
                      hoveredStar={hoveredStar}
                      onClick={() => handleStarClick(star)}
                      onHover={() => setHoveredStar(star)}
                      onLeave={() => setHoveredStar(null)}
                    />
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 flex items-center justify-center gap-4 text-xs text-[#A1A1AA]/50"
                >
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400/60" />
                    4–5 ★ → Google
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#A1A1AA]/30" />
                    1–3 ★ → Private
                  </span>
                </motion.div>
              </GlassPanel>
            </motion.div>
          )}

          {/* ─── FEEDBACK FORM (1-3 stars) ─── */}
          {selectedRating !== null && selectedRating < 4 && !submitted && (
            <motion.div key="feedback" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <GlassPanel className="p-8 sm:p-10">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-1.5 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-7 h-7 transition-all ${
                          star <= selectedRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-transparent text-white/10"
                        }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                    We're sorry to hear that.
                  </h2>
                  <p className="text-[#A1A1AA] text-sm">
                    Tell us what went wrong so we can make it right.
                  </p>
                </div>

                {/* Quick Tags */}
                <div className="mb-5">
                  <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-3 text-center">
                    Quick select (optional)
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag.label);
                      return (
                        <motion.button
                          key={tag.label}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleTag(tag.label)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#16A34A]/20 border border-[#16A34A]/40 text-[#16A34A]"
                              : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10"
                          }`}
                        >
                          <span>{tag.emoji}</span>
                          <span>{tag.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2 text-[#A1A1AA] font-medium text-sm">
                      <User className="w-4 h-4 text-[#16A34A]" /> Your Name <span className="text-xs text-[#A1A1AA]/50 font-normal">(Optional)</span>
                    </Label>
                    <Input
                      placeholder="e.g. John Doe (or leave blank to stay anonymous)"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-2 text-[#A1A1AA] font-medium text-sm">
                        <Phone className="w-4 h-4 text-[#16A34A]" /> Phone <span className="text-xs text-[#A1A1AA]/50 font-normal">(Optional)</span>
                      </Label>
                      <Input
                        placeholder="e.g. 01700-000000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-2 text-[#A1A1AA] font-medium text-sm">
                        <Mail className="w-4 h-4 text-[#16A34A]" /> Email <span className="text-xs text-[#A1A1AA]/50 font-normal">(Optional)</span>
                      </Label>
                      <Input
                        placeholder="e.g. you@email.com"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2 text-[#A1A1AA] font-medium text-sm">
                      <MessageSquare className="w-4 h-4 text-[#16A34A]" /> Additional Details
                    </Label>
                    <Textarea
                      placeholder="Tell us more if you'd like (or skip this step)"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A] focus:ring-[#16A34A]/20 transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => { setSelectedRating(null); setSelectedTags([]); }}
                      className="text-[#A1A1AA] hover:text-white hover:bg-white/5 cursor-pointer"
                    >
                      ← Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-12 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold shadow-lg shadow-[#16A34A]/25 hover:shadow-[#16A34A]/40 transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Submit Feedback
                        </div>
                      )}
                    </Button>
                  </div>
                </form>

                <p className="mt-4 text-center text-xs text-[#A1A1AA]/50 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Your feedback is confidential
                </p>
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── PROMOTIONAL BANNER ─── */}
        {selectedRating === null && business.promoEnabled && business.promoText && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-4"
          >
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] backdrop-blur-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Special Offer</span>
              </div>
              <p className="text-sm text-amber-300/90 leading-relaxed">{business.promoText}</p>
            </div>
          </motion.div>
        )}

        {/* ─── POWERED BY ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <p className="text-[10px] text-[#A1A1AA]/30 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            Powered by STAR CATCH
          </p>
        </motion.div>
      </div>
    </div>
  );
}
