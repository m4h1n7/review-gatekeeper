import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, Shield } from "lucide-react";

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#16A34A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      </div>

      <nav className="relative z-20 px-4 sm:px-6 py-5 border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#16A34A]/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
            <p className="text-xs text-[#A1A1AA]">Last updated: August 24, 2026</p>
          </div>
        </div>

        <GlassPanel className="p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              By accessing or using STAR CATCH Reviews and Feedback Agency Bd ("STAR CATCH", "the Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service, which are governed by the laws of Bangladesh, including the Bangladesh Contract Act 1872. If you do not agree, do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              STAR CATCH is a Software-as-a-Service (SaaS) tool designed for internal feedback routing. It enables businesses to direct customer reviews through a star-rating gatekeeper: satisfied customers (4-5 stars) are redirected to leave public Google reviews, while dissatisfied customers (1-3 stars) are routed to a private feedback form. STAR CATCH provides analytics dashboards, QR code generators, and subscription management for business clients.
            </p>
          </section>

          <section className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h2 className="text-lg font-semibold text-amber-400 mb-3">3. Dynamic Review Redirection Disclaimer</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              <strong className="text-white">STAR CATCH operates as a customer feedback filtering tool. We do not manipulate Google's algorithm, buy fake reviews, or guarantee specific rating increases.</strong> Business clients are solely responsible for providing real and organic customer interactions through our platform. Any increase or decrease in your Google review profile is a natural outcome of your genuine customer experiences and is entirely outside STAR CATCH's control.
            </p>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              STAR CATCH does not generate, fabricate, or incentivize reviews in any way. We only provide the technical infrastructure to route existing customer feedback to the appropriate channel. Any use of STAR CATCH to solicit fake, misleading, or otherwise deceptive reviews is strictly prohibited and constitutes a violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Disclaimer of Liability</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
              STAR CATCH holds no responsibility for third-party platform actions, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-sm text-[#A1A1AA] leading-relaxed space-y-1.5 ml-4">
              <li>Changes to Google Business Profile policies, APIs, or review guidelines</li>
              <li>Suspension, removal, or modification of your Google Business Profile</li>
              <li>Google's decisions regarding the validity or visibility of reviews</li>
              <li>Any downtime, bugs, or service interruptions on third-party platforms</li>
              <li>Data loss or privacy breaches originating from third-party services</li>
            </ul>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              You acknowledge that STAR CATCH is an independent tool and is not affiliated with, endorsed by, or officially connected to Google or any other third-party review platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. User Responsibility</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Businesses using STAR CATCH are solely responsible for how they collect customer feedback and run their review campaigns. This includes ensuring that all feedback collection practices comply with applicable laws and regulations, including but not limited to the Bangladesh Digital Security Act 2018, data protection provisions under the Bangladesh Information and Communication Technology (ICT) Act 2006 (as amended in 2013), and consumer protection laws in your jurisdiction. STAR CATCH is not liable for any misuse of the Platform or any legal consequences arising from your feedback collection practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Account Registration</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Subscriptions &amp; Payments</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
              STAR CATCH offers the following subscription plans:
            </p>
            <ul className="list-disc list-inside text-sm text-[#A1A1AA] leading-relaxed space-y-1.5 ml-4">
              <li><strong className="text-white">Starter Plan:</strong> ৳1,499 BDT setup fee (one-time) + ৳1,499 BDT/month</li>
              <li><strong className="text-white">Business Pro Plan:</strong> ৳1,699 BDT setup fee (one-time) + ৳2,499 BDT/month</li>
            </ul>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              Payments are processed manually via bKash or Nagad and approved by the platform administrator.
            </p>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              <strong className="text-white">Non-Refundable Subscriptions:</strong> All setup fees, hardware costs (NFC cards, standees), and monthly recurring SaaS subscription payments that are processed and activated by the Super Admin are strictly non-refundable. Once your subscription is activated, no refunds will be issued for any reason, including but not limited to: voluntary cancellation, account termination, or dissatisfaction with the service. By submitting a payment, you acknowledge and accept this non-refundable policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Data &amp; Privacy</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, and protect your data in compliance with the Bangladesh Information and Communication Technology (ICT) Act 2006 (as amended in 2013). By using STAR CATCH, you consent to the collection and use of data as outlined in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Limitation of Liability</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              To the maximum extent permitted under the Bangladesh Contract Act 1872, STAR CATCH Reviews and Feedback Agency Bd, its directors, officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business opportunities, or business reputation, arising out of or in connection with your use of the Platform.
            </p>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              In particular, STAR CATCH shall not be held liable for:
            </p>
            <ul className="list-disc list-inside text-sm text-[#A1A1AA] leading-relaxed space-y-1.5 ml-4">
              <li>Any account suspension, penalty, or policy enforcement action by Google Maps, Google Business Profile, or any other third-party platform</li>
              <li>Loss of profits, revenue, or business reputation resulting from customer reviews (whether positive or negative)</li>
              <li>Any action or inaction by Google or other third-party platforms that affects your review profile or business listing</li>
              <li>Damages exceeding the total amount you paid to STAR CATCH in the twelve (12) months preceding the claim</li>
            </ul>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              This limitation of liability applies regardless of the legal theory (contract, tort, negligence, strict liability, or otherwise) and survives termination of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Account Termination</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              STAR CATCH reserves the absolute and unrestricted right to suspend, deactivate, or permanently terminate your access to the Platform at any time, with or without cause, and without prior legal notice. Grounds for termination include, but are not limited to:
            </p>
            <ul className="list-disc list-inside text-sm text-[#A1A1AA] leading-relaxed space-y-1.5 ml-4">
              <li>Non-payment or overdue subscription renewal</li>
              <li>Fraudulent, chargeback, or disputed payment transactions</li>
              <li>Violation of these Terms of Service or any applicable law</li>
              <li>Misuse of the Platform, including soliciting fake reviews or abusing the feedback system</li>
              <li>Any activity deemed harmful to STAR CATCH's reputation, other users, or third parties</li>
            </ul>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              Upon termination, your right to use the Platform ceases immediately. No refund will be provided for any prepaid subscription period. STAR CATCH may retain your data for a period necessary to comply with legal obligations or enforce these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Governing Law &amp; Jurisdiction</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of Bangladesh. All legal disputes arising out of or in connection with these Terms or your use of the Platform are strictly subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh. By using the Platform, you irrevocably submit to the exclusive jurisdiction of the courts of Dhaka for the resolution of any disputes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">12. Changes to Terms</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Platform after changes are posted constitutes acceptance of the modified Terms. It is your responsibility to review these Terms periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">13. Contact</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              If you have questions about these Terms, please contact us via WhatsApp at +880 1673-903919, email us at starcatchbd@gmail.com, or reach us through our platform support channels.
            </p>
          </section>
        </GlassPanel>

        <div className="text-center mt-8 mb-12">
          <Button onClick={() => navigate("/")} className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer">
            <Star className="w-4 h-4 mr-2 fill-white" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
