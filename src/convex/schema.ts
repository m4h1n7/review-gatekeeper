import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    // User accounts
    users: defineTable({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      image: v.optional(v.string()),
      tokenIdentifier: v.optional(v.string()),
      emailVerified: v.optional(v.boolean()),
      onboardingDone: v.optional(v.boolean()),
      onboardingCompleted: v.optional(v.boolean()),
      isAnonymous: v.optional(v.boolean()),
      hasUsedTrial: v.optional(v.boolean()),
      role: v.optional(v.string()),
      accountStatus: v.optional(v.string()),
      signupOtp: v.optional(v.string()),
      signupOtpExpiry: v.optional(v.number()),
      archivedAt: v.optional(v.number()),
      archivedBy: v.optional(v.string()),
      suspended: v.optional(v.boolean()),
      suspendedAt: v.optional(v.number()),
      suspendedBy: v.optional(v.string()),
      suspendedReason: v.optional(v.string()),
    }).index("by_token", ["tokenIdentifier"])
      .index("by_email", ["email"]),

    // Auth accounts (managed by @convex-dev/auth)
    authAccounts: defineTable({
      userId: v.id("users"),
      provider: v.string(),
      providerAccountId: v.string(),
    })
      .index("by_provider", ["provider", "providerAccountId"])
      .index("by_userId", ["userId"]),

    // Auth sessions
    authSessions: defineTable({
      userId: v.id("users"),
      expirationTime: v.number(),
    }).index("by_userId", ["userId"]),

    // Auth key-value pairs (password hashes, etc.)
    authKeyValues: defineTable({
      key: v.string(),
      value: v.string(),
    }).index("by_key", ["key"]),

    // Auth verification tokens
    authVerificationTokens: defineTable({
      identifier: v.string(),
      token: v.string(),
      expirationTime: v.number(),
    })
      .index("by_identifier", ["identifier"])
      .index("by_token", ["token"]),

    // Business profiles
    businesses: defineTable({
      userId: v.string(),
      slug: v.string(),
      name: v.string(),
      businessName: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      reviewUrl: v.string(),
      alertEmail: v.optional(v.string()),
      clientEmail: v.optional(v.string()),
      alertPhone: v.optional(v.string()),
      category: v.optional(v.string()),
      phone: v.optional(v.string()),
      heroUrl: v.optional(v.string()),
      createdAt: v.number(),
      subscriptionStatus: v.optional(v.string()),
      planType: v.optional(v.string()),
      trialEndsAt: v.optional(v.number()),
      customHeading: v.optional(v.string()),
      customSubtitle: v.optional(v.string()),
      customHeadline: v.optional(v.string()),
      brandColor: v.optional(v.string()),
      darkMode: v.optional(v.string()),
      themeMode: v.optional(v.string()),
      thankYouMessage: v.optional(v.string()),
      welcomeMessage: v.optional(v.string()),
      publicReviewLabel: v.optional(v.string()),
      publicReviewDescription: v.optional(v.string()),
      publicReviewDesc: v.optional(v.string()),
      privateFeedbackLabel: v.optional(v.string()),
      privateFeedbackDescription: v.optional(v.string()),
      privateFeedbackDesc: v.optional(v.string()),
      promoEnabled: v.optional(v.boolean()),
      promoText: v.optional(v.string()),
      whatsappEnabled: v.optional(v.boolean()),
      whatsappMessage: v.optional(v.string()),
      lowRatingShowPublicOption: v.optional(v.boolean()),
      lowRatingOptionsHeading: v.optional(v.string()),
      lowRatingOptionsSubtitle: v.optional(v.string()),
      lowRatingPrivateLabel: v.optional(v.string()),
      lowRatingPrivateDesc: v.optional(v.string()),
      lowRatingPublicLabel: v.optional(v.string()),
      lowRatingPublicDesc: v.optional(v.string()),
      lowRatingFeedbackHeading: v.optional(v.string()),
      facebookReviewUrl: v.optional(v.string()),
      tripadvisorReviewUrl: v.optional(v.string()),
      trustpilotReviewUrl: v.optional(v.string()),
    })
      .index("by_userId", ["userId"])
      .index("by_slug", ["slug"]),

    // Subscriptions
    subscriptions: defineTable({
      userId: v.string(),
      plan: v.string(),
      status: v.string(),
      expiresAt: v.number(),
      proExpiresAt: v.optional(v.number()),
      createdAt: v.number(),
      approvedBy: v.optional(v.string()),
      approvedAt: v.optional(v.number()),
    }).index("by_userId", ["userId"]),

    // Private feedback submissions (primary table)
    feedbacks: defineTable({
      businessId: v.string(),
      businessSlug: v.string(),
      clientEmail: v.string(),
      businessName: v.string(),
      customerName: v.string(),
      customerPhone: v.optional(v.string()),
      customerEmail: v.optional(v.string()),
      feedbackMessage: v.string(),
      rating: v.number(),
      staffId: v.optional(v.string()),
      staffName: v.optional(v.string()),
      status: v.string(),
      submittedAt: v.number(),
    })
      .index("by_businessId", ["businessId"])
      .index("by_status", ["status"])
      .index("by_submittedAt", ["submittedAt"]),

    // Feedback alias (used by some admin/analytics queries)
    feedback: defineTable({
      businessId: v.string(),
      businessSlug: v.string(),
      clientEmail: v.string(),
      businessName: v.string(),
      customerName: v.string(),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      message: v.optional(v.string()),
      customerPhone: v.optional(v.string()),
      customerEmail: v.optional(v.string()),
      feedbackMessage: v.string(),
      rating: v.number(),
      staffId: v.optional(v.string()),
      staffName: v.optional(v.string()),
      status: v.string(),
      submittedAt: v.number(),
      createdAt: v.number(),
    })
      .index("by_businessId", ["businessId"])
      .index("by_status", ["status"]),

    // Review interactions (star clicks, redirects)
    interactions: defineTable({
      businessId: v.string(),
      businessSlug: v.string(),
      rating: v.number(),
      action: v.optional(v.string()),
      type: v.string(),
      staffId: v.optional(v.string()),
      staffName: v.optional(v.string()),
      timestamp: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_businessId", ["businessId", "createdAt"])
      .index("by_staffId", ["staffId"])
      .index("by_timestamp", ["timestamp"])
      .index("by_slug", ["businessSlug"]),

    payments: defineTable({
      userId: v.string(),
      plan: v.string(),
      amount: v.optional(v.number()),
      currency: v.optional(v.string()),
      paymentMethod: v.optional(v.string()),
      transactionId: v.optional(v.string()),
      trxId: v.optional(v.string()),
      clientEmail: v.optional(v.string()),
      gateway: v.optional(v.string()),
      senderPhone: v.optional(v.string()),
      setupFee: v.optional(v.number()),
      rejectionReason: v.optional(v.string()),
      status: v.string(),
      submittedAt: v.number(),
      reviewedBy: v.optional(v.string()),
      reviewedAt: v.optional(v.number()),
    })
      .index("by_userId", ["userId"])
      .index("by_status", ["status"]),

    // Notifications
    notifications: defineTable({
      type: v.string(),
      title: v.string(),
      message: v.string(),
      targetUserId: v.optional(v.string()),
      read: v.boolean(),
      createdAt: v.number(),
      actionUrl: v.optional(v.string()),
    })
      .index("by_targetUser", ["targetUserId", "read"])
      .index("by_type", ["type"]),

    // Announcements (admin broadcast)
    announcements: defineTable({
      title: v.string(),
      message: v.string(),
      active: v.boolean(),
      createdBy: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_active", ["active"]),

    // Audit logs
    auditLogs: defineTable({
      adminEmail: v.optional(v.string()),
      action: v.string(),
      targetUser: v.optional(v.string()),
      targetEmail: v.optional(v.string()),
      details: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_createdAt", ["createdAt"]),

    // Staff sub-accounts
    staffAccounts: defineTable({
      ownerId: v.string(),
      staffEmail: v.string(),
      staffName: v.optional(v.string()),
      status: v.string(),
      createdAt: v.number(),
    })
      .index("by_ownerId", ["ownerId"])
      .index("by_staffEmail", ["staffEmail"]),

    // Staff members for attribution & leaderboard
    staffMembers: defineTable({
      businessId: v.string(),
      name: v.string(),
      slug: v.string(),
      role: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      createdAt: v.number(),
      active: v.boolean(),
    })
      .index("by_businessId", ["businessId"])
      .index("by_slug", ["slug"]),

    // Demo links (7-day expiry)
    demos: defineTable({
      slug: v.string(),
      businessName: v.string(),
      reviewUrl: v.string(),
      logoUrl: v.optional(v.string()),
      createdBy: v.string(),
      createdAt: v.number(),
      expiresAt: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_createdAt", ["createdAt"]),

    // System-wide settings
    systemSettings: defineTable({
      key: v.string(),
      value: v.string(),
      updatedAt: v.number(),
      updatedBy: v.optional(v.string()),
    })
      .index("by_key", ["key"]),
  },
  {
    schemaValidation: false,
  },
);
