import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

type FilterRange = "today" | "week" | "month" | "all";

function getFilterTimestamp(filter: FilterRange): number {
  const now = Date.now();
  switch (filter) {
    case "today":
      return now - 24 * 60 * 60 * 1000;
    case "week":
      return now - 7 * 24 * 60 * 60 * 1000;
    case "month":
      return now - 30 * 24 * 60 * 60 * 1000;
    case "all":
      return 0;
  }
}

/** Dashboard analytics for a specific business profile */
export const businessStats = query({
  args: {
    businessId: v.string(),
    filter: v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month"),
      v.literal("all"),
    ),
  },
  handler: async (ctx, args) => {
    const since = getFilterTimestamp(args.filter);

    const interactions = await ctx.db
      .query("interactions")
      .withIndex("by_businessId", (q) =>
        q.eq("businessId", args.businessId).gte("createdAt", since),
      )
      .collect();

    const totalVisits = interactions.length;
    const redirects = interactions.filter((i) => i.type === "redirect");
    const feedbacks = interactions.filter((i) => i.type === "feedback_submitted");

    const redirectCount = redirects.length;
    const feedbackCount = feedbacks.length;
    const redirectPercentage =
      totalVisits > 0 ? Math.round((redirectCount / totalVisits) * 100) : 0;
    const feedbackPercentage =
      totalVisits > 0 ? Math.round((feedbackCount / totalVisits) * 100) : 0;

    return {
      totalVisits,
      redirectCount,
      feedbackCount,
      redirectPercentage,
      feedbackPercentage,
    };
  },
});

/** Recent private feedbacks for a business */
export const recentFeedbacks = query({
  args: {
    businessId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const feedbacks = await ctx.db
      .query("feedback")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .order("desc")
      .take(limit);

    return feedbacks.map((f) => ({
      id: f._id,
      customerName: f.customerName,
      phone: f.phone,
      email: f.email,
      message: f.message,
      rating: f.rating,
      createdAt: f.createdAt,
    }));
  },
});

/** Aggregate stats across all user's business profiles */
export const dashboardOverview = query({
  args: {
    filter: v.union(
      v.literal("today"),
      v.literal("week"),
      v.literal("month"),
      v.literal("all"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    if (businesses.length === 0) return null;

    const since = getFilterTimestamp(args.filter);

    let totalVisits = 0;
    let totalRedirects = 0;
    let totalFeedbacks = 0;

    for (const biz of businesses) {
      const interactions = await ctx.db
        .query("interactions")
        .withIndex("by_businessId", (q) =>
          q.eq("businessId", biz._id).gte("createdAt", since),
        )
        .collect();

      totalVisits += interactions.length;
      totalRedirects += interactions.filter((i) => i.type === "redirect").length;
      totalFeedbacks += interactions.filter(
        (i) => i.type === "feedback_submitted",
      ).length;
    }

    return {
      profileCount: businesses.length,
      totalVisits,
      totalRedirects,
      totalFeedbacks,
      redirectPercentage:
        totalVisits > 0
          ? Math.round((totalRedirects / totalVisits) * 100)
          : 0,
      feedbackPercentage:
        totalVisits > 0
          ? Math.round((totalFeedbacks / totalVisits) * 100)
          : 0,
      businesses: businesses.map((b) => ({
        id: b._id,
        name: b.name,
        slug: b.slug,
      })),
    };
  },
});
