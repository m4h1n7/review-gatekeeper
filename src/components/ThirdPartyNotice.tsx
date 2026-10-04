import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useModalKeyboard } from "@/hooks/useModalKeyboard";
import {
  ShieldCheck, Globe, Type, MessageCircle, Star, HelpCircle, Database,
  Mail, X, ExternalLink, AlertTriangle, CheckCircle2, Info, ListChecks,
} from "lucide-react";

/**
 * Third-party embeds audit + compliance notice.
 *
 * Every entry was verified against the source, not assumed:
 *  - `grep -rn '<iframe'`       -> zero iframes anywhere in the app
 *  - `grep -rn '<script src='`  -> zero third-party scripts
 *    (index.html's only <script> is the first-party module /src/main.tsx)
 *  - `grep -rn '<embed'`        -> zero
 *
 * Hosts referenced in source but deliberately NOT listed below, and why:
 *  - docs.convex.dev          -> appears only inside Convex's generated
 *                                .d.ts comment blocks; never fetched
 *  - example.com              -> placeholder text in input attributes
 *  - freebuff.com             -> the platform host that serves this app (first-party)
 *  - starcatchreviews.freebuff.app -> our own production origin (first-party)
 *  - www.aboutcookies.org     -> an informational link on the Cookie Policy page
 *
 * The most important finding: exactly ONE third party is contacted
 * automatically on page load (Google Fonts). Everything else happens only
 * when the visitor deliberately clicks a link.
 */

const ACCENT = "#16A34A";

type Sharing = "automatic" | "on-click" | "server-side";

export interface ThirdPartyService {
  id: string;
  name: string;
  vendor: string;
  icon: React.ReactNode;
  sharing: Sharing;
  /** Actual hostnames contacted, so the audit is verifiable against the code. */
  hosts: string[];
  /** Plain-English statement of what actually reaches this third party. */
  whatIsShared: string;
  when: string;
  privacyUrl: string;
  privacyLabel: string;
}

export const SHARING_LABEL: Record<Sharing, string> = {
  automatic: "Loads automatically",
  "on-click": "Only when you click",
  "server-side": "Server-side only",
};

const A = "automatic" as const;
const C = "on-click" as const;
const S = "server-side" as const;

export const THIRD_PARTY_SERVICES: ThirdPartyService[] = [
  {
    id: "google-fonts",
    name: "Poppins typeface (Google Fonts)",
    vendor: "Google LLC",
    icon: <Type className="w-4 h-4" />,
    sharing: A,
    hosts: ["fonts.googleapis.com", "fonts.gstatic.com"],
    whatIsShared:
      "Your IP address, browser user-agent, and the referring page — solely to download the font file. Nothing about your account, feedback, or business data is sent.",
    when:
      "Every page load, on every page of the Platform, before you interact with anything. This is the only automatic third-party connection we make.",
    privacyUrl: "https://policies.google.com/privacy",
    privacyLabel: "Google Privacy Policy",
  },
  {
    id: "google-reviews",
    name: "Google Business Profile & Reviews",
    vendor: "Google LLC",
    icon: <Star className="w-4 h-4" />,
    sharing: C,
    hosts: ["g.page", "maps.app.goo.gl", "google.com/maps"],
    whatIsShared:
      "The review text, star rating and your Google account details are entered on Google's own site. Google — not STAR CATCH — determines what it collects from that point, including your Google account identity.",
    when:
      "Only when a customer rates 4-5 stars and chooses to be redirected to leave a public review, or when a business owner opens their Google review link.",
    privacyUrl: "https://policies.google.com/privacy",
    privacyLabel: "Google Privacy Policy",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    vendor: "Meta Platforms, Inc.",
    icon: <MessageCircle className="w-4 h-4" />,
    sharing: C,
    hosts: ["wa.me", "api.whatsapp.com"],
    whatIsShared:
      "Your WhatsApp profile name, phone number, profile photo and whatever you type in the chat. We do not see or store the contents of your WhatsApp conversations.",
    when:
      "Only when you tap a WhatsApp button or link on our site. Our chat bubble is built by us and contains no Meta code — no data reaches Meta until you actually press send.",
    privacyUrl: "https://www.whatsapp.com/legal/privacy-policy",
    privacyLabel: "WhatsApp Privacy Policy",
  },
  {
    id: "google-support",
    name: "Google Business Profile Help Centre",
    vendor: "Google LLC",
    icon: <HelpCircle className="w-4 h-4" />,
    sharing: C,
    hosts: ["support.google.com"],
    whatIsShared:
      "Standard web-server logs such as your IP address and browser type, under Google's own policies.",
    when: "Only when you click through to Google's help documentation.",
    privacyUrl: "https://policies.google.com/privacy",
    privacyLabel: "Google Privacy Policy",
  },
  {
    id: "convex",
    name: "Database, authentication & file storage",
    vendor: "Convex, Inc.",
    icon: <Database className="w-4 h-4" />,
    sharing: S,
    hosts: ["*.convex.site"],
    whatIsShared:
      "All Platform data, including your account records and your customers' feedback, is stored on Convex infrastructure encrypted at rest.",
    when:
      "Every request the app makes to its own backend. This is our processor acting on our instructions under a data processing agreement — it never contacts you directly.",
    privacyUrl: "https://www.convex.dev/legal/privacy",
    privacyLabel: "Convex Privacy Policy",
  },
  {
    id: "resend",
    name: "Transactional email delivery",
    vendor: "Resend (Plus Five Five, Inc.)",
    icon: <Mail className="w-4 h-4" />,
    sharing: S,
    hosts: ["api.resend.com"],
    whatIsShared:
      "Your email address and the contents of messages we send you, such as verification codes, password resets and account alerts.",
    when: "Only when we send you an email. Sent from our server — never from your browser.",
    privacyUrl: "https://resend.com/legal/privacy-policy",
    privacyLabel: "Resend Privacy Policy",
  },
  {
    id: "gmail-smtp",
    name: "Fallback email delivery (SMTP)",
    vendor: "Google LLC (Gmail)",
    icon: <Mail className="w-4 h-4" />,
    sharing: S,
    hosts: ["smtp.gmail.com"],
    whatIsShared:
      "Your email address and message content, sent from a Gmail account over an encrypted connection.",
    when:
      "Only if primary email delivery fails, and only when we send you an email. We never store your Gmail password — an app password is used, held only in server configuration.",
    privacyUrl: "https://policies.google.com/privacy",
    privacyLabel: "Google Privacy Policy",
  },
];

