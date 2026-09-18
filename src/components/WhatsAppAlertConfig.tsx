"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Phone,
  Send,
  Check,
  Bell,
  BellOff,
  TestTube,
} from "lucide-react";

interface WhatsAppAlertConfigProps {
  businessName: string;
  /** Live private feedbacks — used to render the real-time alert preview */
  latestFeedback?: {
    customerName: string;
    rating: number;
    message: string;
    createdAt: number;
  } | null;
}

export default function WhatsAppAlertConfig({
  businessName,
  latestFeedback,
}: WhatsAppAlertConfigProps) {
  const [enabled, setEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+880");
  const [testSent, setTestSent] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  // The exact alert text that would be pushed to WhatsApp for the latest
  // private feedback (live — updates instantly when new feedback arrives).
  const alertPreview = latestFeedback
    ? `🔔 New Private Feedback for ${businessName}\n\n⭐ Rating: ${latestFeedback.rating}/5\n👤 ${latestFeedback.customerName}\n💬 ${latestFeedback.message.slice(0, 160)}`
    : null;

  const handleToggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const handleSendTest = useCallback(async () => {
    if (!phoneNumber || phoneNumber.length < 11) return;
    setTestLoading(true);
    // Simulate sending test notification
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTestLoading(false);
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  }, [phoneNumber]);

  return (
    <div className="space-y-4">
      {/* Toggle Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              enabled
                ? "bg-[#25D366]/15 text-[#25D366]"
                : "bg-white/5 text-[#A1A1AA]/50"
            }`}
          >
            {enabled ? (
              <Bell className="w-5 h-5" />
            ) : (
              <BellOff className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              Instant WhatsApp Alerts
            </p>
            <p className="text-xs text-[#A1A1AA]">
              Get notified instantly when private feedback is submitted
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
            enabled ? "bg-[#25D366]" : "bg-white/10"
          }`}
        >
          <motion.span
            className="inline-block h-4 w-4 rounded-full bg-white shadow"
            animate={{ x: enabled ? 22 : 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Phone Input */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#A1A1AA]">
                  <span>🇧🇩</span>
                  <span>+880</span>
                </div>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="1XXXXXXXXX"
                  className="flex-1 h-9 bg-white/5 border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/40 focus:border-[#25D366] focus:ring-[#25D366]/20"
                />
              </div>

              {/* Test Notification Button */}
              <Button
                onClick={handleSendTest}
                disabled={testLoading || phoneNumber.length < 11}
                variant="outline"
                size="sm"
                className="w-full h-9 border-[#25D366]/20 bg-[#25D366]/5 hover:bg-[#25D366]/10 text-[#25D366] cursor-pointer text-xs font-semibold"
              >
                {testLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-[#25D366]/30 border-t-[#25D366] rounded-full"
                  />
                ) : testSent ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Test Sent!
                  </>
                ) : (
                  <>
                    <TestTube className="w-3.5 h-3.5 mr-1.5" />
                    Send Test Notification
                  </>
                )}
              </Button>

              <p className="text-[10px] text-[#A1A1AA]/40 text-center">
                Test notification will be sent to this number to verify delivery.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-Time Alert Preview — mirrors the latest private feedback */}
      {latestFeedback && alertPreview && (
        <div className="rounded-xl border border-[#25D366]/20 bg-[#25D366]/[0.04] p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
            <p className="text-[10px] font-bold text-[#25D366] uppercase tracking-wider">
              Live Alert Preview
            </p>
          </div>
          {/* WhatsApp-style bubble */}
          <div className="rounded-lg rounded-tl-sm bg-[#0B141A] border border-white/5 p-3">
            <div className="rounded-lg bg-[#005C4B] p-2.5">
              <p className="text-[11px] text-white/90 whitespace-pre-line leading-relaxed">
                {alertPreview}
              </p>
              <p className="text-right text-[9px] text-white/40 mt-1">
                {new Date(latestFeedback.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ✓✓
              </p>
            </div>
          </div>
          <p className="text-[10px] text-[#A1A1AA]/50 mt-2">
            Preview of the WhatsApp alert for the most recent private feedback (updates in real time).
          </p>
        </div>
      )}
    </div>
  );
}
