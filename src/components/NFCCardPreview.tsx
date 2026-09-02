import React, { useState, useRef, useCallback, useEffect } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  RotateCcw,
  Star,
  Wifi,
  ScanLine,
  ChevronLeft,
  ChevronRight,
  Printer,
  FileText,
} from "lucide-react";

/* ─── CR80 Card Constants ─── */
const CR80_MM_W = 85.6;
const CR80_MM_H = 53.98;
const CR80_PX_W = 1012; // 85.6mm at 300 DPI
const CR80_PX_H = 637;  // 53.98mm at 300 DPI

interface NFCCardPreviewProps {
  slug: string;
  businessName: string;
  brandColor?: string;
  staffMembers?: Array<{ id: string; name: string; slug: string }>;
  isPro?: boolean;
}

/* ─── Stars helper ─── */
function GoldStars({ count = 5, size = "w-3.5 h-3.5" }: { count?: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className={`${size} text-amber-400 fill-amber-400`} />
      ))}
    </div>
  );
}

/* ─── Generate QR code as data URL ─── */
function generateQRDataUrl(value: string, size = 400): Promise<string> {
  return new Promise<string>((resolve) => {
    try {
      // Create a hidden canvas for high-res QR
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.style.position = "fixed";
      canvas.style.top = "-9999px";
      document.body.appendChild(canvas);

      // Render QRCodeCanvas via React root
      const { createRoot } = require("react-dom/client");
      const root = createRoot(canvas);
      root.render(
        React.createElement(QRCodeCanvas, {
          value,
          size,
          level: "H",
          includeMargin: false,
          fgColor: "#000000",
          bgColor: "#FFFFFF",
        })
      );

      // Wait for render then extract
      setTimeout(() => {
        try {
          const dataUrl = canvas.toDataURL("image/png");
          root.unmount();
          document.body.removeChild(canvas);
          resolve(dataUrl);
        } catch {
          try { root.unmount(); } catch {}
          try { document.body.removeChild(canvas); } catch {}
          resolve("");
        }
      }, 300);
    } catch {
      resolve("");
    }
  });
}

/* ─── Build the PDF for CR80 card ─── */
async function buildCardPDF(
  reviewUrl: string,
  brandColor: string,
  staffLabel?: string,
): Promise<jsPDF> {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [CR80_MM_W, CR80_MM_H * 2 + 10], // Stack both sides vertically with gap
  });

  const w = CR80_MM_W;
  const h = CR80_MM_H;
  const gap = 10; // mm between front and back

  // ─── FRONT SIDE ───
  // Dark background
  pdf.setFillColor(10, 10, 11);
  pdf.roundedRect(0, 0, w, h, 4, 4, "F");

  // Brand accent line
  pdf.setDrawColor(...hexToRGB(brandColor));
  pdf.setLineWidth(0.5);
  pdf.line(w / 2 - 8, h - 2, w / 2 + 8, h - 2);

  // NFC icon area (top right) - simple text
  pdf.setFontSize(6);
  pdf.setTextColor(180, 180, 180);
  pdf.text("NFC", w - 10, 8, { align: "center" });

  // Google G Logo (simplified as colored circles)
  const gx = w / 2;
  const gy = h / 2 - 6;
  // Blue arc
  pdf.setFillColor(66, 133, 244);
  pdf.circle(gx, gy, 4, "F");
  // Green
  pdf.setFillColor(52, 168, 83);
  pdf.circle(gx + 3.5, gy + 1.5, 3.5, "F");
  // Yellow
  pdf.setFillColor(251, 188, 5);
  pdf.circle(gx - 3.5, gy + 1.5, 3.5, "F");
  // Red
  pdf.setFillColor(234, 67, 53);
  pdf.circle(gx, gy + 4, 3.5, "F");
  // Center white
  pdf.setFillColor(255, 255, 255);
  pdf.circle(gx, gy + 1.5, 2, "F");

  // "Review us on Google"
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Review us on Google", gx, gy + 12, { align: "center" });

  // 5 Gold Stars
  drawStars(pdf, gx - 12, gy + 16, 5, 3);

  // "Tap Phone Here"
  pdf.setFontSize(7);
  pdf.setTextColor(150, 150, 150);
  pdf.text("Tap Phone Here", gx, h - 6, { align: "center" });

  // ─── BACK SIDE ───
  const backY = h + gap;

  // Dark background
  pdf.setFillColor(10, 10, 11);
  pdf.roundedRect(0, backY, w, h, 4, 4, "F");

  // Brand accent line
  pdf.setDrawColor(...hexToRGB(brandColor));
  pdf.line(w / 2 - 8, backY + h - 2, w / 2 + 8, backY + h - 2);

  // "SCAN" label
  pdf.setFontSize(6);
  pdf.setTextColor(180, 180, 180);
  pdf.text("SCAN", w / 2, backY + 7, { align: "center" });

  // QR Code (embedded from canvas)
  try {
    const qrDataUrl = await generateQRDataUrl(reviewUrl, 400);
    if (qrDataUrl) {
      // White background for QR
      const qrSize = 24;
      const qrX = w / 2 - qrSize / 2;
      const qrY = backY + 9;
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 2, 2, "F");
      pdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    }
  } catch {
    // Fallback: placeholder QR
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(w / 2 - 15, backY + 9, 30, 24, 2, 2, "F");
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text("[QR Code]", w / 2, backY + 23, { align: "center" });
  }

  // "Scan QR Code to Rate Us"
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Scan QR Code to Rate Us", w / 2, backY + 38, { align: "center" });

  // 5 Gold Stars
  drawStars(pdf, w / 2 - 10, backY + 41, 5, 2.5);

  // "NFC & QR Instant Feedback"
  pdf.setFontSize(5);
  pdf.setTextColor(120, 120, 120);
  pdf.text("NFC & QR Instant Feedback", w / 2, backY + h - 5, { align: "center" });

  // Print specs footer
  pdf.setFontSize(4);
  pdf.setTextColor(80, 80, 80);
  pdf.text(
    `CR80 PVC Card | ${CR80_MM_W}mm x ${CR80_MM_H}mm | 300 DPI | NFC: NTAG215/216`,
    w / 2,
    backY + h + gap - 1,
    { align: "center" },
  );

  return pdf;
}

