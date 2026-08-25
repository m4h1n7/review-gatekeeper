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

    // Also send a copy to the platform admin
    const PLATFORM_ADMIN_EMAIL = "mahinhosen870@gmail.com";
    if (args.to.toLowerCase() !== PLATFORM_ADMIN_EMAIL.toLowerCase()) {
      await transporter.sendMail({
        from: `"STAR CATCH Alerts" <${process.env.EMAIL_USER}>`,
        to: PLATFORM_ADMIN_EMAIL,
        subject: `\u26a0\ufe0f [Platform Copy] New Private Feedback for ${args.businessName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
          <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
              <tr><td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                  <tr><td style="background:#7C3AED;padding:28px 32px;text-align:center;">
                    <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700;">\u26a0\ufe0f Platform Copy — Private Feedback</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">A customer left negative feedback for a business on your platform</p>
                  </td></tr>
                  <tr><td style="padding:32px;">
                    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;"><strong>${args.businessName}</strong> received private negative feedback:</p>

                    <div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
                      <p style="margin:0 0 6px;color:#5B21B6;font-size:11px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Rating</p>
                      <p style="margin:0;font-size:22px;color:#7C3AED;letter-spacing:2px;">${stars}</p>
                    </div>

                    <div style="margin-bottom:16px;">
                      <p style="margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Customer</p>
                      <p style="margin:0 0 8px;color:#0f172a;font-size:15px;font-weight:600;">${args.customerName}</p>
                      ${contactInfo ? `<div style="background:#f8fafc;border-radius:8px;padding:12px;">${contactInfo}</div>` : ""}
                    </div>

                    <div style="margin-bottom:24px;">
                      <p style="margin:0 0 6px;color:#64748b;font-size:11px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Feedback Message</p>
                      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;">
                        <p style="margin:0;color:#334155;font-size:14px;line-height:1.6;">${args.message}</p>
                      </div>
                    </div>

                    <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;line-height:1.5;">Sent to business owner: ${args.to}</p>
                  </td></tr>
                  <tr><td style="background:#fafafa;border-top:1px solid #e4e4e7;padding:20px 32px;text-align:center;">
                    <p style="margin:0;color:#d4d4d8;font-size:10px;">STAR CATCH Platform Admin Copy</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
        text: `[Platform Copy] Private Feedback for ${args.businessName}\n\nRating: ${stars}\nCustomer: ${args.customerName}\n${args.customerPhone ? `Phone: ${args.customerPhone}\n` : ""}${args.customerEmail ? `Email: ${args.customerEmail}\n` : ""}\nFeedback: ${args.message}\n\nBusiness owner notified: ${args.to}`,
      }).catch(() => {}); // fire-and-forget — don't fail if admin copy fails
    }

    return { ok: true };
  },
});

export const sendPaymentApproved = action({
  args: {
    to: v.string(),
    plan: v.string(),
    clientName: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const transporter = await getTransporter();
    const planLabel = args.plan === "starter" ? "Starter Plan" : "Business Pro Plan";
    const dashboardUrl = `https://${process.env.CONVEX_SITE_URL?.replace(/^https?:\/\//, "") || "starcatch.reviews"}/dashboard`;

    await transporter.sendMail({
      from: `"STAR CATCH" <${process.env.EMAIL_USER}>`,
      to: args.to,
      subject: `\u2705 Your Payment Has Been Approved — Welcome to ${planLabel}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                <tr><td style="background:#16A34A;padding:28px 32px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700;">\u2705 Payment Approved!</h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">Welcome to STAR CATCH ${planLabel}</p>
                </td></tr>
                <tr><td style="padding:32px;">
                  <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">Hi ${args.clientName || "there"},</p>
                  <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">Great news! Your payment has been verified and approved. Your <strong>${planLabel}</strong> subscription is now active for <strong>30 days</strong>.</p>
                  <p style="margin:0 0 24px;color:#3f3f46;font-size:14px;line-height:1.6;">You now have full access to your dashboard, analytics, QR code generator, and all ${planLabel} features.</p>
                  <a href="${dashboardUrl}" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;text-align:center;width:100%;box-sizing:border-box;">Go to Dashboard</a>
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
      text: `Hi ${args.clientName || "there"},\n\nYour payment has been approved! Your ${planLabel} subscription is now active for 30 days.\n\nGo to Dashboard: ${dashboardUrl}\n\nSTAR CATCH Reviews & Feedback Agency Bd`,
    });
    return { ok: true };
  },
});

export const sendPaymentRejected = action({
  args: {
    to: v.string(),
    plan: v.optional(v.string()),
    reason: v.optional(v.string()),
    clientName: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const transporter = await getTransporter();
    const planLabel = args.plan === "starter" ? "Starter Plan" : args.plan === "pro" ? "Business Pro Plan" : "your plan";
    const reasonText = args.reason || "No reason provided.";
    const supportUrl = `https://wa.me/8801673903919?text=${encodeURIComponent("Hi Star Catch team, I need help with my payment.")}`;

    await transporter.sendMail({
      from: `"STAR CATCH" <${process.env.EMAIL_USER}>`,
      to: args.to,
      subject: `\u274c Payment Update — Action Required`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                <tr><td style="background:#DC2626;padding:28px 32px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700;">\u274c Payment Not Verified</h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">Your ${planLabel} submission needs attention</p>
                </td></tr>
                <tr><td style="padding:32px;">
                  <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">Hi ${args.clientName || "there"},</p>
                  <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">We were unable to verify your payment for <strong>${planLabel}</strong>. Please review the reason below and resubmit.</p>
                  <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
                    <p style="margin:0 0 4px;color:#991B1B;font-size:11px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Reason</p>
                    <p style="margin:0;color:#DC2626;font-size:14px;line-height:1.5;">${reasonText}</p>
                  </div>
                  <p style="margin:0 0 24px;color:#3f3f46;font-size:14px;line-height:1.6;">Please ensure your Transaction ID and sender phone number are correct, then try again.</p>
                  <a href="${supportUrl}" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;text-align:center;width:100%;box-sizing:border-box;">Contact Support on WhatsApp</a>
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
      text: `Hi ${args.clientName || "there"},\n\nYour payment for ${planLabel} was not verified.\nReason: ${reasonText}\n\nPlease resubmit with correct details or contact support.\nWhatsApp: https://wa.me/8801673903919\n\nSTAR CATCH Reviews & Feedback Agency Bd`,
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
      `,        text: `Your ${name} verification code is: ${args.otp}\n\nThis code expires in 15 minutes.\nIf you did not request this code, you can safely ignore this email.`,
    });

    return { ok: true };
  },
});

// ─── Integration test helpers (run via: bun convex run email:testSmtpConnection)

export const testSmtpConnection = action({
  args: {},
  handler: async () => {
    const transporter = await getTransporter();
    try {
      await transporter.verify();
      return { ok: true, message: "SMTP connection verified successfully" };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  },
});

export const sendTrialReminder = action({
  args: {
    to: v.string(),
    businessName: v.string(),
    daysRemaining: v.number(),
    totalScans: v.number(),
    totalRedirects: v.number(),
    totalFeedbacks: v.number(),
    reviewSlug: v.string(),
  },
  handler: async (_ctx, args) => {
    const transporter = await getTransporter();
    const isUrgent = args.daysRemaining <= 2;
    const headerColor = isUrgent ? "#DC2626" : "#F59E0B";
    const headerIcon = isUrgent ? "\u26a0\ufe0f" : "\u23f3";
    const headerTitle = isUrgent
      ? "Your Free Trial Expires Tomorrow!"
      : `Your Free Trial Has ${args.daysRemaining} Days Left`;
    const siteBase = process.env.CONVEX_SITE_URL?.replace(/^https?:\/\//, "") || "starcatch.reviews";
    const dashboardUrl = `https://${siteBase}/dashboard`;
    const pricingUrl = `https://${siteBase}/pricing`;

    await transporter.sendMail({
      from: `"STAR CATCH" <${process.env.EMAIL_USER}>`,
      to: args.to,
      subject: `${headerIcon} ${headerTitle} — Upgrade to Keep Your Reviews Flowing`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                <tr><td style="background:${headerColor};padding:28px 32px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700;">${headerIcon} ${headerTitle}</h1>
                  <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:12px;">${args.businessName} — Free Trial Summary</p>
                </td></tr>
                <tr><td style="padding:32px;">
                  <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">Here's how your review gateway performed during your free trial:</p>

                  <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
                    <p style="margin:0 0 8px;color:#166534;font-size:11px;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Trial Performance Summary</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#334155;font-size:13px;">Total Customer Taps</td>
                        <td style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:700;text-align:right;">${args.totalScans}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#334155;font-size:13px;">Google Reviews Redirected (4-5 \u2605)</td>
                        <td style="padding:6px 0;color:#16A34A;font-size:13px;font-weight:700;text-align:right;">${args.totalRedirects}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#334155;font-size:13px;">Private Feedback Captured (1-3 \u2605)</td>
                        <td style="padding:6px 0;color:#F59E0B;font-size:13px;font-weight:700;text-align:right;">${args.totalFeedbacks}</td>
                      </tr>
                    </table>
                  </div>

                  ${args.totalScans > 0 ? `
                  <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:14px;margin-bottom:20px;">
                    <p style="margin:0;color:#1E40AF;font-size:13px;line-height:1.5;">\ud83d\udca1 Your positive conversion rate: <strong>${Math.round((args.totalRedirects / args.totalScans) * 100)}%</strong> of all scans redirected to Google Reviews. Imagine how many more positive reviews you'll collect with an active subscription!</p>
                  </div>
                  ` : ""}

                  <p style="margin:0 0 20px;color:#3f3f46;font-size:14px;line-height:1.6;">To continue receiving reviews and protecting your Google rating, upgrade to a paid plan today:</p>

                  <a href="${pricingUrl}" style="display:inline-block;background:#16A34A;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;text-align:center;width:100%;box-sizing:border-box;">Upgrade Now \u2014 Choose Your Plan</a>

                  <p style="margin:16px 0 0;color:#94a3b8;font-size:11px;text-align:center;line-height:1.5;">Plans start from \u09f31,499/month. No setup fees for trial-to-paid upgrades.</p>
                </td></tr>
                <tr><td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
                  <p style="margin:0;color:#94a3b8;font-size:11px;">STAR CATCH Reviews and Feedback Agency Bd</p>
                  <p style="margin:4px 0 0;color:#cbd5e1;font-size:10px;">\u00a9 ${new Date().getFullYear()} All rights reserved</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      text: `${headerTitle}\n\nBusiness: ${args.businessName}\nTotal Taps: ${args.totalScans}\nGoogle Redirects: ${args.totalRedirects}\nPrivate Feedback: ${args.totalFeedbacks}\n\nUpgrade now: ${pricingUrl}`,
    });
    return { ok: true };
  },
});

export const sendTestEmail = action({
  args: {},
  handler: async () => {
    const transporter = await getTransporter();
    try {
      const info = await transporter.sendMail({
        from: `"STAR CATCH Integration Test" <${process.env.EMAIL_USER}>`,
        to: "starcatchbd@gmail.com",
        subject: "\u2705 STAR CATCH Integration Test — Nodemailer Working",
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8" /></head>
          <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Tahoma,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
              <tr><td align="center">
                <table width="400" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
                  <tr><td style="background:#16A34A;padding:24px 28px;text-align:center;">
                    <h1 style="margin:0;color:#fff;font-size:18px;font-weight:700;">\u2705 Integration Test Passed</h1>
                  </td></tr>
                  <tr><td style="padding:28px;">
                    <p style="margin:0 0 16px;color:#3f3f46;font-size:14px;line-height:1.6;">Nodemailer SMTP connection and email sending are working correctly.</p>
                    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:14px;">
                      <p style="margin:0;color:#166534;font-size:13px;">\u2714 SMTP host: smtp.gmail.com:465 (SSL)<br/>\u2714 Sender: ${process.env.EMAIL_USER}<br/>\u2714 Recipient: starcatchbd@gmail.com</p>
                    </div>
                    <p style="margin:16px 0 0;color:#94a3b8;font-size:11px;text-align:center;">Sent at ${new Date().toISOString()}</p>
                  </td></tr>
                </table>
              </td></tr>
            </table>
          </body>
          </html>
        `,
        text: `STAR CATCH Integration Test Passed\n\nNodemailer SMTP connection verified.\nHost: smtp.gmail.com:465\nSender: ${process.env.EMAIL_USER}\nSent at: ${new Date().toISOString()}`,
      });
      return { ok: true, messageId: info.messageId, accepted: info.accepted };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  },
});
