import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { X, CheckCircle2, Smartphone, Copy, Send } from "lucide-react";

interface TrialExpiredModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TrialExpiredModal({ open, onClose, onSuccess }: TrialExpiredModalProps) {
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">("pro");

  const submitPayment = useMutation(api.payments.submit);

  const planDetails = {
    starter: { setupFee: 1499, monthlyFee: 1499, totalFirst: 2998, label: "Starter Plan" },
    pro: { setupFee: 1699, monthlyFee: 2499, totalFirst: 4198, label: "Business Pro Plan" },
  };
  const currentPlan = planDetails[selectedPlan];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitPayment({
        gateway: "bkash",
        senderPhone: senderNumber,
        trxId,
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#18181B]/95 backdrop-blur-2xl shadow-2xl"
          >
            <button onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors z-10 cursor-pointer">
              <X className="w-5 h-5 text-[#A1A1AA]" />
            </button>
            <div className="bg-red-500 p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <span className="text-3xl">⏰</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Free Trial Expired</h2>
              <p className="text-white/70 text-sm">Your 14-day free trial has ended. Upgrade now to keep your review gateway active.</p>
            </div>
            <div className="p-6 sm:p-8">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#16A34A]/10 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Payment Submitted</h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">We have received your transaction details. Our team will verify your payment within 24 hours.</p>
                  <Button variant="outline" className="w-full h-11 border-white/10 bg-white/5 text-white cursor-pointer hover:bg-white/10" onClick={onClose}>Close</Button>
                </motion.div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wider mb-3">Choose your plan</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setSelectedPlan("starter")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${selectedPlan === "starter" ? "border-white/20 bg-white/[0.08]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                        <p className="text-sm font-semibold text-white">Starter</p>
                        <p className="text-xs text-[#A1A1AA] mt-0.5">৳১,৪৯৯ + ৳১,৪৯৯/mo</p>
                      </button>
                      <button type="button" onClick={() => setSelectedPlan("pro")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${selectedPlan === "pro" ? "border-[#16A34A]/40 bg-[#16A34A]/[0.08]" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-white">Business Pro</p>
                          <span className="text-[9px] bg-[#16A34A] text-white px-1.5 py-0.5 rounded-full font-bold">★</span>
                        </div>
                        <p className="text-xs text-[#A1A1AA] mt-0.5">৳১,৬৯৯ + ৳২,৪৯৯/mo</p>
                      </button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#16A34A]/5 to-[#16A34A]/10 rounded-2xl p-5 mb-6 border border-[#16A34A]/15">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center"><Smartphone className="w-4 h-4 text-white" /></div>
                      <div><h4 className="font-semibold text-white text-sm">bKash Payment</h4><p className="text-xs text-[#A1A1AA]">Personal Account</p></div>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#A1A1AA]">Account Number</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white font-mono">01673903919</span>
                          <button type="button" onClick={handleCopyNumber} className="relative p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer">
                            <Copy className="w-3.5 h-3.5 text-[#16A34A]" />
                            {copied && <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#16A34A] text-white text-[10px] font-semibold px-2 py-1 rounded-md shadow-lg">Copied!</motion.span>}
                          </button>
                        </div>
                      </div>
                      <div className="h-px bg-white/10 my-1" />
                      <div className="flex items-center justify-between">
                        <span className="text-[#A1A1AA]">Total First Payment</span>
                        <span className="font-bold text-lg text-white">৳{currentPlan.totalFirst.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-[#A1A1AA]/60">(৳{currentPlan.setupFee.toLocaleString()} setup + ৳{currentPlan.monthlyFee.toLocaleString()} first month)</p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[#A1A1AA] font-medium text-sm">Sender bKash Number</Label>
                      <Input placeholder="e.g. 01XXXXXXXXX" value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A]" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[#A1A1AA] font-medium text-sm">Transaction ID (TrxID)</Label>
                      <Input placeholder="10-character TrxID" value={trxId} onChange={(e) => setTrxId(e.target.value)}
                        className="h-11 bg-white/5 border-white/10 text-white placeholder:text-[#A1A1AA]/40 focus:border-[#16A34A] font-mono" maxLength={10} required />
                    </div>
                    <Button type="submit" disabled={submitting || !senderNumber || !trxId}
                      className="w-full h-12 bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold shadow-lg shadow-[#16A34A]/25 cursor-pointer disabled:opacity-50">
                      {submitting ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</div>
                        : <div className="flex items-center gap-2"><Send className="w-4 h-4" />Submit Payment</div>}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
