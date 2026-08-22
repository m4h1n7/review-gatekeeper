import { action } from "./_generated/server";
import { v } from "convex/values";

/** Send email notification when negative feedback is submitted.
 *  Uses Resend API (user must set RESEND_API_KEY in project env).
 */
export const sendNegativeFeedbackEmail = action({
  args: {
    alertEmail: v.string(),
    businessName: v.string(),
    customerName: v.string(),
    rating: v.number(),
    message: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("[email] RESEND_API_KEY not configured — skipping notification");
      return { sent: false, reason: "no_api_key" };
    }

    const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; font-size: 20px; margin: 0;">New Private Feedback</h1>
          <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">Review Gatekeeper Alert</p>
        </div>
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <p style="color: #64748b; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Business</p>
          <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 16px;">${args.businessName}</p>
          <p style="color: #64748b; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Rating</p>
          <p style="color: #f59e0b; font-size: 24px; margin: 0 0 16px;">${"★".repeat(args.rating)}${"☆".repeat(5 - args.rating)}</p>
          <p style="color: #64748b; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Customer</p>
          <p style="color: #0f172a; font-size: 14px; margin: 0 0 16px;">${args.customerName}</p>
          <p style="color: #64748b; font-size: 12px; text-transform: uppercase; margin: 0 0 4px;">Feedback</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0; background: white; border-radius: 6px; padding: 12px; border: 1px solid #e2e8f0;">${args.message}</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
          Sent by Review Gatekeeper — Protect your Google rating
        </p>
      </div>
    `;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Review Gatekeeper <alerts@reviewgatekeeper.com>",
          to: [args.alertEmail],
          subject: `⚠️ Private Feedback — ${args.businessName} (${args.rating}/5)`,
          html,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error("[email] Resend API error:", body);
        return { sent: false, reason: "api_error", detail: body };
      }

      return { sent: true };
    } catch (err) {
      console.error("[email] Failed to send:", err);
      return { sent: false, reason: "network_error" };
    }
  },
});
