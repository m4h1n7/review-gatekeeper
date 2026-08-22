import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Generate a URL-friendly slug from a business name */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const create = mutation({
  args: {
    name: v.string(),
    logoUrl: v.string(),
    reviewUrl: v.string(),
    alertEmail: v.string(),
  },
  handler: async (ctx, args) => {
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

    const id = await ctx.db.insert("businesses", {
      name: args.name,
      slug,
      logoUrl: args.logoUrl,
      reviewUrl: args.reviewUrl,
      alertEmail: args.alertEmail,
      createdAt: now,
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
    };
  },
});

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
