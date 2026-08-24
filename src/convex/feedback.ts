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
    });

    const id = await ctx.db.insert("feedback", {
      businessId: args.businessId,
      businessSlug: args.businessSlug,
      customerName: args.customerName,
      phone: args.phone,
      email: args.email,
      message: args.message,
      rating: args.rating,
      createdAt: Date.now(),
      status: "unresolved",
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

