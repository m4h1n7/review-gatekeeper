import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Star,
  Zap,
  CheckCircle2,
  XCircle,
  BarChart3,
  MessageSquare,
  QrCode,
  Share2,
  Shield,
  Eye,
  ArrowRight,
  Smartphone,
  Mail,
  TrendingUp,
  Settings,
  Filter,
  Users,
} from "lucide-react";

type PlanTab = "starter" | "pro";

/* ------------------------------------------------------------------ */
/*  Simulated widget previews for each plan                           */
/* ------------------------------------------------------------------ */

function StarterPreview() {
  const [rating, setRating] = useState<number | null>(null);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#18181B]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Widget header */}
      <div className="bg-white/[0.04] border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
          <span className="text-xs font-semibold text-white/80">Review Widget</span>
        </div>
        <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">Starter</span>
      </div>

      {/* Simulated rating */}
      <div className="p-5 text-center">
        <div className="w-10 h-10 rounded-full bg-[#16A34A]/15 flex items-center justify-center mx-auto mb-3">
          <Star className="w-5 h-5 text-[#16A34A] fill-[#16A34A]" />
        </div>
        <p className="text-sm font-semibold text-white mb-1">How was your experience?</p>
        <p className="text-[11px] text-[#A1A1AA] mb-4">Tap a star to rate us</p>

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              className="transition-transform hover:scale-110 cursor-pointer"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  s <= (rating ?? 0) ? "text-[#16A34A] fill-[#16A34A]" : "text-white/10"
                }`}
              />
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {rating && rating >= 4 && (
            <motion.div
              key="google"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/20 p-3 text-center">
                <CheckCircle2 className="w-6 h-6 text-[#16A34A] mx-auto mb-1" />
                <p className="text-xs font-semibold text-white">Redirecting to Google Review...</p>
              </div>
            </motion.div>
          )}
          {rating && rating <= 3 && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-left">
                <p className="text-xs font-semibold text-white mb-2">Private Feedback Form</p>
                <div className="h-6 bg-white/5 rounded mb-1.5 w-full" />
                <div className="h-6 bg-white/5 rounded mb-1.5 w-full" />
                <div className="h-10 bg-white/5 rounded w-full" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feature badges */}
      <div className="px-5 pb-4 flex flex-wrap gap-1.5">
        {["Smart Star Routing", "Private Feedback", "QR Code"].map((f) => (
          <span key={f} className="text-[10px] text-zinc-400 bg-white/5 border border-white/[0.06] rounded-full px-2 py-0.5">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProPreview() {
  const [rating, setRating] = useState<number | null>(null);
  const [activeFeature, setActiveFeature] = useState<"routing" | "analytics" | "whatsapp">("routing");

  return (
    <div className="rounded-2xl border border-[#16A34A]/20 bg-[#18181B]/80 backdrop-blur-xl overflow-hidden shadow-2xl ring-1 ring-[#16A34A]/10">
      {/* Widget header */}
      <div className="bg-[#16A34A]/[0.06] border-b border-white/5 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="text-xs font-semibold text-white/80">Pro Dashboard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-[#16A34A]" />
          <span className="text-[10px] text-[#16A34A] font-semibold bg-[#16A34A]/10 px-2 py-0.5 rounded-full">Business Pro</span>
        </div>
      </div>

      {/* Feature tabs */}
      <div className="flex border-b border-white/5">
        {[
          { key: "routing" as const, icon: <Star className="w-3 h-3" />, label: "Review Routing" },
          { key: "analytics" as const, icon: <BarChart3 className="w-3 h-3" />, label: "Analytics" },
          { key: "whatsapp" as const, icon: <MessageSquare className="w-3 h-3" />, label: "WhatsApp" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFeature(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-colors cursor-pointer ${
              activeFeature === tab.key
                ? "text-[#16A34A] border-b-2 border-[#16A34A] bg-[#16A34A]/[0.04]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {activeFeature === "routing" && (
            <motion.div key="routing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-3">
                <p className="text-sm font-semibold text-white mb-1">How was your experience?</p>
                <div className="flex justify-center gap-1.5 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)} className="cursor-pointer">
                      <Star className={`w-7 h-7 ${s <= (rating ?? 0) ? "text-[#16A34A] fill-[#16A34A]" : "text-white/10"}`} />
                    </button>
                  ))}
                </div>
              </div>
              {rating && rating <= 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                  <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                    <p className="text-[11px] text-white font-medium mb-2">Quick Complaint Tags:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["Slow Service", "Cleanliness", "Food Quality", "Staff Behavior"].map((tag) => (
                        <span key={tag} className="text-[10px] text-zinc-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 cursor-pointer hover:bg-amber-500/20 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeFeature === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Scans", value: "1,247", icon: <Eye className="w-3 h-3" /> },
                  { label: "Reviews", value: "892", icon: <Star className="w-3 h-3" /> },
                  { label: "Saved", value: "355", icon: <Shield className="w-3 h-3" /> },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-[#16A34A] mb-1">{stat.icon}</div>
                    <p className="text-sm font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>
              {/* Mini chart */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                <p className="text-[10px] text-zinc-500 mb-2">Daily Rating Trend</p>
                <div className="flex items-end gap-1 h-12">
                  {[40, 55, 35, 65, 80, 70, 90, 85, 95, 88, 92, 98].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#16A34A]/60 to-[#16A34A]/20" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeFeature === "whatsapp" && (
            <motion.div key="whatsapp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="rounded-xl bg-[#25D366]/[0.06] border border-[#25D366]/15 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">WhatsApp Message Generator</p>
                    <p className="text-[10px] text-zinc-500">1-click share templates</p>
                  </div>
                </div>
                <div className="rounded-lg bg-black/30 p-3 mb-3">
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Hi! We'd love your feedback. 🌟 Tap the link below to share your experience with us on Google — it only takes 10 seconds!
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 text-[10px] font-semibold py-2 rounded-lg bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 flex items-center justify-center gap-1">
                    <Share2 className="w-3 h-3" /> Copy Message
                  </button>
                  <button className="flex-1 text-[10px] font-semibold py-2 rounded-lg bg-[#25D366] text-white flex items-center justify-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Open WhatsApp
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feature badges */}
      <div className="px-5 pb-4 flex flex-wrap gap-1.5">
        {["Smart Routing", "Analytics", "Quick Tags", "WhatsApp", "QR Standee", "CSV Export"].map((f) => (
          <span key={f} className="text-[10px] text-[#16A34A]/80 bg-[#16A34A]/[0.06] border border-[#16A34A]/15 rounded-full px-2 py-0.5">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature comparison table                                          */
/* ------------------------------------------------------------------ */

const comparisonFeatures = [
  { feature: "Smart Star Routing (4-5★ → Google)", starter: true, pro: true },
  { feature: "Private Feedback Capture (1-3★)", starter: true, pro: true },
  { feature: "Basic Analytics Dashboard", starter: true, pro: true },
  { feature: "1× Smart NFC Card + QR Code", starter: true, pro: false },
  { feature: "Real-Time Rating Trend Chart", starter: true, pro: true },
  { feature: "Custom Branded Review Page", starter: false, pro: true },
  { feature: "Dynamic Performance Line Chart", starter: false, pro: true },
  { feature: "Quick Complaint Tags", starter: false, pro: true },
  { feature: "WhatsApp Message Generator", starter: false, pro: true },
  { feature: "Custom Customer Offer Banner", starter: false, pro: true },
  { feature: "Printable QR Standee (PDF/PNG)", starter: false, pro: true },
  { feature: "CSV / Excel Export", starter: false, pro: true },
  { feature: "Estimated Saved Revenue Widget", starter: false, pro: true },
  { feature: "Resolve via WhatsApp Button", starter: false, pro: true },
  { feature: "Staff Sub-Accounts", starter: false, pro: true },
  { feature: "Priority Support", starter: false, pro: true },
  { feature: "2× NFC Cards + Acrylic Standee", starter: false, pro: true },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export function InteractivePlanDemo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PlanTab>("starter");

  return (
    <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <p className="text-sm font-semibold text-[#16A34A] uppercase tracking-widest mb-3">
            See it in action
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Explore each plan
          </h2>
          <p className="mt-3 text-[#A1A1AA] text-base max-w-lg mx-auto">
            Try the interactive preview below to see exactly what your customers and your dashboard will look like.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
            {([
              { key: "starter" as const, label: "Starter Plan Demo", icon: <Star className="w-4 h-4" /> },
              { key: "pro" as const, label: "Pro Plan Demo", icon: <Zap className="w-4 h-4" /> },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? tab.key === "pro"
                      ? "bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/25"
                      : "bg-white/10 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.key === "starter" ? "Starter" : "Pro"}</span>
                {tab.key === "pro" && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full hidden sm:inline">Popular</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <AnimatePresence mode="wait">
          {activeTab === "starter" ? (
            <motion.div
              key="starter"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-md mx-auto mb-12 sm:mb-16"
            >
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Starter Plan Preview</h3>
                <p className="text-sm text-[#A1A1AA] max-w-sm mx-auto">
                  Basic review gating with smart star routing, private feedback capture, and a real-time QR code — perfect for small cafés and shops.
                </p>
              </div>

              <StarterPreview />

              <div className="mt-6 text-center">
                <Button
                  onClick={() => {
                    navigate("/auth?returnTo=/pricing");
                  }}
                  className="bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/10 cursor-pointer"
                >
                  Try Starter Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg mx-auto mb-12 sm:mb-16"
            >
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16A34A]/10 border border-[#16A34A]/20 text-[#16A34A] text-xs font-semibold mb-3">
                  <Zap className="w-3 h-3" />
                  Most Popular
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Business Pro Plan Preview</h3>
                <p className="text-sm text-[#A1A1AA] max-w-sm mx-auto">
                  Everything in Starter plus advanced analytics, WhatsApp integrations, quick complaint tags, and printable standee exports.
                </p>
              </div>

              <ProPreview />

              <div className="mt-6 text-center">
                <Button
                  onClick={() => {
                    navigate("/auth?returnTo=/pricing");
                  }}
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold shadow-lg shadow-[#16A34A]/25 cursor-pointer"
                >
                  <Star className="w-4 h-4 mr-2 fill-white" />
                  Upgrade to Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-xl font-bold text-white text-center mb-6">Feature Comparison</h3>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_80px_80px] border-b border-white/[0.08] px-5 py-3 bg-white/[0.02]">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Feature</span>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center">Starter</span>
              <span className="text-xs font-semibold text-[#16A34A] uppercase tracking-wider text-center">Pro</span>
            </div>

            {/* Table rows */}
            {comparisonFeatures.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_80px_80px] items-center px-5 py-2.5 ${
                  i < comparisonFeatures.length - 1 ? "border-b border-white/[0.04]" : ""
                } hover:bg-white/[0.02] transition-colors`}
              >
                <span className="text-sm text-zinc-300">{row.feature}</span>
                <div className="flex justify-center">
                  {row.starter ? (
                    <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-white/10" />
                  )}
                </div>
                <div className="flex justify-center">
                  {row.pro ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  ) : (
                    <XCircle className="w-4 h-4 text-white/10" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-zinc-600 mt-4">
            Both plans include the core review gating engine. Pro unlocks the full growth toolkit.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
