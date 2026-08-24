import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { api } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * POST /api/send-otp
 * Accepts { email, otp, appName } and delegates to the "use node" email action.
 * Auth providers (email-otp, password-reset) call this endpoint since they
 * cannot import Node.js modules directly.
 *
 * Environment variables required (set via Keys/API keys UI):
 *   EMAIL_USER: starcatchbd@gmail.com
 *   EMAIL_PASS: llkr wpgk cnym spej
 */
http.route({
  path: "/api/send-otp",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = (await request.json()) as {
        email?: string;
        otp?: string;
        appName?: string;
      };

      if (!body.email || !body.otp) {
        return new Response(
          JSON.stringify({ ok: false, error: "Missing email or otp" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Delegate to the "use node" action which has nodemailer available
      const result = await ctx.runAction(api.email.sendOtp, {
        to: body.email,
        otp: body.otp,
        appName: body.appName || "STAR CATCH Reviews",
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("OTP email error:", error);
      return new Response(
        JSON.stringify({
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }),
});

/**
 * POST /api/send-neg-feedback
 * Sends a negative feedback alert email to the business owner's email via Nodemailer.
 * Called from the frontend when a customer submits 1-3 star feedback.
 */
http.route({
  path: "/api/send-neg-feedback",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = (await request.json()) as {
        to?: string;
        businessName?: string;
        businessSlug?: string;
        customerName?: string;
        customerPhone?: string;
        customerEmail?: string;
        rating?: number;
        message?: string;
      };

      if (!body.to || !body.businessName || !body.customerName || body.rating === undefined) {
        return new Response(
          JSON.stringify({ ok: false, error: "Missing required fields" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const result = await ctx.runAction(api.email.sendNegativeFeedback, {
        to: body.to,
        businessName: body.businessName,
        businessSlug: body.businessSlug || "",
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail,
        rating: body.rating,
        message: body.message || "No feedback provided.",
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Negative feedback email error:", error);
      return new Response(
        JSON.stringify({
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }),
});

/**
 * POST /api/send-approval-email
 * Sends an approval notification email to the client after payment is approved.
 */
http.route({
  path: "/api/send-approval-email",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = (await request.json()) as {
        to?: string;
        plan?: string;
        clientName?: string;
      };

      if (!body.to) {
        return new Response(
          JSON.stringify({ ok: false, error: "Missing recipient email" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const result = await ctx.runAction(api.email.sendPaymentApproved, {
        to: body.to,
        plan: body.plan || "pro",
        clientName: body.clientName,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Approval email error:", error);
      return new Response(
        JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }),
});

/**
 * POST /api/send-rejection-email
 * Sends a rejection notification email to the client after payment is rejected.
 */
http.route({
  path: "/api/send-rejection-email",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = (await request.json()) as {
        to?: string;
        plan?: string;
        reason?: string;
        clientName?: string;
      };

      if (!body.to) {
        return new Response(
          JSON.stringify({ ok: false, error: "Missing recipient email" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      const result = await ctx.runAction(api.email.sendPaymentRejected, {
        to: body.to,
        plan: body.plan,
        reason: body.reason,
        clientName: body.clientName,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Rejection email error:", error);
      return new Response(
        JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }),
});

export default http;
