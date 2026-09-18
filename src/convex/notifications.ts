import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Real-time list of the signed-in client's notifications (newest first).
 * Live Convex subscription — new feedback instantly rings the dashboard bell.
 */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const docs = await ctx.db
      .query("notifications")
      .withIndex("by_targetUser", (q) => q.eq("targetUserId", userId))
      .order("desc")
      .take(30);

    return docs.map((n) => ({
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      actionUrl: n.actionUrl,
    }));
  },
});

/** Mark one notification as read */
export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const n = await ctx.db.get(args.id);
    if (!n || n.targetUserId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, { read: true });
    return { ok: true };
  },
});

/** Mark all of the current user's notifications as read */
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_targetUser", (q) =>
        q.eq("targetUserId", userId).eq("read", false),
      )
      .collect();

    for (const n of unread) {
      await ctx.db.patch(n._id, { read: true });
    }
    return { marked: unread.length };
  },
});

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
