/**
 * SINGLE SOURCE OF TRUTH for legal document metadata.
 *
 * Every legal page, footer and legal notice imports from here. Change
 * `lastUpdated` or `version` once and the whole site updates — there are no
 * hardcoded "Last updated" strings left in the pages.
 *
 * Bump `version` on every page, and bump `LEGAL_CONFIG_VERSION` when the shape
 * of this config changes so cached consumers can detect staleness.
 */

export const LEGAL_CONFIG_VERSION = 2;

export type LegalDocId =
  | "privacy"
  | "terms"
  | "cookie-policy"
  | "refund-policy"
  | "open-source-licenses";

export interface LegalDoc {
  id: LegalDocId;
  path: string;
  title: string;
  shortTitle: string;
  /** Bump on every substantive edit to that document. */
  version: string;
  /** ISO date (YYYY-MM-DD). Rendered verbatim in the UI. */
  lastUpdated: string;
  effective: string;
}

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = {
  privacy: {
    id: "privacy",
    path: "/privacy",
    title: "Privacy Policy",
    shortTitle: "Privacy",
    version: "2.1.0",
    lastUpdated: "2026-10-04",
    effective: "2026-10-04",
  },
  terms: {
    id: "terms",
    path: "/terms",
    title: "Terms of Service",
    shortTitle: "Terms",
    version: "2.0.0",
    lastUpdated: "2026-10-04",
    effective: "2026-10-04",
  },
  "cookie-policy": {
    id: "cookie-policy",
    path: "/cookie-policy",
    title: "Cookie Policy",
    shortTitle: "Cookies",
    version: "1.1.0",
    lastUpdated: "2026-10-04",
    effective: "2026-10-04",
  },
  "refund-policy": {
    id: "refund-policy",
    path: "/refund-policy",
    title: "Refund & Cancellation Policy",
    shortTitle: "Refunds",
    version: "2.0.0",
    lastUpdated: "2026-10-04",
    effective: "2026-10-04",
  },
  "open-source-licenses": {
    id: "open-source-licenses",
    path: "/open-source-licenses",
    title: "Open-Source Licenses & Asset Credits",
    shortTitle: "Licenses",
    version: "1.0.0",
    lastUpdated: "2026-10-04",
    effective: "2026-10-04",
  },
};

/** The newest lastUpdated across all documents — used for "site legal as of". */
export const LATEST_LEGAL_UPDATE = Object.values(LEGAL_DOCS)
  .map((d) => d.lastUpdated)
  .sort()
  .slice(-1)[0];

/** "2026-10-04" -> "October 4, 2026". Falls back to the raw value if unparsable. */
export function formatLegalDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** One-line stamp used under every legal page heading. */
export function legalStamp(id: LegalDocId): string {
  const doc = LEGAL_DOCS[id];
  return `Last updated: ${formatLegalDate(doc.lastUpdated)} · Version ${doc.version}`;
}

/** Footer-style stamp: company, year, rights reserved. */
export function copyrightLine(): string {
  return `© ${new Date().getFullYear()} STAR CATCH. All rights reserved.`;
}
