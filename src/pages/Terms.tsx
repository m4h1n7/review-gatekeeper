import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Star, ArrowLeft, Shield, CheckCircle2, Ban, UserCheck, Copyright,
  AlertTriangle, CreditCard, Gavel, RefreshCw,
  Scale, Mail, Database, Link2,
} from "lucide-react";
import { legalStamp } from "@/lib/legalConfig";

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

const TOC = [
  { id: "acceptance", label: "1. Acceptance of Terms", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { id: "service", label: "2. Description of Service", icon: <Shield className="w-3.5 h-3.5" /> },
  { id: "acceptable-use", label: "3. Acceptable Use", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { id: "prohibited", label: "4. Prohibited Activities", icon: <Ban className="w-3.5 h-3.5" /> },
  { id: "accounts", label: "5. Account Responsibilities", icon: <UserCheck className="w-3.5 h-3.5" /> },
  { id: "ip", label: "6. Intellectual Property", icon: <Copyright className="w-3.5 h-3.5" /> },
  { id: "reviews", label: "7. Review Redirection Disclaimer", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { id: "third-party", label: "8. Third-Party Platforms", icon: <Link2 className="w-3.5 h-3.5" /> },
  { id: "subscriptions", label: "9. Subscriptions & Payments", icon: <CreditCard className="w-3.5 h-3.5" /> },
  { id: "liability", label: "10. Limitation of Liability", icon: <Gavel className="w-3.5 h-3.5" /> },
  { id: "indemnity", label: "11. Indemnification", icon: <Scale className="w-3.5 h-3.5" /> },
  { id: "termination", label: "12. Account Termination", icon: <Ban className="w-3.5 h-3.5" /> },
  { id: "privacy", label: "13. Data & Privacy", icon: <Database className="w-3.5 h-3.5" /> },
  { id: "law", label: "14. Governing Law", icon: <Scale className="w-3.5 h-3.5" /> },
  { id: "changes", label: "15. Changes to Terms", icon: <RefreshCw className="w-3.5 h-3.5" /> },
  { id: "contact", label: "16. Contact", icon: <Mail className="w-3.5 h-3.5" /> },
];

export default function Terms() {
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
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="STAR CATCH — go to home page"
            className="flex items-center gap-2.5 cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-[#16A34A] flex items-center justify-center shadow-lg shadow-[#16A34A]/25">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-sm text-white tracking-wide">STAR CATCH</span>
          </button>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="border-white/10 bg-white/5 hover:bg-white/10 text-[#A1A1AA] cursor-pointer text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#16A34A]/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
            <p className="text-xs text-[#A1A1AA]">{legalStamp("terms")}</p>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { k: "No fake reviews", v: "Generating or soliciting fake reviews is prohibited" },
            { k: "Your data is yours", v: "You own your content; we own the platform" },
            { k: "Subscriptions", v: "Non-refundable once activated by our admin" },
            { k: "Bangladesh law", v: "Governed by Dhaka jurisdiction" },
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
            <Section id="acceptance" icon={<CheckCircle2 className="w-4 h-4" />} title="1. Acceptance of Terms">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                By accessing, browsing, or using STAR CATCH Reviews and Feedback Agency Bd ("STAR CATCH", "the Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree with any part of these Terms, you must not use the Platform. If you use the Platform on behalf of a business, you represent that you have the authority to bind that business.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                These Terms are governed by the laws of Bangladesh, including the Bangladesh Contract Act 1872, the Information and Communication Technology (ICT) Act 2006 (as amended in 2013), and the Digital Security Act 2018. Please read these Terms together with our <button onClick={() => navigate("/privacy")} className="text-[#16A34A] hover:underline cursor-pointer">Privacy Policy</button> and <button onClick={() => navigate("/refund-policy")} className="text-[#16A34A] hover:underline cursor-pointer">Refund Policy</button>, which form part of this agreement.
              </p>
            </Section>

            <Section id="service" icon={<Shield className="w-4 h-4" />} title="2. Description of Service">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                STAR CATCH is a Software-as-a-Service (SaaS) tool designed for internal feedback routing. It enables businesses to direct customer reviews through a star-rating gatekeeper: satisfied customers (4-5 stars) are redirected to leave public Google reviews, while dissatisfied customers (1-3 stars) are routed to a private feedback form. STAR CATCH provides analytics dashboards, QR code generators, NFC review cards, staff attribution leaderboards, and subscription management for business clients.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                The Platform is provided on a subscription basis. Features and plan limits are as described on our <button onClick={() => navigate("/pricing")} className="text-[#16A34A] hover:underline cursor-pointer">Pricing</button> page and may change from time to time, with reasonable notice.
              </p>
            </Section>

            <Section id="acceptable-use" icon={<CheckCircle2 className="w-4 h-4" />} title="3. Acceptable Use of the Platform">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">You agree to use the Platform only for legitimate business purposes and in accordance with these Terms, applicable law, and third-party platform rules. Specifically, you agree:</p>
              <Bullets
                items={[
                  <>To provide and maintain accurate, current, and complete account and business information</>,
                  <>To use the Platform only for your own business and not to resell, sublicense, or provide it as a service to third parties without our written consent</>,
                  <>To comply with all applicable laws, including the ICT Act 2006 (as amended in 2013), the Digital Security Act 2018, consumer protection laws, and any applicable data protection or advertising regulations</>,
                  <>To obtain any necessary consents from your end customers before collecting their personal data through the feedback forms, and to handle that data lawfully</>,
                  <>To keep your subscription payments current and to interact with the Platform only through official channels</>,
                  <>Not to interfere with the Platform's operation, security, or availability, including by attempting to gain unauthorised access, probe for vulnerabilities without permission, or circumvent plan limits</>,
                  <>Not to upload or transmit malicious code, or content that is unlawful, defamatory, obscene, or infringes the rights of others</>,
                ]}
              />
            </Section>

            <Section id="prohibited" icon={<Ban className="w-4 h-4" />} title="4. Prohibited Activities">
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">The following activities are strictly prohibited and constitute a material breach of these Terms:</p>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <Bullets
                  items={[
                    <>Generating, purchasing, incentivising, or soliciting fake, fraudulent, or misleading reviews or ratings</>,
                    <>Using the Platform to deceive customers about the nature of a review request or the identity of the business</>,
                    <>Interfering with a customer's genuine feedback, suppressing negative feedback, or manipulating analytics data</>,
                    <>Attempting to access or use the Platform through automated means, scrapers, bots, or credential-sharing without our written permission</>,
                    <>Reverse engineering, decompiling, disassembling, or attempting to derive the source code of the Platform, except where such restriction is prohibited by law</>,
                    <>Copying, reselling, sublicensing, or creating derivative works of the Platform or its components</>,
                    <>Sharing, selling, or transferring your account credentials or subscription access to another party</>,
                    <>Using the Platform to harass, abuse, or infringe upon any person, or to collect data in violation of applicable privacy laws</>,
                    <>Uploading or distributing any content that infringes the intellectual property rights of others</>,
                  ]}
                />
              </div>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We may investigate suspected violations and, at our sole discretion, suspend or terminate any account that engages in prohibited activity, without prior notice.
              </p>
            </Section>

            <Section id="accounts" icon={<UserCheck className="w-4 h-4" />} title="5. User Account Responsibilities">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">You are solely responsible for your account. In particular:</p>
              <Bullets
                items={[
                  <><strong className="text-white">Accurate registration.</strong> You must provide accurate and complete information when creating an account and keep it updated.</>,
                  <><strong className="text-white">Credential confidentiality.</strong> You are responsible for maintaining the confidentiality of your password and any sign-in codes, and for all activities that occur under your account.</>,
                  <><strong className="text-white">Notify us of compromise.</strong> You agree to notify us immediately at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#16A34A] hover:underline">{CONTACT_EMAIL}</a> of any unauthorised use of your account or loss of credentials.</>,
                  <><strong className="text-white">Staff accounts.</strong> If you create staff accounts or attribution links, you are responsible for all activity performed by those staff members and for removing access when it is no longer needed.</>,
                  <><strong className="text-white">Compliance with collection laws.</strong> Businesses using STAR CATCH are solely responsible for how they collect customer feedback and run their review campaigns, and for ensuring their practices comply with the Digital Security Act 2018, the data protection provisions of the ICT Act 2006 (as amended in 2013), and consumer protection laws in their jurisdiction. STAR CATCH is not liable for misuse of the Platform or legal consequences arising from your feedback collection practices.</>,
                  <><strong className="text-white">Age.</strong> You must be at least 18 years old and legally capable of entering into a binding contract.</>,
                ]}
              />
            </Section>

            <Section id="ip" icon={<Copyright className="w-4 h-4" />} title="6. Intellectual Property Rights">
              <h3 className="text-sm font-semibold text-white mt-1">Our intellectual property</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                The Platform and all related content, including the software, source and object code, algorithms, database schema, designs, user interface, logos, branding, text, graphics, icons, photographs, and any modifications, inventions, or derivative works ("Our IP"), are and remain the exclusive property of STAR CATCH Reviews and Feedback Agency Bd or its licensors. We own or hold all rights in Our IP, including all intellectual property rights worldwide.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Consistent with the Copyright Act 1889 of Bangladesh and applicable international conventions, you may not reproduce, redistribute, modify, create derivative works of, or publicly display Our IP without our prior written consent. Nothing in these Terms grants you any right, title, or interest in Our IP except the limited, revocable, non-transferable, non-exclusive right to use the Platform for its intended purpose during the term of your subscription.
              </p>
              <h3 className="text-sm font-semibold text-white mt-2">Your content</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                You retain all rights to the business information, logos, and other materials you upload to the Platform ("Your Content"), as well as to the customer feedback routed through your gatekeeper. You grant us a limited, worldwide, non-exclusive, royalty-free licence to host, store, process, and display Your Content solely to the extent necessary to operate the Platform for you (for example, to generate your QR codes, display your analytics, and deliver feedback to your inbox).
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                You confirm that you have the right to submit Your Content and that it does not infringe the intellectual property rights of any third party. We do not claim ownership of Your Content, and we will not use it for our own marketing without your permission.
              </p>
              <h3 className="text-sm font-semibold text-white mt-2">Feedback</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                If you provide suggestions, ideas, or feedback about the Platform ("Feedback"), you grant us a perpetual, worldwide, irrevocable, royalty-free licence to use and incorporate that Feedback without restriction or compensation.
              </p>
            </Section>

            <Section id="reviews" icon={<AlertTriangle className="w-4 h-4" />} title="7. Dynamic Review Redirection Disclaimer">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
                <p className="text-sm text-[#A1A1AA] leading-relaxed">
                  <strong className="text-white">STAR CATCH operates as a customer feedback filtering tool. We do not manipulate Google's algorithm, buy fake reviews, or guarantee specific rating increases.</strong> Business clients are solely responsible for providing real and organic customer interactions through our platform. Any increase or decrease in your Google review profile is a natural outcome of your genuine customer experiences and is entirely outside STAR CATCH's control.
                </p>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">
                  STAR CATCH does not generate, fabricate, or incentivize reviews in any way. We only provide the technical infrastructure to route existing customer feedback to the appropriate channel. Any use of STAR CATCH to solicit fake, misleading, or otherwise deceptive reviews is strictly prohibited and constitutes a violation of these Terms.
                </p>
              </div>
            </Section>

            <Section id="third-party" icon={<Link2 className="w-4 h-4" />} title="8. Third-Party Platforms">
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
                STAR CATCH holds no responsibility for third-party platform actions, including but not limited to:
              </p>
              <Bullets
                items={[
                  <>Changes to Google Business Profile policies, APIs, or review guidelines</>,
                  <>Suspension, removal, or modification of your Google Business Profile</>,
                  <>Google's decisions regarding the validity or visibility of reviews</>,
                  <>Any downtime, bugs, or service interruptions on third-party platforms</>,
                  <>Data loss or privacy breaches originating from third-party services</>,
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                You acknowledge that STAR CATCH is an independent tool and is not affiliated with, endorsed by, or officially connected to Google or any other third-party review platform. We do not control and are not responsible for the content or policies of any third-party site you are redirected to.
              </p>
            </Section>

            <Section id="subscriptions" icon={<CreditCard className="w-4 h-4" />} title="9. Subscriptions &amp; Payments">
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">STAR CATCH offers the following subscription plans:</p>
              <Bullets
                items={[
                  <><strong className="text-white">Starter Plan:</strong> ৳1,499 BDT setup fee (one-time) + ৳1,499 BDT/month</>,
                  <><strong className="text-white">Business Pro Plan:</strong> ৳1,699 BDT setup fee (one-time) + ৳2,499 BDT/month</>,
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Payments are processed manually via bKash or Nagad and approved by the platform administrator. Features, usage limits, and included hardware (such as NFC cards and standees) vary by plan as described on the Pricing page.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                <strong className="text-white">Non-Refundable Subscriptions:</strong> All setup fees, hardware costs (NFC cards, standees), and monthly recurring SaaS subscription payments that are processed and activated by the Super Admin are strictly non-refundable. Once your subscription is activated, no refunds will be issued for any reason, including but not limited to: voluntary cancellation, account termination, or dissatisfaction with the service. By submitting a payment, you acknowledge and accept this non-refundable policy.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Fees are exclusive of any applicable taxes or withholding, and you are responsible for all charges associated with your payment method, including bank fees.
              </p>
            </Section>

            <Section id="liability" icon={<Gavel className="w-4 h-4" />} title="10. Limitation of Liability">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                To the maximum extent permitted under the Bangladesh Contract Act 1872, STAR CATCH Reviews and Feedback Agency Bd, its directors, officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business opportunities, or business reputation, arising out of or in connection with your use of the Platform.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">In particular, STAR CATCH shall not be held liable for:</p>
              <Bullets
                items={[
                  <>Any account suspension, penalty, or policy enforcement action by Google Maps, Google Business Profile, or any other third-party platform</>,
                  <>Loss of profits, revenue, or business reputation resulting from customer reviews (whether positive or negative)</>,
                  <>Any action or inaction by Google or other third-party platforms that affects your review profile or business listing</>,
                  <>Damages exceeding the total amount you paid to STAR CATCH in the twelve (12) months preceding the claim</>,
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                This limitation of liability applies regardless of the legal theory (contract, tort, negligence, strict liability, or otherwise) and survives termination of your account. The Platform is provided on an "as is" and "as available" basis, without warranties of any kind, whether express or implied, including any implied warranty of merchantability, fitness for a particular purpose, accuracy, or non-infringement.
              </p>
            </Section>

            <Section id="indemnity" icon={<Scale className="w-4 h-4" />} title="11. Indemnification">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                You agree to indemnify, defend, and hold harmless STAR CATCH Reviews and Feedback Agency Bd, its directors, officers, employees, and affiliates from and against any and all claims, losses, liabilities, damages, costs, and expenses (including reasonable legal fees) arising out of or in connection with: (a) your use of the Platform in violation of these Terms or applicable law; (b) your collection, handling, or use of customer personal data; (c) your use of the Platform to solicit or generate fake, fraudulent, or misleading reviews; or (d) any claim from a third party arising from your business, Your Content, or your public review profile.
              </p>
            </Section>

            <Section id="termination" icon={<Ban className="w-4 h-4" />} title="12. Account Suspension &amp; Termination">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                STAR CATCH reserves the absolute and unrestricted right to suspend, deactivate, or permanently terminate your access to the Platform at any time, with or without cause, and without prior legal notice. Grounds for termination include, but are not limited to:
              </p>
              <Bullets
                items={[
                  <>Non-payment or overdue subscription renewal</>,
                  <>Fraudulent, chargeback, or disputed payment transactions</>,
                  <>Violation of these Terms of Service or any applicable law</>,
                  <>Misuse of the Platform, including soliciting fake reviews or abusing the feedback system</>,
                  <>Any activity deemed harmful to STAR CATCH's reputation, other users, or third parties</>,
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                You may request deletion of your account at any time by contacting us. Upon termination, your right to use the Platform ceases immediately. No refund will be provided for any prepaid subscription period, consistent with Section 9. STAR CATCH may retain your data for a period necessary to comply with legal obligations or enforce these Terms, as further described in our <button onClick={() => navigate("/privacy")} className="text-[#16A34A] hover:underline cursor-pointer">Privacy Policy</button>.
              </p>
            </Section>

            <Section id="privacy" icon={<Database className="w-4 h-4" />} title="13. Data &amp; Privacy">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Your use of the Platform is also governed by our <button onClick={() => navigate("/privacy")} className="text-[#16A34A] hover:underline cursor-pointer">Privacy Policy</button>, which describes in detail how we collect, use, store, and protect your data (including names, emails, phone numbers, and activity logs) in compliance with the Bangladesh ICT Act 2006 (as amended in 2013) and the Digital Security Act 2018. By using STAR CATCH, you consent to the collection and use of data as outlined in our Privacy Policy.
              </p>
            </Section>

            <Section id="law" icon={<Scale className="w-4 h-4" />} title="14. Governing Law &amp; Jurisdiction">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of Bangladesh, including the Bangladesh Contract Act 1872, the ICT Act 2006 (as amended in 2013), and the Digital Security Act 2018. All legal disputes arising out of or in connection with these Terms or your use of the Platform are strictly subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh. By using the Platform, you irrevocably submit to the exclusive jurisdiction of the courts of Dhaka for the resolution of any disputes.
              </p>
            </Section>

            <Section id="changes" icon={<RefreshCw className="w-4 h-4" />} title="15. Changes to These Terms">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting, and the "Last updated" date at the top of this page will reflect the revision. Where a change materially affects your rights, we will provide more prominent notice (by email or in-app notification). Your continued use of the Platform after changes are posted constitutes acceptance of the modified Terms. It is your responsibility to review these Terms periodically.
              </p>
            </Section>

            <Section id="contact" icon={<Mail className="w-4 h-4" />} title="16. Contact">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-2">
                <p className="text-sm font-semibold text-white">STAR CATCH Reviews and Feedback Agency Bd</p>
                <p className="text-sm text-[#A1A1AA]">
                  <strong className="text-white">Email:</strong>{" "}
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
            </Section>
          </GlassPanel>
        </div>

        <div className="text-center mt-8 mb-12 space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#71717A]">
            <button onClick={() => navigate("/terms")} className="hover:text-white transition-colors cursor-pointer text-[#16A34A]">Terms of Service</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/privacy")} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/refund-policy")} className="hover:text-white transition-colors cursor-pointer">Refund Policy</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/cookie-policy")} className="hover:text-white transition-colors cursor-pointer">Cookie Policy</button>
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
