import { useState, useEffect } from "react";
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
  ShieldCheck,
  Clock,
  Sparkles,
  Gift,
  AlertTriangle,
  ExternalLink,
  MessageCircle,
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

export default function Review() {
  const { clientSlug } = useParams<{ clientSlug: string }>();
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

  // UI state
  const [view, setView] = useState<"choice" | "feedback" | "submitted" | "redirecting">("choice");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  // Countdown for Google redirect
  useEffect(() => {
    if (view !== "redirecting") return;
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
  }, [view, business?.reviewUrl]);

  const handlePublicReview = async () => {
    // Log the public review action
    if (business) {
      try {
        await logPublicReview({ businessId: business.id, businessSlug: business.slug });
      } catch (e) {
        console.error("Failed to log public review:", e);
      }
    }
    setView("redirecting");
  };

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
        rating: 3, // Default rating for private feedback path (no star selection)
      });

      // Send email notification to business owner
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

      // Google Apps Script webhook
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

      setView("submitted");
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

  // Subscription Inactive
  if (subStatus && !subStatus.active) {
    const isTrialExpired = subStatus.reason === "expired" && subStatus.plan === "trial";
    const isCancelled = subStatus.reason === "cancelled";
    const isPending = subStatus.reason === "pending_payment";
    const noSubscription = subStatus.reason === "no_subscription";

    let title = "Account Temporarily Inactive";
    let message = "This business's subscription is currently inactive. Please contact the business owner or try again later.";
    let iconColor = "bg-amber-500/10";
    let iconText = "text-amber-400";
    let glowColor = "bg-amber-500/5";

    if (isTrialExpired) {
      title = "Free Trial Expired";
      message = "This business's 10-day free trial has ended. The business owner needs to subscribe to a plan to continue accepting reviews.";
      iconColor = "bg-red-500/10";
      iconText = "text-red-400";
      glowColor = "bg-red-500/5";
    } else if (isCancelled) {
      title = "Subscription Cancelled";
      message = "This business's subscription has been cancelled. Please contact the business owner for more information.";
      iconColor = "bg-red-500/10";
      iconText = "text-red-400";
      glowColor = "bg-red-500/5";
    } else if (isPending) {
      title = "Payment Under Review";
      message = "This business's payment is being verified. Review submission will be available shortly.";
    } else if (noSubscription) {
      title = "No Active Subscription";
      message = "This business has not set up a subscription yet. Please contact the business owner to get started with STAR CATCH.";
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[#0D0D0D]" />
          <div className={`absolute top-1/4 left-1/3 w-[400px] h-[400px] ${glowColor} rounded-full blur-3xl`} />
        </div>
        <GlassPanel className="p-8 sm:p-10 text-center max-w-md w-full">
          <div className={`w-16 h-16 mx-auto rounded-2xl ${iconColor} flex items-center justify-center mb-5`}>
            <Clock className={`w-8 h-8 ${iconText}`} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          <p className="text-[#A1A1AA] text-sm leading-relaxed">{message}</p>
        </GlassPanel>
      </div>
    );
  }

  // Service Paused — owner suspended
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
  if (view === "redirecting") {
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
          <h2 className="text-2xl font-bold text-white mb-2">Thank you for sharing your experience!</h2>
          {business.thankYouMessage ? (
            <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-300/90 leading-relaxed">{business.thankYouMessage}</p>
            </div>
          ) : (
            <p className="text-[#A1A1AA] text-sm mb-4">
              We'd love it if you shared your experience on Google. Thank you!
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
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Google Review Now
          </Button>
        </GlassPanel>
      </div>
    );
  }

  // Feedback submitted thank-you
  if (view === "submitted") {
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

  // ─── PRIVATE FEEDBACK FORM (view === "feedback") ───
  if (view === "feedback") {
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <GlassPanel className="p-8 sm:p-10">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-7 h-7 text-amber-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                  We're sorry to hear that.
                </h2>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">
                  Have an issue or concern? Speak directly with our management team
                  so we can resolve it for you within 24 hours.
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
                    onClick={() => { setView("choice"); setSelectedTags([]); setForm({ name: "", phone: "", email: "", message: "" }); }}
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
        </div>
      </div>
    );
  }

  // ─── MAIN VIEW: TWO-BUTTON CHOICE (view === "choice") ───
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <GlassPanel className="p-8 sm:p-10 text-center">
            {/* Business Logo with first-letter fallback */}
            {business.logoUrl && !logoFailed ? (
              <motion.img
                src={business.logoUrl}
                alt={business.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover mx-auto mb-6 shadow-xl border-2 border-white/10 bg-white/5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <motion.div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl mx-auto mb-6 shadow-xl border-2 border-white/10 bg-gradient-to-br from-[#16A34A] to-[#0D9668] flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-white font-bold text-4xl sm:text-5xl select-none">
                  {business.name?.charAt(0)?.toUpperCase() || "B"}
                </span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug"
            >
              How was your experience
              <br />
              with{" "}
              <span className="text-[#16A34A]">{business.name}</span>
              {" "}today?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[#A1A1AA] text-sm mb-8"
            >
              Choose how you'd like to share your feedback
            </motion.p>

            {/* ─── TWO EQUAL-WEIGHT BUTTONS ─── */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              {/* Option A: Share Public Review */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePublicReview}
                className="w-full group relative overflow-hidden rounded-2xl border border-[#16A34A]/30 bg-[#16A34A]/10 p-6 text-left transition-all hover:border-[#16A34A]/50 hover:bg-[#16A34A]/15 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#16A34A]/20 flex items-center justify-center shrink-0 group-hover:bg-[#16A34A]/30 transition-colors">
                    <Star className="w-7 h-7 text-[#16A34A] fill-[#16A34A]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Share Public Review</h3>
                    <p className="text-sm text-[#A1A1AA] leading-relaxed">
                      Leave a review on Google to help others discover this business
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-[#16A34A]/60 group-hover:text-[#16A34A] transition-colors shrink-0" />
                </div>
              </motion.button>

              {/* Equal visual divider */}
              <div className="flex items-center gap-3 px-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-[#A1A1AA]/40 font-medium">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Option B: Send Private Feedback */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView("feedback")}
                className="w-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all hover:border-white/20 hover:bg-white/[0.06] cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                    <MessageCircle className="w-7 h-7 text-[#A1A1AA]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Send Private Feedback</h3>
                    <p className="text-sm text-[#A1A1AA] leading-relaxed">
                      Speak directly with our management team — we'll resolve it within 24 hours
                    </p>
                  </div>
                  <MessageCircle className="w-5 h-5 text-[#A1A1AA]/40 group-hover:text-[#A1A1AA] transition-colors shrink-0" />
                </div>
              </motion.button>
            </motion.div>
          </GlassPanel>
        </motion.div>

        {/* ─── PROMOTIONAL BANNER ─── */}
        {business.promoEnabled && business.promoText && (
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
