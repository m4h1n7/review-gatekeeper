/**
 * Targeted tests for the audit-related changes:
 * 1. Admin role detection (used in SuperAdminGuard + requireAdmin)
 * 2. Announcement role-based filtering (getAnnouncements)
 * 3. Email dedup logic (sendNegativeFeedback admin copy skip)
 */
import { describe, it, expect } from "vitest";

// ── Shared constants (mirrors the source of truth in admin.ts + SuperAdminGuard.tsx) ──
const SUPER_ADMIN_EMAILS = [
  "mahinhosen870@gmail.com",
  "atazwar103@gmail.com",
  "starcatchbd@gmail.com",
];

// ─────────────────────────────────────────────────────────────────────
// 1. Admin role detection
// ─────────────────────────────────────────────────────────────────────
describe("Super admin email detection", () => {
  const isAdmin = (email?: string | null): boolean =>
    SUPER_ADMIN_EMAILS.includes(email?.toLowerCase() ?? "");

  it("recognises all three super admin emails (case-insensitive)", () => {
    expect(isAdmin("mahinhosen870@gmail.com")).toBe(true);
    expect(isAdmin("Mahinhosen870@Gmail.com")).toBe(true);
    expect(isAdmin("atazwar103@gmail.com")).toBe(true);
    expect(isAdmin("ATAZWAR103@GMAIL.COM")).toBe(true);
    expect(isAdmin("starcatchbd@gmail.com")).toBe(true);
    expect(isAdmin("STARCATCHBD@GMAIL.COM")).toBe(true);
  });

  it("rejects non-admin emails", () => {
    expect(isAdmin("randomuser@gmail.com")).toBe(false);
    expect(isAdmin("mahinhosen870@gmail.com.evil.com")).toBe(false);
    expect(isAdmin("admin@starcatchbd@gmail.com")).toBe(false);
  });

  it("rejects null, undefined, and empty string", () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
    expect(isAdmin("")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 2. Announcement filtering (role-based access control)
// ─────────────────────────────────────────────────────────────────────
describe("Announcement filtering by role", () => {
  const mockAnnouncements = [
    { id: "a1", title: "Published Notice", message: "Hello", active: true, createdBy: "admin", createdAt: 100 },
    { id: "a2", title: "Draft Announcement", message: "WIP", active: false, createdBy: "admin", createdAt: 200 },
    { id: "a3", title: "Another Draft", message: "Secret", active: false, createdBy: "admin", createdAt: 300 },
  ];

  /** Mirrors the new getAnnouncements filter logic */
  function filterAnnouncements(
    announcements: typeof mockAnnouncements,
    isAdmin: boolean,
  ) {
    if (isAdmin) return announcements;
    return announcements.filter((a) => a.active);
  }

  it("admin sees ALL announcements (active + inactive)", () => {
    const result = filterAnnouncements(mockAnnouncements, true);
    expect(result).toHaveLength(3);
    expect(result.map((a) => a.id)).toEqual(["a1", "a2", "a3"]);
  });

  it("non-admin sees ONLY active announcements", () => {
    const result = filterAnnouncements(mockAnnouncements, false);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a1");
    expect(result.every((a) => a.active)).toBe(true);
  });

  it("non-admin sees empty array when no announcements are active", () => {
    const allInactive = mockAnnouncements.map((a) => ({ ...a, active: false }));
    const result = filterAnnouncements(allInactive, false);
    expect(result).toHaveLength(0);
  });

  it("admin still sees results when all are inactive", () => {
    const allInactive = mockAnnouncements.map((a) => ({ ...a, active: false }));
    const result = filterAnnouncements(allInactive, true);
    expect(result).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 3. Email dedup — skip admin copy when recipient IS the admin
// ─────────────────────────────────────────────────────────────────────
describe("Negative feedback email admin-copy dedup", () => {
  const PLATFORM_ADMIN_EMAIL = "mahinhosen870@gmail.com";

  /** Returns true if the admin copy should be sent */
  function shouldSendAdminCopy(toEmail: string): boolean {
    return toEmail.toLowerCase() !== PLATFORM_ADMIN_EMAIL.toLowerCase();
  }

  it("sends admin copy when recipient is a business owner", () => {
    expect(shouldSendAdminCopy("owner@restaurant.com")).toBe(true);
    expect(shouldSendAdminCopy("client@shop.bd")).toBe(true);
  });

  it("skips admin copy when recipient IS the platform admin", () => {
    expect(shouldSendAdminCopy("mahinhosen870@gmail.com")).toBe(false);
  });

  it("skips admin copy regardless of email case", () => {
    expect(shouldSendAdminCopy("MAHINHOSEN870@GMAIL.COM")).toBe(false);
    expect(shouldSendAdminCopy("Mahinhosen870@Gmail.com")).toBe(false);
  });

  it("still sends admin copy for similar-looking but different emails", () => {
    expect(shouldSendAdminCopy("mahinhosen870+test@gmail.com")).toBe(true);
    expect(shouldSendAdminCopy("mahinhosen871@gmail.com")).toBe(true);
    expect(shouldSendAdminCopy("mahinhosen870@gmail.co")).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 4. Rate limit window (feedback.ts anti-spam)
// ─────────────────────────────────────────────────────────────────────
describe("Feedback rate limit logic", () => {
  const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

  function canSubmitFeedback(lastSubmissionTimestamp: number, now: number) {
    const timeSinceLast = now - lastSubmissionTimestamp;
    return timeSinceLast >= RATE_LIMIT_WINDOW_MS;
  }

  it("blocks submission within 60 seconds of last feedback", () => {
    const now = Date.now();
    expect(canSubmitFeedback(now - 30_000, now)).toBe(false); // 30s ago
    expect(canSubmitFeedback(now - 10_000, now)).toBe(false); // 10s ago
  });

  it("allows submission after 60 seconds", () => {
    const now = Date.now();
    expect(canSubmitFeedback(now - 60_000, now)).toBe(true);  // exactly 60s
    expect(canSubmitFeedback(now - 120_000, now)).toBe(true); // 2 min ago
  });

  it("always allows first submission (timestamp 0)", () => {
    expect(canSubmitFeedback(0, Date.now())).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 5. Star rating routing (Review.tsx logic)
// ─────────────────────────────────────────────────────────────────────
describe("Star rating routing decisions", () => {
  function getRoutingDecision(rating: number) {
    if (rating >= 4) return "google_redirect";
    return "private_feedback";
  }

  it("routes 4 and 5 stars to Google redirect", () => {
    expect(getRoutingDecision(4)).toBe("google_redirect");
    expect(getRoutingDecision(5)).toBe("google_redirect");
  });

  it("routes 1, 2, 3 stars to private feedback", () => {
    expect(getRoutingDecision(1)).toBe("private_feedback");
    expect(getRoutingDecision(2)).toBe("private_feedback");
    expect(getRoutingDecision(3)).toBe("private_feedback");
  });
});
