"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  Copy,
  RefreshCw,
  MessageSquare,
  PenLine,
  Send,
  ThumbsUp,
} from "lucide-react";

type Tone = "friendly" | "professional" | "apologetic";

const TONE_OPTIONS: { value: Tone; label: string; emoji: string }[] = [
  { value: "friendly", label: "Friendly", emoji: "😊" },
  { value: "professional", label: "Professional", emoji: "💼" },
  { value: "apologetic", label: "Apologetic", emoji: "🙏" },
];

const AI_RESPONSES: Record<Tone, string> = {
  friendly:
    "Hi there! Thank you so much for taking the time to share your feedback with us. We're really glad you brought this to our attention — it helps us get better every day! Our team is already looking into it, and we'd love to make your next experience even better. See you soon! 🌟",
  professional:
    "Dear Valued Customer,\n\nThank you for your feedback. We take all customer input seriously and have escalated your comments to our management team for immediate review. We are committed to maintaining the highest standards of service.\n\nWe will follow up within 24 hours to address your concerns. Please do not hesitate to reach out if you have additional comments.\n\nBest regards,\nManagement Team",
  apologetic:
    "We sincerely apologize for the experience you described. This falls short of the standards we set for ourselves, and we understand your frustration. Our management team has been notified and will be reaching out to you directly within 24 hours to make this right. Your feedback is incredibly valuable to us, and we are committed to ensuring this does not happen again. Thank you for giving us the opportunity to improve. 🙏",
};

interface AIAssistantProps {
  businessName: string;
}

export default function AIAssistant({ businessName }: AIAssistantProps) {
  const [selectedTone, setSelectedTone] = useState<Tone>("professional");
  const [editedReply, setEditedReply] = useState(AI_RESPONSES.professional);
  const [isEditing, setIsEditing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleToneChange = useCallback((tone: Tone) => {
    setSelectedTone(tone);
    setEditedReply(AI_RESPONSES[tone]);
    setIsEditing(false);
    setIsApproved(false);
  }, []);

  const handleRegenerate = useCallback(() => {
    setEditedReply(AI_RESPONSES[selectedTone]);
    setIsApproved(false);
    setIsEditing(false);
  }, [selectedTone]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(editedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [editedReply]);

  const handleApprove = useCallback(() => {
    setIsApproved(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  return (
    <div className="space-y-4">
      {/* Tone Selector */}
      <div className="flex items-center gap-2">
        {TONE_OPTIONS.map((tone) => (
          <button
            key={tone.value}
            onClick={() => handleToneChange(tone.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              selectedTone === tone.value
                ? "bg-[#16A34A]/15 border border-[#16A34A]/30 text-[#16A34A] shadow-sm shadow-[#16A34A]/10"
                : "bg-white/5 border border-white/10 text-[#A1A1AA] hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>{tone.emoji}</span>
            {tone.label}
          </button>
        ))}
      </div>

      {/* AI Response Card */}
      <div className="relative rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
          <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
          <span className="text-xs font-medium text-[#A1A1AA]">
            AI-Generated Response
          </span>
          <span className="ml-auto text-[10px] text-[#A1A1AA]/50">
            {selectedTone.charAt(0).toUpperCase() + selectedTone.slice(1)} Tone
          </span>
        </div>

        <div className="p-4">
          {isEditing ? (
            <textarea
              value={editedReply}
              onChange={(e) => setEditedReply(e.target.value)}
              className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-lg p-3 text-sm text-white/90 resize-none focus:outline-none focus:border-[#16A34A]/50 focus:ring-1 focus:ring-[#16A34A]/20 transition-all"
              placeholder="Edit the AI response..."
            />
          ) : (
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
              {editedReply}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-white/[0.02]">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer text-xs h-8"
          >
            <PenLine className="w-3 h-3 mr-1.5" />
            {isEditing ? "Done" : "Edit Reply"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer text-xs h-8"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Regenerate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer text-xs h-8"
          >
            {copied ? (
              <Check className="w-3 h-3 mr-1.5 text-[#16A34A]" />
            ) : (
              <Copy className="w-3 h-3 mr-1.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>

          <div className="flex-1" />

          <AnimatePresence mode="wait">
            {isApproved ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16A34A]/15 border border-[#16A34A]/25 text-[#16A34A] text-xs font-semibold"
              >
                <Check className="w-3 h-3" />
                Posted
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white cursor-pointer text-xs font-semibold h-8 px-4 shadow-sm shadow-[#16A34A]/20"
                >
                  <ThumbsUp className="w-3 h-3 mr-1.5" />
                  Approve & Post
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#16A34A] text-white shadow-2xl shadow-[#16A34A]/30"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Response Posted!</p>
              <p className="text-xs text-white/70">
                AI reply approved for {businessName}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
