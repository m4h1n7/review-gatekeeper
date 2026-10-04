/**
 * Full-size SVG export for the printable review QR code.
 *
 * Extracted from PrintableQR so the exact production code path can be executed
 * and asserted in isolation (a DOM is the only requirement).
 *
 * Guarantees for the produced file:
 *  - root <svg> carries xmlns, viewBox="0 0 500 500", width="500", height="500"
 *  - every QR module is native <path> geometry (never a linked bitmap)
 *  - the brand badge is native <rect>/<path>; an uploaded logo is embedded as a
 *    self-contained data: URL and is aspect-fit, so it is never stretched
 */

/** Exported SVG canvas edge, in user units. */
export const QR_EXPORT_SIZE = 500;

/** 5-point star in a 100x100 box, used as native <path> geometry. */
const STAR_PATH =
  "M50.00,0.00 L38.24,33.82 L2.45,34.55 L30.98,56.18 L20.61,90.45 L50.00,70.00 " +
  "L79.39,90.45 L69.02,56.18 L97.55,34.55 L61.76,33.82 Z";

const SVG_NS = "http://www.w3.org/2000/svg";

export interface QrSvgExportOptions {
  /** Brand badge fill. */
  accentColor?: string;
  /**
   * Self-contained data: URL of an uploaded logo. Omit to draw the native star
   * instead. Only data: URLs are accepted — a remote URL is rejected so the
   * exported file can never depend on an external asset.
   */
  logoDataUrl?: string | null;
}

/**
 * Build a standalone, full-size SVG document string from a qrcode.react
 * <svg> element. Does not mutate the source element.
 */
export function buildQrSvgMarkup(
  svgEl: SVGSVGElement,
  options: QrSvgExportOptions = {},
): string {
  const { accentColor = "#16A34A", logoDataUrl = null } = options;
  const clone = svgEl.cloneNode(true) as SVGSVGElement;

  // qrcode.react renders in cell units ("0 0 N N"). Read that, then scale the
  // whole thing into a 500-unit user space.
  const vb = (svgEl.getAttribute("viewBox") ?? "0 0 1 1").trim().split(/\s+/).map(Number);
  const cells = vb[2] > 0 ? vb[2] : 1;
  const scale = QR_EXPORT_SIZE / cells;

  // Normalise the root so the file is valid and renders at full size in any
  // viewer, editor or print driver.
  clone.setAttribute("xmlns", SVG_NS);
  clone.setAttribute("viewBox", `0 0 ${QR_EXPORT_SIZE} ${QR_EXPORT_SIZE}`);
  clone.setAttribute("width", String(QR_EXPORT_SIZE));
  clone.setAttribute("height", String(QR_EXPORT_SIZE));
  clone.removeAttribute("role");
  clone.removeAttribute("id");
  clone.removeAttribute("class");

  // Drop any linked bitmap the renderer may have produced — the QR modules
  // must be vector geometry in this file.
  for (const img of Array.from(clone.querySelectorAll("image"))) img.remove();

  // Wrap the library's cell-unit <path> elements in a scaling group so they
  // fill the 500x500 canvas without rewriting any path data.
  const scaleGroup = document.createElementNS(SVG_NS, "g");
  scaleGroup.setAttribute("transform", `scale(${scale})`);
  while (clone.firstChild) scaleGroup.appendChild(clone.firstChild);
  clone.appendChild(scaleGroup);

  // Brand badge — native geometry, centred on the code.
  const badge = QR_EXPORT_SIZE * 0.2;
  const badgeX = (QR_EXPORT_SIZE - badge) / 2;
  const pad = QR_EXPORT_SIZE * 0.015;

  // Quiet knockout so the badge never sits on top of live modules.
  const knockout = document.createElementNS(SVG_NS, "rect");
  knockout.setAttribute("x", String(badgeX - pad));
  knockout.setAttribute("y", String(badgeX - pad));
  knockout.setAttribute("width", String(badge + pad * 2));
  knockout.setAttribute("height", String(badge + pad * 2));
  knockout.setAttribute("rx", String(badge * 0.22));
  knockout.setAttribute("fill", "#FFFFFF");
  clone.appendChild(knockout);

  const badgeRect = document.createElementNS(SVG_NS, "rect");
  badgeRect.setAttribute("x", String(badgeX));
  badgeRect.setAttribute("y", String(badgeX));
  badgeRect.setAttribute("width", String(badge));
  badgeRect.setAttribute("height", String(badge));
  badgeRect.setAttribute("rx", String(badge * 0.22));
  badgeRect.setAttribute("fill", accentColor);
  clone.appendChild(badgeRect);

  if (logoDataUrl && logoDataUrl.startsWith("data:image/")) {
    // Self-contained data URL, aspect-fit inside the badge box so the logo is
    // never distorted, and inset so it clears the rounded corners.
    const img = document.createElementNS(SVG_NS, "image");
    const inset = badge * 0.16;
    img.setAttribute("x", String(badgeX + inset));
    img.setAttribute("y", String(badgeX + inset));
    img.setAttribute("width", String(badge - inset * 2));
    img.setAttribute("height", String(badge - inset * 2));
    img.setAttribute("preserveAspectRatio", "xMidYMid meet");
    img.setAttribute("href", logoDataUrl);
    clone.appendChild(img);
  } else {
    // No usable logo: draw the star as a real <path>, not a font glyph or a
    // linked asset.
    const star = document.createElementNS(SVG_NS, "path");
    star.setAttribute("d", STAR_PATH);
    star.setAttribute("fill", "#FFFFFF");
    star.setAttribute(
      "transform",
      `translate(${badgeX + badge * 0.2} ${badgeX + badge * 0.2}) scale(${badge * 0.6 / 100})`
    );
    clone.appendChild(star);
  }

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
    new XMLSerializer().serializeToString(clone)
  );
}
