import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, FileCode2, ShieldCheck, Image as ImageIcon } from "lucide-react";

const ACCENT = "#16A34A";

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}

/**
 * Licences read from each installed package's own package.json at the versions
 * currently in package.json, not from memory.
 */
const SOFTWARE = [
  { name: "React & React DOM", license: "MIT", use: "User interface runtime", url: "https://github.com/facebook/react/blob/main/LICENSE" },
  { name: "Lucide React", license: "ISC", use: "All interface icons", url: "https://github.com/lucide-icons/lucide/blob/main/LICENSE" },
  { name: "qrcode.react", license: "ISC", use: "QR code generation", url: "https://github.com/zxing-js/qrcode-react/blob/main/LICENSE" },
  { name: "Framer Motion", license: "MIT", use: "Interface animation", url: "https://github.com/motiondivision/motion/blob/main/LICENSE" },
  { name: "Convex", license: "Apache-2.0", use: "Database, functions and file storage", url: "https://github.com/get-convex/convex-backend/blob/main/LICENSE" },
  { name: "Convex Auth", license: "Apache-2.0", use: "Authentication", url: "https://github.com/get-convex/auth/blob/main/LICENSE" },
  { name: "Resend", license: "MIT", use: "Transactional email delivery", url: "https://github.com/resend/react-email/blob/main/LICENSE" },
  { name: "Nodemailer", license: "MIT-0", use: "SMTP email fallback", url: "https://github.com/nodemailer/nodemailer/blob/master/LICENSE" },
  { name: "Tailwind CSS", license: "MIT", use: "Styling", url: "https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE" },
];

const FONTS = [
  { name: "Poppins", license: "SIL Open Font License 1.1", use: "All site typefaces", url: "https://openfontlicense.org/" },
];

export default function OpenSourceLicenses() {
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
            <FileCode2 className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Open-Source Licenses &amp; Asset Credits</h1>
            <p className="text-xs text-[#A1A1AA]">Last updated: October 4, 2026</p>
          </div>
        </div>

        <GlassPanel className="p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Our commitment</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Every icon, graphic, font and piece of software used on this Platform is either
              first-party work owned by STAR CATCH or is used under a recognised open-source licence
              that permits commercial use. <strong className="text-white">We do not use unlicensed
              stock photography, scraped assets, or third-party images.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2.5">
              <ImageIcon className="w-4 h-4" style={{ color: ACCENT }} />
              Images &amp; graphics
            </h2>
            <div className="rounded-xl border border-[#16A34A]/25 bg-[#16A34A]/5 p-4 space-y-2">
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                <strong className="text-white">There are no third-party raster images on this
                site.</strong> The only graphic asset shipped with the Platform is the STAR CATCH logo
                (<code className="text-[11px] text-white/80">logo.svg</code>), which is original
                first-party artwork. All other visuals are drawn in-browser as SVG — interface icons
                from Lucide, QR codes generated live by qrcode.react, and charts rendered as SVG by
                React. Customer logos and review photographs shown inside the product are uploaded by
                each business for their own use and are not distributed by us.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Software licences</h2>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-white/[0.04]">
                      {["Component", "Licence", "Used for"].map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold text-white whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SOFTWARE.map((s) => (
                      <tr key={s.name} className="border-t border-white/5">
                        <td className="px-4 py-3 align-top">
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[#16A34A] hover:underline">
                            {s.name}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-[#A1A1AA] align-top whitespace-nowrap">{s.license}</td>
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">{s.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Typefaces</h2>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-white/[0.04]">
                      {["Typeface", "Licence", "Used for"].map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold text-white whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FONTS.map((f) => (
                      <tr key={f.name} className="border-t border-white/5">
                        <td className="px-4 py-3 align-top">
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[#16A34A] hover:underline">
                            {f.name}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">{f.license}</td>
                        <td className="px-4 py-3 text-[#A1A1AA] align-top">{f.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3">
              The SIL Open Font License permits commercial use, embedding and web distribution. Full
              licence text is available at{" "}
              <a href="https://openfontlicense.org/" target="_blank" rel="noopener noreferrer" className="text-[#16A34A] hover:underline">
                openfontlicense.org
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4" style={{ color: ACCENT }} />
              Compliance with local law
            </h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              STAR CATCH operates in accordance with the applicable commercial and digital laws of
              Bangladesh, including the Bangladesh Contract Act 1872, the Information and Communication
              Technology (ICT) Act 2006 (as amended in 2013), the Digital Security Act 2018, and
              applicable consumer protection and e-commerce regulations. Use of the Platform is
              governed by our{" "}
              <button onClick={() => navigate("/terms")} className="text-[#16A34A] hover:underline cursor-pointer">
                Terms of Service
              </button>
              ,{" "}
              <button onClick={() => navigate("/privacy")} className="text-[#16A34A] hover:underline cursor-pointer">
                Privacy Policy
              </button>{" "}
              and{" "}
              <button onClick={() => navigate("/refund-policy")} className="text-[#16A34A] hover:underline cursor-pointer">
                Refund Policy
              </button>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Attribution</h2>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              © {new Date().getFullYear()} STAR CATCH. All rights reserved. Licences are reproduced in
              summary for transparency; the linked projects remain authoritative. If you believe any
              asset is misattributed or improperly licensed, please contact us at{" "}
              <a href="mailto:starcatchbd@gmail.com" className="text-[#16A34A] hover:underline break-all">
                starcatchbd@gmail.com
              </a>{" "}
              and we will investigate and correct it.
            </p>
          </section>
        </GlassPanel>

        <div className="text-center mt-8 mb-12 space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#71717A]">
            <button onClick={() => navigate("/terms")} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/privacy")} className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <span className="text-white/15">&bull;</span>
            <button onClick={() => navigate("/cookie-policy")} className="hover:text-white transition-colors cursor-pointer">Cookie Policy</button>
          </div>
          <Button onClick={() => navigate("/")} className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-semibold cursor-pointer">
            <Star className="w-4 h-4 mr-2 fill-white" /> Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
