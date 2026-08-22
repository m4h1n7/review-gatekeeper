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
      status: f.status,
    }));
  },
});

/** Daily rating trend for chart display */
export const ratingTrend = query({
  args: {
    businessId: v.optional(v.string()),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const since = Date.now() - args.days * 24 * 60 * 60 * 1000;

    let businessIds: string[] = [];

    if (args.businessId) {
      businessIds = [args.businessId];
    } else {
      const businesses = await ctx.db
        .query("businesses")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
      businessIds = businesses.map((b) => b._id);
    }

    // Collect all interactions since the start
    const allInteractions: { rating: number; type: string; createdAt: number }[] = [];
    for (const bid of businessIds) {
      const interactions = await ctx.db
        .query("interactions")
        .withIndex("by_businessId", (q) =>
          q.eq("businessId", bid).gte("createdAt", since),
        )
        .collect();
      allInteractions.push(...interactions.map((i) => ({ rating: i.rating, type: i.type, createdAt: i.createdAt })));
    }

    // Group by day
    const dayMap: Record<string, { rating: number; type: string; score: number }[]> = {};
    const now = new Date();

    for (let d = args.days - 1; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const key = date.toISOString().slice(0, 10);
      dayMap[key] = [];
    }

    for (const interaction of allInteractions) {
      const date = new Date(interaction.createdAt).toISOString().slice(0, 10);
      if (dayMap[date]) {
        dayMap[date].push({
          rating: interaction.rating,
          type: interaction.type,
          score: interaction.rating >= 4 ? 1 : -0.5,
        });
      }
    }

    // Calculate running score
    let runningScore = 50; // start at neutral
    const trend = Object.entries(dayMap).map(([date, items]) => {
      const positive = items.filter((i) => i.type === "redirect").length;
      const negative = items.filter((i) => i.type === "feedback_submitted").length;
      const dayDelta = items.reduce((sum, i) => sum + i.score, 0);
      runningScore = Math.max(0, Math.min(100, runningScore + dayDelta * 2));

      return {
        date,
        day: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: Math.round(runningScore),
        positive,
        negative,
        total: items.length,
      };
    });

    return trend;
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
