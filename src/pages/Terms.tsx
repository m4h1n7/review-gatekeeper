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
            <p className="text-xs text-[#A1A1AA]">Last updated: August 23, 2026</p>
          </div>
        </div>

        <GlassPanel className="p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              By accessing or using STAR CATCH Reviews and Feedback Agency Bd ("STAR CATCH", "the Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              STAR CATCH is a Software-as-a-Service (SaaS) tool designed for internal feedback routing. It enables businesses to direct customer reviews through a star-rating gatekeeper: satisfied customers (4-5 stars) are redirected to leave public Google reviews, while dissatisfied customers (1-3 stars) are routed to a private feedback form. STAR CATCH provides analytics dashboards, QR code generators, and subscription management for business clients.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Disclaimer of Liability</h2>
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
            <h2 className="text-lg font-semibold text-white mb-3">4. User Responsibility</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Businesses using STAR CATCH are solely responsible for how they collect customer feedback and run their review campaigns. This includes ensuring that all feedback collection practices comply with applicable laws and regulations, including but not limited to data protection and consumer protection laws in your jurisdiction. STAR CATCH is not liable for any misuse of the Platform or any legal consequences arising from your feedback collection practices.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Account Registration</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Subscriptions &amp; Payments</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
              STAR CATCH offers a Pro subscription plan priced at ৳1,000 BDT per month (or equivalent in USD at $10/month). Payments are processed manually via bKash or Nagad and approved by the platform administrator.
            </p>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              <strong className="text-white">Non-Refundable Subscriptions:</strong> All bKash/Nagad subscription payments that are processed and activated by the Super Admin are strictly non-refundable. Once your Pro subscription is activated, no refunds will be issued for any reason, including but not limited to: voluntary cancellation, account termination, or dissatisfaction with the service. By submitting a payment, you acknowledge and accept this non-refundable policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Data &amp; Privacy</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, and protect your data. By using STAR CATCH, you consent to the collection and use of data as outlined in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              To the maximum extent permitted by law, STAR CATCH shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising out of or in connection with your use of the Platform. Our total liability shall not exceed the amount you paid for the Platform in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Termination</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              We reserve the right to suspend or terminate your access to the Platform at any time, with or without cause, including but not limited to violations of these Terms. Upon termination, your right to use the Platform ceases immediately. No refund will be provided for any prepaid subscription period.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Changes to Terms</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Platform after changes are posted constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              If you have questions about these Terms, please contact us via WhatsApp at +880 1673-903919 or through our platform support channels.
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
