import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
