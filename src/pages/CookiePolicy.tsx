import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Star, ArrowLeft, Cookie, ShieldCheck, ChartLine, Megaphone, Settings,
  Globe, Scale, Mail, RefreshCw, Ban,
} from "lucide-react";
import { useConsent } from "@/components/CookieConsent";
import { legalStamp } from "@/lib/legalConfig";

const ACCENT = "#16A34A";
const CONTACT_EMAIL = "starcatchbd@gmail.com";

/** Shows the visitor's stored consent state and lets them reopen the banner. */
function CookieConsentControls() {
  const { consent, hasDecided, openBanner, acceptAll, rejectNonEssential } = useConsent();

  const label = consent.analytics
    ? "Analytics and Marketing allowed"
    : consent.marketing
      ? "Marketing allowed only"
      : "Essential only";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-white">Your current choice</p>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            {hasDecided ? label : "No choice recorded yet — you will be asked on your next visit."}
          </p>
        </div>
        <button
          type="button"
          onClick={openBanner}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.09] text-[#A1A1AA] hover:text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          <Settings className="w-3.5 h-3.5" />
          Change preferences
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={acceptAll}
          className="text-[11px] px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-medium transition-colors cursor-pointer"
        >
          Accept all
        </button>
        <button
          type="button"
          onClick={rejectNonEssential}
          className="text-[11px] px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-[#A1A1AA] font-medium transition-colors cursor-pointer"
        >
          Reject non-essential
        </button>
      </div>
    </div>
  );
}

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
  { id: "what-are-cookies", label: "1. What Are Cookies", icon: <Cookie className="w-3.5 h-3.5" /> },
  { id: "types", label: "2. Types of Cookies We Use", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { id: "what-we-use", label: "3. Cookies & Storage We Actually Use", icon: <Settings className="w-3.5 h-3.5" /> },
  { id: "analytics", label: "4. Analytics Cookies", icon: <ChartLine className="w-3.5 h-3.5" /> },
  { id: "marketing", label: "5. Marketing Cookies", icon: <Megaphone className="w-3.5 h-3.5" /> },
  { id: "third-party", label: "6. Third-Party Cookies", icon: <Globe className="w-3.5 h-3.5" /> },
  { id: "consent", label: "7. Consent & How to Control", icon: <Scale className="w-3.5 h-3.5" /> },
  { id: "browser-settings", label: "8. Managing Cookies in Your Browser", icon: <Settings className="w-3.5 h-3.5" /> },
  { id: "do-not-track", label: "9. Do Not Track", icon: <Ban className="w-3.5 h-3.5" /> },
  { id: "changes", label: "10. Changes to This Policy", icon: <RefreshCw className="w-3.5 h-3.5" /> },
  { id: "contact", label: "11. Contact Us", icon: <Mail className="w-3.5 h-3.5" /> },
];

