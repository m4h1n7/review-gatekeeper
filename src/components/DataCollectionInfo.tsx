import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, User, Building2, MessageSquare, Activity, CreditCard,
  Users, Bell, X, Ban, ChevronDown, ListChecks,
} from "lucide-react";

/**
 * "What User Data We Collect" — a single source of truth for data transparency.
 *
 * Every entry below was taken directly from the Convex schema (src/convex/schema.ts)
 * and the mutations that write to it (feedback.ts, users.ts, payments.ts, staff.ts),
 * so the list cannot drift into describing fields the app does not store.
 *
 * Deliberately includes a `NOT collected` section: transparency is as much about
 * what we do NOT hold as what we do.
 */

export interface DataPoint {
  item: string;
  fields: string[];
  purpose: string;
  whoSees: string;
  retention: string;
}

export interface DataCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  summary: string;
  points: DataPoint[];
}

const ACCENT = "#16A34A";

export const DATA_CATEGORIES: DataCategory[] = [
  {
    id: "account",
    title: "Account & Authentication",
    icon: <User className="w-4 h-4" />,
    summary:
      "Collected only when you create an account, so we can identify you and keep your account secure.",
    points: [
      {
        item: "Name",
        fields: ["users.name"],
        purpose: "Personalises your dashboard, review pages and email notifications.",
        whoSees: "You; STAR CATCH staff supporting your account",
        retention: "Life of your account, then deleted within 30 days of closure",
      },
      {
        item: "Email address",
        fields: ["users.email", "authVerificationCodes.emailVerified"],
        purpose: "Sign-in, password reset, one-time verification codes, and account alerts.",
        whoSees: "You; our email delivery providers (Resend / Gmail SMTP)",
        retention: "Life of your account",
      },
      {
        item: "Phone number (optional)",
        fields: ["users.phone", "users.phoneVerificationTime"],
        purpose: "Optional. Used for WhatsApp support and, for businesses, for customer alerts.",
        whoSees: "You; STAR CATCH staff",
        retention: "Life of your account",
      },
      {
        item: "Password (as a salted hash)",
        fields: ["authAccounts.secret"],
        purpose: "Verifies it is you when you sign in. We never store or can read your password.",
        whoSees: "Nobody — it is one-way hashed before storage",
        retention: "Until you change it or close your account",
      },
      {
        item: "Session & refresh tokens",
        fields: ["authSessions.expirationTime", "authRefreshTokens"],
        purpose: "Keeps you signed in and lets you revoke access by signing out.",
        whoSees: "Your browser and our auth system only",
        retention: "Expire automatically on a rolling schedule",
      },
      {
        item: "OAuth verifier signatures",
        fields: ["authVerifiers.signature"],
        purpose:
          "A short-lived PKCE signature that stops another site from replaying your sign-in. Created only if you sign in with a Google or other external account.",
        whoSees: "Our auth system only",
        retention: "Deleted as soon as the sign-in completes",
      },
      {
        item: "One-time verification & reset codes",
        fields: ["users.signupOtp", "users.resetOtp", "authVerificationCodes.code"],
        purpose: "Confirms you own the email address and secures password resets.",
        whoSees: "You (emailed) and our verification system",
        retention: "Single-use and cleared after use; codes expire after 15 minutes",
      },
      {
        item: "Login rate-limiting counters",
        fields: ["authRateLimits.attemptsLeft", "authRateLimits.lastAttemptTime"],
        purpose: "Slows down brute-force password and OTP guessing.",
        whoSees: "Our systems only — never shown to you or anyone else",
        retention: "Short-lived; reset as time passes",
      },
      {
        item: "Account status & role",
        fields: ["users.role", "users.accountStatus", "users.emailVerified", "users.onboardingCompleted", "users.hasUsedTrial"],
        purpose: "Controls which features you can access and enforces trial and plan limits.",
        whoSees: "You and authorised administrators",
        retention: "Life of your account",
      },
      {
        item: "Suspension & archive records",
        fields: ["users.suspendedReason", "users.suspendedBy", "users.archivedAt"],
        purpose: "Records why an account was restricted, for accountability and appeals.",
        whoSees: "You and administrators",
        retention: "Retained while the restriction stands, then reviewed",
      },
    ],
  },
  {
    id: "business",
    title: "Business Profile & Branding",
    icon: <Building2 className="w-4 h-4" />,
    summary:
      "The public-facing details you configure so we can generate your QR codes, NFC cards and review pages.",
    points: [
      {
        item: "Business name & category",
        fields: ["businesses.name", "businesses.businessName", "businesses.category"],
        purpose: "Displayed on your review page and used to label your feedback inbox.",
        whoSees: "Public — any customer who scans your code",
        retention: "Life of your account",
      },
      {
        item: "Custom URL slug",
        fields: ["businesses.slug"],
        purpose: "The short link customers open, e.g. /review/your-shop.",
        whoSees: "Public",
        retention: "Life of your account",
      },
      {
        item: "Logo & hero images",
        fields: ["businesses.logoUrl", "businesses.logoStorageId", "businesses.heroUrl"],
        purpose: "Branding your QR code, NFC card and review page.",
        whoSees: "Public",
        retention: "Life of your account",
      },
      {
        item: "Google & other review links",
        fields: ["businesses.reviewUrl", "businesses.facebookReviewUrl", "businesses.tripadvisorReviewUrl", "businesses.trustpilotReviewUrl"],
        purpose: "Where satisfied customers (4-5 stars) are sent to leave a public review.",
        whoSees: "Public; the destination platform receives the visitor's own data under its own policy",
        retention: "Life of your account",
      },
      {
        item: "Notification contact details",
        fields: ["businesses.alertEmail", "businesses.clientEmail", "businesses.alertPhone"],
        purpose: "Sends you a new-feedback alert and identifies whose feedback is whose.",
        whoSees: "You; our email provider",
        retention: "Life of your account",
      },
      {
        item: "Custom text & appearance settings",
        fields: ["businesses.customHeading", "businesses.brandColor", "businesses.thankYouMessage", "businesses.privateFeedbackLabel", "…"],
        purpose: "Lets you word and style the prompts your customers see.",
        whoSees: "Public, as displayed on your review page",
        retention: "Life of your account",
      },
    ],
  },
  {
    id: "subscription",
    title: "Subscription & Plan Status",
    icon: <CreditCard className="w-4 h-4" />,
    summary: "Tracks which plan you are on and when paid access expires.",
    points: [
      {
        item: "Plan, status and expiry dates",
        fields: ["subscriptions.plan", "subscriptions.status", "subscriptions.expiresAt", "subscriptions.proExpiresAt"],
        purpose: "Grants or removes paid features and drives the renewal reminder.",
        whoSees: "You and administrators",
        retention: "Life of your account",
      },
      {
        item: "Activation approval trail",
        fields: ["subscriptions.approvedBy", "subscriptions.approvedAt", "businesses.trialEndsAt"],
        purpose: "Records who authorised your plan and when, for billing disputes.",
        whoSees: "You and administrators",
        retention: "Retained as an accounting record",
      },
    ],
  },
  {
    id: "feedback",
    title: "Customer Feedback You Receive",
    icon: <MessageSquare className="w-4 h-4" />,
    summary:
      "Submitted by your end customers through your gatekeeper — the single most sensitive category we hold.",
    points: [
      {
        item: "Customer name",
        fields: ["feedback.customerName", "feedbacks.customerName"],
        purpose: "Lets you follow up on a complaint. Optional — defaults to 'Anonymous Customer'.",
        whoSees: "Only the business that owns the gatekeeper it was submitted through",
        retention: "Until you delete it or your account closes",
      },
      {
        item: "Customer phone number",
        fields: ["feedback.customerPhone", "feedbacks.customerPhone"],
        purpose: "So you can call the customer back about their issue. Optional.",
        whoSees: "Only the business that owns that gatekeeper",
        retention: "Until you delete it or your account closes",
      },
      {
        item: "Customer email address",
        fields: ["feedback.customerEmail", "feedbacks.customerEmail"],
        purpose: "So you can reply in writing. Optional.",
        whoSees: "Only the business that owns that gatekeeper",
        retention: "Until you delete it or your account closes",
      },
      {
        item: "Feedback message",
        fields: ["feedback.feedbackMessage", "feedbacks.feedbackMessage"],
        purpose: "The actual complaint or comment the customer wrote.",
        whoSees: "Only the business that owns that gatekeeper",
        retention: "Until you delete it or your account closes",
      },
      {
        item: "Star rating",
        fields: ["feedback.rating"],
        purpose: "Routes 1-3 star ratings to your private inbox and 4-5 stars to Google.",
        whoSees: "The owning business (aggregated counts also shown to its staff)",
        retention: "Until you delete it or your account closes",
      },
      {
        item: "Timestamps & status",
        fields: ["feedback.submittedAt", "feedback.status"],
        purpose: "Lets you triage and mark feedback as resolved.",
        whoSees: "The owning business",
        retention: "Until you delete it or your account closes",
      },
    ],
  },
  {
    id: "interactions",
    title: "Activity & Analytics Logs",
    icon: <Activity className="w-4 h-4" />,
    summary:
      "Anonymous usage events that power your dashboard. These contain no name, email or phone number.",
    points: [
      {
        item: "QR / NFC scan count",
        fields: ["interactions.type = 'scan'", "interactions.businessId"],
        purpose: "Counts how many customers opened your review page.",
        whoSees: "The owning business, as a number",
        retention: "Duration of your subscription, then aggregated and anonymised",
      },
      {
        item: "Google redirect events",
        fields: ["interactions.type = 'redirect'"],
        purpose: "Records that a satisfied customer chose to go to Google — a count only.",
        whoSees: "The owning business, as a number",
        retention: "Duration of your subscription",
      },
      {
        item: "Public review intent",
        fields: ["interactions.type = 'public_review'"],
        purpose: "Records that a customer opted to leave a public review. The review text itself is never sent to us.",
        whoSees: "The owning business, as a number",
        retention: "Duration of your subscription",
      },
      {
        item: "Feedback submitted events",
        fields: ["interactions.type = 'feedback_submitted'"],
        purpose: "Counts private feedback submissions for your dashboard.",
        whoSees: "The owning business, as a number",
        retention: "Duration of your subscription",
      },
      {
        item: "Staff attribution on events",
        fields: ["interactions.staffId", "interactions.staffName"],
        purpose: "Credits a scan or review to the staff member whose QR link was used.",
        whoSees: "The owning business and its staff",
        retention: "Duration of your subscription",
      },
      {
        item: "Per-session scan token",
        fields: ["interactions.sessionKey"],
        purpose:
          "A random ID in your browser that stops one customer being counted twice from reloads or double-taps on the same day.",
        whoSees: "Our systems only — it is not linked to you as a person",
        retention: "Expires with your browser session",
      },
    ],
  },
  {
    id: "payments",
    title: "Payment Records",
    icon: <CreditCard className="w-4 h-4" />,
    summary: "Manual bKash / Nagad verification. We never see or store full card numbers.",
    points: [
      {
        item: "Sender mobile number",
        fields: ["payments.senderPhone"],
        purpose: "So our admin can match your payment to your bKash or Nagad account.",
        whoSees: "You and the reviewing administrator",
        retention: "Retained as an accounting record",
      },
      {
        item: "Transaction ID (TrxID)",
        fields: ["payments.trxId", "payments.transactionId"],
        purpose: "Matches your claim to the money that actually arrived.",
        whoSees: "You and the reviewing administrator",
        retention: "Retained as an accounting record",
      },
      {
        item: "Amount, currency & gateway",
        fields: ["payments.amount", "payments.currency", "payments.gateway", "payments.setupFee"],
        purpose: "Confirms the correct plan was activated and the right amount paid.",
        whoSees: "You and the reviewing administrator",
        retention: "Retained as an accounting record",
      },
      {
        item: "Review outcome",
        fields: ["payments.status", "payments.rejectionReason", "payments.reviewedBy"],
        purpose: "Explains why a payment was approved or declined.",
        whoSees: "You and the reviewing administrator",
        retention: "Retained as an accounting record",
      },
    ],
  },
  {
    id: "staff",
    title: "Staff Accounts & Members",
    icon: <Users className="w-4 h-4" />,
    summary: "Only if you run a Pro plan and choose to add staff.",
    points: [
      {
        item: "Staff login email & password",
        fields: ["staffAccounts.staffEmail", "authAccounts.secret"],
        purpose: "Lets staff sign in to a scoped view of your dashboard.",
        whoSees: "That staff member; they cannot see billing or account credentials",
        retention: "Until you remove the staff account",
      },
      {
        item: "Staff display name & status",
        fields: ["staffAccounts.staffName", "staffAccounts.status"],
        purpose: "Labels the staff member on the attribution leaderboard.",
        whoSees: "You and your other staff",
        retention: "Until you remove the staff account",
      },
      {
        item: "Staff member name & role",
        fields: ["staffMembers.name", "staffMembers.role", "staffMembers.email", "staffMembers.phone"],
        purpose: "Creates their personal QR link so scans can be credited to them.",
        whoSees: "You and your staff",
        retention: "Until you remove the staff member",
      },
    ],
  },
  {
    id: "ops",
    title: "Operational Records",
    icon: <Bell className="w-4 h-4" />,
    summary: "Internal records we keep to run and protect the service.",
    points: [
      {
        item: "In-app notifications",
        fields: ["notifications.title", "notifications.message"],
        purpose: "Shows you subscription and account alerts in your dashboard.",
        whoSees: "You (the addressed recipient)",
        retention: "Until dismissed or your account closes",
      },
      {
        item: "Platform announcements",
        fields: ["announcements.title", "announcements.message"],
        purpose: "Service notices shown to all signed-in users.",
        whoSees: "All signed-in users",
        retention: "Until withdrawn",
      },
      {
        item: "Administrative audit log",
        fields: ["auditLogs.adminEmail", "auditLogs.action", "auditLogs.details"],
        purpose: "Records admin actions on accounts for accountability and dispute resolution.",
        whoSees: "Administrators only — never business customers",
        retention: "Retained as an internal compliance record",
      },
      {
        item: "Trial demo records",
        fields: ["demos.businessName", "demos.reviewUrl", "demos.expiresAt"],
        purpose: "Runs the public demo pages and expires them automatically.",
        whoSees: "Administrators; demo pages are public",
        retention: "Until the demo expires",
      },
      {
        item: "Platform settings",
        fields: ["systemSettings.key", "systemSettings.value"],
        purpose: "Global configuration such as feature flags. Contains no personal data about you.",
        whoSees: "Administrators only",
        retention: "Until superseded or removed",
      },
    ],
  },
];

