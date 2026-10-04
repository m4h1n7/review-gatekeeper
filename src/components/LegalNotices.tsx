import { useNavigate } from "react-router";
import { Scale, FileCode2 } from "lucide-react";

/**
 * Footer legal notices: regulatory compliance disclaimer + asset licensing.
 *
 * The licence list is not decorative. Every entry was read from the installed
 * package's own package.json, and the font licence from the publisher:
 *   lucide-react   ISC        (icons)
 *   qrcode.react   ISC        (QR generation)
 *   framer-motion  MIT        (animation)
 *   react/-dom     MIT
 *   convex, @convex-dev/auth   Apache-2.0
 *   Poppins        SIL OFL 1.1 (Google Fonts, commercial use permitted)
 * The only first-party graphic is the STAR CATCH logo (logo.svg).
 * There are no stock photographs or third-party raster images in this project.
 */
export function LegalNotices() {
  const navigate = useNavigate();

  return (
    <div className="border-t border-white/[0.06] pt-6 mt-6 space-y-4">
      {/* Regulatory compliance */}
      <div className="flex items-start gap-2.5">
        <Scale className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-[11px] text-zinc-600 leading-relaxed">
          <span className="text-zinc-500">Legal compliance.</span>{" "}
          STAR CATCH operates in accordance with the applicable commercial and digital laws of
          Bangladesh, including the Bangladesh Contract Act 1872, the Information and Communication
          Technology (ICT) Act 2006 (as amended in 2013), the Digital Security Act 2018, and
          applicable consumer protection and e-commerce regulations. Use of this Platform is subject to
          our{" "}
          <button
            type="button"
            onClick={() => navigate("/terms")}
            className="hover:text-white transition-colors cursor-pointer underline underline-offset-2"
          >
            Terms of Service
          </button>
          ,{" "}
          <button
            type="button"
            onClick={() => navigate("/privacy")}
            className="hover:text-white transition-colors cursor-pointer underline underline-offset-2"
          >
            Privacy Policy
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={() => navigate("/refund-policy")}
            className="hover:text-white transition-colors cursor-pointer underline underline-offset-2"
          >
            Refund Policy
          </button>
          .
        </p>
      </div>

      {/* Asset licensing */}
      <div className="flex items-start gap-2.5">
        <FileCode2 className="w-3.5 h-3.5 text-zinc-600 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-zinc-600 leading-relaxed">
          <button
            type="button"
            onClick={() => navigate("/open-source-licenses")}
            className="hover:text-white transition-colors cursor-pointer text-[#A1A1AA] underline underline-offset-2"
          >
            Open-source licenses &amp; asset credits
          </button>{" "}
          <span className="text-zinc-600">
            — all icons, graphics and fonts on this site are open-source or first-party. Icons by Lucide
            (ISC) · QR by qrcode.react (ISC) · animation by Framer Motion (MIT) · typefaces Poppins
            (SIL OFL 1.1).
          </span>
        </p>
      </div>
    </div>
  );
}

export default LegalNotices;
