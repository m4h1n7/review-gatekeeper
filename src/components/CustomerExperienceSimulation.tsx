import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ExternalLink,
  MessageCircle,
  Send,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  MessageSquare,
  User,
  Phone,
  Mail,
  RotateCcw,
  Smartphone,
} from "lucide-react";

type SimState = "invitation" | "choice" | "google-review" | "private-feedback" | "thank-you";

const QUICK_TAGS = [
  { label: "Slow Service", emoji: "⏰" },
  { label: "Cleanliness", emoji: "🧹" },
  { label: "Food Quality", emoji: "🍽️" },
  { label: "Staff Behavior", emoji: "😤" },
  { label: "Wait Time", emoji: "⏳" },
  { label: "Other", emoji: "💬" },
];

/* ─── Phone Mockup Shell ─── */
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[320px] sm:w-[340px]">
      {/* Phone bezel */}
      <div className="relative rounded-[2.5rem] border-2 border-white/10 bg-[#111113] shadow-2xl shadow-black/50 overflow-hidden">
        {/* Notch */}
        <div className="relative z-10 flex justify-center pt-3 pb-1">
          <div className="w-24 h-5 rounded-full bg-black" />
        </div>
        {/* Screen */}
        <div className="relative h-[520px] overflow-hidden bg-[#0D0D0D]">
          {children}
        </div>
        {/* Home indicator */}
        <div className="flex justify-center pb-3 pt-1">
          <div className="w-28 h-1 rounded-full bg-white/20" />
        </div>
      </div>
      {/* Glow */}
      <div className="absolute -inset-4 bg-[#16A34A]/5 rounded-[3rem] blur-2xl -z-10" />
    </div>
  );
}

/* ─── STATE 1: Invitation Screen ─── */
function InvitationScreen({ onProceed }: { onProceed: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
      {/* Business logo placeholder */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#0D9668] flex items-center justify-center mb-5 shadow-lg shadow-[#16A34A]/20">
        <Star className="w-8 h-8 text-white fill-white" />
      </div>
      <h3 className="text-white font-bold text-lg text-center mb-1">
        Your Business Name
      </h3>
      <p className="text-[#A1A1AA] text-xs text-center mb-6 leading-relaxed">
        Thank you for visiting us!<br />
        We'd love to hear about your experience.
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onProceed}
        className="w-full h-12 rounded-xl bg-[#16A34A] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#16A34A]/25 cursor-pointer"
      >
        <Star className="w-4 h-4 fill-white" />
        Give Us Your Feedback
      </motion.button>
      <p className="text-[10px] text-[#A1A1AA]/40 mt-4 text-center">
        Tap the button to start the simulation
      </p>
    </div>
  );
}

/* ─── STATE 2: Non-Gated Choice Screen ─── */
function ChoiceScreen({
  onPublicReview,
  onPrivateFeedback,
}: {
  onPublicReview: () => void;
  onPrivateFeedback: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col px-5 py-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#0D9668] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#16A34A]/20">
          <Star className="w-6 h-6 text-white fill-white" />
        </div>
        <h3 className="text-white font-bold text-base mb-1">
          How was your experience
          <br />
          with us today?
        </h3>
        <p className="text-[#A1A1AA] text-[11px]">
          Choose how you'd like to share your feedback
        </p>
      </div>

      {/* Two equal buttons */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPublicReview}
          className="w-full group rounded-xl border border-[#16A34A]/30 bg-[#16A34A]/10 p-4 text-left transition-all hover:border-[#16A34A]/50 hover:bg-[#16A34A]/15 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#16A34A]/20 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-[#16A34A] fill-[#16A34A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Submit Public Review</p>
              <p className="text-[10px] text-[#A1A1AA] leading-snug">
                Share your experience on Google
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#16A34A]/50 shrink-0" />
          </div>
        </motion.button>

        <div className="flex items-center gap-3 px-1">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-[#A1A1AA]/40 font-medium">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPrivateFeedback}
          className="w-full group rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.06] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-[#A1A1AA]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Provide Private Feedback</p>
              <p className="text-[10px] text-[#A1A1AA] leading-snug">
                Speak directly with our management team
              </p>
            </div>
            <MessageCircle className="w-4 h-4 text-[#A1A1AA]/40 shrink-0" />
          </div>
        </motion.button>
      </div>

      <p className="text-center text-[9px] text-[#A1A1AA]/30 mt-auto pt-4">
        Both options are equal — your choice, your comfort
      </p>
    </div>
  );
}

/* ─── STATE 3A: Simulated Google Review Page ─── */
function GoogleReviewScreen({ onBack }: { onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CheckCircle2 className="w-12 h-12 text-[#16A34A] mx-auto mb-4" />
        </motion.div>
        <p className="text-white font-bold text-base text-center mb-1">
          Review Submitted!
        </p>
        <p className="text-[#A1A1AA] text-[11px] text-center mb-4">
          Thank you for sharing your experience on Google.
        </p>
        <button
          onClick={onBack}
          className="text-[#16A34A] text-xs font-medium flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Restart simulation
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Simulated Google header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <p className="text-sm font-medium text-gray-800">Google Review</p>
      </div>
      <div className="flex-1 bg-white px-4 py-4">
        <p className="text-xs text-gray-500 mb-2">Rate your experience</p>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="w-6 h-6 text-amber-400 fill-amber-400" />
          ))}
        </div>
        <textarea
          placeholder="Tell others about your experience..."
          className="w-full h-20 rounded-lg border border-gray-200 p-2 text-xs text-gray-700 resize-none mb-3"
          readOnly
        />
        <button
          onClick={() => setSubmitted(true)}
          className="w-full h-9 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
        >
          Post Review
        </button>
      </div>
    </div>
  );
}

