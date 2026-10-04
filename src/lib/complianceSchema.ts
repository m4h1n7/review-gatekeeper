import { z } from "zod";

/**
 * Runtime-validated compliance state.
 *
 * Everything that is persisted or read from the DOM is parsed through these
 * schemas before it is trusted. A corrupt, truncated, or hand-edited
 * localStorage entry can therefore never crash the app — the worst case is
 * falling back to the safe default (essential only, nothing granted).
 *
 * Stored records carry a `version`. When the shape changes we migrate rather
 * than discard, so a user who already answered is not nagged again.
 */

export const CURRENT_CONSENT_VERSION = 2;

/** Consent categories, in the order they are presented. */
export const CONSENT_CATEGORIES = ["essential", "analytics", "marketing"] as const;
export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

/** A category is only optional if the platform can actually do without it. */
export const ConsentStateSchema = z.object({
  essential: z.literal(true),
  analytics: z.boolean(),
  marketing: z.boolean(),
});

export type ConsentState = z.infer<typeof ConsentStateSchema>;

export const DEFAULT_CONSENT: ConsentState = {
  essential: true,
  analytics: false,
  marketing: false,
};

/** Shape written to localStorage. */
export const StoredConsentSchema = z.object({
  version: z.number().int().positive(),
  decidedAt: z.string().min(1),
  consent: ConsentStateSchema,
});

export type StoredConsent = z.infer<typeof StoredConsentSchema>;

/**
 * Accepts anything at all and returns a valid stored record, or null if the
 * input is so malformed that we should treat the visitor as undecided.
 *
 * Migration notes:
 *  - v1 stored a flat `{ essential, analytics, marketing, version }` with no
 *    `consent` wrapper and a boolean `version` in some early builds.
 *  - v2 nests under `consent` and uses a numeric `version`.
 */
export function parseStoredConsent(raw: unknown): StoredConsent | null {
  if (raw === null || raw === undefined) return null;

  // Already v2+ and valid?
  const direct = StoredConsentSchema.safeParse(raw);
  if (direct.success) return direct.data;

  if (typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  // v1: flat shape, possibly a non-numeric version marker.
  const migratedVersion =
    typeof obj.version === "number" && Number.isInteger(obj.version)
      ? obj.version
      : 1;

  const flat = ConsentStateSchema.safeParse({
    essential: true,
    analytics: obj.analytics,
    marketing: obj.marketing,
  });
  if (!flat.success) return null;

  return {
    version: CURRENT_CONSENT_VERSION,
    // A v1 record had no timestamp; treat the migration moment as the decision.
    decidedAt: typeof obj.decidedAt === "string" ? obj.decidedAt : new Date().toISOString(),
    consent: flat.data,
  };
}

/** Safe localStorage read + parse. Never throws. */
export function readStoredConsent(storageKey: string): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    return parseStoredConsent(JSON.parse(raw));
  } catch {
    // Unavailable storage, blocked cookies, or invalid JSON — all non-fatal.
    return null;
  }
}

/** Safe localStorage write. Never throws. */
export function writeStoredConsent(storageKey: string, state: ConsentState): void {
  const record: StoredConsent = {
    version: CURRENT_CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    consent: state,
  };
  // Validate before persisting, so we never write a malformed record.
  const parsed = StoredConsentSchema.safeParse(record);
  if (!parsed.success) return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(parsed.data));
  } catch {
    /* quota exceeded or storage disabled — preference simply won't persist */
  }
}

/** Accessibility preferences. Same defensive guarantees as consent. */
export const AccessibilityPrefsSchema = z.object({
  version: z.number().int().positive(),
  highContrast: z.boolean(),
  reduceMotion: z.boolean().optional(),
});

export type AccessibilityPrefs = z.infer<typeof AccessibilityPrefsSchema>;

export function parseAccessibilityPrefs(raw: unknown): AccessibilityPrefs | null {
  const parsed = AccessibilityPrefsSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.highContrast !== "boolean") return null;
  return {
    version: typeof obj.version === "number" ? obj.version : 1,
    highContrast: obj.highContrast,
    reduceMotion: typeof obj.reduceMotion === "boolean" ? obj.reduceMotion : undefined,
  };
}
