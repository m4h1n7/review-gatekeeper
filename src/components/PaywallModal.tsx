import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Lock, Zap, CheckCircle2 } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  reason: string;
}

export function PaywallModal({ open, onClose, reason }: PaywallModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/90 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            {/* Header gradient */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Free Trial Limit Reached
              </h2>
              <p className="text-blue-100 text-sm">
                {reason}
              </p>
            </div>

            {/* Pro features */}
            <div className="p-8">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Upgrade to Pro
              </h3>
              <div className="space-y-3 mb-8">
                {[
                  "Unlimited review profiles",
                  "Unlimited analytics & feedback",
                  "Automated email alerts for every negative review",
                  "Priority support",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-slate-900">$10</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <p className="text-xs text-slate-500">
                  ৳1,000/month for BDT customers
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 cursor-pointer"
                  onClick={onClose}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Upgrade to Pro
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-slate-400 cursor-pointer"
                  onClick={onClose}
                >
                  Maybe later
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
