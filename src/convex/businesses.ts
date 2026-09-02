import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

/**
 * Create a new business profile after onboarding.
 * Generates a unique slug from the business name.
 */
export const create = mutation({
  args: {
    name: v.string(),
    logoUrl: v.string(),
    reviewUrl: v.string(),
    alertEmail: v.string(),
    category: v.optional(v.string()),
    phone: v.optional(v.string()),
    heroUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    // Generate unique slug
    const baseSlug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await ctx.db
        .query("businesses")
        .withIndex("by_slug", (q) => q.eq("slug", finalSlug))
        .first();
      if (!existing) break;
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const businessId = await ctx.db.insert("businesses", {
      name: args.name,
      slug: finalSlug,
      logoUrl: args.logoUrl,
      reviewUrl: args.reviewUrl,
      alertEmail: args.alertEmail,
      category: args.category,
      phone: args.phone,
      heroUrl: args.heroUrl,
      createdAt: Date.now(),
      userId: userId as any,
    });

    // Mark onboarding as completed
    await ctx.db.patch(userId as any, { onboardingCompleted: true });

    return { businessId, slug: finalSlug };
  },
});

/**
 * Admin-created business: skips onboarding completion, assigns to a specific user.
 */
export const createAsAdmin = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    logoUrl: v.optional(v.string()),
    reviewUrl: v.string(),
    alertEmail: v.string(),
    category: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const baseSlug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await ctx.db
        .query("businesses")
        .withIndex("by_slug", (q) => q.eq("slug", finalSlug))
        .first();
      if (!existing) break;
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const id = await ctx.db.insert("businesses", {
      name: args.name,
      slug: finalSlug,
      logoUrl: args.logoUrl ?? "",
      reviewUrl: args.reviewUrl,
      alertEmail: args.alertEmail,
      category: args.category,
      phone: args.phone,
      createdAt: Date.now(),
      userId: args.userId,
    });

    return { id, slug: finalSlug };
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
      brandColor: business.brandColor ?? undefined,
      welcomeMessage: business.welcomeMessage ?? undefined,
      promoEnabled: business.promoEnabled ?? false,
      promoText: business.promoText ?? "",
      thankYouMessage: business.thankYouMessage ?? "",
      themeMode: business.themeMode ?? "dark",
      customHeadline: business.customHeadline ?? "",
      customSubtitle: business.customSubtitle ?? "",
      publicReviewLabel: business.publicReviewLabel ?? "",
      publicReviewDesc: business.publicReviewDesc ?? "",
      privateFeedbackLabel: business.privateFeedbackLabel ?? "",
      privateFeedbackDesc: business.privateFeedbackDesc ?? "",
      // Low-rating options
      lowRatingShowPublicOption: business.lowRatingShowPublicOption ?? true,
      lowRatingOptionsHeading: business.lowRatingOptionsHeading ?? "",
      lowRatingOptionsSubtitle: business.lowRatingOptionsSubtitle ?? "",
      lowRatingPrivateLabel: business.lowRatingPrivateLabel ?? "",
      lowRatingPrivateDesc: business.lowRatingPrivateDesc ?? "",
      lowRatingPublicLabel: business.lowRatingPublicLabel ?? "",
      lowRatingPublicDesc: business.lowRatingPublicDesc ?? "",
      lowRatingFeedbackHeading: business.lowRatingFeedbackHeading ?? "",
    };
  },
});

/** Update thank-you message for 4-5 star redirects */
export const updateThankYou = mutation({
  args: {
    businessId: v.string(),
    thankYouMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const business = await ctx.db.get(args.businessId as any);
    if (!business) throw new Error("Business not found");
    if ((business as any).userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.businessId as any, {
      thankYouMessage: args.thankYouMessage,
    });

    return { ok: true };
  },
});

/** Update promo/offer banner settings */
export const updatePromo = mutation({
  args: {
    businessId: v.string(),
    promoEnabled: v.boolean(),
    promoText: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const business = await ctx.db.get(args.businessId as any);
    if (!business) throw new Error("Business not found");
    if ((business as any).userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.businessId as any, {
      promoEnabled: args.promoEnabled,
      promoText: args.promoText,
    });

    return { ok: true };
  },
});

