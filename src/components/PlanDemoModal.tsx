import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  Zap,
  BarChart3,
  QrCode,
  MessageCircle,
  Shield,
  Users,
  Gift,
  CheckCircle2,
  Smartphone,
  TrendingUp,
  Wifi,
  Eye,
} from "lucide-react";

type Plan = "starter" | "pro";

interface PlanDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: Plan;
}

function StarterDemo() {
  return (
    <div className="space-y-5">
      {/* Basic Dashboard Preview */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-zinc-400" />
          <h4 className="text-sm font-semibold text-white">Basic Dashboard</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Scans", value: "342", icon: <Eye className="w-3 h-3" /> },
            { label: "Google Redirects", value: "78%", icon: <TrendingUp className="w-3 h-3" /> },
            { label: "Private Captured", value: "22%", icon: <Shield className="w-3 h-3" /> },
            { label: "Avg Rating", value: "4.2★", icon: <Star className="w-3 h-3" /> },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-zinc-500">{m.icon}</span>
                <span className="text-[10px] text-zinc-500">{m.label}</span>
              </div>
              <p className="text-sm font-bold text-white">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 1-3 Star Filter Demo */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-semibold text-white">Private Feedback Filter</h4>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= 4 ? "text-[#16A34A] fill-[#16A34A]" : "text-[#16A34A] fill-[#16A34A]"}`} />
              ))}
            </div>
            <span className="text-[10px] font-medium text-[#16A34A]">→ Google Review Redirect</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex gap-0.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-[10px] font-medium text-amber-400">→ Private Feedback Captured</span>
          </div>
        </div>
      </div>

      {/* Static QR Code Preview */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-4 h-4 text-zinc-400" />
          <h4 className="text-sm font-semibold text-white">Static QR Code</h4>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-28 rounded-xl bg-white/[0.06] border border-white/[0.1] flex flex-col items-center justify-center gap-1.5 shrink-0">
            <QrCode className="w-8 h-8 text-[#16A34A]" />
            <span className="text-[9px] text-zinc-500">Scan Me</span>
          </div>
          <div className="text-xs text-zinc-500 leading-relaxed">
            <p className="mb-1.5 text-zinc-400 font-medium">Standard QR code</p>
            <p>Print and place at your counter. Customers scan to reach your review page.</p>
          </div>
        </div>
      </div>

      {/* Hardware */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wifi className="w-4 h-4 text-zinc-400" />
          <h4 className="text-sm font-semibold text-white">Included Hardware</h4>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">1× Premium Smart NFC Card</p>
            <p className="text-[10px] text-zinc-500">Tap to open your review page instantly</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProDemo() {
  const [whatsappMsg, setWhatsappMsg] = useState(
    "Hi! Thank you for visiting us. We'd love to hear your feedback 🙏\n\nTap here to share your experience:\nhttps://g.page/r/YOUR-BUSINESS/review"
  );

  return (
    <div className="space-y-5">
      {/* Advanced Dashboard with Line Chart */}
      <div className="rounded-2xl border border-[#16A34A]/20 bg-[#16A34A]/[0.03] p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-[#16A34A]" />
          <h4 className="text-sm font-semibold text-white">Advanced Analytics Dashboard</h4>
          <span className="ml-auto text-[9px] bg-[#16A34A]/20 text-[#16A34A] px-2 py-0.5 rounded-full font-semibold">PRO</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "Total Scans", value: "1,247", color: "text-white" },
            { label: "Google Redirects", value: "89%", color: "text-[#16A34A]" },
            { label: "Private Captured", value: "11%", color: "text-amber-400" },
            { label: "Staff Leader", value: "Rahim", color: "text-emerald-300" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
              <p className="text-[10px] text-zinc-500 mb-0.5">{m.label}</p>
              <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
        {/* Mini Line Chart */}
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
          <p className="text-[10px] text-zinc-500 mb-3">Monthly Review Trend</p>
          <svg viewBox="0 0 300 80" className="w-full h-16">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A34A" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,60 Q30,55 60,45 T120,35 T180,25 T240,15 T300,10" fill="none" stroke="#16A34A" strokeWidth="2" />
            <path d="M0,60 Q30,55 60,45 T120,35 T180,25 T240,15 T300,10 L300,80 L0,80 Z" fill="url(#lineGrad)" />
            {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((m, i) => (
              <text key={i} x={i * 27 + 12} y={78} fill="#52525b" fontSize="8" textAnchor="middle">
                {m}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* WhatsApp Message Generator */}
      <div className="rounded-2xl border border-[#16A34A]/20 bg-[#16A34A]/[0.03] p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          <h4 className="text-sm font-semibold text-white">WhatsApp Message Generator</h4>
          <span className="ml-auto text-[9px] bg-[#16A34A]/20 text-[#16A34A] px-2 py-0.5 rounded-full font-semibold">PRO</span>
        </div>
        <div className="rounded-xl bg-[#075E54] p-4 max-w-xs mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#128C7E] flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white">Review Request</p>
              <p className="text-[9px] text-white/60">Just now</p>
            </div>
          </div>
          <div className="bg-[#054640] rounded-lg p-3">
            <p className="text-[11px] text-white/90 whitespace-pre-line leading-relaxed">{whatsappMsg}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="text-[10px] px-3 py-1.5 rounded-lg bg-[#25D366]/20 text-[#25D366] font-semibold">Copy Message</button>
          <button className="text-[10px] px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-semibold">Open in WhatsApp</button>
        </div>
        <textarea
          value={whatsappMsg}
          onChange={(e) => setWhatsappMsg(e.target.value)}
          className="mt-3 w-full rounded-xl bg-white/[0.04] border border-white/[0.08] p-3 text-xs text-white placeholder:text-zinc-600 resize-none h-20 focus:outline-none focus:border-[#16A34A]/30"
          placeholder="Customize your message..."
        />
      </div>

      {/* Custom Offer Banner */}
      <div className="rounded-2xl border border-[#16A34A]/20 bg-[#16A34A]/[0.03] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-semibold text-white">Custom Customer Offer Banner</h4>
          <span className="ml-auto text-[9px] bg-[#16A34A]/20 text-[#16A34A] px-2 py-0.5 rounded-full font-semibold">PRO</span>
        </div>
        <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-500/20 p-4 text-center">
          <p className="text-lg mb-1">🎉</p>
          <p className="text-xs font-bold text-amber-400 mb-1">Show this screen to the cashier!</p>
          <p className="text-[11px] text-amber-400/70">Get 10% off on your next visit</p>
        </div>
      </div>

      {/* Staff Leaderboard */}
      <div className="rounded-2xl border border-[#16A34A]/20 bg-[#16A34A]/[0.03] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-white">Staff Performance Leaderboard</h4>
          <span className="ml-auto text-[9px] bg-[#16A34A]/20 text-[#16A34A] px-2 py-0.5 rounded-full font-semibold">PRO</span>
        </div>
        <div className="space-y-2">
          {[
            { rank: "🥇", name: "Rahim", scans: 147, reviews: 112, rate: "76%" },
            { rank: "🥈", name: "Karim", scans: 98, reviews: 71, rate: "72%" },
            { rank: "🥉", name: "Salim", scans: 64, reviews: 43, rate: "67%" },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <span className="text-base">{s.rank}</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">{s.name}</p>
                <p className="text-[10px] text-zinc-500">{s.scans} scans · {s.reviews} reviews</p>
              </div>
              <span className="text-xs font-bold text-[#16A34A]">{s.rate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hardware */}
      <div className="rounded-2xl border border-[#16A34A]/20 bg-[#16A34A]/[0.03] p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wifi className="w-4 h-4 text-[#16A34A]" />
          <h4 className="text-sm font-semibold text-white">Included Hardware</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-10 h-10 rounded-lg bg-[#16A34A]/10 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">2× Premium Smart NFC Cards</p>
              <p className="text-[10px] text-zinc-500">Tap to open your review page instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-10 h-10 rounded-lg bg-[#16A34A]/10 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">1× Acrylic Table Stand</p>
              <p className="text-[10px] text-zinc-500">Premium display stand for your counter</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanDemoModal({ isOpen, onClose, initialPlan = "starter" }: PlanDemoModalProps) {
  const [activeTab, setActiveTab] = useState<Plan>(initialPlan);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-lg max-h-[85vh] bg-[#141417] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#16A34A]/15 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-[#16A34A]" />
                  </div>
                  <h3 className="text-base font-bold text-white">Plan Preview</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Plan Toggle Tabs */}
              <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <button
                  onClick={() => setActiveTab("starter")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "starter"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  Starter Plan
                </button>
                <button
                  onClick={() => setActiveTab("pro")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "pro"
                      ? "bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/25"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Business Pro
                  {activeTab !== "pro" && (
                    <span className="text-[8px] bg-[#16A34A]/20 text-[#16A34A] px-1.5 py-0.5 rounded-full">
                      POPULAR
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: activeTab === "starter" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: activeTab === "starter" ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "starter" ? <StarterDemo /> : <ProDemo />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.06] bg-[#141417]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-zinc-600">
                  {activeTab === "starter"
                    ? "৳১,৪৯৯ setup + ৳১,৪৯৯/mo"
                    : "৳১,৬৯৯ setup + ৳২,৪৯৯/mo"}
                </p>
                <button
                  onClick={onClose}
                  className="text-xs font-semibold text-[#16A34A] hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
