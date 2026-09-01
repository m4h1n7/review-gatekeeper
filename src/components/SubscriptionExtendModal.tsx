import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ChevronRight, Clock } from "lucide-react";

interface SubscriptionExtendModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (days: number) => void;
  clientEmail: string;
  currentExpiresAt: number | null;
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
  currentExpiresAt,
  processing,
}: SubscriptionExtendModalProps) {
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [customDays, setCustomDays] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const days = isCustom ? parseInt(customDays) || 0 : selectedDays;
  const newExpiresAt = currentExpiresAt
    ? new Date(currentExpiresAt + days * 86400000)
    : new Date(Date.now() + days * 86400000);

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
                    {clientEmail}
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
                <div>
                  <p className="text-xs text-[#A1A1AA]">Current Expiry</p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(currentExpiresAt)}
                  </p>
                </div>
              </div>

              {/* Preset Quick Picks */}
              <div>
                <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2.5">
                  Quick Select
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
                  key={days}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#16A34A]/5 border border-[#16A34A]/20"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#16A34A]" />
                    <div>
                      <p className="text-xs text-[#A1A1AA]">New Expiry Date</p>
                      <p className="text-sm font-semibold text-[#16A34A]">
                        {formatDate(newExpiresAt.getTime())}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#16A34A]/50" />
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
                onClick={() => days > 0 && onConfirm(days)}
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
