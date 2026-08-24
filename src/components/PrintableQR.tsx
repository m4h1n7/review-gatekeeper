import { useRef, useState } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Printer, Star, Lock, Upload, Palette } from "lucide-react";
import { useNavigate } from "react-router";

interface PrintableQRProps {
  slug: string;
  businessName: string;
  isPro?: boolean;
}

export function PrintableQR({ slug, businessName, isPro = false }: PrintableQRProps) {
  const reviewUrl = `${window.location.origin}/review/${slug}`;
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<"svg" | "png" | null>(null);
  const [accentColor, setAccentColor] = useState("#16A34A");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const downloadSVG = () => {
    if (!isPro) return;
    setDownloading("svg");
    const svgEl = printRef.current?.querySelector("svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `star-catch-qr-${slug}.svg`;
    a.click(); URL.revokeObjectURL(url);
    setTimeout(() => setDownloading(null), 500);
  };

  const downloadPNG = () => {
    if (!isPro) return;
    setDownloading("png");
    const canvas = printRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url;
    a.download = `star-catch-qr-${slug}.png`;
    a.click();
    setTimeout(() => setDownloading(null), 500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const ACCENT_PRESETS = ["#16A34A", "#2563EB", "#DC2626", "#7C3AED", "#F59E0B", "#0D9488"];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 flex items-center justify-center">
          <Printer className="w-5 h-5 text-[#16A34A]" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            Printable QR Code
          </h3>
          <p className="text-xs text-[#A1A1AA]">
            For your storefront, receipts, or business cards
          </p>
        </div>
      </div>

      {/* Standee Customizer (Pro only) */}
      {isPro && (
        <div className="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-[#A1A1AA]" />
            <p className="text-xs font-medium text-[#A1A1AA]">Customize Standee</p>
          </div>
          {/* Logo upload */}
          <div>
            <label className="block text-[10px] font-medium text-[#A1A1AA] mb-1.5">Business Logo</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-dashed border-white/15 text-[#A1A1AA] hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-xs">
                <Upload className="w-3.5 h-3.5" />
                {logoDataUrl ? "Change Logo" : "Upload Logo"}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              {logoDataUrl && (
                <button onClick={() => setLogoDataUrl(null)} className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer">Remove</button>
              )}
            </div>
          </div>
          {/* Accent color */}
          <div>
            <label className="block text-[10px] font-medium text-[#A1A1AA] mb-1.5">Accent Color</label>
            <div className="flex items-center gap-2">
              {ACCENT_PRESETS.map((c) => (
                <button key={c} onClick={() => setAccentColor(c)}
                  className={`w-7 h-7 rounded-full cursor-pointer transition-all ${accentColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#18181B] scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* Printable frame — always visible for both plans */}
      <div
        ref={printRef}
        className="mx-auto w-fit rounded-2xl border-2 border-white/10 bg-white p-6 mb-4 relative"
      >
        <div className="flex flex-col items-center gap-3">
          {/* Logo + brand */}
          <div className="flex items-center gap-1.5">
            {logoDataUrl ? (
              <img src={logoDataUrl} alt="Logo" className="w-6 h-6 rounded object-contain" />
            ) : (
              <Star className="w-4 h-4" style={{ color: accentColor, fill: accentColor }} />
            )}
            <span className="text-[10px] font-bold text-[#18181B] tracking-wide">
              STAR CATCH
            </span>
          </div>

          {/* QR Code */}
          <div className="relative">
            <QRCodeSVG
              value={reviewUrl}
              size={180}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#18181B"
              includeMargin={false}
              imageSettings={{
                src: "",
                height: 0,
                width: 0,
                excavate: false,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md" style={{ backgroundColor: accentColor }}>
                {logoDataUrl ? (
                  <img src={logoDataUrl} alt="" className="w-7 h-7 object-contain" />
                ) : (
                  <Star className="w-5 h-5 text-white fill-white" />
                )}
              </div>
            </div>
          </div>

          {/* Canvas for PNG download (hidden) */}
          <div className="absolute opacity-0 pointer-events-none">
            <QRCodeCanvas
              value={reviewUrl}
              size={400}
              level="H"
              bgColor="#FFFFFF"
              fgColor="#18181B"
              includeMargin={true}
              imageSettings={{
                src: "",
                height: 0,
                width: 0,
                excavate: false,
              }}
            />
          </div>

          {/* Frame text */}
          <div className="text-center">
            <p className="text-sm font-bold text-[#18181B]">
              Scan to Leave Feedback
            </p>
            <p className="text-[10px] text-[#A1A1AA] mt-0.5 max-w-[180px]">
              {businessName}
            </p>
          </div>
        </div>
      </div>

      {/* Download buttons with Pro gating */}
      <div className="relative">
        {!isPro && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0D0D0D]/80 backdrop-blur-[2px] rounded-xl">
            <div className="text-center px-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A]/15 border border-[#16A34A]/25 text-[#16A34A] text-xs font-semibold mb-2">
                <Lock className="w-3 h-3" /> PRO FEATURE
              </div>
              <p className="text-xs text-[#A1A1AA] mb-3">Upgrade to Business Pro to download printable QR standees</p>
              <Button onClick={() => navigate("/pricing")} size="sm"
                className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold cursor-pointer">
                Upgrade to Business Pro
              </Button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSVG}
            disabled={downloading === "svg"}
            className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {downloading === "svg" ? "Downloading..." : "Download SVG"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPNG}
            disabled={downloading === "png"}
            className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] hover:text-white cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {downloading === "png" ? "Downloading..." : "Download PNG"}
          </Button>
        </div>
      </div>
    </div>
  );
}
