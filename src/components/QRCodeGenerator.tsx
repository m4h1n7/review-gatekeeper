import { useState, useRef, useEffect, useCallback } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";
import {
  Download,
  Palette,
  Type,
  Image as ImageIcon,
  Printer,
  CheckCircle2,
  Star,
  MessageCircle,
  FileDown,
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
type PosterFormat = "a5" | "tent";

/* ─── Helpers ─── */
function hexToRGB(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/** Load an image for canvas/PDF embedding; resolves null on CORS/load failure */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timeout = setTimeout(() => resolve(null), 4000);
    img.onload = () => {
      clearTimeout(timeout);
      resolve(img.naturalWidth > 0 ? img : null);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };
    img.src = src;
  });
}

/** Draw a 5-pointed filled star (canvas, pixel coords) */
function canvasStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.4;
    const x = cx + Math.cos(angle) * rad;
    const y = cy + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/** Draw a row of stars centered on cx (canvas) */
function canvasStars(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  count: number,
  r: number,
  color: string,
) {
  const spacing = r * 2.8;
  const startX = cx - ((count - 1) * spacing) / 2;
  for (let i = 0; i < count; i++) canvasStar(ctx, startX + i * spacing, cy, r, color);
}

/** Draw a row of stars centered on x (jsPDF, mm coords) */
function pdfStars(
  pdf: jsPDF,
  cx: number,
  cy: number,
  count: number,
  r: number,
  color: [number, number, number],
) {
  const spacing = r * 2.8;
  const startX = cx - ((count - 1) * spacing) / 2;
  for (let i = 0; i < count; i++) {
    pdf.setFillColor(...color);
    pdf.setDrawColor(...color);
    const points: [number, number][] = [];
    for (let j = 0; j < 10; j++) {
      const angle = (Math.PI / 5) * j - Math.PI / 2;
      const rad = j % 2 === 0 ? r : r * 0.4;
      points.push([startX + i * spacing + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
    }
    pdf.lines(
      points.slice(1).map((p, idx) => {
        const prev = points[idx];
        return [p[0] - prev[0], p[1] - prev[1]];
      }),
      points[0][0],
      points[0][1],
      [1, 1],
      "F",
      true,
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
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
  const [successLabel, setSuccessLabel] = useState("Poster downloaded!");
  const [isExporting, setIsExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // ─── Dynamic Branding Sync ───
  // The parent passes live Convex data; when the client updates their Business
  // Name / Logo / Brand Accent Color these flow straight into the poster.
  useEffect(() => {
    setLogoPreview(logoUrl || "");
  }, [logoUrl]);

  useEffect(() => {
    if (brandColor) setQrFg(brandColor);
  }, [brandColor]);

  // Build the review URL with optional staff attribution (?staff= is primary)
  const qrValue = staffSlug ? `${reviewUrl}?staff=${staffSlug}` : reviewUrl;

  /** Read the hidden 1200px QR canvas as a data URL (used by PNG + PDF export) */
  const getQRDataUrl = useCallback((): string | null => {
    const hidden = document.getElementById("qr-download-canvas") as HTMLCanvasElement | null;
    if (!hidden) return null;
    try {
      return hidden.toDataURL("image/png");
    } catch {
      return null;
    }
  }, []);

  const showSuccessToast = useCallback((label: string) => {
    setSuccessLabel(label);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, []);

  /* ══════════════════════════════════════════════════════════════
     HIGH-RES PNG POSTER (1600 × 2133 px ≈ 200 DPI at A5)
     Brand-synced: logo, business name, brand accent bar, QR color
     ══════════════════════════════════════════════════════════════ */
  const downloadPNG = useCallback(async () => {
    setIsExporting(true);
    try {
      const W = 1600;
      const H = 2133;
      const cvs = document.createElement("canvas");
      cvs.width = W;
      cvs.height = H;
      const ctx = cvs.getContext("2d");
      if (!ctx) return;

      // Background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, W, H);

      // Brand accent top bar
      ctx.fillStyle = qrFg;
      ctx.fillRect(0, 0, W, 22);

      // Logo (falls back to brand-colored initial)
      const logoImg = await loadImage(logoPreview);
      if (logoImg) {
        const logoSize = 300;
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, 320, logoSize / 2, 0, Math.PI * 2);
        ctx.shadowColor = "rgba(0,0,0,0.12)";
        ctx.shadowBlur = 30;
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, 320, logoSize / 2 - 8, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, W / 2 - logoSize / 2, 320 - logoSize / 2, logoSize, logoSize);
        ctx.restore();
      } else {
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, 320, 150, 0, Math.PI * 2);
        ctx.fillStyle = qrFg;
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 150px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText((businessName || "B").charAt(0).toUpperCase(), W / 2, 328);
      }

      // Stars
      canvasStars(ctx, W / 2, 560, 5, 38, "#FBBF24");

      // Business name
      ctx.fillStyle = "#1E293B";
      ctx.font = "bold 92px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(businessName, W / 2, 690);

      // Subtitle
      ctx.fillStyle = "#64748B";
      ctx.font = "46px Inter, system-ui, sans-serif";
      ctx.fillText(customText, W / 2, 760);

      // QR (white card + brand-tinted border)
      const qrData = getQRDataUrl();
      const qrImg = qrData ? await loadImage(qrData) : null;
      if (qrImg) {
        const qrSize = 900;
        const qrX = (W - qrSize) / 2;
        const qrY = 850;
        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowColor = "rgba(0,0,0,0.08)";
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.roundRect(qrX - 36, qrY - 36, qrSize + 72, qrSize + 72, 40);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = `${qrFg}30`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(qrX - 36, qrY - 36, qrSize + 72, qrSize + 72, 40);
        ctx.stroke();
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      }

      // Brand accent divider
      ctx.fillStyle = qrFg;
      ctx.fillRect(W / 2 - 90, 1920, 180, 8);

      // Footer
      ctx.fillStyle = "#94A3B8";
      ctx.font = "34px Inter, system-ui, sans-serif";
      ctx.fillText("Powered by STAR CATCH", W / 2, 2010);
      if (staffName) {
        ctx.font = "30px Inter, system-ui, sans-serif";
        ctx.fillStyle = qrFg;
        ctx.fillText(`Served by ${staffName}`, W / 2, 2060);
      }

      const link = document.createElement("a");
      link.download = `${businessName.replace(/\s+/g, "-")}-Poster.png`;
      link.href = cvs.toDataURL("image/png", 1.0);
      link.click();

      showSuccessToast("High-res poster downloaded!");
    } catch (e) {
      console.error("PNG export failed:", e);
    } finally {
      setIsExporting(false);
    }
  }, [businessName, customText, qrFg, logoPreview, staffName, getQRDataUrl, showSuccessToast]);

  /* ══════════════════════════════════════════════════════════════
     PRINT-READY VECTOR PDF (A5 portrait / Table Tent landscape)
     True vector text & shapes + 1200px embedded QR (~340 DPI)
     ══════════════════════════════════════════════════════════════ */
  const downloadPosterPDF = useCallback(
    async (format: PosterFormat) => {
      setIsExporting(true);
      try {
        const accent = hexToRGB(qrFg);
        const gold: [number, number, number] = [251, 191, 36];

        const isA5 = format === "a5";
        const w = isA5 ? 148 : 210; // mm
        const h = isA5 ? 210 : 148;

        const pdf = new jsPDF({
          orientation: isA5 ? "portrait" : "landscape",
          unit: "mm",
          format: [w, h],
        });

        // Background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, w, h, "F");

        // Brand accent top bar
        pdf.setFillColor(...accent);
        pdf.rect(0, 0, w, 3.2, "F");

        // Logo or brand-colored initial
        const logoImg = await loadImage(logoPreview);
        const logoSize = isA5 ? 34 : 28;
        const logoY = isA5 ? 16 : 14;
        if (logoImg) {
          const dataUrl = (() => {
            try {
              const c = document.createElement("canvas");
              const s = 512;
              c.width = s;
              c.height = s;
              const cx2 = c.getContext("2d");
              if (!cx2) return null;
              cx2.drawImage(logoImg, 0, 0, s, s);
              return c.toDataURL("image/png");
            } catch {
              return null;
            }
          })();
          if (dataUrl) {
            pdf.addImage(dataUrl, "PNG", w / 2 - logoSize / 2, logoY, logoSize, logoSize);
          } else {
            // CORS-blocked logo → branded initial fallback
            pdf.setFillColor(...accent);
            pdf.circle(w / 2, logoY + logoSize / 2, logoSize / 2, "F");
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(logoSize * 0.7);
            pdf.text(
              (businessName || "B").charAt(0).toUpperCase(),
              w / 2,
              logoY + logoSize / 2 + logoSize * 0.12,
              { align: "center" },
            );
          }
        } else {
          pdf.setFillColor(...accent);
          pdf.circle(w / 2, logoY + logoSize / 2, logoSize / 2, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(logoSize * 0.7);
          pdf.text(
            (businessName || "B").charAt(0).toUpperCase(),
            w / 2,
            logoY + logoSize / 2 + logoSize * 0.12,
            { align: "center" },
          );
        }

        // Stars
        pdfStars(pdf, w / 2, logoY + logoSize + 10, 5, isA5 ? 3.6 : 3, gold);

        // Business name (vector text — scales crisply at any print size)
        pdf.setTextColor(30, 41, 59);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(isA5 ? 22 : 18);
        pdf.text(businessName, w / 2, logoY + logoSize + 20, { align: "center" });

        // Subtitle
        pdf.setTextColor(100, 116, 139);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(isA5 ? 11 : 10);
        pdf.text(customText, w / 2, logoY + logoSize + 27, { align: "center" });

        // QR code — embedded from the hidden 1200px canvas (~340 DPI at 90mm)
        const qrData = getQRDataUrl();
        const qrSize = isA5 ? 92 : 62;
        const qrY = isA5 ? logoY + logoSize + 36 : logoY + logoSize + 34;
        if (qrData) {
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(w / 2 - qrSize / 2 - 4, qrY - 4, qrSize + 8, qrSize + 8, 3, 3, "F");
          pdf.setDrawColor(...accent);
          pdf.setLineWidth(0.6);
          pdf.roundedRect(w / 2 - qrSize / 2 - 4, qrY - 4, qrSize + 8, qrSize + 8, 3, 3, "S");
          pdf.addImage(qrData, "PNG", w / 2 - qrSize / 2, qrY, qrSize, qrSize);
        }

        // Accent divider
        const footerY = isA5 ? qrY + qrSize + 14 : qrY + qrSize + 12;
        pdf.setFillColor(...accent);
        pdf.roundedRect(w / 2 - 9, footerY, 18, 1.1, 0.5, 0.5, "F");

        // Footer
        pdf.setTextColor(148, 163, 184);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.text("Powered by STAR CATCH", w / 2, footerY + 6, { align: "center" });
        if (staffName) {
          pdf.setTextColor(...accent);
          pdf.setFontSize(8);
          pdf.text(`Served by ${staffName}`, w / 2, footerY + 10.5, { align: "center" });
        }

        pdf.save(`${businessName.replace(/\s+/g, "-")}-${isA5 ? "A5-Poster" : "Table-Tent"}.pdf`);
        showSuccessToast(isA5 ? "A5 poster PDF downloaded!" : "Table tent PDF downloaded!");
      } catch (e) {
        console.error("PDF export failed:", e);
      } finally {
        setIsExporting(false);
      }
    },
    [businessName, customText, qrFg, logoPreview, staffName, getQRDataUrl, showSuccessToast],
  );

  /* ─── Print (fixed: injects the real live preview incl. actual QR SVG) ─── */
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
            body { font-family: 'Inter', system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #ffffff; }
            svg { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  }, [businessName]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-[#16A34A]/10 flex items-center justify-center">
          <Download className="w-5 h-5 text-[#16A34A]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">QR Code Generator</h3>
          <p className="text-xs text-[#A1A1AA]">
            Print-ready posters — branding synced from your profile
          </p>
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

          {/* Export Buttons */}
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <button
                onClick={() => downloadPosterPDF("a5")}
                disabled={isExporting}
                className="flex-1 h-10 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" />
                Download Poster (A5 PDF)
              </button>
              <button
                onClick={() => downloadPosterPDF("tent")}
                disabled={isExporting}
                className="h-10 px-4 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/30 hover:bg-[#16A34A]/25 text-[#16A34A] text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                title="Download Table Tent format (A5 landscape)"
              >
                Table Tent PDF
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadPNG}
                disabled={isExporting}
                className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download PNG (High-Res)
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Standee
              </button>
            </div>
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
                {successLabel}
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
                borderTop: `4px solid ${qrFg}`,
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

              {/* QR Code with optional centered logo overlay */}
              <div className="flex justify-center mb-3">
                <div className="relative p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <QRCodeSVG
                    value={qrValue}
                    size={180}
                    bgColor={qrBg}
                    fgColor={qrFg}
                    level="H"
                    includeMargin={false}
                  />
                  {/* Centered logo overlay */}
                  {logoPreview && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div
                        className="bg-white rounded-full flex items-center justify-center shadow-md"
                        style={{ width: 40, height: 40 }}
                      >
                        <img
                          src={logoPreview}
                          alt="Logo"
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
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

      {/* Hidden 1200px canvas — single source of truth for PNG + PDF exports */}
      <div style={{ position: "absolute", left: -9999, top: -9999 }}>
        <QRCodeCanvas
          id="qr-download-canvas"
          value={qrValue}
          size={1200}
          bgColor={qrBg}
          fgColor={qrFg}
          level="H"
          includeMargin={false}
        />
      </div>
    </div>
  );
}
