import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  desc: string;
  demo?: ReactNode;
  index?: number;
}

export default function FeatureCard({ icon, title, desc, demo, index = 0 }: FeatureCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative"
    >
      <div
        className={`
          relative rounded-2xl border backdrop-blur-2xl p-6 h-full
          transition-all duration-300 cursor-default
          border-white/[0.08] bg-white/[0.04]
          hover:border-[#16A34A]/25 hover:bg-white/[0.06]
          hover:shadow-[0_0_40px_-12px_rgba(22,163,74,0.15)]
          ${expanded ? "border-[#16A34A]/30 bg-white/[0.07] shadow-[0_0_60px_-12px_rgba(22,163,74,0.2)]" : ""}
        `}
      >
        {/* Subtle glow edge on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#16A34A]/5 via-transparent to-emerald-500/5" />

        <div className="relative z-10">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 flex items-center justify-center text-[#16A34A] mb-4 group-hover:bg-[#16A34A]/20 group-hover:shadow-[0_0_20px_-4px_rgba(22,163,74,0.3)] transition-all duration-300">
            {icon}
          </div>

          {/* Text */}
          <h3 className="font-bold text-white mb-1.5 group-hover:text-[#16A34A]/90 transition-colors">{title}</h3>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">{desc}</p>

          {/* Expand toggle */}
          {demo && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#16A34A] hover:text-emerald-300 transition-colors cursor-pointer"
            >
              {expanded ? (
                <>
                  <X className="w-3 h-3" /> Close Preview
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> See Live Demo
                </>
              )}
            </button>
          )}
        </div>

        {/* Expandable demo drawer */}
        <AnimatePresence>
          {expanded && demo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                {demo}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