/** Third-party tools deliberately NOT present — stated for completeness. */
export const NOT_USED = [
  "Google Analytics or any web analytics tracker",
  "Google Maps embedded map (no map iframe on any page)",
  "The Google Reviews / Places API embed",
  "Facebook Pixel, Meta tracking, or any advertising pixel",
  "The official WhatsApp Business chat widget (our bubble is custom-built and code-free)",
  "Hotjar, Microsoft Clarity, Segment, Mixpanel, PostHog, or Sentry",
  "Any advertising or cross-site remarketing cookie",
  "Any third-party script or iframe of any kind — our only auto-loading external asset is the Poppins webfont",
];

function ServiceCard({ service }: { service: ThirdPartyService }) {
  const isAutomatic = service.sharing === "automatic";
  return (
    <div
      className={`rounded-xl border p-4 ${
        isAutomatic
          ? "border-amber-500/25 bg-amber-500/[0.06]"
          : "border-white/[0.07] bg-white/[0.02]"
      }`}
    >
      <div className="flex items-start gap-2.5 mb-2.5">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{
            color: isAutomatic ? "#F59E0B" : ACCENT,
            backgroundColor: isAutomatic ? "rgba(245,158,11,0.15)" : "rgba(22,163,74,0.15)",
          }}
        >
          {service.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{service.name}</p>
          <p className="text-[11px] text-white/40">{service.vendor}</p>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-1 rounded-full shrink-0 whitespace-nowrap ${
            isAutomatic
              ? "bg-amber-500/15 text-amber-400"
              : service.sharing === C
                ? "bg-white/[0.06] text-white/50"
                : "bg-[#16A34A]/15 text-[#16A34A]"
          }`}
        >
          {SHARING_LABEL[service.sharing]}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-2.5">
        {service.hosts.map((hst) => (
          <code
            key={hst}
            className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/50 font-mono"
          >
            {hst}
          </code>
        ))}
      </div>

      <dl className="space-y-1.5 text-[11px] leading-relaxed">
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-white/50 w-[52px]">Shared</dt>
          <dd className="text-[#A1A1AA]">{service.whatIsShared}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="shrink-0 font-medium text-white/50 w-[52px]">When</dt>
          <dd className="text-[#A1A1AA]">{service.when}</dd>
        </div>
      </dl>

      <a
        href={service.privacyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 mt-2.5 text-[11px] text-[#16A34A] hover:underline"
      >
        {service.privacyLabel}
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

function ComplianceNotice() {
  return (
    <div className="rounded-xl border border-[#16A34A]/25 bg-[#16A34A]/5 p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
        <h4 className="text-sm font-semibold text-white">Compliance Notice</h4>
      </div>
      <div className="space-y-2.5 text-[11px] text-[#A1A1AA] leading-relaxed">
        <p>
          This Platform integrates with third-party tools that are operated by other companies, not by
          STAR CATCH. <strong className="text-white">When you interact with any of them, the data you
          share is handled by that third party under its own privacy policy and terms of service, which
          may differ from ours.</strong>
        </p>
        <p>
          Once you follow a link to Google, Meta/WhatsApp, or any other external service, you are on
          <strong className="text-white"> their</strong> website. From that moment we no longer control
          what is collected, and we do not receive a copy of it. Those providers may use the data for
          their own purposes, including advertising and profiling, under their own policies.
        </p>
        <p>
          We encourage you to read each provider's privacy policy before you interact with their tool.
          The links below take you to the current policy for each vendor.
        </p>
      </div>
    </div>
  );
}

function NotUsedBlock() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
        <h4 className="text-sm font-semibold text-white">What we deliberately do NOT embed</h4>
      </div>
      <ul className="space-y-1">
        {NOT_USED.map((item) => (
          <li key={item} className="text-[11px] text-[#A1A1AA] leading-relaxed flex gap-2">
            <span style={{ color: ACCENT }} className="shrink-0">✕</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Inline block for use inside a page. */
export function ThirdPartyBlock() {
  const automatic = THIRD_PARTY_SERVICES.filter((s) => s.sharing === "automatic");
  const onClick = THIRD_PARTY_SERVICES.filter((s) => s.sharing === "on-click");
  const serverSide = THIRD_PARTY_SERVICES.filter((s) => s.sharing === "server-side");

  return (
    <div className="space-y-6">
      <ComplianceNotice />

      {automatic.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                Connected automatically on every page load
              </h4>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed mt-0.5">
                These contact their vendor without you clicking anything. We are telling you plainly
                rather than burying it.
              </p>
            </div>
          </div>
          {automatic.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Globe className="w-4 h-4" style={{ color: ACCENT }} />
          Shared only when you choose to interact
        </h4>
        {onClick.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Database className="w-4 h-4" style={{ color: ACCENT }} />
          Our service providers (server-side, never in your browser)
        </h4>
        {serverSide.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>

      <NotUsedBlock />

      <p className="text-[11px] text-[#71717A] leading-relaxed">
        Questions about how a specific vendor handles your data should be directed to that vendor. For
        anything concerning STAR CATCH, email{" "}
        <a href="mailto:starcatchbd@gmail.com" className="text-[#16A34A] hover:underline">
          starcatchbd@gmail.com
        </a>{" "}
        or see our <a href="/privacy" className="text-[#16A34A] hover:underline">Privacy Policy</a>.
      </p>
    </div>
  );
}

/** Modal variant, opened from a button. */
export function ThirdPartyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Shared trap: Escape closes, focus enters the dialog, Tab/Shift+Tab cycle
  // inside it, and focus returns to the triggering footer button on close.
  useModalKeyboard(open, onClose, panelRef);

  const automaticCount = THIRD_PARTY_SERVICES.filter((s) => s.sharing === "automatic").length;

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
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="third-party-title"
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
                <h2 id="third-party-title" className="text-base font-semibold text-white">
                  Third-Party Embeds &amp; External Services
                </h2>
                <p className="text-xs text-[#A1A1AA] leading-relaxed mt-1">
                  Every third party connected to this Platform, and exactly what each one receives.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close third-party services list"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 pt-4 space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  We ran a full audit of the codebase. There are{" "}
                  <strong className="text-white">no iframes, no third-party scripts, and no tracking
                  pixels</strong> anywhere in this app. Of {THIRD_PARTY_SERVICES.length} third-party
                  connections, only{" "}
                  <strong className="text-white">{automaticCount}</strong> happens automatically —
                  everything else waits for you to click.
                </p>
              </div>

              <ThirdPartyBlock />

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/privacy");
                }}
                className="w-full h-10 rounded-xl bg-[#16A34A] hover:bg-[#16A34A]/90 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Read the full Privacy Policy
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Footer-friendly trigger button that opens the modal. */
export function ThirdPartyButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Third-Party Embeds
      </button>
      <ThirdPartyModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
