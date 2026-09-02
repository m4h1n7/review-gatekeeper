import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ChevronRight, Clock, Crown, Star } from "lucide-react";

interface SubscriptionExtendModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (days: number, plan: "starter" | "pro") => void;
  clientEmail: string;
  clientName?: string;
  currentExpiresAt: number | null;
  currentPlan?: string;
  processing: boolean;
}

const PRESETS = [7, 15, 30, 60, 90];

function formatDate(ts: number | null): string {
  if (!ts) return "No expiry set";
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SubscriptionExtendModal({
  open,
  onClose,
  onConfirm,
  clientEmail,
  clientName,
  currentExpiresAt,
  currentPlan = "pro",
  processing,
}: SubscriptionExtendModalProps) {
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [customDays, setCustomDays] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">(
    currentPlan === "starter" ? "starter" : "pro"
  );

  const days = isCustom ? parseInt(customDays) || 0 : selectedDays;
  const baseDate = currentExpiresAt && currentExpiresAt > Date.now()
    ? currentExpiresAt
    : Date.now();
  const newExpiresAt = new Date(baseDate + days * 86400000);
  const isPlanChange = selectedPlan !== (currentPlan === "starter" ? "starter" : "pro");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#18181B] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Extend Subscription
                  </h2>
                  <p className="text-sm text-[#A1A1AA] mt-0.5">
                    {clientName || clientEmail}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-[#A1A1AA] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Current Expiry */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <Clock className="w-4 h-4 text-[#A1A1AA] shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-[#A1A1AA]">Current Plan & Expiry</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${currentPlan === "pro" ? "bg-[#16A34A]/15 text-[#16A34A]" : "bg-amber-500/15 text-amber-400"}`}>
                      {currentPlan === "pro" ? "PRO" : currentPlan === "starter" ? "STARTER" : currentPlan?.toUpperCase() || "NONE"}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {formatDate(currentExpiresAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Plan Type Selector */}
              <div>
                <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2.5">
                  Plan Type
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedPlan("starter")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPlan === "starter"
                        ? "border-white/20 bg-white/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-sm font-semibold text-white">Starter</span>
                    </div>
                    <p className="text-[10px] text-[#A1A1AA]">1 profile, basic features</p>
                  </button>
                  <button
                    onClick={() => setSelectedPlan("pro")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPlan === "pro"
                        ? "border-[#16A34A]/40 bg-[#16A34A]/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span className="text-sm font-semibold text-white">Pro</span>
                    </div>
                    <p className="text-[10px] text-[#A1A1AA]">Unlimited profiles, all features</p>
                  </button>
                </div>
              </div>

              {/* Preset Quick Picks */}
              <div>
                <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2.5">
                  Extension Duration
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setSelectedDays(d);
                        setIsCustom(false);
                      }}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        !isCustom && selectedDays === d
                          ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25"
                          : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10"
                      }`}
                    >
                      +{d}d
                    </button>
                  ))}
                  <button
                    onClick={() => setIsCustom(true)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isCustom
                        ? "bg-[#16A34A] text-white shadow-md shadow-[#16A34A]/25"
                        : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10"
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Custom Days Input */}
              {isCustom && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                    Enter number of days
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#16A34A]/50 focus:ring-1 focus:ring-[#16A34A]/30"
                  />
                </motion.div>
              )}

              {/* Projected Date Preview */}
              {days > 0 && (
                <motion.div
                  key={`${days}-${selectedPlan}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-[#16A34A]/5 border border-[#16A34A]/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#16A34A]" />
                      <p className="text-xs text-[#A1A1AA]">New Expiry Date</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#16A34A]/50" />
                  </div>
                  <p className="text-sm font-semibold text-[#16A34A] ml-6">
                    {formatDate(newExpiresAt.getTime())}
                  </p>
                  {isPlanChange && (
                    <p className="text-[10px] text-amber-400 ml-6 mt-1">
                      ⚠️ Plan will change from {currentPlan?.toUpperCase() || "NONE"} to {selectedPlan.toUpperCase()}
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[#A1A1AA] text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => days > 0 && onConfirm(days, selectedPlan)}
                disabled={days <= 0 || processing}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-sm font-semibold shadow-md shadow-[#16A34A]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {processing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm +{days} Days
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
