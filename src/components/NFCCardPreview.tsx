import { useState, useRef, useCallback } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
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
} from "lucide-react";

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

/* ─── Download helper: renders the card DOM to a data-URL via SVG foreignObject ─── */
function downloadCardNode(
  node: HTMLElement,
  filename: string,
) {
  const w = node.offsetWidth;
  const h = node.offsetHeight;

  // Inline all computed styles for the foreignObject
  const clone = node.cloneNode(true) as HTMLElement;
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

  // Inline key styles
  const inlineStyles = (el: Element) => {
    const cs = getComputedStyle(el as HTMLElement);
    const props = [
      "background-color",
      "color",
      "font-family",
      "font-size",
      "font-weight",
      "letter-spacing",
      "text-align",
      "line-height",
      "padding",
      "margin",
      "border",
      "border-radius",
      "display",
      "flex-direction",
      "align-items",
      "justify-content",
      "gap",
      "width",
      "height",
      "overflow",
      "position",
      "inset",
      "transform",
      "opacity",
      "box-shadow",
      "fill",
      "stroke",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
    ];
    let inline = "";
    for (const p of props) {
      const v = cs.getPropertyValue(p);
      if (v) inline += `${p}:${v};`;
    }
    (el as HTMLElement).style.cssText += inline;
    for (const child of el.children) {
      inlineStyles(child);
    }
  };
  inlineStyles(clone);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <foreignObject width="100%" height="100%">
    ${new XMLSerializer().serializeToString(clone)}
  </foreignObject>
</svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function NFCCardPreview({
  slug,
  businessName,
  brandColor = "#16A34A",
  staffMembers = [],
  isPro = false,
}: NFCCardPreviewProps) {
  const [showBack, setShowBack] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<"front" | "back" | null>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const reviewUrl = selectedStaff
    ? `${window.location.origin}/review/${slug}?sid=${selectedStaff}`
    : `${window.location.origin}/review/${slug}`;

  const handleDownload = useCallback(
    (which: "front" | "back") => {
      const ref = which === "front" ? frontRef : backRef;
      if (!ref.current) return;
      setDownloading(which);
      const suffix = selectedStaff ? `-${selectedStaff}` : "";
      const filename = `nfc-card-${which}-${slug}${suffix}.svg`;
      try {
        downloadCardNode(ref.current, filename);
      } catch (e) {
        console.error("Download failed", e);
      } finally {
        setTimeout(() => setDownloading(null), 600);
      }
    },
    [slug, selectedStaff],
  );

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
              {/* Glow border */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  border: `1px solid ${brandColor}20`,
                  boxShadow: `inset 0 1px 0 ${brandColor}10, 0 0 40px ${brandColor}05`,
                }}
              />

              {/* NFC Icon – top right */}
              <div className="absolute top-4 right-4 flex flex-col items-center gap-0.5 opacity-40">
                <Wifi className="w-4 h-4 text-white rotate-90" strokeWidth={2.5} />
                <span className="text-[7px] text-white font-medium tracking-wider">NFC</span>
              </div>

              {/* Content */}
              <div className="flex flex-col items-center justify-center h-full px-6 pb-5 pt-6">
                {/* Google G Logo */}
                <div className="mb-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>

                <p className="text-white text-sm font-semibold tracking-wide mb-1">
                  Review us on Google
                </p>

                <GoldStars count={5} size="w-4 h-4" />

                <div className="mt-4 flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${brandColor}20` }}
                  >
                    <Wifi className="w-3 h-3 rotate-90" style={{ color: brandColor }} />
                  </div>
                  <span className="text-[10px] text-white/40 font-medium tracking-wider uppercase">
                    Tap Phone Here
                  </span>
                </div>
              </div>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-16 rounded-full"
                style={{ backgroundColor: `${brandColor}30` }}
              />
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
              {/* Glow border */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  border: `1px solid ${brandColor}20`,
                  boxShadow: `inset 0 1px 0 ${brandColor}10, 0 0 40px ${brandColor}05`,
                }}
              />

              {/* Scan label – top */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-40">
                <ScanLine className="w-3.5 h-3.5 text-white" />
                <span className="text-[7px] text-white font-medium tracking-wider">SCAN</span>
              </div>

              {/* Content */}
              <div className="flex flex-col items-center justify-center h-full px-6 pb-5 pt-6">
                {/* QR Code */}
                <div className="bg-white p-3 rounded-xl mb-3 shadow-lg">
                  <QRCodeSVG
                    value={reviewUrl}
                    size={120}
                    level="H"
                    includeMargin={false}
                    fgColor="#0A0A0B"
                    bgColor="#FFFFFF"
                  />
                </div>

                <p className="text-white text-xs font-semibold tracking-wide mb-1.5">
                  Scan QR Code to Rate Us
                </p>

                <GoldStars count={5} size="w-3 h-3" />

                <div className="mt-3 flex items-center gap-1.5">
                  <ScanLine className="w-3 h-3 text-white/30" />
                  <span className="text-[9px] text-white/30 font-medium tracking-wider uppercase">
                    NFC & QR Instant Feedback
                  </span>
                </div>
              </div>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-16 rounded-full"
                style={{ backgroundColor: `${brandColor}30` }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Flip Controls ─── */}
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

      {/* ─── Staff QR Toggle (Pro only) ─── */}
      {isPro && staffMembers.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mb-2">
            Staff QR Preview
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedStaff(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                selectedStaff === null
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              Business Default
            </button>
            {staffMembers.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStaff(s.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  selectedStaff === s.id
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Download Buttons ─── */}
      <div className="flex gap-2">
        <Button
          onClick={() => handleDownload("front")}
          disabled={downloading !== null}
          variant="outline"
          className="flex-1 h-9 border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
        >
          {downloading === "front" ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-2" />
          )}
          Download Front
        </Button>
        <Button
          onClick={() => handleDownload("back")}
          disabled={downloading !== null}
          variant="outline"
          className="flex-1 h-9 border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
        >
          {downloading === "back" ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <Download className="w-3.5 h-3.5 mr-2" />
          )}
          Download Back
        </Button>
      </div>
    </div>
  );
}
