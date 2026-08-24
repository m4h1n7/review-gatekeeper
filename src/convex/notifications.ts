import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Send negative feedback alert email to the business owner via Nodemailer.
 * The email goes to the client's registered email (business.alertEmail),
 * NOT to the main admin email.
 *
 * Uses the /api/send-neg-feedback HTTP endpoint which sends via
 * STAR CATCH Alerts <starcatchbd@gmail.com>.
 */
export const sendNegativeFeedbackEmail = action({
  args: {
    alertEmail: v.string(),
    businessName: v.string(),
    businessSlug: v.optional(v.string()),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    rating: v.number(),
    message: v.string(),
  },
  handler: async (_ctx, args) => {
    const siteUrl = process.env.CONVEX_SITE_URL;
    if (!siteUrl) {
      console.log("[email] CONVEX_SITE_URL not configured — skipping notification");
      return { sent: false, reason: "no_site_url" };
    }

    try {
      const res = await fetch(`${siteUrl}/api/send-neg-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: args.alertEmail,
          businessName: args.businessName,
          businessSlug: args.businessSlug || "",
          customerName: args.customerName,
          customerPhone: args.customerPhone,
          customerEmail: args.customerEmail,
          rating: args.rating,
          message: args.message,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error("[email] Send neg-feedback error:", body);
        return { sent: false, reason: "endpoint_error", detail: body };
      }

      return { sent: true };
    } catch (err) {
      console.error("[email] Failed to send negative feedback email:", err);
      return { sent: false, reason: "network_error" };
    }
  },
});