export const NOT_COLLECTED: string[] = [
  "IP addresses — we never read or store your IP in the application",
  "Browser, device or operating-system fingerprints",
  "Precise or approximate location data",
  "Advertising or cross-site tracking cookies, pixels or beacons",
  "Your Google account, password, or the content of your public reviews",
  "Contact lists, message histories, or files from your device",
  "Biometric, health, financial-account or national ID data",
  "Data from anyone we know to be under 18",
];

const PILL = "text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/50 font-mono whitespace-nowrap";

function DataPointRow({ point }: { point: DataPoint }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <p className="text-sm font-semibold text-white">{point.item}</p>
      <div className="flex flex-wrap gap-1 mt-1.5 mb-2.5">
        {point.fields.map((f) => (
          <code key={f} className={PILL}>
            {f}
          </code>
        ))}
      </div>
      <dl className="space-y-1.5 text-[11px] leading-relaxed">
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-white/50 w-[52px]">Why</dt>
          <dd className="text-[#A1A1AA]">{point.purpose}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-white/50 w-[52px]">Who</dt>
          <dd className="text-[#A1A1AA]">{point.whoSees}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-white/50 w-[52px]">Kept</dt>
          <dd className="text-[#A1A1AA]">{point.retention}</dd>
        </div>
      </dl>
    </div>
  );
}

