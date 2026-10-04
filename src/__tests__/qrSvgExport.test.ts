/**
 * @vitest-environment happy-dom
 *
 * Tests the printable-QR SVG export (src/lib/qrSvgExport.ts) against the
 * requirements the exported file has to satisfy:
 *
 *  1. root <svg> carries viewBox="0 0 500 500", width="500", height="500"
 *  2. QR modules are native <path>/<rect> geometry — no external image and no
 *     unscaled logo
 *  3. the emitted geometry is a genuine, scannable QR (quiet zone + finder
 *     patterns + timing patterns survive the scaling)
 *
 * These run the real production builder against a real qrcode.react render in
 * a real DOM, so they exercise the exact code path the Download SVG button
 * uses. All state is built in beforeAll and read inside it() bodies, since
 * describe bodies are evaluated during collection, before beforeAll runs.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import { buildQrSvgMarkup, QR_EXPORT_SIZE } from "@/lib/qrSvgExport";

const REVIEW_URL = "https://starcatchreviews.freebuff.app/review/demo-shop";
const LOGO_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/** Exactly the markup PrintableQR renders for its hidden export source. */
const SOURCE_MARKUP = renderToStaticMarkup(
  createElement(QRCodeSVG, {
    value: REVIEW_URL,
    size: QR_EXPORT_SIZE,
    level: "H",
    bgColor: "#FFFFFF",
    fgColor: "#18181B",
    includeMargin: true,
  }),
);

function mount(markup: string): Document {
  const doc = document.implementation.createHTMLDocument("t");
  doc.body.innerHTML = markup;
  return doc;
}

interface Exported {
  out: string;
  root: SVGSVGElement;
  paths: SVGPathElement[];
  rects: SVGRectElement[];
  images: SVGImageElement[];
}

/** The dark-module matrix encoded in a module path. */
function readMatrix(d: string, n: number): boolean[][] {
  const grid: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const tokens = d.match(/[MmZzLlHhVv]|-?\d*\.?\d+/g) ?? [];
  let cx = 0, cy = 0, px = 0, py = 0, w = 0, h = 0;
  const commit = () => {
    for (let y = py; y < py + h; y++)
      for (let x = px; x < px + w; x++)
        if (x >= 0 && y >= 0 && x < n && y < n) grid[y][x] = true;
  };
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const num = () => Number(tokens[++i]);
    if (t === "M" || t === "m") {
      commit();
      const nx = num(), ny = num();
      cx = t === "M" ? nx : cx + nx;
      cy = t === "M" ? ny : cy + ny;
      px = cx; py = cy; w = 0; h = 0;
    } else if (t === "h") { cx += num(); w = Math.max(w, cx - px); }
    else if (t === "H") { cx = num(); w = Math.max(w, cx - px); }
    else if (t === "v") { cy += num(); h = Math.max(h, cy - py); }
    else if (t === "V") { cy = num(); h = Math.max(h, cy - py); }
  }
  commit();
  return grid;
}

let sourceSvg: SVGSVGElement;
let cells: number;
let scale: number;
let plain: Exported;
let withLogo: Exported;
let remoteLogo: string;

function exportOf(options: Parameters<typeof buildQrSvgMarkup>[1]): Exported {
  const out = buildQrSvgMarkup(sourceSvg, options);
  const root = mount(out).querySelector("svg") as SVGSVGElement;
  return {
    out,
    root,
    paths: Array.from(root.querySelectorAll("path")),
    rects: Array.from(root.querySelectorAll("rect")),
    images: Array.from(root.querySelectorAll("image")),
  };
}

beforeAll(() => {
  sourceSvg = mount(SOURCE_MARKUP).querySelector("svg") as SVGSVGElement;
  cells = Number((sourceSvg.getAttribute("viewBox") ?? "0 0 1 1").trim().split(/\s+/)[2]);
  scale = QR_EXPORT_SIZE / cells;
  plain = exportOf({ accentColor: "#16A34A", logoDataUrl: null });
  withLogo = exportOf({ accentColor: "#2563EB", logoDataUrl: LOGO_DATA_URL });
  remoteLogo = buildQrSvgMarkup(sourceSvg, {
    accentColor: "#16A34A",
    logoDataUrl: "https://cdn.example.com/logo.png",
  });
});

