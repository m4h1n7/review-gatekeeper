/**
 * Generate PNG favicon files from the SVG logo.
 * Uses Node's built-in capabilities to create minimal valid PNG files
 * with the StarCatch "SC" lettermark on a dark rounded-rect background.
 *
 * Run: node scripts/generate-favicons.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

// Minimal PNG generator (no external deps)
function createPNG(size, bgColor, fgColor) {
  // Create an RGBA pixel buffer
  const pixels = new Uint8Array(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  const cornerRadius = size * 0.2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Rounded rectangle mask
      const inRoundedRect = (() => {
        if (x < cornerRadius || x > size - cornerRadius) {
          if (y < cornerRadius || y > size - cornerRadius) {
            // In corner zone — check circle
            const cornerX =
              x < cornerRadius ? cornerRadius : size - cornerRadius;
            const cornerY =
              y < cornerRadius ? cornerRadius : size - cornerRadius;
            const dist = Math.sqrt(
              (x - cornerX) ** 2 + (y - cornerY) ** 2,
            );
            return dist <= cornerRadius;
          }
          return false;
        }
        return y >= cornerRadius && y <= size - cornerRadius;
      })();

      if (!inRoundedRect) {
        // Transparent
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
        continue;
      }

      // Background
      pixels[idx] = bgColor[0];
      pixels[idx + 1] = bgColor[1];
      pixels[idx + 2] = bgColor[2];
      pixels[idx + 3] = 255;

      // Draw a simple 5-pointed star
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const normalizedAngle = ((angle + Math.PI) / (2 * Math.PI)) * 5;
      const frac = normalizedAngle % 1;
      const outerR = radius;
      const innerR = radius * 0.42;

      // Star outline: alternate between outer and inner radius
      const sector = Math.floor(normalizedAngle) % 5;
      const t = frac < 0.5 ? frac * 2 : 1 - (frac - 0.5) * 2;
      const starR = innerR + (outerR - innerR) * t;

      // Star body (filled with some taper)
      const starEdgeAngle =
        angle + (frac < 0.5 ? 0.15 : -0.15) * (1 - t);
      const edgeDist =
        Math.abs(dist * Math.cos(Math.atan2(dy, dx) - starEdgeAngle));
      const inStar = dist <= starR * 1.02 && dist >= innerR * 0.15;

      // Draw star outline with thickness
      const outlineThickness = size * 0.08;
      const distFromEdge = Math.abs(dist - starR);
      const inOutline = distFromEdge < outlineThickness && dist >= innerR * 0.1;
      // Also draw inner circle of star
      const inInnerCircle = dist <= innerR * 0.3;

      if (inOutline || inInnerCircle) {
        pixels[idx] = fgColor[0];
        pixels[idx + 1] = fgColor[1];
        pixels[idx + 2] = fgColor[2];
        pixels[idx + 3] = 255;
      }
    }
  }

  return encodePNG(size, size, pixels);
}

// Simple PNG encoder (DEFLATE-compressed, no zlib dependency)
function encodePNG(width, height, rgba) {
  // PNG structure: signature + IHDR + IDAT + IEND
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = new Uint8Array(13);
  writeUint32BE(ihdr, 0, width);
  writeUint32BE(ihdr, 4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Build raw image data (filter byte 0 per row)
  const rawDataLen = height * (1 + width * 4);
  const rawData = new Uint8Array(rawDataLen);
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter: None
    const srcOffset = y * width * 4;
    const dstOffset = y * (1 + width * 4) + 1;
    rawData.set(rgba.subarray(srcOffset, srcOffset + width * 4), dstOffset);
  }

  // Compress with zlib (using deflate via Node's zlib if available, else store)
  const compressedData = deflateSync(rawData);

  // Build chunks
  const ihdrChunk = makeChunk("IHDR", ihdr);
  const idatChunk = makeChunk("IDAT", compressedData);
  const iendChunk = makeChunk("IEND", new Uint8Array(0));

  const totalLen =
    signature.length +
    ihdrChunk.length +
    idatChunk.length +
    iendChunk.length;
  const png = new Uint8Array(totalLen);
  let offset = 0;
  png.set(signature, offset);
  offset += signature.length;
  png.set(ihdrChunk, offset);
  offset += ihdrChunk.length;
  png.set(idatChunk, offset);
  offset += idatChunk.length;
  png.set(iendChunk, offset);

  return png;
}

function createStoredDeflate(data) {
  // Build zlib-wrapped stored (uncompressed) blocks
  const MAX_BLOCK = 65535;
  const blocks = [];
  let pos = 0;

  while (pos < data.length) {
    const remaining = data.length - pos;
    const blockLen = Math.min(remaining, MAX_BLOCK);
    const isLast = pos + blockLen >= data.length;
    const header = new Uint8Array(5);
    header[0] = isLast ? 0x01 : 0x00;
    header[1] = blockLen & 0xff;
    header[2] = (blockLen >> 8) & 0xff;
    header[3] = ~blockLen & 0xff;
    header[4] = (~blockLen >> 8) & 0xff;
    blocks.push(header);
    blocks.push(data.subarray(pos, pos + blockLen));
    pos += blockLen;
  }

  const totalLen = blocks.reduce((s, b) => s + b.length, 0);
  const result = new Uint8Array(totalLen);
  let off = 0;
  for (const block of blocks) {
    result.set(block, off);
    off += block.length;
  }

  // Wrap in zlib: CMF=0x78, FLG=0x01
  const zlibHeader = new Uint8Array([0x78, 0x01]);
  // Adler-32 checksum
  const adler = adler32(data);
  const adlerBytes = new Uint8Array(4);
  writeUint32BE(adlerBytes, 0, adler);

  const output = new Uint8Array(zlibHeader.length + result.length + adlerBytes.length);
  output.set(zlibHeader, 0);
  output.set(result, zlibHeader.length);
  output.set(adlerBytes, zlibHeader.length + result.length);
  return output;
}

function adler32(data) {
  let a = 1,
    b = 0;
  const MOD = 65521;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD;
    b = (b + a) % MOD;
  }
  return (b << 16) | a;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = new Uint8Array(4 + 4 + len + 4);
  writeUint32BE(chunk, 0, len);
  const typeBytes = new TextEncoder().encode(type);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  writeUint32BE(chunk, 8 + len, crc);
  return chunk;
}

function writeUint32BE(buf, offset, value) {
  buf[offset] = (value >>> 24) & 0xff;
  buf[offset + 1] = (value >>> 16) & 0xff;
  buf[offset + 2] = (value >>> 8) & 0xff;
  buf[offset + 3] = value & 0xff;
}

// CRC32 for PNG chunks
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// StarCatch brand colors
const BG = [22, 22, 26]; // #16161A dark
const FG = [253, 253, 253]; // #FDFDFD white

// Generate all sizes
const sizes = [
  { size: 16, name: "favicon-16x16.png" },
  { size: 32, name: "favicon-32x32.png" },
  { size: 48, name: "favicon-48x48.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 192, name: "android-chrome-192x192.png" },
  { size: 512, name: "android-chrome-512x512.png" },
];

console.log("Generating StarCatch favicons...\n");

for (const { size, name } of sizes) {
  const png = createPNG(size, BG, FG);
  const outPath = join(PUBLIC_DIR, name);
  writeFileSync(outPath, png);
  console.log(`  ✅ ${name} (${size}x${size}) — ${png.length} bytes`);
}

console.log(`\nDone! ${sizes.length} favicon files written to public/`);
