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
            <p className="text-xs text-[#A1A1AA]">Last updated: August 24, 2026</p>
          </div>
        </div>

        <GlassPanel className="p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Overview</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              This Refund &amp; Cancellation Policy outlines the terms governing subscription payments, cancellations, and refund eligibility for STAR CATCH Reviews and Feedback Agency Bd ("STAR CATCH", "the Platform"). All payments are subject to the terms described below. By submitting a payment, you acknowledge that you have read, understood, and accepted this policy in its entirety.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Subscription Pricing</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
              STAR CATCH offers the following subscription plans:
            </p>
            <ul className="list-disc list-inside text-sm text-[#A1A1AA] leading-relaxed space-y-1.5 ml-4">
              <li><strong className="text-white">Starter Plan:</strong> ৳1,499 BDT setup fee (one-time) + ৳1,499 BDT/month — includes 1 premium smart NFC card with QR code, private feedback filtering, basic analytics dashboard, and real-time rating chart.</li>
              <li><strong className="text-white">Business Pro Plan:</strong> ৳1,699 BDT setup fee (one-time) + ৳2,499 BDT/month — includes 2 premium smart NFC cards + 1 acrylic table standee, dynamic performance chart, WhatsApp message generator, custom customer offer banner, priority support, and full analytics.</li>
            </ul>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              Payments are processed manually via bKash or Nagad and approved by the platform administrator.
            </p>
          </section>

          <section className="p-5 rounded-xl bg-red-500/5 border border-red-500/20">
            <h2 className="text-lg font-semibold text-red-400 mb-3">3. Strictly Non-Refundable — Digital Services &amp; SaaS</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
              <strong className="text-white">All subscription payments processed and activated by the Super Admin are strictly non-refundable.</strong> This applies to all payment categories, in compliance with digital service provision laws of Bangladesh:
            </p>
            <ul className="list-disc list-inside text-sm text-[#A1A1AA] leading-relaxed space-y-1.5 ml-4">
              <li><strong className="text-white">Setup Fees</strong> — One-time onboarding charges (৳1,499 or ৳1,699) are non-refundable once your account has been provisioned and your business profile has been configured.</li>
              <li><strong className="text-white">Monthly SaaS Subscriptions</strong> — Recurring subscription fees (৳1,499/month or ৳2,499/month) are non-refundable once the billing period has commenced, including for: voluntary cancellation, dissatisfaction with the service, inability to use the platform, or changes to third-party platforms (e.g., Google Business Profile).</li>
              <li><strong className="text-white">Hardware Costs</strong> — NFC cards, acrylic table standees, and other physical items ordered as part of a subscription plan are non-refundable once shipped.</li>
            </ul>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              By submitting a bKash/Nagad payment, you explicitly acknowledge that you have read, understood, and agreed to this non-refundable policy. No exceptions will be made.
            </p>
          </section>

          <section className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h2 className="text-lg font-semibold text-amber-400 mb-3">4. Hardware Warranty — Limited 7-Day Replacement</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
              All hardware items (NFC cards, acrylic table standees) are thoroughly tested and inspected before delivery. We stand behind the quality of our physical products with the following limited warranty:
            </p>
            <ul className="list-disc list-inside text-sm text-[#A1A1AA] leading-relaxed space-y-1.5 ml-4">
              <li><strong className="text-white">Replacement Window:</strong> You must report any physical damage or defect within <strong className="text-white">7 calendar days</strong> of receiving the hardware.</li>
              <li><strong className="text-white">Eligible Defects:</strong> Physical damage upon arrival (cracked cards, broken standees, manufacturing defects that prevent normal use).</li>
              <li><strong className="text-white">Proof Required:</strong> You must provide photographic evidence of the damage and the original packaging upon request.</li>
              <li><strong className="text-white">What Is Not Covered:</strong> Normal wear and tear, cosmetic scratches after use, water damage, intentional damage, or damage caused by improper storage/handling.</li>
            </ul>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              To request a replacement, contact us via WhatsApp at +880 1673-903919 or email starcatchbd@gmail.com within the 7-day window. Replacement is at the sole discretion of STAR CATCH after inspection of the reported defect.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Cancellation</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
              You may cancel your subscription at any time by contacting us via WhatsApp at +880 1673-903919 or emailing starcatchbd@gmail.com. Upon cancellation:
            </p>
            <ul className="list-disc list-inside text-sm text-[#A1A1AA] leading-relaxed space-y-1.5 ml-4">
              <li>Your Pro access will continue until the end of your current billing period</li>
              <li>After the billing period ends, your account will revert to pending status</li>
              <li>No partial refund will be issued for the remaining subscription period</li>
              <li>Your business profiles and data will be retained for 30 days after expiration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Subscription Expiration</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Pro subscriptions are valid for 30 days from the date of activation. If you do not renew your subscription before the expiration date, your access to Pro features will be suspended. Your data (business profiles, analytics, and feedback) will be retained for 30 days after expiration, after which it may be permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Disputes &amp; Chargebacks</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              If you initiate a chargeback, payment dispute, or fraudulent claim through your bank or mobile financial service (bKash, Nagad, or otherwise), your STAR CATCH account will be immediately suspended pending investigation. Frivolous or fraudulent disputes may result in permanent account termination and legal action to the fullest extent permitted under Bangladesh law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Governing Law &amp; Jurisdiction</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              This Refund &amp; Cancellation Policy is governed by the laws of Bangladesh, including the Bangladesh Contract Act 1872. All disputes arising from or in connection with this policy are strictly subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Contact</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              For any questions regarding this Refund &amp; Cancellation Policy, please contact us via WhatsApp at +880 1673-903919, email us at starcatchbd@gmail.com, or reach us through our platform support channels.
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
