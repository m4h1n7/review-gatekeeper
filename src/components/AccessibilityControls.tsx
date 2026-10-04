import { useCompliance } from "./ComplianceProvider";
import { Contrast, Eye } from "lucide-react";

/**
 * Accessibility controls.
 *
 * Bound to the central ComplianceProvider — there is no local state here, so
 * toggling in one place updates every consumer instantly via the `hc-mode`
 * class on <html>.
 *
 * Deliberately a real <button> with aria-pressed, so it is reachable by
 * keyboard and announced correctly by screen readers.
 */
export function HighContrastToggle({ className = "" }: { className?: string }) {
  const { highContrast, toggleHighContrast, isHydrated } = useCompliance();

  return (
    <button
      type="button"
      onClick={toggleHighContrast}
      aria-pressed={highContrast}
      aria-label="High contrast mode"
      className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg border transition-colors cursor-pointer text-xs font-medium ${
        highContrast
          ? "bg-white text-black border-white"
          : "border-white/10 bg-white/[0.05] text-[#A1A1AA] hover:bg-white/[0.1] hover:text-white"
      } ${className}`}
    >
      <Contrast className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      High contrast
      <span
        className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded ${
          highContrast ? "bg-black/15 text-black" : "bg-white/10 text-white/60"
        }`}
      >
        {isHydrated ? (highContrast ? "On" : "Off") : "—"}
      </span>
    </button>
  );
}

/** Row variant, used inside settings panels where space allows. */
export function AccessibilitySettingsRow() {
  const { highContrast, toggleHighContrast, reduceMotion, isHydrated } = useCompliance();

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3">
        <Contrast className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#16A34A" }} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white">High contrast</p>
          <p className="text-[11px] text-[#A1A1AA] leading-relaxed mt-0.5">
            Increases text and border contrast across every page, banner and modal.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={highContrast}
          aria-label="High contrast mode"
          onClick={toggleHighContrast}
          disabled={!isHydrated}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer disabled:opacity-60 ${
            highContrast ? "bg-[#16A34A]" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              highContrast ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3">
        <Eye className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#16A34A" }} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white">Reduced motion</p>
          <p className="text-[11px] text-[#A1A1AA] leading-relaxed mt-0.5">
            {reduceMotion
              ? "Animations are reduced, following your system preference."
              : "Follows your operating system setting. No override is applied."}
          </p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] text-white/50 shrink-0 mt-0.5">
          {reduceMotion ? "Reduced" : "System"}
        </span>
      </div>
    </div>
  );
}

export default HighContrastToggle;