/** Update business branding: hero image, brand color, and welcome message */
export const updateBranding = mutation({
  args: {
    businessId: v.string(),
    heroUrl: v.optional(v.string()),
    brandColor: v.optional(v.string()),
    welcomeMessage: v.optional(v.string()),
    themeMode: v.optional(v.union(v.literal("dark"), v.literal("light"), v.literal("auto"))),
    customHeadline: v.optional(v.string()),
    customSubtitle: v.optional(v.string()),
    publicReviewLabel: v.optional(v.string()),
    publicReviewDesc: v.optional(v.string()),
    privateFeedbackLabel: v.optional(v.string()),
    privateFeedbackDesc: v.optional(v.string()),
    // Low-rating options
    lowRatingShowPublicOption: v.optional(v.boolean()),
    lowRatingOptionsHeading: v.optional(v.string()),
    lowRatingOptionsSubtitle: v.optional(v.string()),
    lowRatingPrivateLabel: v.optional(v.string()),
    lowRatingPrivateDesc: v.optional(v.string()),
    lowRatingPublicLabel: v.optional(v.string()),
    lowRatingPublicDesc: v.optional(v.string()),
    lowRatingFeedbackHeading: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const business = await ctx.db.get(args.businessId as any);
    if (!business) throw new Error("Business not found");
    if ((business as any).userId !== userId) throw new Error("Unauthorized");

    const patch: Record<string, any> = {};
    if (args.heroUrl !== undefined) patch.heroUrl = args.heroUrl;
    if (args.brandColor !== undefined) patch.brandColor = args.brandColor;
    if (args.welcomeMessage !== undefined) patch.welcomeMessage = args.welcomeMessage;
    if (args.themeMode !== undefined) patch.themeMode = args.themeMode;
    if (args.customHeadline !== undefined) patch.customHeadline = args.customHeadline;
    if (args.customSubtitle !== undefined) patch.customSubtitle = args.customSubtitle;
    if (args.publicReviewLabel !== undefined) patch.publicReviewLabel = args.publicReviewLabel;
    if (args.publicReviewDesc !== undefined) patch.publicReviewDesc = args.publicReviewDesc;
    if (args.privateFeedbackLabel !== undefined) patch.privateFeedbackLabel = args.privateFeedbackLabel;
    if (args.privateFeedbackDesc !== undefined) patch.privateFeedbackDesc = args.privateFeedbackDesc;
    // Low-rating options
    if (args.lowRatingShowPublicOption !== undefined) patch.lowRatingShowPublicOption = args.lowRatingShowPublicOption;
    if (args.lowRatingOptionsHeading !== undefined) patch.lowRatingOptionsHeading = args.lowRatingOptionsHeading;
    if (args.lowRatingOptionsSubtitle !== undefined) patch.lowRatingOptionsSubtitle = args.lowRatingOptionsSubtitle;
    if (args.lowRatingPrivateLabel !== undefined) patch.lowRatingPrivateLabel = args.lowRatingPrivateLabel;
    if (args.lowRatingPrivateDesc !== undefined) patch.lowRatingPrivateDesc = args.lowRatingPrivateDesc;
    if (args.lowRatingPublicLabel !== undefined) patch.lowRatingPublicLabel = args.lowRatingPublicLabel;
    if (args.lowRatingPublicDesc !== undefined) patch.lowRatingPublicDesc = args.lowRatingPublicDesc;
    if (args.lowRatingFeedbackHeading !== undefined) patch.lowRatingFeedbackHeading = args.lowRatingFeedbackHeading;

    await ctx.db.patch(args.businessId as any, patch);

    return { ok: true };
  },
});

/** List businesses for the current user (used by AccountSettings) */
export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();

    return businesses.map((b) => ({
      id: b._id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      reviewUrl: b.reviewUrl,
      alertEmail: b.alertEmail,
      heroUrl: b.heroUrl,
      brandColor: b.brandColor,
      welcomeMessage: b.welcomeMessage,
      category: b.category,
      phone: b.phone,
      promoEnabled: b.promoEnabled ?? false,
      promoText: b.promoText ?? "",
      thankYouMessage: b.thankYouMessage ?? "",
      themeMode: b.themeMode ?? "dark",
      customHeadline: b.customHeadline ?? "",
      customSubtitle: b.customSubtitle ?? "",
      publicReviewLabel: b.publicReviewLabel ?? "",
      publicReviewDesc: b.publicReviewDesc ?? "",
      privateFeedbackLabel: b.privateFeedbackLabel ?? "",
      privateFeedbackDesc: b.privateFeedbackDesc ?? "",
      // Low-rating options
      lowRatingShowPublicOption: b.lowRatingShowPublicOption ?? true,
      lowRatingOptionsHeading: b.lowRatingOptionsHeading ?? "",
      lowRatingOptionsSubtitle: b.lowRatingOptionsSubtitle ?? "",
      lowRatingPrivateLabel: b.lowRatingPrivateLabel ?? "",
      lowRatingPrivateDesc: b.lowRatingPrivateDesc ?? "",
      lowRatingPublicLabel: b.lowRatingPublicLabel ?? "",
      lowRatingPublicDesc: b.lowRatingPublicDesc ?? "",
      lowRatingFeedbackHeading: b.lowRatingFeedbackHeading ?? "",
      subscriptionStatus: b.subscriptionStatus,
      trialEndsAt: b.trialEndsAt,
      planType: b.planType,
      createdAt: b.createdAt,
    }));
  },
});

