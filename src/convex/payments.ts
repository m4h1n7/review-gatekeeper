import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const SUPER_ADMIN_EMAILS = ["mahinhosen870@gmail.com", "atazwar103@gmail.com", "starcatchbd@gmail.com"];

/** Submit a manual payment request (called from PaywallModal) */
export const submit = mutation({
  args: {
    gateway: v.union(v.literal("bkash"), v.literal("nagad")),
    senderPhone: v.string(),
    trxId: v.string(),
    plan: v.optional(v.union(v.literal("starter"), v.literal("pro"))),
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

    const setupFee = args.plan === "starter" ? 1499 : args.plan === "pro" ? 1699 : 1699;

    const id = await ctx.db.insert("payments", {
      userId,
      clientEmail,
      gateway: args.gateway,
      senderPhone: args.senderPhone,
      trxId: args.trxId,
      plan: args.plan ?? "pro",
      status: "pending",
      setupFee,
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
    if (!user || !SUPER_ADMIN_EMAILS.includes(user.email ?? "")) return null;

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    // Enrich with subscription status and user/business info
    const results = [];
    for (const p of payments) {
      const sub = await ctx.db
        .query("subscriptions")
        .withIndex("by_userId", (q) => q.eq("userId", p.userId))
        .first();

      const ownerUser = (await ctx.db.get(p.userId as any)) as any;
      const biz = (await ctx.db
        .query("businesses")
        .withIndex("by_userId", (q) => q.eq("userId", p.userId))
        .first()) as any;

      results.push({
        id: p._id,
        userId: p.userId,
        clientEmail: p.clientEmail ?? "unknown",
        clientName: ownerUser?.name ?? "—",
        businessName: biz?.name ?? null,
        gateway: p.gateway,
        senderPhone: p.senderPhone ?? "—",
        trxId: p.trxId ?? "—",
        setupFee: p.setupFee ?? null,
        status: p.status,
        submittedAt: p.submittedAt,
        selectedPlan: (p as any).plan ?? "pro",
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
    if (!user || !SUPER_ADMIN_EMAILS.includes(user.email ?? "")) return null;

    const payments = await ctx.db
      .query("payments")
      .order("desc")
      .collect();

    return payments.map((p) => ({
      id: p._id,
      userId: p.userId,
      clientEmail: p.clientEmail ?? "unknown",
      gateway: p.gateway,
      senderPhone: p.senderPhone ?? "—",
      trxId: p.trxId ?? "—",
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
    if (!adminUser || !SUPER_ADMIN_EMAILS.includes(adminUser.email ?? "")) {
      throw new Error("Unauthorized: only super admin can approve payments");
    }

    const paymentDoc = await ctx.db.get(args.paymentId as any);
    if (!paymentDoc || !("status" in paymentDoc)) throw new Error("Payment not found");
    const payment = paymentDoc as {
      _id: any; userId: string; status: string;
    };
    if (payment.status !== "pending") throw new Error("Payment already reviewed");

    // Mark payment as approved
    await ctx.db.patch(payment._id, {
      status: "approved",
      reviewedAt: Date.now(),
    });

    // Read the plan from the payment record (set during submission)
    const paymentData = paymentDoc as any;
    const selectedPlan: "starter" | "pro" = paymentData.plan === "starter" ? "starter" : "pro";

    // Find or create subscription for the client with the correct plan
    const existingSub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", payment.userId))
      .first();

    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

    if (existingSub) {
      await ctx.db.patch(existingSub._id, {
        plan: selectedPlan,
        status: "active",
        expiresAt,
        proExpiresAt: expiresAt,
      });
    } else {
      await ctx.db.insert("subscriptions", {
        userId: payment.userId,
        plan: selectedPlan,
        status: "active",
        createdAt: Date.now(),
        expiresAt,
        proExpiresAt: expiresAt,
      });
    }

    // Return client email + plan for frontend to trigger approval email
    const ownerUser = (await ctx.db.get(payment.userId as any)) as any;
    return {
      ok: true,
      clientEmail: paymentData.clientEmail ?? ownerUser?.email ?? "",
      plan: selectedPlan,
      clientName: ownerUser?.name ?? "",
    };
  },
});

/** Admin only: reject a payment with an optional reason */
export const reject = mutation({
  args: {
    paymentId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const adminUser = await ctx.db.get(userId);
    if (!adminUser || !SUPER_ADMIN_EMAILS.includes(adminUser.email ?? "")) {
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
      rejectionReason: args.reason,
      reviewedAt: Date.now(),
    });

    // Return client email + plan for frontend to trigger rejection email
    const paymentData = paymentDoc as any;
    const ownerUser = (await ctx.db.get(paymentData.userId as any)) as any;
    return {
      ok: true,
      clientEmail: paymentData.clientEmail ?? ownerUser?.email ?? "",
      plan: paymentData.plan ?? "pro",
    };
  },
});
