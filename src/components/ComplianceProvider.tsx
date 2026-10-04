import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import {
  ConsentState, DEFAULT_CONSENT, readStoredConsent, writeStoredConsent,
  parseAccessibilityPrefs, AccessibilityPrefs,
} from "@/lib/complianceSchema";
import { blockedServices, ExternalService } from "@/lib/serviceRegistry";
import { LEGAL_DOCS, LEGAL_CONFIG_VERSION, LegalDocId } from "@/lib/legalConfig";

/**
 * CENTRAL COMPLIANCE STATE.
 *
 * One store holds consent flags, accessibility preferences and legal document
 * metadata. Every compliance module reads from this — none keeps its own copy,
 * which is what makes "change it once, it syncs everywhere" true rather than
 * aspirational.
 *
 * Design notes:
 *  - Every hook is called unconditionally at the top level, before any early
 *    return, so no consumer can trigger React's invalid-hook-call error.
 *  - All storage access is wrapped and schema-validated; corrupt data degrades
 *    to defaults instead of throwing.
 *  - `hasDecided` is false until hydration finishes, so the banner never
 *    flashes for someone who already answered.
 */

const CONSENT_KEY = "starcatch_cookie_consent";
const A11Y_KEY = "starcatch_a11y_prefs";
const DOC_SEEN_KEY = "starcatch_accepted_policies";

interface ComplianceContextValue {
  // ── Consent ──
  consent: ConsentState;
  hasDecided: boolean;
  /** True until localStorage has been read; render nothing that depends on consent yet. */
  isHydrated: boolean;
  isConsentBannerOpen: boolean;
  hasConsent: (category: "essential" | "analytics" | "marketing") => boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  saveCustom: (prefs: Partial<Omit<ConsentState, "essential">>) => void;
  openConsentBanner: () => void;
  closeConsentBanner: () => void;
  canDismissWithoutChoosing: boolean;

  // ── Accessibility ──
  highContrast: boolean;
  toggleHighContrast: () => void;
  reduceMotion: boolean;

  // ── Legal documents ──
  legal: typeof LEGAL_DOCS;
  legalConfigVersion: number;
  /** Documents the visitor has explicitly acknowledged this session. */
  acceptedPolicies: LegalDocId[];
  markPolicyAccepted: (id: LegalDocId) => void;
  hasAcceptedPolicy: (id: LegalDocId) => boolean;
  /** Any document whose version is newer than what the visitor last accepted. */
  policiesNeedingReack: LegalDocId[];

  // ── Service status (live, derived from consent) ──
  blockedServices: ExternalService[];
}

const ComplianceContext = createContext<ComplianceContextValue | null>(null);