/** Complete onboarding: create a business profile and mark user as onboarded */
export const completeOnboarding = mutation({
  args: {
    businessName: v.string(),
    category: v.string(),
    phone: v.optional(v.string()),
    reviewUrl: v.string(),
    slug: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    // Generate unique slug
    const baseSlug = args.slug
      || args.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    let finalSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await ctx.db
        .query("businesses")
        .withIndex("by_slug", (q: any) => q.eq("slug", finalSlug))
        .first();
      if (!existing) break;
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Set 10-day trial
    const trialExpiresAt = Date.now() + 10 * 24 * 60 * 60 * 1000;

    const businessId = await ctx.db.insert("businesses", {
      name: args.businessName,
      slug: finalSlug,
      logoUrl: args.logoUrl ?? "",
      reviewUrl: args.reviewUrl,
      alertEmail: "",
      category: args.category,
      phone: args.phone,
      createdAt: Date.now(),
      userId: userId as any,
      subscriptionStatus: "trialing",
      trialEndsAt: trialExpiresAt,
      planType: "pro",
    });

    // Sync trialEndsAt to all business profiles owned by this user
    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .collect();
    for (const biz of businesses) {
      await ctx.db.patch(biz._id as any, {
        subscriptionStatus: "trialing",
        trialEndsAt: trialExpiresAt,
        planType: "pro",
      });
    }

    // Mark onboarding as completed
    await ctx.db.patch(userId as any, { onboardingCompleted: true });

    return { businessId, slug: finalSlug };
  },
});

/** Update the Google Review URL */
export const updateReviewUrl = mutation({
  args: {
    businessId: v.string(),
    reviewUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const business = await ctx.db.get(args.businessId as any);
    if (!business) throw new Error("Business not found");
    if ((business as any).userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(args.businessId as any, {
      reviewUrl: args.reviewUrl,
    });

    return { ok: true };
  },
});

/** Get all businesses for a user (for multi-profile dashboard) */
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const businesses = await ctx.db
      .query("businesses")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    return businesses.map((b) => ({
      id: b._id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      reviewUrl: b.reviewUrl,
      alertEmail: b.alertEmail,
      heroUrl: b.heroUrl,
      brandColor: b.brandColor,
      welcomeMessage: b.welcomeMessage,
      category: b.category,
      phone: b.phone,
      promoEnabled: b.promoEnabled ?? false,
      promoText: b.promoText ?? "",
      thankYouMessage: b.thankYouMessage ?? "",
      subscriptionStatus: b.subscriptionStatus,
      trialEndsAt: b.trialEndsAt,
      planType: b.planType,
      createdAt: b.createdAt,
    }));
  },
});

/** Get all businesses (admin) */
export const getAll = query({
  handler: async (ctx) => {
    const businesses = await ctx.db.query("businesses").collect();
    return businesses.map((b) => ({
      id: b._id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      reviewUrl: b.reviewUrl,
      alertEmail: b.alertEmail,
      heroUrl: b.heroUrl,
      brandColor: b.brandColor,
      welcomeMessage: b.welcomeMessage,
      category: b.category,
      phone: b.phone,
      promoEnabled: b.promoEnabled ?? false,
      promoText: b.promoText ?? "",
      thankYouMessage: b.thankYouMessage ?? "",
      subscriptionStatus: b.subscriptionStatus,
      trialEndsAt: b.trialEndsAt,
      planType: b.planType,
      createdAt: b.createdAt,
      userId: b.userId,
    }));
  },
});

/** Delete a business profile */
export const remove = mutation({
  args: { businessId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in");

    const business = await ctx.db.get(args.businessId as any);
    if (!business) throw new Error("Business not found");
    if ((business as any).userId !== userId) throw new Error("Unauthorized");

    await ctx.db.delete(args.businessId as any);
    return { ok: true };
  },
});
