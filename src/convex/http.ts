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

export default http;
