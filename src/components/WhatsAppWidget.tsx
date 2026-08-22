import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/8801673903919?text=" +
  encodeURIComponent("Hi EasyReview Pro team, I need help with my review dashboard");

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Tooltip / mini-chat bubble */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-72 rounded-2xl border border-white/10 bg-[#18181B]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#16A34A] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">EasyReview Pro Support</p>
                  <p className="text-white/70 text-xs">Typically replies in minutes</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Message area */}
            <div className="px-5 py-4">
              <div className="bg-white/10 rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%]">
                <p className="text-white text-sm leading-relaxed">
                  Need help with your review dashboard? We're here for you.
                </p>
                <p className="text-white/40 text-[10px] mt-1 text-right">now</p>
              </div>
            </div>

            {/* CTA button */}
            <div className="px-5 pb-5">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-11 bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold rounded-xl shadow-lg shadow-[#16A34A]/25 hover:shadow-[#16A34A]/40 transition-all text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Open WhatsApp Chat
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="w-14 h-14 rounded-full bg-[#16A34A] hover:bg-[#15803D] flex items-center justify-center shadow-xl shadow-[#16A34A]/30 hover:shadow-[#16A34A]/50 transition-all cursor-pointer"
        aria-label="Open WhatsApp support"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
