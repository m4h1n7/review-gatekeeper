import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Cookie, X, ShieldCheck, ChartLine, Megaphone, Settings } from "lucide-react";

/**
 * Cookie consent management.
 *
 * Consent categories:
 *  - essential   always on, cannot be switched off (session token, scan dedup, UI prefs)
 *  - analytics   optional, off unless the user opts in
 *  - marketing   optional, off unless the user opts in
 *
 * IMPORTANT: the Platform currently ships no third-party analytics or marketing
 * scripts, so analytics/marketing consent is recorded but gates nothing today.
 * The gate exists so that introducing such a script later cannot do so
 * silently — it must be wired to `hasConsent("analytics" | "marketing")`.
 */

const STORAGE_KEY = "starcatch_cookie_consent";

export type ConsentCategory = "essential" | "analytics" | "marketing";

export interface ConsentState {
  essential: true;
  analytics: boolean;
  marketing: boolean;
}

export const DEFAULT_CONSENT: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
};

interface StoredConsent extends ConsentState {
  /** ISO timestamp of when the visitor made this choice. */
  decidedAt: string;
  /** Bumped when the category list changes, so old records are re-prompted. */
  version: number;
}

const CONSENT_VERSION = 1;

interface ConsentContextValue {
  consent: ConsentState;
  /** True once the visitor has made an explicit choice (loaded or made). */
  hasDecided: boolean;
  /** True while stored consent is still being read on first paint. */
  isLoading: boolean;
  /** Whether the banner should currently be on screen. */
  isBannerOpen: boolean;
  hasConsent: (category: ConsentCategory) => boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  saveCustom: (prefs: Partial<Omit<ConsentState, "essential">>) => void;
  openBanner: () => void;
  closeBanner: () => void;
  /**
   * Whether the banner can be dismissed without recording a choice.
   * False on first visit — consent must be explicit. True only when the
   * visitor re-opens the panel after having already answered.
   */
  canDismissWithoutChoosing: boolean;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readStored(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (
      typeof parsed?.decidedAt !== "string" ||
      typeof parsed?.analytics !== "boolean" ||
      typeof parsed?.marketing !== "boolean"
    ) {
      return null;
    }
    // A stale record from an older category list must be re-prompted.
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(state: ConsentState) {
  try {
    const payload: StoredConsent = {
      ...state,
      decidedAt: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage may be unavailable (private mode / disabled). Consent then simply
    // does not persist, and the banner is shown again on the next visit.
  }
}

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const [hasDecided, setHasDecided] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  // Distinguishes "not yet prompted this session" from "user asked to reopen".
  const [isReopened, setIsReopened] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored) {
      // Returning visitor with a valid prior choice: do not prompt again.
      setConsent({ essential: true, analytics: stored.analytics, marketing: stored.marketing });
      setHasDecided(true);
      setIsBannerOpen(false);
    } else {
      // First visit (or the stored record was unusable): must ask.
      setIsBannerOpen(true);
    }
    setIsLoading(false);
  }, []);

  const persist = useCallback((next: ConsentState) => {
    setConsent(next);
    setHasDecided(true);
    setIsBannerOpen(false);
    setIsReopened(false);
    writeStored(next);
  }, []);

  const acceptAll = useCallback(() => {
    persist({ essential: true, analytics: true, marketing: true });
  }, [persist]);

  const rejectNonEssential = useCallback(() => {
    persist({ essential: true, analytics: false, marketing: false });
  }, [persist]);

  const saveCustom = useCallback(
    (prefs: Partial<Omit<ConsentState, "essential">>) => {
      persist({
        essential: true,
        analytics: prefs.analytics ?? false,
        marketing: prefs.marketing ?? false,
      });
    },
    [persist],
  );

  const openBanner = useCallback(() => {
    setIsReopened(true);
    setIsBannerOpen(true);
  }, []);

  const closeBanner = useCallback(() => {
    // Dismissing without choosing is only allowed for a re-opened panel where
    // the visitor already answered previously. On first visit the banner is
    // modal and cannot be dismissed without an explicit choice.
    setIsBannerOpen(false);
  }, []);

  const hasConsent = useCallback(
    (category: ConsentCategory) => {
      if (category === "essential") return true;
      return consent[category] === true;
    },
    [consent],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hasDecided,
      isLoading,
      isBannerOpen: isBannerOpen && !(hasDecided && !isReopened),
      canDismissWithoutChoosing: hasDecided,
      hasConsent,
      acceptAll,
      rejectNonEssential,
      saveCustom,
      openBanner,
      closeBanner,
    }),
    [
      consent,
      hasDecided,
      isLoading,
      isBannerOpen,
      isReopened,
      hasConsent,
      acceptAll,
      rejectNonEssential,
      saveCustom,
      openBanner,
      closeBanner,
    ],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
}

