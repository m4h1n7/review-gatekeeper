import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/** Generate a URL-friendly slug from a business name */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Complete onboarding: create first business + mark user as onboarded */
export const completeOnboarding = mutation({
  args: {
    businessName: v.string(),
    category: v.string(),
    phone: v.string(),
    reviewUrl: v.string(),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Generate slug
    const slug = args.slug || slugify(args.businessName);

    // Ensure slug is unique
    let finalSlug = slug;
    let attempt = 0;
    while (true) {
      const existing = await ctx.db
        .query("businesses")
        .withIndex("by_slug", (q) => q.eq("slug", finalSlug))
        .first();
      if (!existing) break;
      attempt++;
      finalSlug = `${slug}-${attempt}`;
    }

    // Create the business profile
    const businessId = await ctx.db.insert("businesses", {
      name: args.businessName,
      slug: finalSlug,
      logoUrl: "",
      reviewUrl: args.reviewUrl,
      alertEmail: user.email || "",
      category: args.category,
      phone: args.phone,
      createdAt: Date.now(),
      userId,
    });

    // Create default free subscription if none exists
    const existingSub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!existingSub) {
      await ctx.db.insert("subscriptions", {
        userId,
        plan: "free",
        status: "pending",
        createdAt: Date.now(),
      });
    }

    // Mark onboarding as completed
    await ctx.db.patch(userId, { onboardingCompleted: true });

    return { businessId, slug: finalSlug };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    logoUrl: v.string(),
    reviewUrl: v.string(),
    alertEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in to create a business");

    const now = Date.now();
    let slug = slugify(args.name);

    // Ensure slug is unique by appending a suffix if needed
    let attempt = 0;
    while (true) {
      const existing = await ctx.db
        .query("businesses")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!existing) break;
      attempt++;
      slug = `${slugify(args.name)}-${attempt}`;
    }

    // Check subscription limits
    const userSub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!userSub || userSub.plan === "free") {
      // Free tier: max 1 business profile
      const existingBusinesses = await ctx.db
        .query("businesses")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
      if (existingBusinesses.length >= 1) {
        throw new Error(
          "Free plan limited to 1 profile. Upgrade to Pro for unlimited.",
        );
      }
    }

    const id = await ctx.db.insert("businesses", {
      name: args.name,
      slug,
      logoUrl: args.logoUrl,
      reviewUrl: args.reviewUrl,
      alertEmail: args.alertEmail,
      createdAt: now,
      userId,
    });

    return { id, slug };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const business = await ctx.db
      .query("businesses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!business) return null;
    return {
      id: business._id,
      name: business.name,
      slug: business.slug,
      logoUrl: business.logoUrl,
      reviewUrl: business.reviewUrl,
      alertEmail: business.alertEmail,
      heroUrl: business.heroUrl,
      promoText: business.promoText,
    };
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return businesses.map((b) => ({
      id: b._id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      reviewUrl: b.reviewUrl,
      alertEmail: b.alertEmail,
      createdAt: b.createdAt,
    }));
  },
});

// Keep old list for backward compatibility
export const list = query({
  handler: async (ctx) => {
    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
    return businesses.map((b) => ({
      id: b._id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      reviewUrl: b.reviewUrl,
      alertEmail: b.alertEmail,
      createdAt: b.createdAt,
    }));
  },
});
