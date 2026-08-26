import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const SUPER_ADMIN_EMAILS = ["mahinhosen870@gmail.com", "atazwar103@gmail.com", "starcatchbd@gmail.com"];

/**
 * Admin-only: Send trial reminders to all trial accounts on Day 8 or Day 10.
 * Uses scheduler to fire email actions asynchronously.
 */
export const sendTrialReminders = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user || !SUPER_ADMIN_EMAILS.includes(user.email ?? "")) {
      throw new Error("Unauthorized: only super admin can trigger trial reminders");
    }

    // Get all active trial subscriptions
    const allSubs = await ctx.db.query("subscriptions").collect();
    const trialSubs = allSubs.filter(
      (s: any) => s.plan === "trial" && s.status === "active" && s.expiresAt !== undefined
    );

    const now = Date.now();
    let scheduled = 0;
    let skipped = 0;

    for (const sub of trialSubs) {
      if (!sub.expiresAt) continue;

      const daysRemaining = Math.ceil((sub.expiresAt - now) / (1000 * 60 * 60 * 24));

      // Only send on Day 12 (2 days left) or Day 14 (0 days left)
      if (daysRemaining !== 2 && daysRemaining !== 0) {
        skipped++;
        continue;
      }

      // Get user email
      const trialUser = await ctx.db.get(sub.userId as any);
      if (!trialUser || !('email' in trialUser) || !trialUser.email) continue;

      // Get business info
      const businesses = await ctx.db
        .query("businesses")
        .withIndex("by_userId", (q: any) => q.eq("userId", sub.userId))
        .collect();

      if (businesses.length === 0) continue;

      const biz = businesses[0];

      // Get analytics for this trial period
      let totalScans = 0;
      let totalRedirects = 0;
      let totalFeedbacks = 0;

      for (const b of businesses) {
        const interactions = await ctx.db
          .query("interactions")
          .withIndex("by_businessId", (q: any) =>
            q.eq("businessId", b._id).gte("createdAt", sub.createdAt)
          )
          .collect();

        totalScans += interactions.length;
        totalRedirects += interactions.filter((i: any) => i.type === "redirect").length;
        totalFeedbacks += interactions.filter((i: any) => i.type === "feedback_submitted").length;
      }

      // Schedule the email action asynchronously
      await ctx.scheduler.runAfter(0, "email:sendTrialReminder" as any, {
        to: trialUser.email as string,
        businessName: biz.name,
        daysRemaining,
        totalScans,
        totalRedirects,
        totalFeedbacks,
        reviewSlug: biz.slug,
      });

      scheduled++;
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      adminEmail: user.email ?? "unknown",
      action: "TRIAL_REMINDERS_SENT",
      details: `Checked ${trialSubs.length} trial accounts, scheduled ${scheduled} reminders`,
      createdAt: now,
    });

    return {
      checked: trialSubs.length,
      scheduled,
      skipped,
    };
  },
});
