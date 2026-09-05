import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Auth tables matching the exact structure expected by @convex-dev/auth v0.0.95.
 *
 * IMPORTANT: The library hardcodes these index names:
 *   authAccounts → "providerAndAccountId" on ["provider", "providerAccountId"]
 *   authAccounts → "userIdAndProvider" on ["userId", "provider"]
 *   authSessions → "userId" on ["userId"]
 *   authVerificationCodes → "accountId" on ["accountId"], "code" on ["code"]
 *   authVerifiers → "signature" on ["signature"]
 *   authRateLimits → "identifier" on ["identifier"]
 *   authRefreshTokens → "sessionId" on ["sessionId"]
 *
 * We do NOT spread authTables because the deployed backend already has
 * authAccounts with "by_provider" index, and Convex rejects duplicate
 * index field sets. Instead we define each table manually with the
 * library-expected index names.
 */
export default defineSchema(
  {
    // ═══════════════════════════════════════════════════════════════════
    // Users — extended with app-specific fields beyond what auth needs
    // ═══════════════════════════════════════════════════════════════════
    users: defineTable({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      image: v.optional(v.string()),
      // Library fields
      emailVerificationTime: v.optional(v.number()),
      phone: v.optional(v.string()),
      phoneVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      // App-specific fields
      tokenIdentifier: v.optional(v.string()),
      emailVerified: v.optional(v.boolean()),
      onboardingDone: v.optional(v.boolean()),
      onboardingCompleted: v.optional(v.boolean()),
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
    })
      .index("email", ["email"])
      .index("phone", ["phone"])
      .index("by_token", ["tokenIdentifier"]),

    // ═══════════════════════════════════════════════════════════════════
    // Auth Accounts — uses library-expected index names
    // ═══════════════════════════════════════════════════════════════════
    authAccounts: defineTable({
      userId: v.id("users"),
      provider: v.string(),
      providerAccountId: v.string(),
      secret: v.optional(v.string()),
      emailVerified: v.optional(v.string()),
      phoneVerified: v.optional(v.string()),
    })
      .index("userIdAndProvider", ["userId", "provider"])
      .index("providerAndAccountId", ["provider", "providerAccountId"]),

    // ═══════════════════════════════════════════════════════════════════
    // Auth Sessions
    // ═══════════════════════════════════════════════════════════════════
    authSessions: defineTable({
      userId: v.id("users"),
      expirationTime: v.number(),
    }).index("userId", ["userId"]),

    // ═══════════════════════════════════════════════════════════════════
    // Auth Refresh Tokens
    // ═══════════════════════════════════════════════════════════════════
    authRefreshTokens: defineTable({
      sessionId: v.id("authSessions"),
      expirationTime: v.number(),
      firstUsedTime: v.optional(v.number()),
      parentRefreshTokenId: v.optional(v.id("authRefreshTokens")),
    })
      .index("sessionId", ["sessionId"])
      .index("sessionIdAndParentRefreshTokenId", [
        "sessionId",
        "parentRefreshTokenId",
      ]),

    // ═══════════════════════════════════════════════════════════════════
    // Auth Verification Codes (OTP, magic link, OAuth codes)
    // ═══════════════════════════════════════════════════════════════════
    authVerificationCodes: defineTable({
      accountId: v.id("authAccounts"),
      provider: v.string(),
      code: v.string(),
      expirationTime: v.number(),
      verifier: v.optional(v.string()),
      emailVerified: v.optional(v.string()),
      phoneVerified: v.optional(v.string()),
    })
      .index("accountId", ["accountId"])
      .index("code", ["code"]),

    // ═══════════════════════════════════════════════════════════════════
    // Auth Verifiers (PKCE for OAuth)
    // ═══════════════════════════════════════════════════════════════════
    authVerifiers: defineTable({
      sessionId: v.optional(v.id("authSessions")),
      signature: v.optional(v.string()),
    }).index("signature", ["signature"]),

    // ═══════════════════════════════════════════════════════════════════
    // Auth Rate Limits (OTP + password throttling)
    // ═══════════════════════════════════════════════════════════════════
    authRateLimits: defineTable({
      identifier: v.string(),
      lastAttemptTime: v.number(),
      attemptsLeft: v.number(),
    }).index("identifier", ["identifier"]),

    // ═══════════════════════════════════════════════════════════════════
    // App Tables
    // ═══════════════════════════════════════════════════════════════════

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

    announcements: defineTable({
      title: v.string(),
      message: v.string(),
      active: v.boolean(),
      createdBy: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_active", ["active"]),

    auditLogs: defineTable({
      adminEmail: v.optional(v.string()),
      action: v.string(),
      targetUser: v.optional(v.string()),
      targetEmail: v.optional(v.string()),
      details: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_createdAt", ["createdAt"]),

    staffAccounts: defineTable({
      ownerId: v.string(),
      staffEmail: v.string(),
      staffName: v.optional(v.string()),
      status: v.string(),
      createdAt: v.number(),
    })
      .index("by_ownerId", ["ownerId"])
      .index("by_staffEmail", ["staffEmail"]),

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

    systemSettings: defineTable({
      key: v.string(),
      value: v.string(),
      updatedAt: v.number(),
      updatedBy: v.optional(v.string()),
    }).index("by_key", ["key"]),
  },
  {
    schemaValidation: false,
  },
);
