import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X,
  Lock,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Copy,
  Send,
} from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  reason: string;
}

export function PaywallModal({ open, onClose, reason }: PaywallModalProps) {
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate submission — in production this would POST to a backend
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText("01673903919");
  };

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
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/60 bg-white/90 backdrop-blur-2xl shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Upgrade to Pro
              </h2>
              <p className="text-blue-100 text-sm">{reason}</p>
            </div>

            <div className="p-6 sm:p-8">
              {/* Success state */}
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Payment Submitted
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    We have received your transaction details. Our team will
                    verify your payment and activate your Pro subscription
                    within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full h-11 border-slate-200 text-slate-600 font-medium cursor-pointer"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </motion.div>
              ) : (
                <>
                  {/* Pro features */}
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    What you get with Pro
                  </h3>
                  <div className="space-y-2.5 mb-6">
                    {[
                      "Unlimited review profiles",
                      "Unlimited analytics & feedback",
                      "Automated email alerts",
                      "Priority support",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-sm text-slate-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* bKash Account Details */}
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-5 mb-6 border border-pink-100/80">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">
                          bKash Payment
                        </h4>
                        <p className="text-xs text-slate-500">
                          Personal Account
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Account Type</span>
                        <span className="font-medium text-slate-900">
                          Personal
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">bKash Number</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 font-mono">
                            01673903919
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyNumber}
                            className="p-1 rounded-md hover:bg-pink-100 transition-colors cursor-pointer"
                            title="Copy number"
                          >
                            <Copy className="w-3.5 h-3.5 text-pink-500" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Account Name</span>
                        <span className="font-medium text-slate-900">
                          ahanf tazwar alif
                        </span>
                      </div>
                      <div className="h-px bg-pink-200/60 my-1" />
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-bold text-lg text-slate-900">
                          ৳1,000
                          <span className="text-xs font-normal text-slate-500 ml-1">
                            /month
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      How to Pay
                    </h4>
                    <ol className="space-y-2.5 text-sm text-slate-600">
                      {[
                        'Open your bKash App and select "Send Money".',
                        "Enter Number: 01673903919 (ahanf tazwar alif).",
                        "Enter Amount: ৳1,000.",
                        "Complete the transaction and copy the 10-character Transaction ID (TrxID).",
                        "Paste the TrxID and your sender phone number below to request verification.",
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex-none w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed pt-0.5">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Verification Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-700 font-medium text-sm">
                        Sender bKash Number
                      </Label>
                      <Input
                        placeholder="e.g. 01XXXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="h-11 bg-white/60 border-white/60 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/50 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-slate-700 font-medium text-sm">
                        Transaction ID (TrxID)
                      </Label>
                      <Input
                        placeholder="10-character TrxID"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="h-11 bg-white/60 border-white/60 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200/50 transition-all font-mono"
                        maxLength={10}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting || !senderNumber || !trxId}
                      className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Submit Payment Verification
                        </div>
                      )}
                    </Button>
                  </form>

                  <Button
                    variant="ghost"
                    className="w-full text-slate-400 mt-2 cursor-pointer"
                    onClick={onClose}
                  >
                    Maybe later
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
