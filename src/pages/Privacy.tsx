import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, Lock, Mail, ShieldCheck, Database, Users, Eye, Cookie, Globe, Scale, Baby, AlertTriangle, RefreshCw } from "lucide-react";

const ACCENT = "#16A34A";
const CONTACT_EMAIL = "starcatchbd@gmail.com";

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

function DataTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
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
  { id: "collect", label: "2. Information We Collect", icon: <Database className="w-3.5 h-3.5" /> },
  { id: "use", label: "3. How We Use Your Information", icon: <Eye className="w-3.5 h-3.5" /> },
  { id: "legal-basis", label: "4. Legal Basis for Processing", icon: <Scale className="w-3.5 h-3.5" /> },
  { id: "cookies", label: "5. Cookies & Local Storage", icon: <Cookie className="w-3.5 h-3.5" /> },
  { id: "sharing", label: "6. How We Share Information", icon: <Users className="w-3.5 h-3.5" /> },
  { id: "storage", label: "7. Storage & Retention", icon: <Database className="w-3.5 h-3.5" /> },
  { id: "security", label: "8. Security & Protection Measures", icon: <Lock className="w-3.5 h-3.5" /> },
  { id: "rights", label: "9. Your Privacy Rights", icon: <Scale className="w-3.5 h-3.5" /> },
  { id: "transfers", label: "10. International Transfers", icon: <Globe className="w-3.5 h-3.5" /> },
  { id: "children", label: "11. Children's Privacy", icon: <Baby className="w-3.5 h-3.5" /> },
  { id: "breach", label: "12. Breach Notification", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { id: "changes", label: "13. Changes to This Policy", icon: <RefreshCw className="w-3.5 h-3.5" /> },
  { id: "contact", label: "14. Contact Us", icon: <Mail className="w-3.5 h-3.5" /> },
];