export default function CookiePolicy() {
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
            <Cookie className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Cookie Policy</h1>
            <p className="text-xs text-[#A1A1AA]">{legalStamp("cookie-policy")}</p>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { k: "Essential only", v: "No advertising or cross-site tracking cookies" },
            { k: "No ad pixels", v: "We run no Facebook, Google, or ad-network pixels" },
            { k: "No data sale", v: "Your browsing data is never sold to advertisers" },
            { k: "Full control", v: "You can block or delete cookies in your browser" },
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
            <Section id="what-are-cookies" icon={<Cookie className="w-4 h-4" />} title="1. What Are Cookies?">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide reporting information and to personalise content and advertising.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Cookies can be classified as <strong className="text-white">session cookies</strong>, which expire automatically when you close your browser, or <strong className="text-white">persistent cookies</strong>, which stay on your device until they are deleted or expire after a set period.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                You can find out more about cookies and how to manage them at{" "}
                <a href="https://www.aboutcookies.org/" target="_blank" rel="noreferrer" className="text-[#16A34A] hover:underline">AboutCookies.org</a>.
              </p>
            </Section>

            <Section id="types" icon={<ShieldCheck className="w-4 h-4" />} title="2. Types of Cookies We Use">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">Cookies and similar technologies generally fall into three categories:</p>
              <div className="space-y-3">
                <div className="rounded-xl border border-[#16A34A]/25 bg-[#16A34A]/5 p-4">
                  <p className="text-sm font-semibold text-white mb-1.5">Essential / Strictly Necessary Cookies</p>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    These enable core features such as security, network management, and accessibility. They keep you signed in, protect pages from cross-site request forgery, remember your in-progress form entries, and allow the Platform to load. These cookies do not store any personally identifiable information about you and cannot be switched off without degrading the functionality of the Platform.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white mb-1.5">Analytics / Performance Cookies</p>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    These help us understand how visitors use the Platform — which pages are visited, how often, and whether features work correctly — so we can improve performance and reliability. Analytics data is aggregated and de-identified and is not used to build advertising profiles.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white mb-1.5">Marketing / Advertising Cookies</p>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    These are used to track visitors across websites in order to display relevant advertising, measure the effectiveness of campaigns, and personalise content. <strong className="text-white">STAR CATCH does not use advertising cookies, tracking pixels, or cross-site behavioural profiling.</strong> We never sell your data to advertisers or data brokers.
                  </p>
                </div>
              </div>
            </Section>

            <Section id="what-we-use" icon={<Settings className="w-4 h-4" />} title="3. Cookies &amp; Storage We Actually Use">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We keep our cookie footprint deliberately small. In practice, STAR CATCH relies on browser storage rather than heavy cookie tracking. Here's exactly what we use:
              </p>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-white/[0.04]">
                        {["Technology", "Type", "Purpose", "Duration"].map((h, i) => (
                          <th key={i} className="px-4 py-3 font-semibold text-white whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-white/5">
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">Session token (browser local storage)</td>
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">Essential</td>
                        <td className="px-4 py-3 text-[#A1A1AA] leading-relaxed align-top">Keeps you securely signed in to your account. Generated by our authentication system when you log in.</td>
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">Until you log out or clear your browser storage</td>
                      </tr>
                      <tr className="border-t border-white/5">
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">Scan-deduplication token (session storage)</td>
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">Essential</td>
                        <td className="px-4 py-3 text-[#A1A1AA] leading-relaxed align-top">A random identifier stored per browser tab, used to count each customer's QR/NFC scan only once per day, so reloads and double-taps don't inflate your analytics.</td>
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">Cleared when you close the browser tab</td>
                      </tr>
                      <tr className="border-t border-white/5">
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">Interface preferences (local storage)</td>
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">Essential / functional</td>
                        <td className="px-4 py-3 text-[#A1A1AA] leading-relaxed align-top">Remembers light preferences such as the last dashboard tab you viewed, so the interface feels consistent between visits.</td>
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">Until you clear your browser storage</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                <strong className="text-white">Note:</strong> because our measurement is essential and first-party, the Platform works fully with cookies and third-party storage blocked. Disabling them will only sign you out between page loads and may require you to log in again.
              </p>
            </Section>

            <Section id="analytics" icon={<ChartLine className="w-4 h-4" />} title="4. Analytics Cookies">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We do not run Google Analytics or any third-party analytics script on this Platform. Our measurement of Platform usage happens entirely on our own servers, using data you generate by using the Platform (such as scans, ratings, and feedback), which is described in detail in our <button onClick={() => navigate("/privacy")} className="text-[#16A34A] hover:underline cursor-pointer">Privacy Policy</button>.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                If we ever introduce a third-party analytics tool, this page will be updated to name it, explain what it collects, and — where required by law — we will ask for your consent before setting it.
              </p>
            </Section>

            <Section id="marketing" icon={<Megaphone className="w-4 h-4" />} title="5. Marketing Cookies">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We do not use marketing or advertising cookies, remarketing tags, or tracking pixels. We do not use services such as Google Ads, Facebook Pixel, or any ad-network beacon. Your activity on the Platform is never sold, rented, or exchanged with advertisers.
              </p>
            </Section>

            <Section id="third-party" icon={<Globe className="w-4 h-4" />} title="6. Third-Party Cookies on Our Platform">
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
                Some cookies may be set by third parties when you interact with external services connected to the Platform. These are governed by the third party's own privacy policy, not this one. In particular:
              </p>
              <Bullets
                items={[
                  <><strong className="text-white">Google Reviews redirect.</strong> When a customer rates your service 4-5 stars and chooses to leave a public review, they are redirected to your Google Business Profile. Once they leave our site, Google may set its own cookies and process their data under Google's privacy policy.</>,
                  <><strong className="text-white">Google Fonts.</strong> Our site loads typefaces from Google Fonts, which means your browser makes a request to Google's servers and Google receives your IP address as part of serving the font. We have chosen not to self-host fonts precisely to minimise data sharing.</>,
                  <><strong className="text-white">Email providers.</strong> We send verification and password-reset emails using email delivery providers. Opening those emails may cause the provider to place its own cookies or tracking pixels in that email client, governed by that provider's policy.</>,
                  <><strong className="text-white">WhatsApp support links.</strong> If you contact us via WhatsApp, Meta's own privacy policy applies once you leave our site.</>,
                ]}
              />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We do not embed third-party advertising cookies or share your data with such services for their own purposes. Each third party's handling of your data is governed by their own terms, which we encourage you to review.
              </p>
            </Section>

            <Section id="consent" icon={<Scale className="w-4 h-4" />} title="7. Consent & How to Control Cookies">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We ask for your consent the first time you visit the Platform. A cookie consent banner appears with three options: <strong className="text-white">Accept All</strong>, <strong className="text-white">Reject Non-Essential</strong>, or <strong className="text-white">Customize Preferences</strong>, where you can enable or disable Analytics and Marketing individually. Strictly Necessary cookies are always on because the Platform cannot function without them.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Your choice is stored on your device so we do not ask again on every visit. Because we only use strictly necessary cookies by default, the Platform is fully functional whether you accept or reject. If we ever introduce analytics or marketing technologies that are not essential, they will be gated behind your consent and cannot load until you allow them.
              </p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                You are always free to change your mind. Use the button below to revisit your preferences, or clear your browser storage to reset the banner to its first-visit state.
              </p>
              <CookieConsentControls />
            </Section>

            <Section id="browser-settings" icon={<Settings className="w-4 h-4" />} title="8. Managing Cookies in Your Browser">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                You can block, allow, or delete cookies through your browser settings. Below are the most common browsers. Note that disabling cookies may sign you out of STAR CATCH and prevent parts of the Platform from working.
              </p>

              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white mb-1.5">Google Chrome (Windows / Mac)</p>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    Open the three-dot menu (⋮) &rarr; Settings &rarr; Privacy and security &rarr; Third-party cookies &rarr; choose "Block third-party cookies" or "Block in Incognito." To delete existing cookies, go to Settings &rarr; Privacy and security &rarr; Clear browsing data and select "Cookies and other site data."
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white mb-1.5">Mozilla Firefox</p>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    Open the hamburger menu (☰) &rarr; Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data &rarr; "Manage Data…" to view or remove individual cookies, or "Clear Data…" to delete them all. Under "Enhanced Tracking Protection," you can choose whether to block third-party cookies.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white mb-1.5">Microsoft Edge</p>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    Open the three-dot menu (…) &rarr; Settings &rarr; Privacy, search, and services &rarr; "Choose what to track" (set to "Off") and "Manage on-device site data" to review or delete stored data.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white mb-1.5">Safari (Mac / iPhone &amp; iPad)</p>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    On Mac: Safari &rarr; Settings &rarr; Privacy &amp; Security, then untick "Allow websites to save historical data" or "Track cross-site with third-party content." To delete data: History &rarr; "Clear History." On iPhone/iPad: Settings &rarr; Apps &rarr; Safari &rarr; then adjust "Block All Cookies" and "Prevent Cross-Site Tracking."
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                For a general, browser-agnostic guide on managing cookies, visit{" "}
                <a href="https://www.aboutcookies.org/how-to-manage-cookies" target="_blank" rel="noreferrer" className="text-[#16A34A] hover:underline">AboutCookies.org</a>.
              </p>
            </Section>

            <Section id="do-not-track" icon={<Ban className="w-4 h-4" />} title="9. Do Not Track (DNT)">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                Some browsers send a "Do Not Track" (DNT) signal to indicate that a user does not wish to be tracked. Because STAR CATCH uses only essential cookies and does not track you for advertising, we do not use the DNT signal to change any functionality — there is nothing in our cookie set for it to switch off.
              </p>
            </Section>

            <Section id="changes" icon={<RefreshCw className="w-4 h-4" />} title="10. Changes to This Cookie Policy">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                We may update this Cookie Policy from time to time as our Platform and legal obligations evolve. Changes will be posted on this page with an updated "Last updated" date. Any new or changed cookies we adopt will be described here. Your continued use of the Platform after changes are posted constitutes acceptance of the updated policy.
              </p>
            </Section>

            <Section id="contact" icon={<Mail className="w-4 h-4" />} title="11. Contact Us">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                If you have any questions about this Cookie Policy or our use of cookies, please contact us:
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
            <button onClick={() => navigate("/cookie-policy")} className="hover:text-white transition-colors cursor-pointer text-[#16A34A]">Cookie Policy</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/refund-policy")} className="hover:text-white transition-colors cursor-pointer">Refund Policy</button>
          </div>
          <Button onClick={() => navigate("/")} className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer">
            <Star className="w-4 h-4 mr-2 fill-white" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