/* ─── Helper: hex color to RGB array ─── */
function hexToRGB(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/* ─── Helper: draw gold stars ─── */
function drawStars(pdf: jsPDF, x: number, y: number, count: number, radius: number) {
  const spacing = radius * 2.8;
  const startX = x - ((count - 1) * spacing) / 2;
  for (let i = 0; i < count; i++) {
    const cx = startX + i * spacing;
    drawStarShape(pdf, cx, y, radius, [251, 191, 36]); // amber-400
  }
}

/* ─── Helper: draw a 5-pointed star ─── */
function drawStarShape(pdf: jsPDF, cx: number, cy: number, r: number, color: [number, number, number]) {
  pdf.setFillColor(...color);
  pdf.setDrawColor(...color);
  const points: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.4;
    points.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
  }
  // Draw as polygon using lines
  pdf.setLineWidth(0.15);
  pdf.line(points[0][0], points[0][1], points[1][0], points[1][1]);
  pdf.line(points[1][0], points[1][1], points[2][0], points[2][1]);
  pdf.line(points[2][0], points[2][1], points[3][0], points[3][1]);
  pdf.line(points[3][0], points[3][1], points[4][0], points[4][1]);
  pdf.line(points[4][0], points[4][1], points[5][0], points[5][1]);
  pdf.line(points[5][0], points[5][1], points[6][0], points[6][1]);
  pdf.line(points[6][0], points[6][1], points[7][0], points[7][1]);
  pdf.line(points[7][0], points[7][1], points[8][0], points[8][1]);
  pdf.line(points[8][0], points[8][1], points[9][0], points[9][1]);
  pdf.line(points[9][0], points[9][1], points[0][0], points[0][1]);
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function NFCCardPreview({
  slug,
  businessName,
  brandColor = "#16A34A",
  staffMembers = [],
  isPro = false,
}: NFCCardPreviewProps) {
  const [showBack, setShowBack] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<"front" | "back" | "pdf" | null>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const reviewUrl = selectedStaff
    ? `${window.location.origin}/review/${slug}?sid=${selectedStaff}`
    : `${window.location.origin}/review/${slug}`;

  const staffLabel = selectedStaff
    ? staffMembers.find((s) => s.id === selectedStaff)?.name
    : undefined;

  /* ─── Download SVG ─── */
  const handleDownloadSVG = useCallback(
    (which: "front" | "back") => {
      const ref = which === "front" ? frontRef : backRef;
      if (!ref.current) return;
      setDownloading(which);

      const node = ref.current;
      const w = node.offsetWidth;
      const h = node.offsetHeight;
      const clone = node.cloneNode(true) as HTMLElement;
      clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

      // Inline styles
      const inline = (el: Element) => {
        const cs = getComputedStyle(el as HTMLElement);
        const props = [
          "background-color", "color", "font-family", "font-size", "font-weight",
          "letter-spacing", "text-align", "line-height", "padding", "margin",
          "border", "border-radius", "display", "flex-direction", "align-items",
          "justify-content", "gap", "width", "height", "overflow", "position",
          "box-shadow", "fill", "stroke", "stroke-width",
        ];
        let css = "";
        for (const p of props) {
          const v = cs.getPropertyValue(p);
          if (v) css += `${p}:${v};`;
        }
        (el as HTMLElement).style.cssText += css;
        for (const child of el.children) inline(child);
      };
      inline(clone);

      const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(clone)}</foreignObject></svg>`;
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nfc-card-${which}-${slug}${selectedStaff ? `-${selectedStaff}` : ""}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setTimeout(() => setDownloading(null), 600);
    },
    [slug, selectedStaff],
  );

  /* ─── Download PDF ─── */
  const handleDownloadPDF = useCallback(async () => {
    setDownloading("pdf");
    try {
      const pdf = await buildCardPDF(reviewUrl, brandColor, staffLabel);
      const suffix = selectedStaff ? `-${selectedStaff}` : "";
      pdf.save(`nfc-card-CR80-${slug}${suffix}.pdf`);
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setTimeout(() => setDownloading(null), 800);
    }
  }, [reviewUrl, brandColor, slug, selectedStaff, staffLabel]);

  /* ─── Direct Print ─── */
  const handlePrint = useCallback(() => {
    // Create a print-specific window
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const frontHtml = frontRef.current?.outerHTML || "";
    const backHtml = backRef.current?.outerHTML || "";

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>NFC Card - ${businessName}</title>
  <style>
    @page { size: auto; margin: 10mm; }
    @media print { body { margin: 0; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: #fff;
      color: #000;
      padding: 20px;
    }
    .card-container {
      display: flex;
      gap: 24px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .card-side {
      width: ${CR80_MM_W}mm;
      height: ${CR80_MM_H}mm;
      border-radius: 4mm;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;
      border: 1px solid #e5e5e5;
    }
    .card-label {
      text-align: center;
      font-size: 10px;
      font-weight: 600;
      color: #666;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .specs {
      text-align: center;
      font-size: 8px;
      color: #999;
      margin-top: 20px;
      line-height: 1.6;
    }
    .specs strong { color: #666; }
  </style>
</head>
<body>
  <div class="card-container">
    <div>
      <div class="card-label">Front — NFC Tap Side</div>
      <div class="card-side">${frontHtml}</div>
    </div>
    <div>
      <div class="card-label">Back — QR Code Side</div>
      <div class="card-side">${backHtml}</div>
    </div>
  </div>
  <div class="specs">
    <strong>CR80 PVC Card</strong> | ${CR80_MM_W}mm × ${CR80_MM_H}mm | 300 DPI Print Resolution<br/>
    <strong>NFC Chip:</strong> NTAG215 / NTAG216 | <strong>Material:</strong> CR80 PVC (0.76mm)<br/>
    ${staffLabel ? `<strong>Staff:</strong> ${staffLabel} | ` : ""}<strong>Review URL:</strong> ${reviewUrl}
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`);
    printWindow.document.close();
  }, [businessName, reviewUrl, staffLabel]);

  return (
    <div className="space-y-4">
      {/* ─── Card Container ─── */}
      <div className="relative" style={{ perspective: "1200px" }}>
        <AnimatePresence mode="wait">
          {!showBack ? (
            /* ═══ FRONT SIDE ═══ */
            <motion.div
              key="front"
              ref={frontRef}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full aspect-[1.6/1] rounded-2xl overflow-hidden relative"
              style={{ backgroundColor: "#0A0A0B" }}
            >
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  border: `1px solid ${brandColor}20`,
                  boxShadow: `inset 0 1px 0 ${brandColor}10, 0 0 40px ${brandColor}05`,
                }}
              />

              {/* NFC Icon */}
              <div className="absolute top-4 right-4 flex flex-col items-center gap-0.5 opacity-40">
                <Wifi className="w-4 h-4 text-white rotate-90" strokeWidth={2.5} />
                <span className="text-[7px] text-white font-medium tracking-wider">NFC</span>
              </div>

              {/* Content */}
              <div className="flex flex-col items-center justify-center h-full px-6 pb-5 pt-6">
                <div className="mb-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                <p className="text-white text-sm font-semibold tracking-wide mb-1">Review us on Google</p>
                <GoldStars count={5} size="w-4 h-4" />
                <div className="mt-4 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColor}20` }}>
                    <Wifi className="w-3 h-3 rotate-90" style={{ color: brandColor }} />
                  </div>
                  <span className="text-[10px] text-white/40 font-medium tracking-wider uppercase">Tap Phone Here</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-16 rounded-full" style={{ backgroundColor: `${brandColor}30` }} />
            </motion.div>
          ) : (
            /* ═══ BACK SIDE ═══ */
            <motion.div
              key="back"
              ref={backRef}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full aspect-[1.6/1] rounded-2xl overflow-hidden relative"
              style={{ backgroundColor: "#0A0A0B" }}
            >
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  border: `1px solid ${brandColor}20`,
                  boxShadow: `inset 0 1px 0 ${brandColor}10, 0 0 40px ${brandColor}05`,
                }}
              />

              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-40">
                <ScanLine className="w-3.5 h-3.5 text-white" />
                <span className="text-[7px] text-white font-medium tracking-wider">SCAN</span>
              </div>

              <div className="flex flex-col items-center justify-center h-full px-6 pb-5 pt-6">
                <div className="bg-white p-3 rounded-xl mb-3 shadow-lg">
                  <QRCodeSVG value={reviewUrl} size={120} level="H" includeMargin={false} fgColor="#0A0A0B" bgColor="#FFFFFF" />
                </div>
                <p className="text-white text-xs font-semibold tracking-wide mb-1.5">Scan QR Code to Rate Us</p>
                <GoldStars count={5} size="w-3 h-3" />
                <div className="mt-3 flex items-center gap-1.5">
                  <ScanLine className="w-3 h-3 text-white/30" />
                  <span className="text-[9px] text-white/30 font-medium tracking-wider uppercase">NFC & QR Instant Feedback</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-16 rounded-full" style={{ backgroundColor: `${brandColor}30` }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flip Controls */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => setShowBack(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              !showBack ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
            }`}
          >
            <ChevronLeft className="w-3 h-3" />
            Front
          </button>
          <button
            onClick={() => setShowBack(!showBack)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white/60 text-xs font-medium transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Flip
          </button>
          <button
            onClick={() => setShowBack(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              showBack ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
            }`}
          >
            Back
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ─── Staff QR Toggle ─── */}
      {isPro && staffMembers.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mb-2">Staff QR Preview</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedStaff(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                selectedStaff === null ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
              }`}
            >
              Business Default
            </button>
            {staffMembers.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStaff(s.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  selectedStaff === s.id ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Export Actions ─── */}
      <div className="space-y-2">
        {/* Primary: Download PDF */}
        <Button
          onClick={handleDownloadPDF}
          disabled={downloading !== null}
          className="w-full h-10 bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-semibold cursor-pointer"
        >
          {downloading === "pdf" ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Download Printable Card PDF (CR80 Standard)
        </Button>

        {/* Secondary row: SVG downloads + Print */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleDownloadSVG("front")}
            disabled={downloading !== null}
            variant="outline"
            className="flex-1 h-9 border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
          >
            {downloading === "front" ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-2" />
            )}
            Front SVG
          </Button>
          <Button
            onClick={() => handleDownloadSVG("back")}
            disabled={downloading !== null}
            variant="outline"
            className="flex-1 h-9 border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
          >
            {downloading === "back" ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Download className="w-3.5 h-3.5 mr-2" />
            )}
            Back SVG
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="h-9 px-3 border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
            title="Direct Print"
          >
            <Printer className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ─── Print Specs Info ─── */}
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
        <p className="text-[10px] text-white/20 leading-relaxed">
          <span className="text-white/30 font-medium">Print Specs:</span> CR80 PVC Card ({CR80_MM_W}mm × {CR80_MM_H}mm) • 300 DPI • NFC Chip: NTAG215/216 • Material: CR80 PVC (0.76mm)
        </p>
      </div>
    </div>
  );
}