function CategoryBlock({ category }: { category: DataCategory }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5">
        <span className="w-7 h-7 rounded-lg bg-[#16A34A]/15 flex items-center justify-center shrink-0" style={{ color: ACCENT }}>
          {category.icon}
        </span>
        <div>
          <h4 className="text-sm font-semibold text-white">{category.title}</h4>
          <p className="text-[11px] text-[#A1A1AA] leading-relaxed mt-0.5">{category.summary}</p>
        </div>
      </div>
      <div className="space-y-2 pl-0 sm:pl-9">
        {category.points.map((p) => (
          <DataPointRow key={p.item} point={p} />
        ))}
      </div>
    </div>
  );
}

function NotCollectedBlock() {
  return (
    <div className="rounded-xl border border-[#16A34A]/25 bg-[#16A34A]/5 p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Ban className="w-4 h-4" style={{ color: ACCENT }} />
        <h4 className="text-sm font-semibold text-white">What we do NOT collect</h4>
      </div>
      <ul className="space-y-1.5">
        {NOT_COLLECTED.map((item) => (
          <li key={item} className="text-[11px] text-[#A1A1AA] leading-relaxed flex gap-2">
            <span style={{ color: ACCENT }} className="shrink-0">✕</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryAccordion({ category }: { category: DataCategory }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 p-3.5 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
      >
        <span className="w-7 h-7 rounded-lg bg-[#16A34A]/15 flex items-center justify-center shrink-0" style={{ color: ACCENT }}>
          {category.icon}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-white">{category.title}</span>
          <span className="block text-[11px] text-white/40">{category.points.length} data points</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 space-y-2">
          <p className="text-[11px] text-[#A1A1AA] leading-relaxed">{category.summary}</p>
          {category.points.map((p) => (
            <DataPointRow key={p.item} point={p} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Inline block for use inside a page (e.g. the Privacy Policy). */
export function DataCollectionBlock() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 rounded-xl border border-[#16A34A]/20 bg-[#16A34A]/5">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
        <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
          Every field below is read directly from our live database schema — this is the complete list,
          not a summary. Nothing is collected beyond what is written here.
        </p>
      </div>

      {DATA_CATEGORIES.map((c) => (
        <CategoryBlock key={c.id} category={c} />
      ))}

      <NotCollectedBlock />

      <p className="text-[11px] text-[#71717A] leading-relaxed">
        To access, correct, export or delete any of this data, email{" "}
        <a href="mailto:starcatchbd@gmail.com" className="text-[#16A34A] hover:underline">
          starcatchbd@gmail.com
        </a>{" "}
        with the subject line "Data Privacy Request". See our{" "}
        <a href="/privacy" className="text-[#16A34A] hover:underline">Privacy Policy</a> for the full process.
      </p>
    </div>
  );
}

/** Modal variant, opened from a button. */
export function DataCollectionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="data-collection-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative w-full sm:max-w-2xl max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#18181B]/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
          >
            <div className="sticky top-0 z-10 flex items-start gap-3 p-5 sm:p-6 pb-4 border-b border-white/[0.07] bg-[#18181B]/95 backdrop-blur-xl">
              <div className="w-9 h-9 rounded-xl bg-[#16A34A]/15 flex items-center justify-center shrink-0">
                <ListChecks className="w-4 h-4" style={{ color: ACCENT }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 id="data-collection-title" className="text-base font-semibold text-white">
                  What User Data We Collect
                </h2>
                <p className="text-xs text-[#A1A1AA] leading-relaxed mt-1">
                  Every data point we store, why we store it, who can see it, and how long we keep it.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close data collection details"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 pt-4 space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-[#16A34A]/20 bg-[#16A34A]/5">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  Straight answer: we collect what we need to run your review gatekeeper, and nothing more.
                  We never sell your data, and we never use it to advertise to you.
                </p>
              </div>

              {DATA_CATEGORIES.map((c) => (
                <CategoryAccordion key={c.id} category={c} />
              ))}

              <NotCollectedBlock />

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate("/privacy");
                  }}
                  className="flex-1 h-10 rounded-xl bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Read the full Privacy Policy
                </button>
                <a
                  href="mailto:starcatchbd@gmail.com?subject=Data%20Privacy%20Request"
                  className="flex-1 h-10 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-[#A1A1AA] hover:text-white text-xs font-medium flex items-center justify-center transition-colors"
                >
                  Request a copy of my data
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Footer-friendly trigger button that opens the modal. */
export function DataCollectionButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        What Data We Collect
      </button>
      <DataCollectionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
