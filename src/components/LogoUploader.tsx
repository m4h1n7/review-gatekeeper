import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ImagePlus,
  CloudUpload,
  Link2,
  Trash2,
  Loader2,
  Crop,
  ZoomIn,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml";

interface LogoUploaderProps {
  businessId: string;
  businessName: string;
  initialLogoUrl?: string;
  disabled?: boolean;
}

type Status = "idle" | "uploading" | "saving" | "error";

/**
 * Drag-and-drop / browse logo uploader with instant 1:1 preview.
 * Files upload straight to Convex file storage; logoUrl on the business
 * document is patched atomically on commit. A "Paste image link" fallback
 * is provided for clients with hosted artwork.
 */
export default function LogoUploader({
  businessId,
  businessName,
  initialLogoUrl,
  disabled = false,
}: LogoUploaderProps) {
  const updateLogo = useMutation(api.businesses.updateBusinessLogo);
  const generateUploadUrl = useAction(api.businesses.generateLogoUploadUrl);
  const updateBranding = useMutation(api.businesses.updateBranding);

  const [savedLogo, setSavedLogo] = useState<string | undefined>(initialLogoUrl);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null); // object URL of unsaved file
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [fit, setFit] = useState<"fit" | "fill">("fit");
  const [urlInput, setUrlInput] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const businessIdRef = useRef(businessId);
  businessIdRef.current = businessId;

  // Keep in sync when the Convex query refreshes the prop
  useEffect(() => {
    setSavedLogo(initialLogoUrl);
  }, [initialLogoUrl]);

  // Revoke object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    };
  }, [pendingUrl]);

  const displayLogo = pendingUrl ?? savedLogo;

  const validate = useCallback((file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) {
      return "Unsupported format. Please use JPEG, PNG, WEBP or SVG.";
    }
    if (file.size > MAX_BYTES) {
      return `Image is ${(file.size / (1024 * 1024)).toFixed(1)}MB — the limit is 5MB.`;
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      if (disabled) return;
      const problem = validate(file);
      if (problem) {
        setStatus("error");
        setErrorMsg(problem);
        toast.error(problem);
        return;
      }

      const nextPreview = URL.createObjectURL(file);
      setPendingUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return nextPreview;
      });
      setStatus("uploading");
      setErrorMsg("");

      try {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error(`Upload failed (${res.status})`);
        const { storageId } = (await res.json()) as { storageId: string };

        setStatus("saving");
        await updateLogo({
          businessId: businessIdRef.current,
          storageId,
          contentType: file.type,
          sizeBytes: file.size,
        });

        setSavedLogo(nextPreview);
        setPendingUrl(null);
        setStatus("idle");
        toast.success("Logo updated", {
          description: "Your new logo is live on the review page.",
        });
      } catch (err) {
        // Roll back the optimistic preview on failure
        if (nextPreview) URL.revokeObjectURL(nextPreview);
        setPendingUrl(null);
        setStatus("error");
        const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
        setErrorMsg(msg);
        toast.error("Couldn't upload logo", { description: msg });
      }
    },
    [disabled, generateUploadUrl, updateLogo, validate],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void uploadFile(file);
    },
    [uploadFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void uploadFile(file);
      e.target.value = ""; // allow re-selecting the same file
    },
    [uploadFile],
  );

  const saveUrlLink = useCallback(async () => {
    if (disabled) return;
    const url = urlInput.trim();
    if (!url) return;
    setSavingUrl(true);
    try {
      await updateBranding({ businessId: businessIdRef.current, logoUrl: url });
      setSavedLogo(url);
      setUrlInput("");
      setStatus("idle");
      setErrorMsg("");
      toast.success("Logo link saved");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't save the link.";
      toast.error(msg);
    } finally {
      setSavingUrl(false);
    }
  }, [disabled, urlInput, updateBranding]);

  const removeLogo = useCallback(async () => {
    if (disabled) return;
    try {
      await updateBranding({ businessId: businessIdRef.current, logoUrl: "" });
      setSavedLogo(undefined);
      setPendingUrl(null);
      toast.success("Logo removed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Couldn't remove the logo.";
      toast.error(msg);
    }
  }, [disabled, updateBranding]);

  const busy = status === "uploading" || status === "saving";

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {/* 1:1 square preview — mirrors the Customer View header frame */}
        <div className="shrink-0">
          <Label className="text-[10px] font-medium uppercase tracking-wider text-[#71717A]">
            1:1 Preview
          </Label>
          <div
            className="mt-1.5 w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] flex items-center justify-center relative"
            style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
          >
            {displayLogo ? (
              <img
                src={displayLogo}
                alt={`${businessName} logo preview`}
                className={
                  fit === "fill"
                    ? "w-full h-full object-cover"
                    : "w-full h-full object-contain p-1.5"
                }
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                }}
                onLoad={(e) => {
                  (e.currentTarget as HTMLImageElement).style.visibility = "visible";
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-[#52525B]">
                <ImagePlus className="w-6 h-6" />
                <span className="text-[9px] font-medium">No logo</span>
              </div>
            )}
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              </div>
            )}
          </div>
          {/* Simple zoom / center-crop controls */}
          {displayLogo && (
            <div className="mt-2 flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => setFit("fit")}
                disabled={disabled}
                title="Fit entire logo (auto-centered)"
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-40 ${
                  fit === "fit"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-[#A1A1AA] hover:text-white border border-transparent"
                }`}
              >
                <ZoomIn className="w-3 h-3" /> Fit
              </button>
              <button
                type="button"
                onClick={() => setFit("fill")}
                disabled={disabled}
                title="Center-crop to fill the square"
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-40 ${
                  fit === "fill"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-[#A1A1AA] hover:text-white border border-transparent"
                }`}
              >
                <Crop className="w-3 h-3" /> Fill
              </button>
            </div>
          )}
        </div>

        {/* Drop zone */}
        <div className="flex-1 min-w-0">
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload business logo"
            onClick={() => !disabled && !busy && inputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !disabled && !busy) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled && !busy) setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-all cursor-pointer select-none ${
              disabled
                ? "border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed"
                : dragActive
                  ? "border-emerald-400/60 bg-emerald-500/10 scale-[1.01]"
                  : "border-white/10 bg-white/[0.03] hover:border-emerald-400/40 hover:bg-emerald-500/[0.06]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_ATTR}
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
            />
            {busy ? (
              <>
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                <p className="text-sm font-medium text-white">
                  {status === "uploading" ? "Uploading your logo…" : "Activating…"}
                </p>
                <p className="text-xs text-[#A1A1AA]">This only takes a second</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CloudUpload className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-white">
                  Drag &amp; drop your business logo here, or{" "}
                  <span className="text-emerald-400 underline underline-offset-2">
                    click to browse
                  </span>
                </p>
                <p className="text-xs text-[#71717A]">JPEG, PNG, WEBP or SVG · up to 5MB</p>
              </>
            )}
          </div>

          {/* Status line */}
          {status === "error" && errorMsg && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errorMsg}
            </div>
          )}
          {!busy && status !== "error" && displayLogo && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              {pendingUrl ? "Ready — uploading…" : "Logo live on your review page"}
            </div>
          )}
        </div>
      </div>

      {/* Fallback: paste hosted image link */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <Label className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] mb-2">
          <Link2 className="w-3.5 h-3.5 text-emerald-400" />
          Prefer a hosted image? Paste an image link (URL)
        </Label>
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void saveUrlLink();
              }
            }}
            placeholder="https://example.com/logo.png"
            disabled={disabled || savingUrl}
            className="flex-1 h-9 bg-black/20 border-white/10 text-sm text-white placeholder:text-[#52525B] focus-visible:ring-emerald-500/40"
          />
          <Button
            size="sm"
            onClick={() => void saveUrlLink()}
            disabled={disabled || savingUrl || !urlInput.trim()}
            className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-40"
          >
            {savingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Link"}
          </Button>
          {displayLogo && !disabled && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void removeLogo()}
              disabled={savingUrl}
              title="Remove logo"
              className="h-9 px-3 border-red-500/25 text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
