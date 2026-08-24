import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      onboardingCompleted: v.optional(v.boolean()),
      emailVerified: v.optional(v.boolean()), // whether the user verified their email via OTP
      signupOtp: v.optional(v.string()), // 6-digit OTP for email verification
      signupOtpExpiry: v.optional(v.number()), // OTP expiry timestamp
    }).index("email", ["email"]), // index for the email. do not remove or modify

    businesses: defineTable({
      name: v.string(),
      slug: v.string(),
      logoUrl: v.string(),
      reviewUrl: v.string(),
      alertEmail: v.string(),
      category: v.optional(v.string()),
      phone: v.optional(v.string()),
      heroUrl: v.optional(v.string()),
      promoEnabled: v.optional(v.boolean()),
      promoText: v.optional(v.string()),
      createdAt: v.number(),
      userId: v.string(), // owner of this business profile
    })
      .index("by_slug", ["slug"])
      .index("by_createdAt", ["createdAt"])
      .index("by_userId", ["userId"]),

    feedback: defineTable({
      businessId: v.string(),
      businessSlug: v.string(),
      customerName: v.string(),
      phone: v.string(),
      email: v.string(),
      message: v.string(),
      rating: v.number(),
      createdAt: v.number(),
      status: v.union(v.literal("unresolved"), v.literal("resolved")),
    })
      .index("by_businessId", ["businessId"])
      .index("by_businessSlug", ["businessSlug"])
      .index("by_createdAt", ["createdAt"]),

    // Tracks every star click (both positive redirects and negative feedback)
    interactions: defineTable({
      businessId: v.string(),
      businessSlug: v.string(),
      rating: v.number(),
      type: v.union(v.literal("redirect"), v.literal("feedback_submitted")),
      createdAt: v.number(),
    })
      .index("by_businessId", ["businessId", "createdAt"])
      .index("by_businessSlug", ["businessSlug", "createdAt"])
      .index("by_createdAt", ["createdAt"]),

    // Manual payment submissions (bKash/Nagad)
    payments: defineTable({
      userId: v.string(),
      clientEmail: v.optional(v.string()),
      gateway: v.union(v.literal("bkash"), v.literal("nagad")),
      senderPhone: v.optional(v.string()),
      trxId: v.optional(v.string()),
      status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
      plan: v.optional(v.union(v.literal("starter"), v.literal("pro"))),
      setupFee: v.optional(v.number()),
      rejectionReason: v.optional(v.string()),
      submittedAt: v.number(),
      reviewedAt: v.optional(v.number()),
    })
      .index("by_status", ["status"])
      .index("by_userId", ["userId"]),

    // Subscription plans: pending payment or active pro
    subscriptions: defineTable({
      userId: v.string(),
      plan: v.union(v.literal("free"), v.literal("starter"), v.literal("pro")),
      status: v.union(v.literal("active"), v.literal("pending"), v.literal("cancelled")),
      createdAt: v.number(),
      expiresAt: v.optional(v.number()),
      proExpiresAt: v.optional(v.number()),
    })
      .index("by_userId", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
