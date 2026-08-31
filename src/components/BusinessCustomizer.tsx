"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Image,
  Type,
  MessageCircle,
  Star,
  ExternalLink,
  ShieldCheck,
  Save,
  Check,
  Sun,
  Moon,
  Monitor,
  Eye,
} from "lucide-react";

interface CustomizationState {
  logoUrl: string;
  brandColor: string;
  themeMode: "dark" | "light" | "auto";
  welcomeMessage: string;
  customHeadline: string;
  customSubtitle: string;
  publicReviewLabel: string;
  publicReviewDesc: string;
  privateFeedbackLabel: string;
  privateFeedbackDesc: string;
  thankYouMessage: string;
  promoEnabled: boolean;
  promoText: string;
}

interface BusinessCustomizerProps {
  initialData: Partial<CustomizationState>;
  businessName: string;
  onSave: (data: Partial<CustomizationState>) => Promise<void>;
}

const PRESET_COLORS = [
  "#16A34A", "#2563EB", "#9333EA", "#DC2626",
  "#EA580C", "#CA8A04", "#0891B2", "#6D28D9",
];

const THEME_OPTIONS = [
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "auto" as const, label: "Auto", icon: Monitor },
];

export default function BusinessCustomizer({
  initialData,
  businessName,
  onSave,
}: BusinessCustomizerProps) {
  const [config, setConfig] = useState<CustomizationState>({
    logoUrl: initialData.logoUrl || "",
    brandColor: initialData.brandColor || "#16A34A",
    themeMode: initialData.themeMode || "dark",
    welcomeMessage: initialData.welcomeMessage || "",
    customHeadline: initialData.customHeadline || "",
    customSubtitle: initialData.customSubtitle || "",
    publicReviewLabel: initialData.publicReviewLabel || "",
    publicReviewDesc: initialData.publicReviewDesc || "",
    privateFeedbackLabel: initialData.privateFeedbackLabel || "",
    privateFeedbackDesc: initialData.privateFeedbackDesc || "",
    thankYouMessage: initialData.thankYouMessage || "",
    promoEnabled: initialData.promoEnabled || false,
    promoText: initialData.promoText || "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState<"brand" | "content" | "buttons">("brand");

  // Sync external changes
  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      logoUrl: initialData.logoUrl || prev.logoUrl,
      brandColor: initialData.brandColor || prev.brandColor,
      themeMode: initialData.themeMode || prev.themeMode,
      welcomeMessage: initialData.welcomeMessage || prev.welcomeMessage,
      thankYouMessage: initialData.thankYouMessage || prev.thankYouMessage,
      promoEnabled: initialData.promoEnabled || prev.promoEnabled,
      promoText: initialData.promoText || prev.promoText,
    }));
  }, [initialData]);

  const update = useCallback((key: keyof CustomizationState, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [config, onSave]);

  const headline = config.customHeadline || `How was your experience with ${businessName}?`;
  const subtitle = config.customSubtitle || "Choose how you'd like to share your feedback";
  const publicLabel = config.publicReviewLabel || "Submit Public Review";
  const publicDesc = config.publicReviewDesc || "Share your experience on Google";
  const privateLabel = config.privateFeedbackLabel || "Provide Private Feedback";
  const privateDesc = config.privateFeedbackDesc || "Speak directly with our management team";

  const inputClass = "h-9 bg-white/5 border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/40 focus:border-[color:var(--brand)] focus:ring-1 focus:ring-[color:var(--brand)]/20 transition-all rounded-lg";

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Controls Panel */}
      <div className="space-y-4">
        {/* Section Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/5">
          {[
            { id: "brand" as const, label: "Brand & Colors", icon: Palette },
            { id: "content" as const, label: "Headings & Text", icon: Type },
            { id: "buttons" as const, label: "Buttons & Labels", icon: MessageCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex-1 ${
                activeSection === tab.id
                  ? "bg-[var(--brand)] text-white shadow-md"
                  : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
              }`}
              style={{ "--brand": config.brandColor } as React.CSSProperties}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Brand & Colors Section */}
        {activeSection === "brand" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Logo */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Label className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA] mb-3">
                <Image className="w-3.5 h-3.5" style={{ color: config.brandColor }} />
                Business Logo
              </Label>
              <Input
                value={config.logoUrl}
                onChange={(e) => { update("logoUrl", e.target.value); setLogoLoaded(false); }}
                placeholder="https://example.com/logo.png"
                className={inputClass}
              />
              {config.logoUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={config.logoUrl}
                    alt="Logo preview"
                    className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    onLoad={() => setLogoLoaded(true)}
                    onError={() => setLogoLoaded(false)}
                  />
                  <span className="text-xs text-[#A1A1AA]/60">Preview</span>
                </div>
              )}
            </div>

            {/* Brand Color */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Label className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA] mb-3">
                <Palette className="w-3.5 h-3.5" style={{ color: config.brandColor }} />
                Brand Color
              </Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => update("brandColor", color)}
                    className={`w-8 h-8 rounded-lg transition-all cursor-pointer ${
                      config.brandColor === color
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#0D0D0D] scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.brandColor}
                  onChange={(e) => update("brandColor", e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <Input
                  value={config.brandColor}
                  onChange={(e) => update("brandColor", e.target.value)}
                  placeholder="#16A34A"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Theme Mode */}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Label className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA] mb-3">
                <Monitor className="w-3.5 h-3.5" style={{ color: config.brandColor }} />
                Customer Screen Theme
              </Label>
              <div className="flex gap-2">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update("themeMode", opt.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex-1 ${
                      config.themeMode === opt.value
                        ? "border-2 text-white"
                        : "border border-white/10 bg-white/5 text-[#A1A1AA] hover:bg-white/10"
                    }`}
                    style={config.themeMode === opt.value ? { borderColor: config.brandColor, backgroundColor: `${config.brandColor}15`, color: config.brandColor } : {}}
                  >
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Content Section */}
        {activeSection === "content" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <Label className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
                <Type className="w-3.5 h-3.5" style={{ color: config.brandColor }} />
                Welcome Headline
              </Label>
              <Input
                value={config.customHeadline}
                onChange={(e) => update("customHeadline", e.target.value)}
                placeholder={`How was your experience with ${businessName}?`}
                className={inputClass}
              />
              <p className="text-[10px] text-[#A1A1AA]/40">
                {config.customHeadline ? "Custom headline set" : `Default: "How was your experience with ${businessName}?"`}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <Label className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
                <Type className="w-3.5 h-3.5" style={{ color: config.brandColor }} />
                Subtitle Text
              </Label>
              <Input
                value={config.customSubtitle}
                onChange={(e) => update("customSubtitle", e.target.value)}
                placeholder="Choose how you'd like to share your feedback"
                className={inputClass}
              />
              <p className="text-[10px] text-[#A1A1AA]/40">
                {config.customSubtitle ? "Custom subtitle set" : 'Default: "Choose how you\'d like to share your feedback"'}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <Label className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
                <Check className="w-3.5 h-3.5" style={{ color: config.brandColor }} />
                Thank-You Message
              </Label>
              <Textarea
                value={config.thankYouMessage}
                onChange={(e) => update("thankYouMessage", e.target.value)}
                placeholder="Thanks! Show this screen for 10% off your next visit."
                className="min-h-[60px] bg-white/5 border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/40 focus:border-[color:var(--brand)] focus:ring-1 focus:ring-[color:var(--brand)]/20 transition-all rounded-lg resize-none"
                style={{ "--brand": config.brandColor } as React.CSSProperties}
              />
              <p className="text-[10px] text-[#A1A1AA]/40">
                {config.thankYouMessage ? "Custom thank-you message set" : "Default thank-you message will be shown"}
              </p>
            </div>
          </motion.div>
        )}

        {/* Buttons Section */}
        {activeSection === "buttons" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <Label className="text-xs font-medium text-[#A1A1AA]">Public Review Button</Label>
              <Input
                value={config.publicReviewLabel}
                onChange={(e) => update("publicReviewLabel", e.target.value)}
                placeholder="Submit Public Review"
                className={inputClass}
              />
              <Input
                value={config.publicReviewDesc}
                onChange={(e) => update("publicReviewDesc", e.target.value)}
                placeholder="Share your experience on Google"
                className={inputClass}
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <Label className="text-xs font-medium text-[#A1A1AA]">Private Feedback Button</Label>
              <Input
                value={config.privateFeedbackLabel}
                onChange={(e) => update("privateFeedbackLabel", e.target.value)}
                placeholder="Provide Private Feedback"
                className={inputClass}
              />
              <Input
                value={config.privateFeedbackDesc}
                onChange={(e) => update("privateFeedbackDesc", e.target.value)}
                placeholder="Speak directly with our management team"
                className={inputClass}
              />
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-10 text-sm font-semibold cursor-pointer"
          style={{ backgroundColor: config.brandColor, color: "white" }}
        >
          {saving ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Customization
            </>
          )}
        </Button>
      </div>

      {/* Live Preview Panel */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <Eye className="w-3.5 h-3.5 text-[#A1A1AA]" />
          <span className="text-xs font-medium text-[#A1A1AA]">Live Preview</span>
          <span className="ml-auto text-[10px] text-[#A1A1AA]/40">Customer View</span>
        </div>

        <div
          className="p-6 min-h-[500px] flex flex-col items-center justify-center"
          style={{
            backgroundColor: config.themeMode === "light" ? "#F8FAFC" : config.themeMode === "auto" ? "#0A0A0B" : "#0A0A0B",
          }}
        >
          {/* Logo */}
          <div className="mb-6">
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt={businessName}
                className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-white/[0.06]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-white font-bold text-2xl"
                style={{ backgroundColor: config.brandColor }}
              >
                {businessName?.charAt(0)?.toUpperCase() || "B"}
              </div>
            )}
          </div>

          {/* Headline */}
          <h2
            className="text-lg font-bold text-center leading-snug mb-1.5"
            style={{ color: config.themeMode === "light" ? "#0F172A" : "white" }}
          >
            {headline}
          </h2>

          {/* Subtitle */}
          <p
            className="text-xs text-center mb-6"
            style={{ color: config.themeMode === "light" ? "#64748B" : "rgba(255,255,255,0.35)" }}
          >
            {subtitle}
          </p>

          {/* Public Review Button */}
          <div
            className="w-full rounded-xl p-4 text-left border mb-2"
            style={{
              backgroundColor: `${config.brandColor}08`,
              borderColor: `${config.brandColor}30`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${config.brandColor}20` }}
              >
                <Star className="w-5 h-5" style={{ color: config.brandColor }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: config.themeMode === "light" ? "#0F172A" : "white" }}>
                  {publicLabel}
                </p>
                <p className="text-[10px]" style={{ color: config.themeMode === "light" ? "#64748B" : "rgba(255,255,255,0.35)" }}>
                  {publicDesc}
                </p>
              </div>
              <ExternalLink className="w-3.5 h-3.5" style={{ color: config.themeMode === "light" ? "#94A3B8" : "rgba(255,255,255,0.2)" }} />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 px-2 my-1">
            <div className="flex-1 h-px" style={{ backgroundColor: config.themeMode === "light" ? "#E2E8F0" : "rgba(255,255,255,0.06)" }} />
            <span className="text-[8px] font-medium tracking-widest" style={{ color: config.themeMode === "light" ? "#94A3B8" : "rgba(255,255,255,0.2)" }}>OR</span>
            <div className="flex-1 h-px" style={{ backgroundColor: config.themeMode === "light" ? "#E2E8F0" : "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Private Feedback Button */}
          <div
            className="w-full rounded-xl p-4 text-left border"
            style={{
              borderColor: config.themeMode === "light" ? "#E2E8F0" : "rgba(255,255,255,0.06)",
              backgroundColor: config.themeMode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.02)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: config.themeMode === "light" ? "#F1F5F9" : "rgba(255,255,255,0.04)" }}
              >
                <MessageCircle className="w-5 h-5" style={{ color: config.themeMode === "light" ? "#64748B" : "rgba(255,255,255,0.4)" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: config.themeMode === "light" ? "#0F172A" : "white" }}>
                  {privateLabel}
                </p>
                <p className="text-[10px]" style={{ color: config.themeMode === "light" ? "#64748B" : "rgba(255,255,255,0.35)" }}>
                  {privateDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-4 flex items-center gap-1.5 text-[10px]" style={{ color: config.themeMode === "light" ? "#94A3B8" : "rgba(255,255,255,0.2)" }}>
            <ShieldCheck className="w-3 h-3" />
            <span>Your choice is completely voluntary</span>
          </div>

          {/* Thank You Message Preview */}
          {config.thankYouMessage && (
            <div
              className="mt-4 w-full p-3 rounded-xl text-center"
              style={{
                backgroundColor: `${config.brandColor}08`,
                border: `1px solid ${config.brandColor}20`,
              }}
            >
              <p className="text-[10px] font-medium" style={{ color: config.brandColor }}>
                Thank-You Message Preview
              </p>
              <p className="text-xs mt-1" style={{ color: config.themeMode === "light" ? "#475569" : "rgba(255,255,255,0.5)" }}>
                {config.thankYouMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
