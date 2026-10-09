// Centralized, env-driven contact configuration.
// All sensitive contact points (phones, emails, WhatsApp) MUST be configured
// via environment variables. Hardcoded personal contact info is not permitted.

/**
 * Primary support phone (Bangladesh format, digits only expected).
 * Used for WhatsApp links, phone display, etc.
 * Env: SUPPORT_PHONE  (e.g. "8801673903919")
 */
export const SUPPORT_PHONE =
  (process.env.SUPPORT_PHONE || "").replace(/\D/g, "");

/**
 * Support email address shown to users for contact.
 * Env: SUPPORT_EMAIL  (e.g. "support@starcatch.reviews")
 */
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "";

/**
 * Business/company email for general correspondence displayed in the UI.
 * Env: COMPANY_EMAIL
 * Default: starcatchbd@gmail.com — kept only as a runtime fallback so the
 * privacy/data-request UI does not break before env vars are configured.
 */
export const COMPANY_EMAIL =
  process.env.COMPANY_EMAIL || "starcatchbd@gmail.com";

/**
 * Founder 1 contact (phone + email) — displayed only in parts of the UI that
 * intentionally surface founder contact details.
 * Env: FOUNDER_1_PHONE, FOUNDER_1_EMAIL
 */
export const FOUNDER_1_PHONE =
  (process.env.FOUNDER_1_PHONE || "").replace(/\D/g, "");
export const FOUNDER_1_EMAIL = process.env.FOUNDER_1_EMAIL || "";

/** Founder 2 contact. */
export const FOUNDER_2_PHONE =
  (process.env.FOUNDER_2_PHONE || "").replace(/\D/g, "");
export const FOUNDER_2_EMAIL = process.env.FOUNDER_2_EMAIL || "";

/**
 * Returns a WhatsApp message link for the support phone.
 * Returns null when SUPPORT_PHONE is not configured.
 */
export function supportWhatsAppLink(pretext = ""): string | null {
  if (!SUPPORT_PHONE) return null;
  const text = encodeURIComponent(
    pretext ? `${pretext}\n\n` : "" +
      "Hi Star Catch team, I need help with my account."
  );
  return `https://wa.me/${SUPPORT_PHONE}?text=${text}`;
}

/** @deprecated Use supportWhatsAppLink() instead */
export const SUPPORT_WHATSAPP_NUMBER = SUPPORT_PHONE;
