import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, CreditCard } from "lucide-react";

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}

export default function RefundPolicy() {
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
            <CreditCard className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Refund &amp; Cancellation Policy</h1>
            <p className="text-xs text-[#A1A1AA]">Last updated: August 23, 2026</p>
          </div>
        </div>

        <GlassPanel className="p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Overview</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              This Refund &amp; Cancellation Policy outlines the terms governing subscription payments, cancellations, and refund eligibility for STAR CATCH Reviews and Feedback Agency Bd ("STAR CATCH", "the Platform").
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Subscription Pricing</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              STAR CATCH offers a Pro subscription plan at ৳1,000 BDT per month (or $10 USD/month for international users). Payments are processed manually via bKash or Nagad and approved by the platform administrator. The subscription provides access to all Pro features including unlimited review profiles, unlimited analytics, and automated email alerts.
            </p>
          </section>

          <section className="p-5 rounded-xl bg-red-500/5 border border-red-500/20">
            <h2 className="text-lg font-semibold text-red-400 mb-3">3. Non-Refundable Subscriptions</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
              <strong className="text-white">All subscription payments processed and activated by the Super Admin are strictly non-refundable.</strong> This includes, but is not limited to:
            </p>
            <ul className="list-disc list-inside text-sm text-[#A1A1AA] leading-relaxed space-y-1.5 ml-4">
              <li>Voluntary cancellation of an active subscription</li>
              <li>Dissatisfaction with Platform features or performance</li>
              <li>Inability to use the Platform due to technical issues</li>
              <li>Changes to Google Business Profile affecting review collection</li>
              <li>Account termination due to policy violations</li>
              <li>Failure to use the service during the subscription period</li>
            </ul>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              By submitting a bKash/Nagad payment, you acknowledge that you have read, understood, and agreed to this non-refundable policy. No exceptions will be made.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Cancellation</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
              You may cancel your Pro subscription at any time by contacting us via WhatsApp at +880 1673-903919. Upon cancellation:
            </p>
            <ul className="list-disc list-inside text-sm text-[#A1A1AA] leading-relaxed space-y-1.5 ml-4">
              <li>Your Pro access will continue until the end of your current billing period</li>
              <li>After the billing period ends, your account will revert to pending status</li>
              <li>No partial refund will be issued for the remaining subscription period</li>
              <li>Your business profiles and data will be retained for 30 days after expiration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Subscription Expiration</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Pro subscriptions are valid for 30 days from the date of activation. If you do not renew your subscription before the expiration date, your access to Pro features will be suspended. Your data (business profiles, analytics, and feedback) will be retained for 30 days after expiration, after which it may be permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Disputes &amp; Chargebacks</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              If you initiate a chargeback or payment dispute through your bank or mobile financial service, your STAR CATCH account will be immediately suspended pending investigation. Frivolous or fraudulent disputes may result in permanent account termination and legal action.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Contact</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              For any questions regarding this Refund &amp; Cancellation Policy, please contact us via WhatsApp at +880 1673-903919 or through our platform support channels.
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
