import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Rate limit: minimum 60 seconds between submissions from the same business.
 * Pro businesses get anti-spam protection. Starter businesses get basic protection too.
 */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export const submit = mutation({
  args: {
    businessId: v.string(),
    businessSlug: v.string(),
    customerName: v.string(),
    phone: v.string(),
    email: v.string(),
    message: v.string(),
    rating: v.number(),
    staffId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Anti-spam: check for recent submissions from this business within rate limit window
    const recentFeedbacks = await ctx.db
      .query("feedback")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .order("desc")
      .take(1);

    if (recentFeedbacks.length > 0) {
      const lastSubmission = recentFeedbacks[0];
      const timeSinceLast = Date.now() - lastSubmission.createdAt;
      if (timeSinceLast < RATE_LIMIT_WINDOW_MS) {
        const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - timeSinceLast) / 1000);
        throw new Error(`Please wait ${waitSeconds} seconds before submitting another feedback. This protects against spam.`);
      }
    }

    // Record the interaction (1-3 star = feedback_submitted)
    await ctx.db.insert("interactions", {
      businessId: args.businessId,
      businessSlug: args.businessSlug,
      rating: args.rating,
      type: "feedback_submitted",
      createdAt: Date.now(),
      staffId: args.staffId,
    });

    // Look up business to fill clientEmail and businessName
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_slug", (q) => q.eq("slug", args.businessSlug))
      .first();

    const id = await ctx.db.insert("feedback", {
      businessId: args.businessId,
      businessSlug: args.businessSlug,
      clientEmail: business?.clientEmail ?? business?.alertEmail ?? "",
      businessName: business?.name ?? business?.businessName ?? "",
      customerName: args.customerName,
      phone: args.phone,
      email: args.email,
      message: args.message,
      feedbackMessage: args.message,
      rating: args.rating,
      createdAt: Date.now(),
      submittedAt: Date.now(),
      status: "unresolved",
    });

    // Real-time dashboard notification — pushed to the business owner so the
    // client dashboard bell rings the moment private feedback lands.
    const customerLabel = args.customerName || "A customer";
    await ctx.db.insert("notifications", {
      type: "negative_feedback",
      title: `New private feedback (${args.rating}★)`,
      message: `${customerLabel}: ${args.message.slice(0, 140)}`,
      targetUserId: business?.userId ?? args.businessId,
      read: false,
      createdAt: Date.now(),
      actionUrl: "/dashboard/feedback",
    });

    return { id };
  },
});

export const logRedirect = mutation({
  args: {
    businessId: v.string(),
    businessSlug: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("interactions", {
      businessId: args.businessId,
      businessSlug: args.businessSlug,
      rating: args.rating,
      type: "redirect",
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});

/**
 * Generic interaction logger: records every star click with rating, type, and optional staff attribution.
 */
export const logInteraction = mutation({
  args: {
    businessId: v.string(),
    businessSlug: v.string(),
    rating: v.number(),
    type: v.union(
      v.literal("redirect"),
      v.literal("feedback_submitted"),
      v.literal("public_review"),
      v.literal("scan"),
    ),
    staffId: v.optional(v.string()),
    sessionKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Scan dedup: one "scan" row per business per client session per day.
    // The browser sends a stable per-session token; repeated opens from the
    // same session on the same day are idempotent (no duplicate rows on
    // reloads or accidental double-taps).
    if (args.type === "scan" && args.sessionKey) {
      const existing = await ctx.db
        .query("interactions")
        .withIndex("by_sessionKey", (q) => q.eq("sessionKey", args.sessionKey))
        .first();
      if (existing) return { ok: true, deduped: true };
    }

    await ctx.db.insert("interactions", {
      businessId: args.businessId,
      businessSlug: args.businessSlug,
      rating: args.rating,
      type: args.type,
      createdAt: Date.now(),
      staffId: args.staffId,
      sessionKey: args.sessionKey,
    });
    return { ok: true };
  },
});

/**
 * Log when a customer clicks "Share Public Review" (option A).
 * This records that the customer chose to leave a public Google review.
 * rating is set to 5 by default since the user chose the public review path.
 */
export const logPublicReview = mutation({
  args: {
    businessId: v.string(),
    businessSlug: v.string(),
    staffId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("interactions", {
      businessId: args.businessId,
      businessSlug: args.businessSlug,
      rating: 5,
      type: "public_review",
      createdAt: Date.now(),
      staffId: args.staffId,
    });
    return { ok: true };
  },
});

/** Toggle feedback status between resolved and unresolved */
export const toggleStatus = mutation({
  args: {
    feedbackId: v.string(),
    status: v.union(v.literal("unresolved"), v.literal("resolved")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.feedbackId as any, { status: args.status });
    return { ok: true };
  },
});

