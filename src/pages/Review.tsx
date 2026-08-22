import { useState, useCallback } from "react";
import { useParams } from "react-router";
import { useMutation, useQuery } from "convex/react";
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
} from "lucide-react";

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-white/60 bg-white/45 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

function StarIcon({
  filled,
  hovered,
  index,
  onClick,
  onHover,
  onLeave,
}: {
  filled: boolean;
  hovered: boolean;
  index: number;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      className="relative focus:outline-none cursor-pointer p-1"
      aria-label={`Rate ${index} out of 5 stars`}
    >
      <Star
        className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200 ${
          filled || hovered
            ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.4)]"
            : "fill-transparent text-slate-300 hover:text-amber-300"
        }`}
        strokeWidth={1.5}
      />
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

  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [redirectToGoogle, setRedirectToGoogle] = useState(false);

  const handleStarClick = useCallback(
    (rating: number) => {
      setSelectedRating(rating);
      if (rating >= 4) {
        setRedirectToGoogle(true);
        setTimeout(() => {
          if (business?.reviewUrl) {
            window.location.href = business.reviewUrl;
          }
        }, 800);
      }
    },
    [business?.reviewUrl],
  );

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setIsSubmitting(true);
    try {
      await submitFeedback({
        businessId: business.id,
        businessSlug: business.slug,
        customerName: form.name,
        phone: form.phone,
        email: form.email,
        message: form.message,
        rating: selectedRating ?? 0,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-12 bg-white/50 border-white/60 backdrop-blur-sm focus:bg-white/70 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/50 transition-all placeholder:text-slate-400";

  // Loading state
  if (!clientSlug || business === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/80 to-violet-50/60" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading review page...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (business === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/80 to-violet-50/60" />
        </div>
        <GlassPanel className="p-8 sm:p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50/80 flex items-center justify-center mb-5">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Business Not Found
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            This review link is invalid or has been deactivated. Please
            contact the business directly for their review page.
          </p>
        </GlassPanel>
      </div>
    );
  }

  // Redirecting to Google state
  if (redirectToGoogle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/80 to-violet-50/60" />
        </div>
        <GlassPanel className="p-8 sm:p-10 text-center max-w-md w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-5" />
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Thanks for the kind words! 🎉
          </h2>
          <p className="text-slate-500 text-sm">
            Redirecting you to Google Reviews...
          </p>
          <div className="mt-4 w-32 h-1.5 mx-auto rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />
          </div>
        </GlassPanel>
      </div>
    );
  }

  // Feedback submitted state
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/80 to-violet-50/60" />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-200/20 rounded-full blur-3xl" />
        </div>
        <GlassPanel className="p-8 sm:p-10 text-center max-w-md w-full">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50/80 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Thank you for your feedback!
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Our management team will reach out directly. We truly appreciate
            you taking the time to help us improve.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4" />
            Your feedback is confidential
          </div>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/80 to-violet-50/60" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200/25 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* Rating Step */}
          {selectedRating === null && (
            <motion.div
              key="rating"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <GlassPanel className="p-8 sm:p-10 text-center">
                {/* Business Logo */}
                <motion.img
                  src={business.logoUrl}
                  alt={business.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover mx-auto mb-6 shadow-lg border-2 border-white/70 bg-slate-100"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'%3E%3Crect fill='%23f1f5f9' width='96' height='96' rx='16'/%3E%3Ctext x='48' y='58' text-anchor='middle' fill='%2394a3b8' font-size='28'%3E%F0%9F%8F%BA%3C/text%3E%3C/svg%3E";
                  }}
                />

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 leading-snug">
                  How was your experience
                  <br />
                  with{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                    {business.name}
                  </span>
                  ?
                </h1>
                <p className="text-slate-400 text-sm mb-8">
                  Tap a star to rate us
                </p>

                {/* Stars */}
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      index={star}
                      filled={star <= (hoveredStar ?? 0)}
                      hovered={hoveredStar !== null && star <= hoveredStar}
                      onClick={() => handleStarClick(star)}
                      onHover={() => setHoveredStar(star)}
                      onLeave={() => setHoveredStar(null)}
                    />
                  ))}
                </div>

                <p className="mt-6 text-xs text-slate-400">
                  4–5 stars → Google review &nbsp;·&nbsp; 1–3 stars → Private
                  feedback
                </p>
              </GlassPanel>
            </motion.div>
          )}

          {/* Feedback Form (1-3 stars) */}
          {selectedRating !== null && selectedRating < 4 && !submitted && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <GlassPanel className="p-8 sm:p-10">
                {/* Header with stars */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= selectedRating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-transparent text-slate-200"
                        }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 leading-snug">
                    We're sorry to hear that.
                  </h2>
                  <p className="text-slate-500 text-sm">
                    How can we make it right?
                  </p>
                </div>

                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                      <User className="w-4 h-4 text-indigo-400" />
                      Your Name
                    </Label>
                    <Input
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className={inputClass}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                        <Phone className="w-4 h-4 text-indigo-400" />
                        Phone
                      </Label>
                      <Input
                        placeholder="(555) 123-4567"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        className={inputClass}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                        <Mail className="w-4 h-4 text-indigo-400" />
                        Email
                      </Label>
                      <Input
                        placeholder="you@email.com"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      Feedback
                    </Label>
                    <Textarea
                      placeholder="Tell us what happened and how we can improve..."
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      className="min-h-[100px] bg-white/50 border-white/60 backdrop-blur-sm focus:bg-white/70 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/50 transition-all placeholder:text-slate-400 resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSelectedRating(null)}
                      className="text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      ← Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-12 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Submit Private Feedback
                        </div>
                      )}
                    </Button>
                  </div>
                </form>

                <p className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Your feedback is confidential and shared only with management
                </p>
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
