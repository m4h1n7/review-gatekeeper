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
  Star,
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
  const [copied, setCopied] = useState(false);

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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#18181B]/95 backdrop-blur-2xl shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5 text-[#A1A1AA]" />
            </button>

            {/* Header */}
            <div className="bg-[#16A34A] p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Upgrade to Pro
              </h2>
              <p className="text-white/70 text-sm">{reason}</p>
            </div>

            <div className="p-6 sm:p-8">
              {/* Success state */}
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#16A34A]/10 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Payment Submitted
                  </h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                    We have received your transaction details. Our team will
                    verify your payment and activate your Pro subscription
                    within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full h-11 border-white/10 bg-white/5 text-white font-medium cursor-pointer hover:bg-white/10"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </motion.div>
              ) : (
                <>
                  {/* Pro features */}
                  <h3 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-4">
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
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <span className="text-sm text-white">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* bKash Account Details */}
                  <div className="bg-gradient-to-br from-[#16A34A]/5 to-[#16A34A]/10 rounded-2xl p-5 mb-6 border border-[#16A34A]/15">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">
                          bKash Payment
                        </h4>
                        <p className="text-xs text-[#A1A1AA]">
                          Personal Account
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#A1A1AA]">Account Type</span>
                        <span className="font-medium text-white">
                          Personal
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#A1A1AA]">bKash Number</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white font-mono">
                            01673903919
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyNumber}
                            className="relative p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer group"
                          >
                            <Copy className="w-3.5 h-3.5 text-[#16A34A]" />
                            {/* Tooltip */}
                            <AnimatePresence>
                              {copied ? (
                                <motion.span
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 4 }}
                                  className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#16A34A] text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-lg"
                                >
                                  Copied!
                                </motion.span>
                              ) : (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/10 text-[#A1A1AA] text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  Copy
                                </span>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#A1A1AA]">Account Name</span>
                        <span className="font-medium text-white">
                          ahanf tazwar alif
                        </span>
                      </div>
                      <div className="h-px bg-white/10 my-1" />
                      <div className="flex items-center justify-between">
                        <span className="text-[#A1A1AA]">Amount</span>
                        <span className="font-bold text-lg text-white">
                          ৳1,000
                          <span className="text-xs font-normal text-[#A1A1AA] ml-1">
                            /month
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#16A34A]" />
                      How to Pay
                    </h4>
                    <ol className="space-y-2.5 text-sm text-[#A1A1AA]">
                      {[
                        'Open your bKash App and select "Send Money".',
                        "Enter Number: 01673903919 (ahanf tazwar alif).",
                        "Enter Amount: ৳1,000.",
                        "Complete the transaction and copy the 10-character Transaction ID (TrxID).",
                        "Paste the TrxID and your sender phone number below to request verification.",
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex-none w-6 h-6 rounded-full bg-[#16A34A]/15 text-[#16A34A] text-xs font-bold flex items-center justify-center">
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
                      <Label className="text-[#A1A1AA] font-medium text-sm">
                        Sender bKash Number
                      </Label>
                      <Input
                        placeholder="e.g. 01XXXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A] focus:ring-[#16A34A]/20 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[#A1A1AA] font-medium text-sm">
                        Transaction ID (TrxID)
                      </Label>
                      <Input
                        placeholder="10-character TrxID"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A] focus:ring-[#16A34A]/20 transition-all font-mono"
                        maxLength={10}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting || !senderNumber || !trxId}
                      className="w-full h-12 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold shadow-lg shadow-[#16A34A]/25 hover:shadow-[#16A34A]/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full text-[#A1A1AA] mt-2 cursor-pointer hover:text-white hover:bg-white/5"
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
