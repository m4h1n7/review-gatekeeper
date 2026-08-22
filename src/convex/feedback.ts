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