describe("QR SVG export — root element", () => {
  it("starts with an XML declaration", () => {
    expect(plain.out.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="no"?>')).toBe(true);
  });

  it('declares viewBox="0 0 500 500"', () => {
    expect(plain.root.getAttribute("viewBox")).toBe("0 0 500 500");
  });

  it('declares width="500" and height="500"', () => {
    expect(plain.root.getAttribute("width")).toBe("500");
    expect(plain.root.getAttribute("height")).toBe("500");
  });

  it("declares the SVG namespace", () => {
    expect(plain.root.getAttribute("xmlns")).toBe("http://www.w3.org/2000/svg");
  });

  it("re-parses as well-formed SVG keeping the 500x500 viewBox", () => {
    const reparsed = mount(plain.out.replace(/^<\?xml[^>]*\?>\s*/, "")).querySelector("svg");
    expect(reparsed).not.toBeNull();
    expect(reparsed?.getAttribute("viewBox")).toBe("0 0 500 500");
  });
});

describe("QR SVG export — native geometry, no external assets", () => {
  it("encodes QR modules as native <path> elements", () => {
    // white background + module path + native star
    expect(plain.paths.length).toBeGreaterThanOrEqual(2);
  });

  it("encodes the brand badge as native <rect> elements", () => {
    expect(plain.rects.length).toBeGreaterThanOrEqual(2);
  });

  it("contains no <image> when no logo was uploaded", () => {
    expect(plain.images.length).toBe(0);
  });

  it("contains no external http(s) asset reference", () => {
    expect(plain.out).not.toMatch(/(?:href|src)\s*=\s*["']https?:/i);
    // the only permitted URL is the w3.org namespace
    expect(plain.out).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
  });

  it("contains no xlink:href and no CSS url() reference", () => {
    expect(plain.out).not.toContain("xlink:href");
    expect(plain.out).not.toMatch(/url\(/);
  });

  it("keeps crispEdges on the module path so it stays sharp when scaled", () => {
    const fg = plain.paths.find((p) => p.getAttribute("d")?.includes("h"));
    expect(fg?.getAttribute("shape-rendering")).toBe("crispEdges");
  });

  it("scales the library's cell-space paths into 500 user units", () => {
    const g = plain.root.querySelector("g") as SVGGElement;
    const gScale = Number((g.getAttribute("transform") ?? "").replace("scale(", "").replace(")", ""));
    expect(gScale).toBeCloseTo(QR_EXPORT_SIZE / cells, 9);
  });

  it("draws the star as a native <path> rather than a glyph or link", () => {
    expect(plain.paths.some((p) => p.getAttribute("fill") === "#FFFFFF")).toBe(true);
  });

  it("centres a 100x100 accent badge on the canvas", () => {
    const badge = plain.rects.find((r) => r.getAttribute("fill") === "#16A34A")!;
    expect(badge.getAttribute("x")).toBe("200");
    expect(badge.getAttribute("y")).toBe("200");
    expect(badge.getAttribute("width")).toBe("100");
    expect(badge.getAttribute("height")).toBe("100");
  });
});

describe("QR SVG export — uploaded logo stays self-contained and unscaled-safe", () => {
  it("embeds exactly one <image>", () => {
    expect(withLogo.images.length).toBe(1);
  });

  it("uses a self-contained data: URL, never an external link", () => {
    const href = withLogo.images[0].getAttribute("href") ?? "";
    expect(href.startsWith("data:image/")).toBe(true);
    expect(href).not.toMatch(/^https?:/);
  });

  it("aspect-fits the logo so it can never be stretched", () => {
    expect(withLogo.images[0].getAttribute("preserveAspectRatio")).toBe("xMidYMid meet");
  });

  it("scales the logo to a real square box inside the badge", () => {
    const img = withLogo.images[0];
    const x = Number(img.getAttribute("x"));
    const y = Number(img.getAttribute("y"));
    const w = Number(img.getAttribute("width"));
    const h = Number(img.getAttribute("height"));
    expect(w).toBeGreaterThan(0);
    expect(w).toBe(h);
    expect(x).toBeGreaterThanOrEqual(200);
    expect(y).toBeGreaterThanOrEqual(200);
    expect(x + w).toBeLessThanOrEqual(300);
    expect(y + h).toBeLessThanOrEqual(300);
  });

  it("keeps the 500x500 root with a logo present", () => {
    expect(withLogo.root.getAttribute("viewBox")).toBe("0 0 500 500");
    expect(withLogo.root.getAttribute("width")).toBe("500");
  });

  it("rejects a remote logo URL and falls back to the native star", () => {
    expect(remoteLogo).not.toContain("cdn.example.com");
    expect(remoteLogo).toMatch(/^<\?xml/);
  });
});

describe("QR SVG export — the emitted geometry is a real, scannable QR", () => {
  const isFinderAt = (grid: boolean[][], ox: number, oy: number) => {
    const dark = (x: number, y: number) => grid[y][x] === true;
    for (let dy = 0; dy < 7; dy++)
      for (let dx = 0; dx < 7; dx++) {
        const ring = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        if (ring !== dark(ox + dx, oy + dy) && core !== dark(ox + dx, oy + dy)) return false;
      }
    return true;
  };

  const moduleGrid = () => {
    const fg = plain.paths.find(
      (p) => p.getAttribute("d")?.includes("h") && !p.getAttribute("d")?.startsWith("M0,0"),
    )!;
    return readMatrix(fg.getAttribute("d") ?? "", cells);
  };

  it("covers the full 500x500 canvas with the white background", () => {
    const bg = plain.paths.find((p) => p.getAttribute("d")?.startsWith("M0,0"))!;
    const toks = (bg.getAttribute("d") ?? "").match(/[MmHhVv]|-?\d*\.?\d+/g) ?? [];
    let x = 0, y = 0, x1 = 0, y1 = 0;
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      const num = () => Number(toks[++i]);
      if (t === "M" || t === "m") {
        const nx = num(), ny = num();
        x = t === "M" ? nx : x + nx;
        y = t === "M" ? ny : y + ny;
      } else if (t === "h") { x += num(); } else if (t === "H") { x = num(); }
      else if (t === "v") { y += num(); } else if (t === "V") { y = num(); }
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
    expect(x1 * scale).toBeCloseTo(500, 3);
    expect(y1 * scale).toBeCloseTo(500, 3);
  });

  it("preserves the 4-module quiet zone the spec requires for scanning", () => {
    const grid = moduleGrid();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let y = 0; y < cells; y++)
      for (let x = 0; x < cells; x++)
        if (grid[y][x]) {
          minX = Math.min(minX, x); maxX = Math.max(maxX, x);
          minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        }
    const inset = 4 * scale;
    expect(minX).toBe(4);
    expect(minY).toBe(4);
    expect(minX * scale).toBeCloseTo(inset, 3);
    // grid holds cell indices, so the drawn right/bottom edge is max+1
    expect((maxX + 1) * scale).toBeCloseTo(500 - inset, 3);
    expect((maxY + 1) * scale).toBeCloseTo(500 - inset, 3);
  });

  it("has a plausible number of dark modules", () => {
    expect(moduleGrid().flat().filter(Boolean).length).toBeGreaterThan(200);
  });

  it("keeps all three finder patterns intact", () => {
    const grid = moduleGrid();
    expect(isFinderAt(grid, 4, 4)).toBe(true);
    expect(isFinderAt(grid, cells - 11, 4)).toBe(true);
    expect(isFinderAt(grid, 4, cells - 11)).toBe(true);
  });

  it("keeps both timing patterns alternating", () => {
    const grid = moduleGrid();
    const dark = (x: number, y: number) => grid[y][x] === true;
    const T = 10; // content row/col 6, offset by the 4-module quiet zone
    for (let i = 12; i <= cells - 13; i++) {
      expect(dark(i, T)).toBe(i % 2 === 0);
      expect(dark(T, i)).toBe(i % 2 === 0);
    }
  });

  it("does not mutate the source qrcode.react element", () => {
    expect(sourceSvg.getAttribute("viewBox")).toBe(`0 0 ${cells} ${cells}`);
    expect(sourceSvg.getAttribute("width")).toBe(String(QR_EXPORT_SIZE));
    expect(sourceSvg.querySelectorAll("image").length).toBe(0);
  });
});
