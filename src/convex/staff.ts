import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Create a new staff member for a business */
export const create = mutation({
  args: {
    businessId: v.string(),
    name: v.string(),
    role: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const business = await ctx.db.get(args.businessId as any);
    if (!business) throw new Error("Business not found");
    if ((business as any).userId !== userId) throw new Error("Unauthorized");

    // Generate unique staff slug from name
    const baseSlug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await ctx.db
        .query("staffMembers")
        .withIndex("by_slug", (q: any) => q.eq("slug", finalSlug))
        .first();
      if (!existing) break;
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const staffId = await ctx.db.insert("staffMembers", {
      businessId: args.businessId,
      name: args.name,
      slug: finalSlug,
      role: args.role,
      email: args.email,
      phone: args.phone,
      createdAt: Date.now(),
      active: true,
    });

    return { staffId, slug: finalSlug };
  },
});

/** Update a staff member */
export const update = mutation({
  args: {
    staffId: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const staff = await ctx.db.get(args.staffId as any);
    if (!staff) throw new Error("Staff member not found");

    const business = await ctx.db.get((staff as any).businessId as any);
    if (!business || (business as any).userId !== userId)
      throw new Error("Unauthorized");

    const patch: Record<string, any> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.role !== undefined) patch.role = args.role;
    if (args.email !== undefined) patch.email = args.email;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.active !== undefined) patch.active = args.active;

    await ctx.db.patch(args.staffId as any, patch);
    return { ok: true };
  },
});

/** Delete a staff member (hard delete) */
export const remove = mutation({
  args: { staffId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const staff = await ctx.db.get(args.staffId as any);
    if (!staff) throw new Error("Staff member not found");

    const business = await ctx.db.get((staff as any).businessId as any);
    if (!business || (business as any).userId !== userId)
      throw new Error("Unauthorized");

    await ctx.db.delete(args.staffId as any);
    return { ok: true };
  },
});

/** List all staff members for a business */
export const listByBusiness = query({
  args: { businessId: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("staffMembers")
      .withIndex("by_businessId", (q: any) =>
        q.eq("businessId", args.businessId),
      )
      .collect();

    return members.map((m) => ({
      id: m._id,
      name: m.name,
      slug: m.slug,
      role: m.role,
      email: m.email,
      phone: m.phone,
      active: m.active,
      createdAt: m.createdAt,
    }));
  },
});

/** Get staff by slug (for review page attribution) */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const staff = await ctx.db
      .query("staffMembers")
      .withIndex("by_slug", (q: any) => q.eq("slug", args.slug))
      .first();
    if (!staff) return null;
    return {
      id: staff._id,
      name: staff.name,
      slug: staff.slug,
      role: staff.role,
      email: staff.email,
      phone: staff.phone,
      businessId: staff.businessId,
    };
  },
});

/**
 * Leaderboard: Get scan/review counts per staff member for a business.
 * Returns sorted array (highest first) with total interactions and breakdown.
 */
export const getLeaderboard = query({
  args: { businessId: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("staffMembers")
      .withIndex("by_businessId", (q: any) =>
        q.eq("businessId", args.businessId),
      )
      .collect();

    const leaderboard = await Promise.all(
      members.map(async (member) => {
        // Count all interactions attributed to this staff
        const interactions = await ctx.db
          .query("interactions")
          .withIndex("by_staffId", (q: any) =>
            q.eq("staffId", member._id as string),
          )
          .collect();

        const totalScans = interactions.length;
        const positiveReviews = interactions.filter(
          (i) => (i.type === "public_review" || i.type === "redirect") && i.rating >= 4,
        ).length;
        const negativeFeedbacks = interactions.filter(
          (i) => i.type === "feedback_submitted" && i.rating <= 3,
        ).length;
        const publicReviews = interactions.filter(
          (i) => i.type === "public_review" || i.type === "redirect",
        ).length;
        const privateFeedbacks = interactions.filter(
          (i) => i.type === "feedback_submitted",
        ).length;

        return {
          staffId: member._id,
          name: member.name,
          slug: member.slug,
          role: member.role,
          active: member.active,
          totalScans,
          publicReviews,
          privateFeedbacks,
          positiveReviews,
          negativeFeedbacks,
          conversionRate:
            totalScans > 0
              ? Math.round((publicReviews / totalScans) * 100)
              : 0,
        };
      }),
    );

    // Sort by total scans descending
    leaderboard.sort((a, b) => b.totalScans - a.totalScans);

    // Add rank
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  },
});
