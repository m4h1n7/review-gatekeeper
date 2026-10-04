import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Star, ArrowLeft, CreditCard, Ban, Wrench, XCircle, CheckCircle2,
  Clock, Wallet, FileText, Scale, Mail, ShieldCheck, AlertTriangle,
} from "lucide-react";

const ACCENT = "#16A34A";
const CONTACT_EMAIL = "starcatchbd@gmail.com";
const WHATSAPP = "+880 1673-903919";

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}

function Section({ id, icon, title, children }: { id: string; icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2.5">
        {icon ? (
          <span className="w-7 h-7 rounded-lg bg-[#16A34A]/15 flex items-center justify-center shrink-0" style={{ color: ACCENT }}>
            {icon}
          </span>
        ) : null}
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc list-inside text-sm text-[#A1A1AA] leading-relaxed space-y-1.5 ml-4">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-white/[0.04]">
              {head.map((h, i) => (
                <th key={i} className="px-4 py-3 font-semibold text-white whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-white/5">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-[#A1A1AA] leading-relaxed align-top">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TOC = [
  { id: "overview", label: "1. Overview", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { id: "plans", label: "2. Plans & Pricing", icon: <CreditCard className="w-3.5 h-3.5" /> },
  { id: "non-refundable", label: "3. Non-Refundable Items", icon: <Ban className="w-3.5 h-3.5" /> },
  { id: "eligible", label: "4. Refund Eligibility", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { id: "ineligible", label: "5. Non-Eligible Claims", icon: <XCircle className="w-3.5 h-3.5" /> },
  { id: "pro-rata", label: "6. Pro-Rata Calculation", icon: <FileText className="w-3.5 h-3.5" /> },
  { id: "cancellation", label: "7. Cancellation Process", icon: <FileText className="w-3.5 h-3.5" /> },
  { id: "timeline", label: "8. Refund Processing Timeline", icon: <Clock className="w-3.5 h-3.5" /> },
  { id: "method", label: "9. Refund Method", icon: <Wallet className="w-3.5 h-3.5" /> },
  { id: "hardware", label: "10. Hardware Warranty", icon: <Wrench className="w-3.5 h-3.5" /> },
  { id: "renewal", label: "11. Auto-Renewal & Expiry", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { id: "chargebacks", label: "12. Disputes & Chargebacks", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { id: "law", label: "13. Governing Law", icon: <Scale className="w-3.5 h-3.5" /> },
  { id: "contact", label: "14. Contact", icon: <Mail className="w-3.5 h-3.5" /> },
];

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#16A34A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#16A34A]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>

      <nav className="relative z-20 px-4 sm:px-6 py-5 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center shadow-lg shadow-[#16A34A]/25">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-sm text-white tracking-wide">STAR CATCH</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#16A34A]/15 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Refund &amp; Cancellation Policy</h1>
            <p className="text-xs text-[#A1A1AA]">Last updated: October 4, 2026 &middot; Effective immediately</p>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { k: "Setup fees", v: "Non-refundable once provisioned" },
            { k: "Hardware", v: "Non-refundable once shipped" },
            { k: "7-day window", v: "Limited hardware replacement warranty" },
            { k: "30 days", v: "Full data retention after expiry" },
          ].map((item) => (
            <div key={item.k} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold text-white mb-1">{item.k}</p>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">{item.v}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">
          {/* Table of contents */}
          <aside className="hidden lg:block sticky top-6">
            <GlassPanel className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-3">Contents</p>
              <nav className="space-y-0.5">
                {TOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 text-[11px] text-[#A1A1AA] hover:text-white transition-colors py-1.5 px-2 rounded-md hover:bg-white/5"
                  >
                    <span style={{ color: ACCENT }} className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </GlassPanel>
          </aside>

          <GlassPanel className="p-6 sm:p-8 space-y-9">
            <Section id="overview" icon={<ShieldCheck className="w-4 h-4" />} title="1. Overview">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                This Refund &amp; Cancellation Policy ("this Policy") governs subscription payments, plan changes, cancellations, and refund eligibility for STAR CATCH Reviews and Feedback Agency Bd ("STAR CATCH", "we", "us"). It applies to all business clients who activate a subscription through our manual bKash or Nagad payment process.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Because STAR CATCH is a <strong className="text-white">B2B SaaS and hardware service</strong>, many fees are consumed on delivery and cannot be reversed. This Policy is designed to be fair and transparent about exactly which amounts are recoverable, on what conditions, and on what timeline. Please read it before submitting any payment. By submitting a payment, you acknowledge that you have read, understood, and accepted this Policy in its entirety.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                This Policy forms part of our <button onClick={() => navigate("/terms")} className="text-[#16A34A] hover:underline cursor-pointer">Terms of Service</button> and should be read together with our <button onClick={() => navigate("/privacy")} className="text-[#16A34A] hover:underline cursor-pointer">Privacy Policy</button>.
              </p>
            </Section>

            <Section id="plans" icon={<CreditCard className="w-4 h-4" />} title="2. Plans &amp; Pricing">
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
                Subscriptions run on <strong className="text-white">30-day billing periods</strong>, starting from the date your subscription is activated by the platform administrator.
              </p>
              <Table
                head={["Plan", "Setup fee", "Monthly", "Includes"]}
                rows={[
                  [
                    <strong className="text-white">Starter</strong>,
                    <>৳1,499 (one-time)</>,
                    <>৳1,499 / 30 days</>,
                    <>1 premium smart NFC card with QR code, private feedback filtering, basic analytics dashboard, real-time rating chart</>,
                  ],
                  [
                    <strong className="text-white">Business Pro</strong>,
                    <>৳1,699 (one-time)</>,
                    <>৳2,499 / 30 days</>,
                    <>2 premium smart NFC cards + 1 acrylic table standee, dynamic performance chart, WhatsApp message generator, custom customer offer banner, priority support, full analytics, staff &amp; QR attribution</>,
                  ],
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Payments are submitted manually via bKash or Nagad and activated after verification by the platform administrator. A subscription is considered <strong className="text-white">active from the activation date</strong>, not the date you sent the payment.
              </p>
            </Section>

            <Section id="non-refundable" icon={<Ban className="w-4 h-4" />} title="3. Non-Refundable Items &amp; Services">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
                <p className="text-sm text-[#A1A1AA] leading-relaxed">
                  <strong className="text-white">The following are strictly non-refundable once consumed, as permitted for digitally delivered services under applicable law of Bangladesh.</strong>
                </p>
                <Table
                  head={["Item", "Becomes non-refundable when", "Reason"]}
                  rows={[
                    [
                      <strong className="text-white">Setup / onboarding fee</strong>,
                      <>When your account is provisioned and your business profile is configured</>,
                      <>One-time onboarding work is already performed</>,
                    ],
                    [
                      <strong className="text-white">Subscription fees (consumed period)</strong>,
                      <>As each 30-day period begins and platform access is delivered</>,
                      <>Cloud infrastructure, hosting, and support are consumed per period</>,
                    ],
                    [
                      <strong className="text-white">NFC cards</strong>,
                      <>When the card is shipped and delivered to you</>,
                      <>Physical, customisable product</>,
                    ],
                    [
                      <strong className="text-white">Acrylic standees</strong>,
                      <>When the standee is shipped and delivered to you</>,
                      <>Physical, printed product</>,
                    ],
                    [
                      <strong className="text-white">Custom branding / design work</strong>,
                      <>When the design is delivered and applied to your QR or NFC assets</>,
                      <>Creative work is delivered to the client</>,
                    ],
                    [
                      <strong className="text-white">Third-party pass-through costs</strong>,
                      <>When incurred (e.g., payment gateway or MFS processing fees)</>,
                      <>Charged by third parties and non-recoverable</>,
                    ],
                  ]}
                />
                <p className="text-sm text-[#A1A1AA] leading-relaxed">
                  No exceptions are made to the above, including for voluntary cancellation, dissatisfaction, inability to use the Platform, or changes to third-party platforms such as Google Business Profile.
                </p>
              </div>
            </Section>

            <Section id="eligible" icon={<CheckCircle2 className="w-4 h-4" />} title="4. Refund Eligibility Criteria">
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
                A refund may be granted in the following circumstances. All requests are assessed on a case-by-case basis by the platform administrator.
              </p>
              <Table
                head={["Scenario", "Eligibility", "Refundable amount"]}
                rows={[
                  [
                    <strong className="text-white">Duplicate or erroneous payment</strong>,
                    <>Eligible — you were charged twice, or a payment was recorded against the wrong account</>,
                    <>Full refund of the duplicated or misapplied amount</>,
                  ],
                  [
                    <strong className="text-white">Payment received but service never activated</strong>,
                    <>Eligible — we hold your funds but the subscription was not activated within 7 days of the payment date</>,
                    <>Full refund of all amounts paid</>,
                  ],
                  [
                    <strong className="text-white">STAR CATCH service failure</strong>,
                    <>Eligible — the Platform was materially unavailable or defective for more than 72 continuous hours, and you can show logs or screenshots</>,
                    <>Pro-rata refund for the affected unused period (see Section 6)</>,
                  ],
                  [
                    <strong className="text-white">Cancelled within 24 hours of activation</strong>,
                    <>Eligible — provided the subscription was activated less than 24 hours ago and you have not generated scans, feedback, or used Pro features</>,
                    <>Full refund of the subscription fee for that period; setup fee remains non-refundable</>,
                  ],
                  [
                    <strong className="text-white">Account suspended in error</strong>,
                    <>Eligible — if we suspended or terminated your account in error and did not remedy it</>,
                    <>Pro-rata refund for the period lost due to the error</>,
                  ],
                  [
                    <strong className="text-white">Hardware never delivered</strong>,
                    <>Eligible — where hardware was paid for but not received, or lost in transit on our side</>,
                    <>Full refund or replacement at your option</>,
                  ],
                  [
                    <strong className="text-white">Legal or regulatory requirement</strong>,
                    <>Eligible — where a refund is required by the Bangladesh Contract Act 1872, the ICT Act 2006, the Digital Security Act 2018, or a court order</>,
                    <>As required by law</>,
                  ],
                ]}
              />
            </Section>

            <Section id="ineligible" icon={<XCircle className="w-4 h-4" />} title="5. Non-Eligible Refund Claims">
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">We are unable to refund in the following situations:</p>
              <Bullets
                items={[
                  <>Change of mind, dissatisfaction with the service, or no longer needing the Platform, after the 24-hour window in Section 4</>,
                  <>Unused time remaining in a current 30-day billing period where you chose to cancel early</>,
                  <>Loss of Google reviews, changes to your Google Business Profile, or any action taken by Google against your listing</>,
                  <>Failure to meet your business's revenue or review-volume expectations — we do not guarantee any specific rating or business outcome</>,
                  <>Hardware that has been used, damaged after delivery, or shows normal wear and tear (see the warranty in Section 10 instead)</>,
                  <>Third-party platform downtime, policy changes, or account suspensions outside our control</>,
                  <>Requests made more than 30 days after the relevant payment or service failure</>,
                  <>Accounts flagged for fraud, fake review solicitation, or breach of our Terms of Service</>,
                ]}
              />
            </Section>

            <Section id="pro-rata" icon={<FileText className="w-4 h-4" />} title="6. Pro-Rata Refund Calculation">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Where a partial refund is granted for an unused subscription period, it is calculated on a pro-rata basis — you are refunded only for the whole days remaining in your 30-day period:
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-1.5">
                <p className="text-xs font-mono text-white">
                  Refund = (৳2,499 ÷ 30) &times; Unused whole days remaining = ৳83.30 &times; days remaining
                </p>
              </div>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">Worked examples for the Business Pro plan (৳2,499/month):</p>
              <Table
                head={["Days used", "Days remaining", "Refundable amount"]}
                rows={[
                  [<>"3 days"</>, <>"27 days"</>, <>৳83.30 &times; 27 &asymp; ৳2,249</>],
                  [<>"10 days"</>, <>"20 days"</>, <>৳83.30 &times; 20 = ৳1,666</>],
                  [<>"25 days"</>, <>"5 days"</>, <>৳83.30 &times; 5 &asymp; ৳416</>],
                  [<>"30 days (period complete)"</>, <>"0 days"</>, <>৳0</>],
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Partial days are not pro-rated — a part-day is either counted or not counted. Setup fees, hardware, and design work are excluded from pro-rata calculations and are never refunded after the trigger point in Section 3.
              </p>
            </Section>

            <Section id="cancellation" icon={<FileText className="w-4 h-4" />} title="7. Subscription Cancellation Process">
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
                You may cancel your subscription at any time. There is no cancellation fee. To cancel, follow these steps:
              </p>
              <Table
                head={["Step", "Action", "Detail"]}
                rows={[
                  [<strong className="text-white">1</strong>, <>Contact us with your cancellation request</>, <>WhatsApp {WHATSAPP} or email <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#16A34A] hover:underline">{CONTACT_EMAIL}</a> from the email address registered to your account. Include your business name and the date you wish to cancel.</>],
                  [<strong className="text-white">2</strong>, <>Receive confirmation</>, <>We confirm receipt within 2 business days and confirm your cancellation effective date in writing.</>],
                  [<strong className="text-white">3</strong>, <>Access continues to period end</>, <>Your Pro and Starter features remain fully active until the end of your current paid 30-day period. There is no loss of access mid-period.</>],
                  [<strong className="text-white">4</strong>, <>Automatic non-renewal</>, <>The subscription does not renew. You will not be charged again, and you do not need to cancel auto-renewal separately.</>],
                  [<strong className="text-white">5</strong>, <>Status changes and data retention begins</>, <>At period end your account reverts to inactive status. Your business profile, QR codes, analytics, and feedback are retained for 30 days, after which they may be permanently deleted.</>],
                  [<strong className="text-white">6</strong>, <>Reinstatement</>, <>If you re-subscribe within the 30-day retention window, we will reactivate your account and restore your data at no extra setup charge.</>],
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                <strong className="text-white">No partial refund is issued for the unused remainder of the current period</strong> when you cancel voluntarily, because that period has already been provisioned for your use. If you would prefer a pro-rata refund instead of simply letting the period lapse, request this explicitly in Step 1 — it is assessed under Section 4 and is not guaranteed.
              </p>
            </Section>

            <Section id="timeline" icon={<Clock className="w-4 h-4" />} title="8. Refund Processing Timeline">
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
                Once a refund is approved, we process it on the following schedule. These are the maximum timeframes; we aim to complete every step faster.
              </p>
              <Table
                head={["Stage", "Timeframe", "What happens"]}
                rows={[
                  [<strong className="text-white">Submit request</strong>, <>Day 0</>, <>You send the request via WhatsApp or email with your business name, registered email, transaction ID, and the reason for the claim.</>],
                  [<strong className="text-white">Acknowledgement</strong>, <>Within 2 business days</>, <>We confirm receipt and give you a reference number.</>],
                  [<strong className="text-white">Assessment</strong>, <>Within 5 business days</>, <>We verify the payment record, activation date, and service history against the criteria in Section 4, and approve, partially approve, or decline in writing.</>],
                  [<strong className="text-white">Disbursement initiated</strong>, <>Within 2 business days of approval</>, <>We initiate the transfer through the same mobile financial service (bKash or Nagad) used for the original payment.</>],
                  [<strong className="text-white">Funds available to you</strong>, <>1-3 business days after initiation</>, <>bKash and Nagad typically credit refunds within 1-3 business days. Processing delays can occasionally extend this to 7 business days.</>],
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                <strong className="text-white">Total target time: 5-10 business days</strong> from your request to funds being available. If a request is declined, we provide a written explanation and you may appeal once within 7 days by replying to the same thread.
              </p>
            </Section>

            <Section id="method" icon={<Wallet className="w-4 h-4" />} title="9. Refund Method">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Refunds are issued to the <strong className="text-white">original payment source</strong> — the bKash or Nagad wallet or number used to pay. We cannot refund to a different account, a different number, or a third party, as doing so would create a fraud and money-laundering risk for both you and us.
              </p>
              <Bullets
                items={[
                  <>Please confirm your correct bKash/Nagad number when you submit a request, so funds are not returned in error</>,
                  <>Any MFS transfer charges deducted by the provider are borne by us, not deducted from your refund amount</>,
                  <>Amounts are returned in Bangladeshi Taka (BDT); we do not convert to other currencies</>,
                  <>Where a partial refund is approved, we adjust for MFS charges on the original payment and state this explicitly before disbursing</>,
                ]}
              />
            </Section>

            <Section id="hardware" icon={<Wrench className="w-4 h-4" />} title="10. Hardware Warranty — 7-Day Replacement">
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
                All hardware (NFC cards and acrylic standees) is tested and inspected before dispatch. We back the physical product with a limited replacement warranty:
              </p>
              <Bullets
                items={[
                  <><strong className="text-white">Replacement window:</strong> you must report any physical damage or defect within <strong className="text-white">7 calendar days</strong> of receiving the hardware.</>,
                  <><strong className="text-white">Eligible defects:</strong> physical damage on arrival, manufacturing defects, or components that fail to function normally.</>,
                  <><strong className="text-white">Proof required:</strong> clear photographic evidence of the defect, and the original packaging where available.</>,
                  <><strong className="text-white">Not covered:</strong> normal wear and tear, cosmetic scratches after use, water damage, intentional damage, or damage from improper storage or handling.</>,
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                To request a replacement, contact us via WhatsApp at {WHATSAPP} or email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#16A34A] hover:underline">{CONTACT_EMAIL}</a> within the 7-day window. Replacement is issued at our sole discretion after inspecting the reported defect, and is the remedy in lieu of a cash refund once the item has shipped.
              </p>
            </Section>

            <Section id="renewal" icon={<AlertTriangle className="w-4 h-4" />} title="11. Auto-Renewal &amp; Subscription Expiry">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Subscriptions are valid for 30 days from the activation date. We contact you before expiry to arrange renewal. Because payment is processed manually, there is no automatic charge — renewal begins only when you submit a payment and the administrator activates it. If you do not renew before the expiry date, access to paid features is suspended.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Suspended accounts show a service-inactive notice on your QR and NFC links, so customers are not directed to an inactive gatekeeper. Your data is retained for 30 days after expiry and may then be permanently deleted. This does not create a refund entitlement — the period has been served.
              </p>
            </Section>

            <Section id="chargebacks" icon={<AlertTriangle className="w-4 h-4" />} title="12. Disputes &amp; Chargebacks">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                If you initiate a chargeback, payment dispute, or fraudulent claim through your bank or mobile financial service, your STAR CATCH account will be immediately suspended pending investigation. Frivolous or fraudulent disputes may result in permanent account termination and legal action to the fullest extent permitted under Bangladesh law.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We ask that you raise any billing concern with us first, via the process in Section 7 and Section 8. We would much rather resolve a genuine billing error directly than through a formal dispute.
              </p>
            </Section>

            <Section id="law" icon={<Scale className="w-4 h-4" />} title="13. Governing Law &amp; Jurisdiction">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                This Refund &amp; Cancellation Policy is governed by the laws of Bangladesh, including the Bangladesh Contract Act 1872, the Information and Communication Technology (ICT) Act 2006 (as amended in 2013), and the Digital Security Act 2018. All disputes arising out of or in connection with this Policy are strictly subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Nothing in this Policy limits your statutory rights under any applicable law. Where a provision of this Policy conflicts with a mandatory legal requirement, the legal requirement prevails.
              </p>
            </Section>

            <Section id="contact" icon={<Mail className="w-4 h-4" />} title="14. Contact">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                For any refund, cancellation, or billing question, please contact us:
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
                <p className="text-sm font-semibold text-white">STAR CATCH Reviews and Feedback Agency Bd</p>
                <p className="text-sm text-[#A1A1AA]">
                  <strong className="text-white">Email:</strong>{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#16A34A] hover:underline break-all">{CONTACT_EMAIL}</a>
                </p>
                <p className="text-sm text-[#A1A1AA]">
                  <strong className="text-white">WhatsApp support:</strong>{" "}
                  <a href="https://wa.me/8801673903919" target="_blank" rel="noreferrer" className="text-[#16A34A] hover:underline">{WHATSAPP}</a>
                </p>
                <p className="text-sm text-[#A1A1AA]">
                  <strong className="text-white">To speed up a claim, include:</strong> business name, registered email, bKash/Nagad transaction ID, payment date, and reason
                </p>
                <p className="text-sm text-[#A1A1AA]">
                  <strong className="text-white">Jurisdiction:</strong> Courts of Dhaka, Bangladesh
                </p>
              </div>
            </Section>
          </GlassPanel>
        </div>

        <div className="text-center mt-8 mb-12 space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#71717A]">
            <button onClick={() => navigate("/terms")} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/privacy")} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/cookie-policy")} className="hover:text-white transition-colors cursor-pointer">Cookie Policy</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/refund-policy")} className="hover:text-white transition-colors cursor-pointer text-[#16A34A]">Refund Policy</button>
          </div>
          <Button onClick={() => navigate("/")} className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer">
            <Star className="w-4 h-4 mr-2 fill-white" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
