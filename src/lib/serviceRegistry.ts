import type { ConsentCategory, ConsentState } from "./complianceSchema";

/**
 * Registry of every external service the Platform can reach.
 *
 * IMPORTANT — verified against the codebase, not assumed:
 * there are currently ZERO third-party scripts, iframes or tracking pixels.
 * A full sweep of src/ and index.html found no <script src> from a remote
 * origin, no <iframe>, and no gtag/Maps JS API / Meta Pixel.
 *
 * The only auto-loading external asset is the Poppins webfont, served by
 * Google, which reveals the visitor's IP to Google on every page load.
 *
 * This registry exists so that when a real third party IS added, it cannot be
 * added silently: it must be declared here, mapped to a consent category, and
 * rendered through <ConsentGatedService> so consent is enforced by default.
 * Declaring it is what makes it appear in the Third-Party notice and in the
 * data-collection modal.
 */

export type ServiceStatus = "active" | "blocked-by-consent" | "unavailable";

export interface ExternalService {
  id: string;
  label: string;
  vendor: string;
  /** Consent category required to load. `essential` always runs. */
  requires: ConsentCategory;
  /** Whether the service loads without any user interaction. */
  loadsAutomatically: boolean;
  hosts: string[];
  /**
   * What the visitor sees when consent blocks this service. Returning a clean
   * placeholder is what prevents a blocked service from becoming a crash.
   */
  fallback: string;
}

export const EXTERNAL_SERVICES: Record<string, ExternalService> = {
  googleFonts: {
    id: "googleFonts",
    label: "Poppins webfont",
    vendor: "Google LLC",
    requires: "essential",
    loadsAutomatically: true,
    hosts: ["fonts.googleapis.com", "fonts.gstatic.com"],
    fallback:
      "Using system fonts. This does not affect any feature — only the typeface changes.",
  },
  googleReviews: {
    id: "googleReviews",
    label: "Google Reviews redirect",
    vendor: "Google LLC",
    requires: "essential",
    loadsAutomatically: false,
    hosts: ["g.page", "maps.app.goo.gl"],
    fallback:
      "Public review links are unavailable right now. Your business can still receive private feedback.",
  },
  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp support",
    vendor: "Meta Platforms, Inc.",
    requires: "essential",
    loadsAutomatically: false,
    hosts: ["wa.me"],
    fallback: "WhatsApp support is unavailable. Email us at starcatchbd@gmail.com instead.",
  },
  analytics: {
    id: "analytics",
    label: "Analytics",
    vendor: "STAR CATCH (first-party)",
    requires: "analytics",
    loadsAutomatically: false,
    hosts: [],
    fallback: "Usage analytics are switched off. The Platform works exactly the same.",
  },
  marketing: {
    id: "marketing",
    label: "Marketing & advertising",
    vendor: "STAR CATCH (first-party)",
    requires: "marketing",
    loadsAutomatically: false,
    hosts: [],
    fallback: "Marketing features are switched off. No advertising is shown or tracked.",
  },
};

export function resolveServiceStatus(
  service: ExternalService,
  consent: ConsentState,
): ServiceStatus {
  if (service.requires === "essential") return "active";
  return consent[service.requires] ? "active" : "blocked-by-consent";
}

export function servicesForCategory(category: ConsentCategory): ExternalService[] {
  return Object.values(EXTERNAL_SERVICES).filter((s) => s.requires === category);
}

/** Services blocked by the visitor's current choices — shown in the notices. */
export function blockedServices(consent: ConsentState): ExternalService[] {
  return Object.values(EXTERNAL_SERVICES).filter(
    (s) => resolveServiceStatus(s, consent) === "blocked-by-consent",
  );
}