export default function Privacy() {
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
            <Lock className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
            <p className="text-xs text-[#A1A1AA]">Last updated: October 4, 2026 &middot; Effective immediately</p>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { k: "We never sell your data", v: "No sale, rental, or trade of personal information" },
            { k: "Encrypted in transit", v: "All traffic over TLS/HTTPS" },
            { k: "Role-based access", v: "Only you and authorised admins can view your data" },
            { k: "Request deletion", v: "Ask us to erase your data at any time" },
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
            <Section id="overview" title="1. Overview">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                STAR CATCH Reviews and Feedback Agency Bd ("STAR CATCH", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains in plain language how we collect, use, store, share, and safeguard your personal information when you create an account, use our Platform, or submit feedback through a STAR CATCH review gatekeeper.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                This policy is formulated in compliance with the Bangladesh Information and Communication Technology (ICT) Act 2006 (as amended in 2013), the Digital Security Act 2018, the Bangladesh Contract Act 1872, and other applicable data protection laws of Bangladesh. It applies to both <strong className="text-white">business subscribers</strong> (account holders) and <strong className="text-white">end customers</strong> (people who leave feedback through a subscriber's gatekeeper). By using STAR CATCH, you consent to the collection and use of information as described here.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We apply the principles of <strong className="text-white">lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity, and accountability</strong> to every processing activity we perform.
              </p>
            </Section>

            <Section id="collect" icon={<Database className="w-4 h-4" />} title="2. Information We Collect">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We only collect the information we genuinely need. Depending on how you interact with the Platform, we may collect:
              </p>
              <DataTable
                head={["Category", "What we collect", "Why it is required"]}
                rows={[
                  [
                    <strong className="text-white">Account &amp; identity data</strong>,
                    <>Full name, email address, phone number (optional), password hash / authentication tokens, account status, subscription plan, and role (business owner, staff member, administrator).</>,
                    <>To create and secure your account, sign you in, and manage your subscription.</>,
                  ],
                  [
                    <strong className="text-white">Business profile data</strong>,
                    <>Business name, category, logo image and logo URL, Google Review link, custom URL slug, custom colours, and NFC card identifier.</>,
                    <>To generate your QR codes, NFC review cards, and branded feedback pages.</>,
                  ],
                  [
                    <strong className="text-white">Customer feedback data</strong>,
                    <>Name, phone number, email address (optional), star rating, and written feedback message submitted by your end customers.</>,
                    <>To route 4-5 star customers to Google and deliver 1-3 star feedback to your private inbox.</>,
                  ],
                  [
                    <strong className="text-white">Activity &amp; usage logs</strong>,
                    <>NFC taps and QR scans, timestamps, device and browser type, referring page, session identifiers, staff attribution links (<code className="text-[11px] text-white/80">?staff=…</code>), scan and review counts, dashboard visits, and IP address where necessary for security.</>,
                    <>To generate your analytics dashboard, monthly reports, and staff performance leaderboard, and to detect fraud.</>,
                  ],
                  [
                    <strong className="text-white">Communications</strong>,
                    <>Messages you send to support, WhatsApp support conversations, and one-time verification (OTP) codes we send to your email address.</>,
                    <>To verify your identity, provide support, and keep an audit trail of account changes.</>,
                  ],
                  [
                    <strong className="text-white">Payment &amp; subscription records</strong>,
                    <>Transaction ID, bKash/Nagad sender phone number, payment amount, activation date, and renewal history. We never store full card numbers.</>,
                    <>To verify manual payments, activate your plan, and maintain billing records.</>,
                  ],
                  [
                    <strong className="text-white">Technical data</strong>,
                    <>Browser type, operating system, screen dimensions, language, and error logs generated while you use the Platform.</>,
                    <>To diagnose faults and improve reliability and user experience.</>,
                  ],
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                <strong className="text-white">We do not collect</strong> sensitive categories of personal data such as national ID numbers, biometric data, health records, political opinions, or religious beliefs. We also do not knowingly collect data from anyone under 18 (see Section 11).
              </p>
            </Section>

            <Section id="use" icon={<Eye className="w-4 h-4" />} title="3. How We Use Your Information">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">We use the collected information strictly to:</p>
              <Bullets
                items={[
                  <>Provide, maintain, and improve the Platform, its features, and its review-gatekeeper workflow</>,
                  <>Process subscription payments, verify manual bKash/Nagad transactions, and manage plan activation, renewal, and expiry</>,
                  <>Send one-time verification codes, password reset codes, and account security notifications to your email address</>,
                  <>Route customer feedback: 4-5 star ratings to the linked Google Review page, and 1-3 star feedback to the subscriber's private inbox</>,
                  <>Generate analytics dashboards, monthly performance reports, and staff attribution leaderboards</>,
                  <>Communicate with you about your account, billing, product updates, and support requests</>,
                  <>Detect and prevent fraud, abuse, spam, and unauthorised access, including enforcing subscription limits</>,
                  <>Enforce our Terms of Service, Refund Policy, and Acceptable Use restrictions</>,
                  <>Comply with legal obligations under the ICT Act 2006, the Digital Security Act 2018, and applicable tax and accounting requirements</>,
                  <>Respond to valid legal or government requests made through lawful process</>,
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We do not use your personal data for automated decision-making that produces legal or similarly significant effects, and we do not build advertising profiles. We do not use private customer feedback to train artificial intelligence models.
              </p>
            </Section>

            <Section id="legal-basis" icon={<Scale className="w-4 h-4" />} title="4. Legal Basis for Processing">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Each category of processing is supported by at least one lawful basis recognised under the ICT Act 2006 (as amended in 2013) and the Digital Security Act 2018:
              </p>
              <DataTable
                head={["Processing activity", "Lawful basis"]}
                rows={[
                  ["Account creation, sign-in, and session management", <>Performance of a contract (necessary to provide the service you requested)</>],
                  ["Subscription activation, billing, and renewal records", <>Performance of a contract and legal obligation (accounting records)</>],
                  ["Sending OTP and password reset codes", <>Performance of a contract and legitimate interest (account security)</>],
                  ["Routing and storing customer feedback for subscribers", <>Performance of a contract, and consent where the end customer provides their details</>],
                  ["Analytics dashboards and monthly reports", <>Legitimate interest (improving and operating the service for the subscriber)</>],
                  ["Fraud detection and abuse prevention", <>Legitimate interest and legal obligation</>],
                  ["Responding to data subject requests", <>Legal obligation</>],
                  ["Marketing or promotional emails (where sent)", <>Consent, which you may withdraw at any time</>],
                ]}
              />
            </Section>

            <Section id="cookies" icon={<Cookie className="w-4 h-4" />} title="5. Cookies &amp; Local Storage">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We use minimal, strictly necessary technologies. We do <strong className="text-white">not</strong> use third-party advertising cookies, tracking pixels, or cross-site behavioural advertising.
              </p>
              <Bullets
                items={[
                  <><strong className="text-white">Session &amp; auth cookies/tokens</strong> — used to keep you signed in and to protect against cross-site request forgery. These are essential.</>,
                  <><strong className="text-white">Local storage</strong> — stores your session token and light UI preferences (such as the last selected dashboard tab) on your own device. Clearing your browser storage removes them.</>,
                  <><strong className="text-white">No advertising or analytics cookies</strong> — we do not embed third-party trackers, pixels, or session recorders.</>,
                  <><strong className="text-white">Your control</strong> — you can block or delete cookies and local storage in your browser settings; note that this will sign you out and disable the Platform.</>,
                ]}
              />
            </Section>

            <Section id="sharing" icon={<Users className="w-4 h-4" />} title="6. How We Share Information">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We do not sell, trade, rent, or broker your personal information. We share data only in the following limited circumstances:
              </p>
              <Bullets
                items={[
                  <><strong className="text-white">With the business you left feedback for.</strong> Name, phone number, rating, and message are shared only with the specific subscriber whose QR code or NFC card you used. They are never shared with other subscribers.</>,
                  <><strong className="text-white">With your authorised staff.</strong> If your business assigns staff accounts or attribution links, those staff can see aggregate scan and review counts and the feedback routed to your business.</>,
                  <><strong className="text-white">With service providers.</strong> We use vetted infrastructure providers to operate the Platform (see Section 7).</>,
                  <><strong className="text-white">With Google.</strong> When a 4-5 star customer chooses to leave a public review, they are redirected to Google. At that point Google, not us, governs the data they share.</>,
                  <><strong className="text-white">With authorities.</strong> We may disclose data where required by Bangladeshi law, a valid court order, or a lawful regulatory request — and only the minimum data necessary.</>,
                  <><strong className="text-white">In corporate transactions.</strong> In a merger, acquisition, or asset sale, personal data may transfer to the successor entity, who must honour this policy.</>,
                ]}
              />
              <div className="rounded-xl border border-[#16A34A]/20 bg-[#16A34A]/5 p-4">
                <p className="text-sm text-[#A1A1AA] leading-relaxed">
                  <strong className="text-white">No sale of personal data.</strong> Private feedback submitted by end users (1-3 star ratings) is processed solely to inform the relevant business owner. It is never sold, traded, or shared with third-party data brokers, marketing agencies, or any unrelated entity.
                </p>
              </div>
            </Section>

            <Section id="storage" icon={<Database className="w-4 h-4" />} title="7. Storage &amp; Retention">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                All Platform data is stored in secure, managed cloud databases (Convex, hosted on Google Cloud infrastructure) and file storage for logos and generated assets. Data is encrypted in transit and at rest by our infrastructure providers. We retain data only as long as necessary for the purposes described in this policy:
              </p>
              <DataTable
                head={["Data type", "Retention period"]}
                rows={[
                  ["Account data (name, email, phone, credentials)", <>For the lifetime of your account, then deleted or irreversibly anonymised within 30 days of account closure</>],
                  ["Verification &amp; reset codes", <>Single-use and deleted shortly after successful verification; codes expire after 15 minutes</>],
                  ["Customer feedback (name, phone, rating, message)", <>Until the subscriber deletes it or the account is terminated</>],
                  ["Activity, scan &amp; review logs", <>Retained for the duration of the subscription, then aggregated into anonymous statistics</>],
                  ["Analytics and monthly reports", <>Retained while your subscription is active; aggregated and de-identified after termination</>],
                  ["Billing and transaction records", <>Retained for the period required by Bangladeshi accounting and tax law</>],
                  ["Security and error logs", <>Retained for a limited period for fraud investigation, then deleted</>],
                  ["Backups", <>Rotated and deleted on a rolling schedule after a live deletion request</>],
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                When we delete your data, it is removed from production systems immediately and purged from backups as those backups rotate out. Aggregated, non-identifiable statistics may be retained because they cannot be linked back to you.
              </p>
            </Section>

            <Section id="security" icon={<Lock className="w-4 h-4" />} title="8. Security &amp; Protection Measures">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We implement technical and organisational safeguards designed to protect personal data against unauthorised access, alteration, disclosure, or destruction, in line with the security standards of the ICT Act 2006 and the Digital Security Act 2018:
              </p>
              <Bullets
                items={[
                  <><strong className="text-white">Encryption</strong> — all data is transmitted over TLS/HTTPS and stored encrypted at rest by our infrastructure providers</>,
                  <><strong className="text-white">Password protection</strong> — passwords are never stored in plain text; only salted password hashes are kept</>,
                  <><strong className="text-white">Role-based access control</strong> — business owners, staff members, and administrators each have scoped permissions; staff cannot access billing or account credentials</>,
                  <><strong className="text-white">Server-side authorisation</strong> — every query and mutation is authorised on the server, so calling our backend directly cannot bypass access rules</>,
                  <><strong className="text-white">Single-use, time-limited codes</strong> — password reset and verification codes expire in 15 minutes and can only be consumed once</>,
                  <><strong className="text-white">Rate limiting and abuse monitoring</strong> — protection against brute-force login attempts, OTP spamming, and fraudulent subscription claims</>,
                  <><strong className="text-white">Data minimisation</strong> — we collect only the minimum data required to operate the Platform</>,
                  <><strong className="text-white">Internal confidentiality obligations</strong> — staff and administrators are bound by confidentiality and may only access data for legitimate support or operations purposes</>,
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                As subscribers, you also have a security responsibility: keep your login credentials confidential, log out of shared devices, and notify us immediately at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#16A34A] hover:underline">{CONTACT_EMAIL}</a> if you suspect unauthorised access. No method of electronic transmission or storage is 100% secure, so we cannot guarantee absolute security.
              </p>
            </Section>

            <Section id="rights" icon={<Scale className="w-4 h-4" />} title="9. Your Privacy Rights">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">Subject to applicable law, you have the right to:</p>
              <Bullets
                items={[
                  <>Be informed about how your personal data is collected, used, and processed</>,
                  <>Access and obtain a copy of the personal data we hold about you</>,
                  <>Request correction of inaccurate or incomplete data (update your name, email, or phone number in Account Settings, or ask us)</>,
                  <>Request deletion of your personal data and your account (right to be forgotten)</>,
                  <>Export or port your data in a portable, machine-readable format</>,
                  <>Withdraw consent for any processing based on consent, at any time</>,
                  <>Object to, or request restriction of, processing carried out on legitimate-interest grounds</>,
                  <>Complain to the relevant data protection authority if you believe your rights have been violated</>,
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                <strong className="text-white">How to exercise your rights:</strong> update your details directly in <button onClick={() => navigate("/settings")} className="text-[#16A34A] hover:underline cursor-pointer">Account Settings</button>, or email a written request to our privacy contact at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#16A34A] hover:underline">{CONTACT_EMAIL}</a> with the subject line "Data Privacy Request". Please include enough detail for us to verify your identity.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                <strong className="text-white">Our response time:</strong> we acknowledge every request within 7 days and aim to fully action access, correction, export, and deletion requests within 30 days. If we need more time, or if we decline a request, we will explain why. We will never penalise you for making a legitimate privacy request. Certain records (for example, billing records required by law) may be retained even after a deletion request.
              </p>
            </Section>

            <Section id="transfers" icon={<Globe className="w-4 h-4" />} title="10. International Transfers">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                STAR CATCH is operated from Bangladesh, but our infrastructure providers store and process data on servers located outside Bangladesh, including in the United States, European Economic Area, and Asia-Pacific regions. By using the Platform, you consent to such cross-border processing.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We rely on the providers' standard contractual clauses, data processing agreements, and equivalent safeguards. We do not sell personal data to third parties and we do not share data with data brokers.
              </p>
            </Section>

            <Section id="children" icon={<Baby className="w-4 h-4" />} title="11. Children's Privacy">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                The Platform is a business-to-business service and is not directed at children. We do not knowingly collect personal data from anyone under the age of 18, and we will not knowingly use such data. If you believe a minor has submitted personal data through a review gatekeeper or created an account, contact us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#16A34A] hover:underline">{CONTACT_EMAIL}</a> and we will promptly investigate and delete the data.
              </p>
            </Section>

            <Section id="breach" icon={<AlertTriangle className="w-4 h-4" />} title="12. Security Breach Notification">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                In the event of a personal data breach that is likely to result in risk to your rights and freedoms, we will notify the competent authority as required under the Digital Security Act 2018 and inform affected users without undue delay, describing the nature of the breach, the likely consequences, and the measures taken to address it. We also notify affected users of any breach that is likely to cause significant harm.
              </p>
            </Section>

            <Section id="changes" icon={<RefreshCw className="w-4 h-4" />} title="13. Changes to This Policy">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal obligations. Changes will be posted on this page with an updated "Last updated" date. Where a change materially affects your rights, we will provide more prominent notice (by email or in-app notification). Your continued use of the Platform after changes are posted constitutes acceptance of the updated policy. We will never retroactively weaken your rights without explicit consent.
              </p>
            </Section>

            <Section id="contact" icon={<Mail className="w-4 h-4" />} title="14. Contact Us">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                If you have questions about this Privacy Policy, wish to exercise any of your data rights, or want to report a privacy concern, contact our privacy lead:
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
                <p className="text-sm font-semibold text-white">STAR CATCH Reviews and Feedback Agency Bd</p>
                <p className="text-sm text-[#A1A1AA]">
                  <strong className="text-white">Privacy &amp; Data Protection Contact:</strong>{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#16A34A] hover:underline break-all">{CONTACT_EMAIL}</a>
                </p>
                <p className="text-sm text-[#A1A1AA]">
                  <strong className="text-white">WhatsApp support:</strong>{" "}
                  <a href="https://wa.me/8801673903919" target="_blank" rel="noreferrer" className="text-[#16A34A] hover:underline">+880 1673-903919</a>
                </p>
                <p className="text-sm text-[#A1A1AA]">
                  <strong className="text-white">Jurisdiction:</strong> Courts of Dhaka, Bangladesh
                </p>
              </div>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                This Privacy Policy is governed by the laws of Bangladesh, including the ICT Act 2006 (as amended in 2013) and the Digital Security Act 2018. All disputes arising out of or in connection with this policy are subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
              </p>
            </Section>
          </GlassPanel>
        </div>

        <div className="text-center mt-8 mb-12 space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#71717A]">
            <button onClick={() => navigate("/terms")} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/privacy")} className="hover:text-white transition-colors cursor-pointer text-[#16A34A]">Privacy Policy</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/refund-policy")} className="hover:text-white transition-colors cursor-pointer">Refund Policy</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/pricing")} className="hover:text-white transition-colors cursor-pointer">Pricing</button>
          </div>
          <Button onClick={() => navigate("/")} className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer">
            <Star className="w-4 h-4 mr-2 fill-white" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
