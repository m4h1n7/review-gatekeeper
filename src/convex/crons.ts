import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Daily subscription expiry sweep (03:00 UTC).
 * Flips every "active" subscription whose expiresAt has passed to "expired"
 * and marks its business profiles inactive, so /review/:slug and dashboards
 * reflect expiry without waiting for a client to open the page.
 */
crons.daily(
  "subscription expiry sweep",
  { hourUTC: 3, minuteUTC: 0 },
  internal.subscriptions.expireSubscriptions,
);

export default crons;
