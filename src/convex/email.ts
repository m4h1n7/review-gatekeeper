"use node";

/**
 * Convex "use node" action for sending OTP emails via Nodemailer (Gmail SMTP).
 * Runs in a Node.js runtime with access to npm packages and built-in modules.
 *
 * Environment variables required (set via Keys/API keys UI):
 *   EMAIL_USER: starcatchbd@gmail.com
 *   EMAIL_PASS: llkr wpgk cnym spej
 */

import { action } from "./_generated/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { v } from "convex/values";

let cachedTransporter: any = null;

async function getTransporter() {
  if (!cachedTransporter) {
    const nodemailer = (await import("nodemailer")).default;
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return cachedTransporter;
}

export const sendNegativeFeedback = action({
  args: {
    to: v.string(),
    businessName: v.string(),
    businessSlug: v.string(),
    customerName: v.string(),
    customerPhone: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    rating: v.number(),
    message: v.string(),
  },
  handler: async (_ctx, args) => {
    const transporter = await getTransporter();
    const stars = "★".repeat(args.rating) + "☆".repeat(5 - args.rating);
    const dashboardUrl = `https://${process.env.CONVEX_SITE_URL?.replace(/^https?:\/\//, "") || "starcatch.reviews"}/dashboard`;

    const contactInfo = [
      args.customerPhone ? `<p style="margin:0;color:#334155;font-size:13px;">📞 ${args.customerPhone}</p>` : "",
      args.customerEmail ? `<p style="margin:4px 0 0;color:#334155;font-size:13px;">✉️ ${args.customerEmail}</p>` : "",
    ].filter(Boolean).join("");

    await transporter.sendMail({
      from: `"STAR CATCH Alerts" <${process.env.EMAIL_USER}>`,
      to: args.to,
      subject: `\u26a0\ufe0f New Private Feedback Received - Action Required`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                <tr><td style="background:#DC2626;padding:28px 32px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700;">\u26a0\ufe0f New Private Feedback</h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">Action Required — Respond Promptly</p>
                </td></tr>
                <tr><td style="padding:32px;">
                  <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">A customer left <strong>private negative feedback</strong> for <strong>${args.businessName}</strong>. Please review and respond.</p>

                  <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
                    <p style="margin:0 0 6px;color:#991B1B;font-size:11px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Rating</p>
                    <p style="margin:0;font-size:22px;color:#DC2626;letter-spacing:2px;">${stars}</p>
                  </div>

                  <div style="margin-bottom:20px;">
                    <p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Customer</p>
                    <p style="margin:0 0 12px;color:#0f172a;font-size:15px;font-weight:600;">${args.customerName}</p>
                    ${contactInfo ? `<div style="background:#f8fafc;border-radius:8px;padding:12px;margin-bottom:12px;">${contactInfo}</div>` : ""}
                  </div>

                  <div style="margin-bottom:24px;">
                    <p style="margin:0 0 6px;color:#64748b;font-size:11px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Feedback Message</p>
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;">
                      <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">${args.message}</p>
                    </div>
                  </div>

                  <a href="${dashboardUrl}" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;text-align:center;width:100%;box-sizing:border-box;">View in Dashboard</a>

                  <p style="margin:20px 0 0;color:#94a3b8;font-size:11px;text-align:center;line-height:1.5;">This feedback was captured privately through your STAR CATCH review gatekeeper page. It has NOT been published publicly.</p>
                </td></tr>
                <tr><td style="background:#fafafa;border-top:1px solid #e4e4e7;padding:20px 32px;text-align:center;">
                  <p style="margin:0;color:#d4d4d8;font-size:10px;">STAR CATCH Reviews &amp; Feedback Agency Bd</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      text: `New Private Feedback for ${args.businessName}\n\nRating: ${stars}\nCustomer: ${args.customerName}\n${args.customerPhone ? `Phone: ${args.customerPhone}\n` : ""}${args.customerEmail ? `Email: ${args.customerEmail}\n` : ""}\nFeedback: ${args.message}\n\nView in Dashboard: ${dashboardUrl}`,
    });

    return { ok: true };
  },
});

export const sendOtp = action({
  args: {
    to: v.string(),
    otp: v.string(),
    appName: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const transporter = await getTransporter();
    const name = args.appName || "STAR CATCH Reviews";

    await transporter.sendMail({
      from: `"STAR CATCH Verification" <${process.env.EMAIL_USER}>`,
      to: args.to,
      subject: `Your ${name} Verification Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                <tr><td style="background:#16A34A;padding:28px 32px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">⭐ STAR CATCH</h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">Reviews &amp; Feedback Agency</p>
                </td></tr>
                <tr><td style="padding:36px 32px 24px;">
                  <p style="margin:0 0 20px;color:#3f3f46;font-size:15px;line-height:1.6;">Use the code below to verify your email address:</p>
                  <div style="background:#f0fdf4;border:2px solid #16A34A;border-radius:10px;padding:20px 0;text-align:center;margin:0 0 24px;">
                    <span style="font-size:36px;font-weight:800;color:#16A34A;letter-spacing:10px;font-family:'Courier New',monospace;">${args.otp}</span>
                  </div>
                  <p style="margin:0 0 8px;color:#71717a;font-size:13px;line-height:1.5;">This code expires in <strong>15 minutes</strong>.</p>
                  <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.5;">If you did not request this code, you can safely ignore this email.</p>
                </td></tr>
                <tr><td style="background:#fafafa;border-top:1px solid #e4e4e7;padding:20px 32px;text-align:center;">
                  <p style="margin:0;color:#d4d4d8;font-size:10px;">⭐ STAR CATCH Reviews &amp; Feedback Agency</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      text: `Your ${name} verification code is: ${args.otp}\n\nThis code expires in 15 minutes.\nIf you did not request this code, you can safely ignore this email.`,
    });

    return { ok: true };
  },
});