/* ─── STATE 3B: Simulated Private Feedback Form ─── */
function PrivateFeedbackScreen({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const toggleTag = (tag: string) =>
    setSelectedTags((p) =>
      p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag],
    );

  return (
    <div className="absolute inset-0 flex flex-col px-5 py-5 overflow-y-auto">
      <button
        onClick={onBack}
        className="self-start mb-3 flex items-center gap-1 text-[#A1A1AA] text-[11px] cursor-pointer"
      >
        <ArrowLeft className="w-3 h-3" />
        Back
      </button>

      <div className="text-center mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
          <MessageCircle className="w-5 h-5 text-amber-400" />
        </div>
        <h3 className="text-white font-bold text-sm mb-1">
          We're sorry to hear that.
        </h3>
        <p className="text-[#A1A1AA] text-[10px] leading-relaxed">
          Have an issue or concern? Speak directly with our management team
          so we can resolve it within 24 hours.
        </p>
      </div>

      {/* Quick tags */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
        {QUICK_TAGS.map((tag) => {
          const sel = selectedTags.includes(tag.label);
          return (
            <button
              key={tag.label}
              onClick={() => toggleTag(tag.label)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                sel
                  ? "bg-[#16A34A]/20 border border-[#16A34A]/40 text-[#16A34A]"
                  : "bg-white/5 border border-white/10 text-[#A1A1AA]"
              }`}
            >
              <span>{tag.emoji}</span>
              <span>{tag.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form fields */}
      <div className="space-y-2.5">
        <div>
          <label className="flex items-center gap-1.5 text-[#A1A1AA] text-[10px] font-medium mb-1">
            <User className="w-3 h-3 text-[#16A34A]" />
            Name <span className="text-[#A1A1AA]/50 font-normal">(Optional)</span>
          </label>
          <div className="h-8 rounded-lg bg-white/5 border border-white/10 px-2 flex items-center">
            <span className="text-[10px] text-[#A1A1AA]/40">Anonymous Customer</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="flex items-center gap-1 text-[#A1A1AA] text-[10px] font-medium mb-1">
              <Phone className="w-3 h-3 text-[#16A34A]" />
              Phone
            </label>
            <div className="h-8 rounded-lg bg-white/5 border border-white/10 px-2 flex items-center">
              <span className="text-[10px] text-[#A1A1AA]/40">N/A</span>
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1 text-[#A1A1AA] text-[10px] font-medium mb-1">
              <Mail className="w-3 h-3 text-[#16A34A]" />
              Email
            </label>
            <div className="h-8 rounded-lg bg-white/5 border border-white/10 px-2 flex items-center">
              <span className="text-[10px] text-[#A1A1AA]/40">N/A</span>
            </div>
          </div>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-[#A1A1AA] text-[10px] font-medium mb-1">
            <MessageSquare className="w-3 h-3 text-[#16A34A]" />
            Details
          </label>
          <div className="h-12 rounded-lg bg-white/5 border border-white/10 px-2 py-1.5">
            <span className="text-[10px] text-[#A1A1AA]/40">
              Tell us more if you'd like...
            </span>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSubmit}
          className="w-full h-9 rounded-lg bg-[#16A34A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-[#16A34A]/20 cursor-pointer"
        >
          <Send className="w-3 h-3" />
          Submit Feedback
        </motion.button>
      </div>

      <p className="text-center text-[9px] text-[#A1A1AA]/30 mt-3 flex items-center justify-center gap-1">
        <ShieldCheck className="w-2.5 h-2.5" />
        Your feedback is confidential
      </p>
    </div>
  );
}

/* ─── STATE 4: Thank You Screen ─── */
function ThankYouScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className="w-14 h-14 rounded-2xl bg-[#16A34A]/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-[#16A34A]" />
        </div>
      </motion.div>
      <h3 className="text-white font-bold text-base text-center mb-1">
        Thank you for your feedback.
      </h3>
      <p className="text-[#A1A1AA] text-[11px] text-center leading-relaxed mb-4">
        Our management team has been notified and will reach out to you shortly.
        We appreciate you taking the time to help us improve.
      </p>
      <div className="flex items-center gap-1.5 text-[10px] text-[#A1A1AA]/50 mb-5">
        <ShieldCheck className="w-3 h-3" />
        Your feedback is confidential
      </div>
      <button
        onClick={onRestart}
        className="text-[#16A34A] text-xs font-medium flex items-center gap-1 cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        Restart simulation
      </button>
    </div>
  );
}

/* ─── Main Export ─── */
export function CustomerExperienceSimulation() {
  const [state, setState] = useState<SimState>("invitation");

  const restart = () => setState("invitation");

  return (
    <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-xs font-semibold mb-4">
            <Smartphone className="w-3.5 h-3.5" />
            Interactive Demo
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Try the Non-Gated Customer Experience
          </h2>
          <p className="text-[#A1A1AA] text-base max-w-lg mx-auto leading-relaxed">
            See exactly what your customers experience. No rating manipulation, no conditional routing — 
            just a clean, honest choice between a public review and private feedback.
          </p>
          <p className="text-[#A1A1AA]/50 text-sm mt-3">
            Tap the button below to simulate the customer journey.
          </p>
        </motion.div>

        {/* Phone mockup + description side by side */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <PhoneFrame>
              <AnimatePresence mode="wait">
                {state === "invitation" && (
                  <motion.div
                    key="invitation"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <InvitationScreen onProceed={() => setState("choice")} />
                  </motion.div>
                )}
                {state === "choice" && (
                  <motion.div
                    key="choice"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <ChoiceScreen
                      onPublicReview={() => setState("google-review")}
                      onPrivateFeedback={() => setState("private-feedback")}
                    />
                  </motion.div>
                )}
                {state === "google-review" && (
                  <motion.div
                    key="google"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <GoogleReviewScreen onBack={restart} />
                  </motion.div>
                )}
                {state === "private-feedback" && (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <PrivateFeedbackScreen
                      onBack={() => setState("choice")}
                      onSubmit={() => setState("thank-you")}
                    />
                  </motion.div>
                )}
                {state === "thank-you" && (
                  <motion.div
                    key="thankyou"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <ThankYouScreen onRestart={restart} />
                  </motion.div>
                )}
              </AnimatePresence>
            </PhoneFrame>
          </motion.div>

          {/* Flow description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="max-w-sm"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              How it works for your customers
            </h3>
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Tap the Review Link",
                  desc: "Customer scans your QR code or taps the shared link",
                  active: state === "invitation",
                },
                {
                  step: "2",
                  title: "Choose Their Path",
                  desc: "Two equal options — no star ratings, no bias, full compliance",
                  active: state === "choice",
                },
                {
                  step: "3a",
                  title: "Public Review → Google",
                  desc: "Happy customers go directly to your Google Business Profile",
                  active: state === "google-review",
                },
                {
                  step: "3b",
                  title: "Private Feedback → You",
                  desc: "Concerns are captured privately with quick-select tags and optional contact info",
                  active: state === "private-feedback",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`flex gap-3 p-3 rounded-xl transition-all ${
                    item.active
                      ? "bg-[#16A34A]/10 border border-[#16A34A]/20"
                      : "bg-white/[0.03] border border-white/5"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      item.active
                        ? "bg-[#16A34A]/20 text-[#16A34A]"
                        : "bg-white/5 text-[#A1A1AA]/50"
                    }`}
                  >
                    {item.step}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        item.active ? "text-white" : "text-[#A1A1AA]"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#A1A1AA]/70 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                <span className="font-bold">Google Compliant:</span> No conditional routing based on ratings.
                Both paths are offered equally with identical visual weight.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
