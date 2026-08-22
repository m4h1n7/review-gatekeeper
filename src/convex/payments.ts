import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const SUPER_ADMIN_EMAIL = "mahinhosen870@gmail.com";

/** Submit a manual payment request (called from PaywallModal) */
export const submit = mutation({
  args: {
    gateway: v.union(v.literal("bkash"), v.literal("nagad")),
    senderPhone: v.string(),
    trxId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Must be signed in to submit payment");

    // Get user email
    const user = await ctx.db.get(userId);
    const clientEmail = user?.email ?? "unknown";

    // Check for duplicate TrxID
    const allPending = await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const duplicate = allPending.find((p) => p.trxId === args.trxId);
    if (duplicate) {
      throw new Error("This Transaction ID has already been submitted");
    }

    const id = await ctx.db.insert("payments", {
      userId,
      clientEmail,
      gateway: args.gateway,
      senderPhone: args.senderPhone,
      trxId: args.trxId,
      status: "pending",
      submittedAt: Date.now(),
    });

    return { id };
  },
});

/** Admin only: list all pending payment requests */
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user || user.email !== SUPER_ADMIN_EMAIL) return null;

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    // Enrich with subscription status
    const results = [];
    for (const p of payments) {
      const sub = await ctx.db
        .query("subscriptions")
        .withIndex("by_userId", (q) => q.eq("userId", p.userId))
        .first();

      results.push({
        id: p._id,
        userId: p.userId,
        clientEmail: p.clientEmail,
        gateway: p.gateway,
        senderPhone: p.senderPhone,
        trxId: p.trxId,
        status: p.status,
        submittedAt: p.submittedAt,
        currentPlan: sub?.plan ?? "free",
        currentSubStatus: sub?.status ?? "none",
      });
    }

    return results;
  },
});

/** Admin only: list all payments (for history) */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user || user.email !== SUPER_ADMIN_EMAIL) return null;

    const payments = await ctx.db
      .query("payments")
      .order("desc")
      .collect();

    return payments.map((p) => ({
      id: p._id,
      userId: p.userId,
      clientEmail: p.clientEmail,
      gateway: p.gateway,
      senderPhone: p.senderPhone,
      trxId: p.trxId,
      status: p.status,
      submittedAt: p.submittedAt,
      reviewedAt: p.reviewedAt,
    }));
  },
});

/** Admin only: approve a payment and upgrade user to Pro */
export const approve = mutation({
  args: { paymentId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adminUser = await ctx.db.get(userId);
    if (!adminUser || adminUser.email !== SUPER_ADMIN_EMAIL) {
      throw new Error("Unauthorized: only super admin can approve payments");
    }

    // Query payment by ID to get proper typing
    const paymentDoc = await ctx.db.get(args.paymentId as any);
    if (!paymentDoc || !("status" in paymentDoc)) throw new Error("Payment not found");
    const payment = paymentDoc as {
      _id: any; userId: string; clientEmail: string; gateway: string;
      senderPhone: string; trxId: string; status: string; submittedAt: number;
    };
    if (payment.status !== "pending") throw new Error("Payment already reviewed");

    // Mark payment as approved
    await ctx.db.patch(payment._id, {
      status: "approved",
      reviewedAt: Date.now(),
    });

    // Find or create subscription for the client
    const existingSub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", payment.userId))
      .first();

    if (existingSub) {
      await ctx.db.patch(existingSub._id, {
        plan: "pro",
        status: "active",
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: payment.userId,
        plan: "pro",
        status: "active",
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
    }

    return { ok: true };
  },
});

/** Admin only: reject a payment */
export const reject = mutation({
  args: { paymentId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adminUser = await ctx.db.get(userId);
    if (!adminUser || adminUser.email !== SUPER_ADMIN_EMAIL) {
      throw new Error("Unauthorized: only super admin can reject payments");
    }

    const paymentDoc = await ctx.db.get(args.paymentId as any);
    if (!paymentDoc || !("status" in paymentDoc)) throw new Error("Payment not found");
    const payment = paymentDoc as {
      _id: any; status: string;
    };
    if (payment.status !== "pending") throw new Error("Payment already reviewed");

    await ctx.db.patch(payment._id, {
      status: "rejected",
      reviewedAt: Date.now(),
    });

    return { ok: true };
  },
});
