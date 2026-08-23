import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
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
  onSuccess?: () => void;
  reason: string;
  plan?: "starter" | "pro";
}

export function PaywallModal({ open, onClose, onSuccess, reason, plan: initialPlan }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">(initialPlan ?? "pro");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const submitPayment = useMutation(api.payments.submit);

  const planDetails = {
    starter: { setupFee: 1999, monthlyFee: 1499, totalFirst: 3498, label: "Starter Plan" },
    pro: { setupFee: 2999, monthlyFee: 2499, totalFirst: 5498, label: "Business Pro Plan" },
  };
  const currentPlan = planDetails[selectedPlan];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitPayment({
        gateway: "bkash",
        senderPhone: senderNumber,
        trxId: trxId,
        plan: selectedPlan,
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit payment";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
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
                Upgrade Your Plan
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
                  {/* Plan Selector */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">
                      Select your plan
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan("starter")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedPlan === "starter"
                            ? "border-white/20 bg-white/[0.08]"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        <p className="text-sm font-semibold text-white">Starter</p>
                        <p className="text-xs text-[#A1A1AA] mt-0.5">৳১,৯৯৯ + ৳১,৪৯৯/mo</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPlan("pro")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedPlan === "pro"
                            ? "border-[#16A34A]/40 bg-[#16A34A]/[0.08]"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-white">Business Pro</p>
                          <span className="text-[9px] bg-[#16A34A] text-white px-1.5 py-0.5 rounded-full font-bold">★</span>
                        </div>
                        <p className="text-xs text-[#A1A1AA] mt-0.5">৳২,৯৯৯ + ৳২,৪৯৯/mo</p>
                      </button>
                    </div>
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
                        <span className="text-[#A1A1AA]">Setup Fee</span>
                        <span className="font-medium text-white">৳{currentPlan.setupFee.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#A1A1AA]">Monthly Fee</span>
                        <span className="font-medium text-white">৳{currentPlan.monthlyFee.toLocaleString()}/month</span>
                      </div>
                      <div className="h-px bg-white/10 my-1" />
                      <div className="flex items-center justify-between">
                        <span className="text-[#A1A1AA]">Total First Payment</span>
                        <span className="font-bold text-lg text-white">৳{currentPlan.totalFirst.toLocaleString()}</span>
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
                        `Enter Amount: ৳${currentPlan.totalFirst.toLocaleString()} (setup + first month).`,
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