const ACCENT = "#16A34A";

function Toggle({ checked, onChange, disabled, label }: { checked: boolean; onChange: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
        checked ? "bg-[#16A34A]" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function CookieConsentBanner() {
  const {
    consent,
    isLoading,
    isBannerOpen,
    canDismissWithoutChoosing,
    acceptAll,
    rejectNonEssential,
    saveCustom,
    closeBanner,
  } = useConsent();

  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);

  // Seed the toggles from current consent each time the panel is opened.
  useEffect(() => {
    if (isBannerOpen) {
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
    }
  }, [isBannerOpen, consent.analytics, consent.marketing]);

  if (isLoading || !isBannerOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#18181B]/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-start gap-3 p-5 sm:p-6 pb-3">
          <div className="w-9 h-9 rounded-xl bg-[#16A34A]/15 flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4" style={{ color: ACCENT }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="cookie-consent-title" className="text-base font-semibold text-white">
              We value your privacy
            </h2>
            <p className="text-xs text-[#A1A1AA] leading-relaxed mt-1">
              We use cookies to keep STAR CATCH working and, with your permission, to understand how it is used.
              You can accept all, reject non-essential cookies, or choose which categories to allow.
            </p>
          </div>
        </div>

        {showPreferences ? (
          <div className="px-5 sm:px-6 pb-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">Strictly Necessary</p>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed mt-0.5">
                  Keeps you signed in, prevents fraud, and remembers your preferences. Always active.
                </p>
              </div>
              <span className="text-[10px] font-medium text-[#16A34A] shrink-0 mt-0.5">Always On</span>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3">
              <ChartLine className="w-4 h-4 mt-0.5 shrink-0 text-white/40" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">Analytics</p>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed mt-0.5">
                  Helps us understand usage so we can improve the Platform. Currently we run no third-party analytics.
                </p>
              </div>
              <Toggle checked={analytics} onChange={() => setAnalytics((v) => !v)} label="Analytics cookies" />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3">
              <Megaphone className="w-4 h-4 mt-0.5 shrink-0 text-white/40" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">Marketing</p>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed mt-0.5">
                  Used for personalised advertising. We run no advertising cookies or tracking pixels today.
                </p>
              </div>
              <Toggle checked={marketing} onChange={() => setMarketing((v) => !v)} label="Marketing cookies" />
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => saveCustom({ analytics, marketing })}
                className="w-full h-11 rounded-xl bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-sm font-semibold transition-all cursor-pointer"
              >
                Save My Preferences
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={rejectNonEssential}
                  className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-[#A1A1AA] text-xs font-medium transition-colors cursor-pointer"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-[#A1A1AA] text-xs font-medium transition-colors cursor-pointer"
                >
                  Accept All
                </button>
              </div>
              {canDismissWithoutChoosing && (
                <button
                  type="button"
                  onClick={closeBanner}
                  className="w-full text-[11px] text-white/35 hover:text-white/60 transition-colors cursor-pointer pt-1"
                >
                  Close without changes
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-3">
            <button
              type="button"
              onClick={acceptAll}
              className="w-full h-11 rounded-xl bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-sm font-semibold transition-all cursor-pointer"
            >
              Accept All
            </button>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={rejectNonEssential}
                className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-[#A1A1AA] text-xs font-medium transition-colors cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-[#A1A1AA] text-xs font-medium transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                Customize Preferences
              </button>
            </div>
            <p className="text-[10px] text-white/30 text-center leading-relaxed pt-1">
              You can change your choice at any time from the{" "}
              <a href="/cookie-policy" className="underline hover:text-white/50">Cookie Policy</a> page.
            </p>
          </div>
        )}

        {/* Close affordance, only once a choice already exists. On first visit
            consent must be explicit, so there is no way to bypass the banner. */}
        {canDismissWithoutChoosing && !showPreferences && (
          <button
            type="button"
            onClick={closeBanner}
            aria-label="Close cookie settings"
            className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
