import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ArrowRight,
  ArrowLeft,
  Building2,
  Globe,
  Link2,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router";

const CATEGORIES = [
  "Restaurant & Cafe",
  "Salon & Spa",
  "Retail Store",
  "Hotel & Hospitality",
  "Healthcare & Dental",
  "Automotive & Garage",
  "Real Estate",
  "Professional Services",
  "Education & Training",
  "Fitness & Gym",
  "Other",
];

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useMutation(api.businesses.completeOnboarding);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await completeOnboarding({
        businessName,
        category,
        phone: "",
        reviewUrl,
        slug: customSlug || undefined,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const step1Valid = businessName.trim().length > 0 && category.length > 0;
  const step2Valid = reviewUrl.trim().length > 0;
  const generatedSlug = customSlug || businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#16A34A]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#16A34A]/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#16A34A] flex items-center justify-center shadow-lg shadow-[#16A34A]/25">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-wide leading-tight">STAR CATCH</span>
              <span className="text-[10px] text-[#A1A1AA] tracking-wider leading-tight">Reviews and Feedback Agency Bd</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s
                  ? "bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/30"
                  : "bg-white/5 text-[#A1A1AA] border border-white/10"
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 2 && (
                <div className={`w-12 h-0.5 rounded-full transition-all ${step > 1 ? "bg-[#16A34A]" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <GlassPanel className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Business Details</h2>
                    <p className="text-xs text-[#A1A1AA]">Tell us about your business</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Business Name</label>
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g., Cafforia BD"
                      className="h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Industry / Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-3 text-sm focus:border-[#16A34A] focus:ring-[#16A34A]/20 focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#18181B]">Select your industry</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-[#18181B]">{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

                <Button
                  onClick={() => { setStep(2); setError(null); }}
                  disabled={!step1Valid}
                  className="w-full h-11 mt-6 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Google Review Link</h2>
                    <p className="text-xs text-[#A1A1AA]">Where should happy customers leave reviews?</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-[#A1A1AA]">Google Review URL</label>
                      <a
                        href="https://support.google.com/business/answer/7277859"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#16A34A] hover:underline flex items-center gap-1"
                      >
                        Where to find this? <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-[#A1A1AA]" />
                      <Input
                        value={reviewUrl}
                        onChange={(e) => setReviewUrl(e.target.value)}
                        placeholder="https://g.page/r/your-business/review"
                        className="pl-9 h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-[#A1A1AA]/60">
                      Open Google Maps → Find your business → Click "Write a review" → Copy that URL
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Custom Review URL Slug (optional)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-[#A1A1AA] text-sm">/review/</span>
                      <Input
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder={generatedSlug || "your-business-slug"}
                        className="pl-[72px] h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-[#16A34A]/20"
                      />
                    </div>
                  </div>

                  {businessName && (
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mb-1">Your review link</p>
                      <p className="text-sm text-[#16A34A] font-mono">/review/{generatedSlug}</p>
                    </div>
                  )}
                </div>

                {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

                <label className="flex items-start gap-2.5 cursor-pointer mt-4">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[#16A34A] focus:ring-[#16A34A]/20 cursor-pointer"
                  />
                  <span className="text-xs text-[#A1A1AA] leading-relaxed">
                    I agree to the{' '}
                    <button type="button" onClick={() => window.open("/terms", "_blank")} className="text-[#16A34A] hover:underline">Terms of Service</button>
                    {' '}and{' '}
                    <button type="button" onClick={() => window.open("/privacy", "_blank")} className="text-[#16A34A] hover:underline">Privacy Policy</button>
                  </span>
                </label>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => { setStep(1); setError(null); }}
                    variant="outline"
                    className="h-11 border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={!step2Valid || !agreedToTerms || isLoading}
                    className="flex-1 h-11 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Complete Setup
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassPanel>

        <p className="text-center text-xs text-[#A1A1AA]/40 mt-6">
          You can always update these settings from your dashboard.
        </p>
      </div>
    </div>
  );
}