function ComplianceProviderInner({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const [hasDecided, setHasDecided] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isConsentBannerOpen, setIsConsentBannerOpen] = useState(false);
  const [isReopened, setIsReopened] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState<LegalDocId[]>([]);

  // Tracks the last acknowledged version per document so we can detect a
  // substantive change without re-prompting on every visit.
  const acceptedVersionsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const stored = readStoredConsent(CONSENT_KEY);
    if (stored) {
      setConsent(stored.consent);
      setHasDecided(true);
      setIsConsentBannerOpen(false);
    } else {
      // First visit, or the stored record was unusable — must ask.
      setIsConsentBannerOpen(true);
    }

    try {
      const a11y = parseAccessibilityPrefs(
        typeof window !== "undefined" ? window.localStorage.getItem(A11Y_KEY) : null,
      );
      if (a11y) {
        setHighContrast(a11y.highContrast);
        if (typeof a11y.reduceMotion === "boolean") setReduceMotion(a11y.reduceMotion);
      }
    } catch {
      /* non-fatal: fall back to defaults */
    }

    if (typeof window !== "undefined" && window.matchMedia) {
      try {
        setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      } catch {
        /* older browsers without the API */
      }
    }

    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(DOC_SEEN_KEY) : null;
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setAcceptedPolicies(parsed.filter((v): v is LegalDocId => typeof v === "string" && v in LEGAL_DOCS));
        }
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const versions = (parsed as Record<string, unknown>).versions;
          if (versions && typeof versions === "object") {
            for (const [k, v] of Object.entries(versions as Record<string, unknown>)) {
              if (typeof v === "string") acceptedVersionsRef.current[k] = v;
            }
          }
        }
      }
    } catch {
      /* non-fatal */
    }

    setIsHydrated(true);
  }, []);

  // ── Persistence (all writes validated, all reads guarded) ──
  const persistConsent = useCallback((next: ConsentState) => {
    setConsent(next);
    setHasDecided(true);
    setIsConsentBannerOpen(false);
    setIsReopened(false);
    if (typeof window !== "undefined") writeStoredConsent(CONSENT_KEY, next);
  }, []);

  const acceptAll = useCallback(
    () => persistConsent({ essential: true, analytics: true, marketing: true }),
    [persistConsent],
  );

  const rejectNonEssential = useCallback(
    () => persistConsent({ essential: true, analytics: false, marketing: false }),
    [persistConsent],
  );

  const saveCustom = useCallback(
    (prefs: Partial<Omit<ConsentState, "essential">>) =>
      persistConsent({
        essential: true,
        analytics: prefs.analytics ?? false,
        marketing: prefs.marketing ?? false,
      }),
    [persistConsent],
  );

  const openConsentBanner = useCallback(() => {
    setIsReopened(true);
    setIsConsentBannerOpen(true);
  }, []);

  const closeConsentBanner = useCallback(() => setIsConsentBannerOpen(false), []);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            A11Y_KEY,
            JSON.stringify({ version: 1, highContrast: next, reduceMotion }),
          );
        } catch {
          /* non-fatal */
        }
      }
      return next;
    });
  }, [reduceMotion]);

  const markPolicyAccepted = useCallback((id: LegalDocId) => {
    if (!(id in LEGAL_DOCS)) return;
    setAcceptedPolicies((prev) => (prev.includes(id) ? prev : [...prev, id]));
    acceptedVersionsRef.current[id] = LEGAL_DOCS[id].version;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          DOC_SEEN_KEY,
          JSON.stringify({ accepted: acceptedPolicies, versions: acceptedVersionsRef.current }),
        );
      } catch {
        /* non-fatal */
      }
    }
  }, [acceptedPolicies]);

  const hasAcceptedPolicy = useCallback(
    (id: LegalDocId) => acceptedPolicies.includes(id),
    [acceptedPolicies],
  );

  // Apply accessibility preferences to the document so CSS can react.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("hc-mode", highContrast);
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [highContrast, reduceMotion]);

  const hasConsent = useCallback(
    (category: "essential" | "analytics" | "marketing") =>
      category === "essential" ? true : consent[category] === true,
    [consent],
  );

  const policiesNeedingReack = useMemo(() => {
    if (!isHydrated) return [];
    return (Object.keys(LEGAL_DOCS) as LegalDocId[]).filter((id) => {
      const seen = acceptedVersionsRef.current[id];
      return Boolean(seen) && seen !== LEGAL_DOCS[id].version;
    });
  }, [isHydrated, acceptedPolicies]);

  const value = useMemo<ComplianceContextValue>(
    () => ({
      consent,
      hasDecided,
      isHydrated,
      isConsentBannerOpen: isConsentBannerOpen && !(hasDecided && !isReopened),
      canDismissWithoutChoosing: hasDecided,
      hasConsent,
      acceptAll,
      rejectNonEssential,
      saveCustom,
      openConsentBanner,
      closeConsentBanner,
      highContrast,
      toggleHighContrast,
      reduceMotion,
      legal: LEGAL_DOCS,
      legalConfigVersion: LEGAL_CONFIG_VERSION,
      acceptedPolicies,
      markPolicyAccepted,
      hasAcceptedPolicy,
      policiesNeedingReack,
      blockedServices: blockedServices(consent),
    }),
    [
      consent, hasDecided, isHydrated, isConsentBannerOpen, isReopened, hasConsent,
      acceptAll, rejectNonEssential, saveCustom, openConsentBanner, closeConsentBanner,
      highContrast, toggleHighContrast, reduceMotion, acceptedPolicies, markPolicyAccepted,
      hasAcceptedPolicy, policiesNeedingReack,
    ],
  );

  return <ComplianceContext.Provider value={value}>{children}</ComplianceContext.Provider>;
}

/**
 * Safe consumer hook. If a component renders outside the provider (a test, a
 * storybook entry, a mis-wired route) it gets inert defaults rather than
 * throwing — a compliance component crashing the app is worse than one that
 * silently does nothing.
 */
export function useCompliance(): ComplianceContextValue {
  const ctx = useContext(ComplianceContext);
  const inert = useMemo<ComplianceContextValue>(
    () => ({
      consent: DEFAULT_CONSENT,
      hasDecided: false,
      isHydrated: true,
      isConsentBannerOpen: false,
      canDismissWithoutChoosing: false,
      hasConsent: (c) => c === "essential",
      acceptAll: () => {},
      rejectNonEssential: () => {},
      saveCustom: () => {},
      openConsentBanner: () => {},
      closeConsentBanner: () => {},
      highContrast: false,
      toggleHighContrast: () => {},
      reduceMotion: false,
      legal: LEGAL_DOCS,
      legalConfigVersion: LEGAL_CONFIG_VERSION,
      acceptedPolicies: [],
      markPolicyAccepted: () => {},
      hasAcceptedPolicy: () => false,
      policiesNeedingReack: [],
      blockedServices: [],
    }),
    [],
  );
  return ctx ?? inert;
}

export function ComplianceProvider({ children }: { children: React.ReactNode }) {
  return <ComplianceProviderInner>{children}</ComplianceProviderInner>;
}
