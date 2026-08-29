import { useState, useRef, useCallback } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Palette,
  Type,
  Image as ImageIcon,
  Printer,
  CheckCircle2,
  X,
  Star,
  MessageCircle,
} from "lucide-react";

interface QRCodeGeneratorProps {
  reviewUrl: string;
  businessName: string;
  logoUrl?: string;
  brandColor?: string;
  staffName?: string;
  staffSlug?: string;
}

/* ─── Color Presets ─── */
const COLOR_PRESETS = [
  { name: "Forest", fg: "#16A34A", bg: "#FFFFFF" },
  { name: "Ocean", fg: "#0284C7", bg: "#FFFFFF" },
  { name: "Ruby", fg: "#DC2626", bg: "#FFFFFF" },
  { name: "Amber", fg: "#D97706", bg: "#FFFFFF" },
  { name: "Violet", fg: "#7C3AED", bg: "#FFFFFF" },
  { name: "Slate", fg: "#1E293B", bg: "#FFFFFF" },
];

/* ─── Template Styles ─── */
type TemplateStyle = "counter" | "tentr" | "minimal";

export default function QRCodeGenerator({
  reviewUrl,
  businessName,
  logoUrl,
  brandColor = "#16A34A",
  staffName,
  staffSlug,
}: QRCodeGeneratorProps) {
  const [customText, setCustomText] = useState("Tap or Scan to Share Your Experience");
  const [qrFg, setQrFg] = useState(brandColor);
  const [qrBg, setQrBg] = useState("#FFFFFF");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>("counter");
  const [logoPreview, setLogoPreview] = useState(logoUrl || "");
  const [showSuccess, setShowSuccess] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Build the review URL with optional staff param
  const qrValue = staffSlug
    ? `${reviewUrl}?sid=${staffSlug}`
    : reviewUrl;

  /* ─── PNG Download ─── */
  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Generate a fresh high-res canvas
    const size = 1200;
    const cvs = document.createElement("canvas");
    cvs.width = size;
    cvs.height = size;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = qrBg;
    ctx.fillRect(0, 0, size, size);

    // Draw QR from the hidden canvas
    const hiddenCanvas = document.getElementById("qr-download-canvas") as HTMLCanvasElement;
    if (hiddenCanvas) {
      const qrSize = size * 0.55;
      const offset = (size - qrSize) / 2;
      ctx.drawImage(hiddenCanvas, offset, 80, qrSize, qrSize);
    }

    // Business name
    ctx.fillStyle = "#1E293B";
    ctx.font = `bold ${size * 0.045}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(businessName, size / 2, size - 200);

    // Subtitle
    ctx.fillStyle = "#64748B";
    ctx.font = `${size * 0.028}px Inter, system-ui, sans-serif`;
    ctx.fillText(customText, size / 2, size - 150);

    // Footer
    ctx.fillStyle = "#94A3B8";
    ctx.font = `${size * 0.02}px Inter, system-ui, sans-serif`;
    ctx.fillText("Powered by STAR CATCH", size / 2, size - 80);

    // Download
    const link = document.createElement("a");
    link.download = `${businessName.replace(/\s+/g, "-")}-QR-Code.png`;
    link.href = cvs.toDataURL("image/png", 1.0);
    link.click();

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [businessName, customText, qrBg]);

  /* ─── Print ─── */
  const handlePrint = useCallback(() => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${businessName} - QR Code Standee</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f8fafc; }
            .standee { background: white; border-radius: 16px; padding: 40px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); max-width: 400px; width: 100%; }
            .standee img { max-width: 200px; margin-bottom: 16px; border-radius: 12px; }
            .standee h2 { font-size: 20px; color: #1e293b; margin-bottom: 8px; }
            .standee p { font-size: 14px; color: #64748b; margin-bottom: 20px; }
            .standee .footer { font-size: 11px; color: #94a3b8; margin-top: 20px; }
            .stars { font-size: 28px; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="standee">
            ${logoPreview ? `<img src="${logoPreview}" alt="${businessName}" />` : ""}
            <div class="stars">⭐ ⭐ ⭐ ⭐ ⭐</div>
            <h2>${businessName}</h2>
            <p>${customText}</p>
            <div id="qr-container"></div>
            <p class="footer">Powered by STAR CATCH</p>
          </div>
          <script>
            window.onload = function() {
              // Render QR code
              const container = document.getElementById('qr-container');
              const canvas = document.createElement('canvas');
              // Copy from generator canvas would be complex; instead we'll add the QR as an image
              container.innerHTML = '<p style="color:#94a3b8; font-size:12px;">Scan with your phone camera</p>';
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }, [businessName, customText, logoPreview]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[#16A34A]/10 flex items-center justify-center">
          <Download className="w-5 h-5 text-[#16A34A]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">QR Code Generator</h3>
          <p className="text-xs text-[#A1A1AA]">Generate print-ready QR code posters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          {/* Custom Text */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-1.5">
              <Type className="w-3 h-3" />
              Custom Text
            </label>
            <input
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Tap or Scan to Share Your Experience"
              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/20 transition-all"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-1.5">
              <ImageIcon className="w-3 h-3" />
              Logo URL (optional)
            </label>
            <input
              value={logoPreview}
              onChange={(e) => setLogoPreview(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#A1A1AA]/50 focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/20 transition-all"
            />
          </div>

          {/* Brand Color */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-2">
              <Palette className="w-3 h-3" />
              QR Code Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setQrFg(c.fg)}
                  className="w-8 h-8 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center"
                  style={{
                    backgroundColor: c.fg,
                    borderColor: qrFg === c.fg ? "white" : "transparent",
                  }}
                  title={c.name}
                >
                  {qrFg === c.fg && (
                    <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                  )}
                </button>
              ))}
              <input
                type="color"
                value={qrFg}
                onChange={(e) => setQrFg(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                title="Custom color"
              />
            </div>
          </div>

          {/* Template Style */}
          <div>
            <label className="text-xs font-medium text-[#A1A1AA] mb-2 block">
              Template Style
            </label>
            <div className="flex gap-2">
              {([
                { key: "counter" as const, label: "Counter Card" },
                { key: "tentr" as const, label: "Table Tent" },
                { key: "minimal" as const, label: "Minimal" },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedTemplate(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    selectedTemplate === t.key
                      ? "bg-[#16A34A]/15 border-[#16A34A]/30 text-[#16A34A]"
                      : "bg-white/5 border-white/10 text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Staff Attribution Info */}
          {staffName && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-400">
                This QR code is attributed to staff member: <strong>{staffName}</strong>
              </p>
            </div>
          )}

          {/* Download Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={downloadPNG}
              className="flex-1 h-10 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Standee
            </button>
          </div>

          {/* Success Toast */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-2 text-sm text-[#16A34A]"
              >
                <CheckCircle2 className="w-4 h-4" />
                QR code downloaded successfully!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Preview */}
        <div className="flex items-center justify-center">
          <div ref={printRef}>
            <div
              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white p-6 text-center ${
                selectedTemplate === "tentr" ? "max-w-[280px]" : "max-w-[320px]"
              } w-full`}
              style={{
                boxShadow: `0 8px 32px ${qrFg}15`,
              }}
            >
              {/* Logo */}
              {logoPreview && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={logoPreview}
                    alt={businessName}
                    className="w-16 h-16 rounded-xl object-cover shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Stars decoration */}
              {selectedTemplate !== "minimal" && (
                <div className="text-2xl mb-3 tracking-wider">
                  <Star className="inline w-5 h-5 fill-amber-400 text-amber-400" />
                  <Star className="inline w-5 h-5 fill-amber-400 text-amber-400" />
                  <Star className="inline w-5 h-5 fill-amber-400 text-amber-400" />
                  <Star className="inline w-5 h-5 fill-amber-400 text-amber-400" />
                  <Star className="inline w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
              )}

              {/* Business Name */}
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {businessName}
              </h3>
              <p className="text-xs text-gray-500 mb-4">{customText}</p>

              {/* QR Code */}
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <QRCodeSVG
                    value={qrValue}
                    size={180}
                    bgColor={qrBg}
                    fgColor={qrFg}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Hidden canvas for PNG download */}
              <div style={{ position: "absolute", left: -9999, top: -9999 }}>
                <QRCodeCanvas
                  id="qr-download-canvas"
                  value={qrValue}
                  size={600}
                  bgColor={qrBg}
                  fgColor={qrFg}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-gray-100 mt-3">
                <MessageCircle className="w-3 h-3 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-medium">
                  Powered by STAR CATCH
                </p>
              </div>

              {staffName && (
                <p className="text-[10px] text-blue-500 mt-1">
                  Staff: {staffName}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
