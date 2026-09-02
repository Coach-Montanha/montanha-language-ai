import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

// CRC32 implementation for PNG chunks
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }

  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Distance to a 4-pointed star (astroid shape): |x|^p + |y|^p <= r^p
function insideStar(px, py, cx, cy, radius, p = 0.55) {
  const dx = Math.abs(px - cx) / radius;
  const dy = Math.abs(py - cy) / radius;
  if (dx > 1 || dy > 1) return 0;
  const val = Math.pow(dx, p) + Math.pow(dy, p);
  if (val <= 1) {
    // Return coverage for anti-aliasing
    return Math.min(1, Math.max(0, (1 - val) * 8 + 0.5));
  }
  return 0;
}

function createSmartLanguagePng(width, height, isMaskable = false) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = makeChunk("IHDR", ihdr);

  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  const cornerR = isMaskable ? 0 : width * 0.22;
  const cx = width * 0.5;
  const cy = height * 0.5;

  // Star geometry relative to icon size
  const starRadius = width * 0.25;
  const star2Radius = width * 0.11;
  const star2Cx = cx + width * 0.22;
  const star2Cy = cy - height * 0.22;

  const star3Radius = width * 0.07;
  const star3Cx = cx - width * 0.22;
  const star3Cy = cy + height * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Rounded squircle boundary check
      if (!isMaskable) {
        let inBounds = true;
        const left = cornerR, right = width - cornerR;
        const top = cornerR, bottom = height - cornerR;

        if (x < left && y < top) {
          if (Math.hypot(x - left, y - top) > cornerR) inBounds = false;
        } else if (x > right && y < top) {
          if (Math.hypot(x - right, y - top) > cornerR) inBounds = false;
        } else if (x < left && y > bottom) {
          if (Math.hypot(x - left, y - bottom) > cornerR) inBounds = false;
        } else if (x > right && y > bottom) {
          if (Math.hypot(x - right, y - bottom) > cornerR) inBounds = false;
        }

        if (!inBounds) {
          rawData[pxOffset] = 0;
          rawData[pxOffset + 1] = 0;
          rawData[pxOffset + 2] = 0;
          rawData[pxOffset + 3] = 0;
          continue;
        }
      }

      // Background: Deep dark slate / midnight blue with subtle royal blue glow
      // #090d16 at edges to #1e293b / #2563eb glow at center
      const distFromCenter = Math.hypot(x - cx, y - cy) / (width * 0.7);
      const glow = Math.max(0, 1 - distFromCenter);

      let bgR = Math.round(15 + glow * 25);
      let bgG = Math.round(23 + glow * 55);
      let bgB = Math.round(42 + glow * 125);
      let bgA = 255;

      // Subtle border line inside squircle
      if (!isMaskable) {
        const isBorder =
          x === 1 || x === width - 2 || y === 1 || y === height - 2;
        if (isBorder) {
          bgR = Math.min(255, bgR + 40);
          bgG = Math.min(255, bgG + 60);
          bgB = Math.min(255, bgB + 90);
        }
      }

      // Primary 4-pointed Sparkle (white core with amber-gold highlights)
      const cov1 = insideStar(x, y, cx, cy, starRadius, 0.52);
      const cov2 = insideStar(x, y, star2Cx, star2Cy, star2Radius, 0.52);
      const cov3 = insideStar(x, y, star3Cx, star3Cy, star3Radius, 0.52);

      let finalR = bgR;
      let finalG = bgG;
      let finalB = bgB;

      // Render star 1 (main sparkle)
      if (cov1 > 0) {
        // Center is bright pure white, points have slight warm golden/amber tint
        const dCenter = Math.hypot(x - cx, y - cy) / starRadius;
        const starR = Math.round(255 - dCenter * 15);
        const starG = Math.round(255 - dCenter * 45); // slight amber/gold tip
        const starB = Math.round(255 - dCenter * 120);

        finalR = Math.round(finalR * (1 - cov1) + starR * cov1);
        finalG = Math.round(finalG * (1 - cov1) + starG * cov1);
        finalB = Math.round(finalB * (1 - cov1) + starB * cov1);
      }

      // Render star 2 (secondary top-right sparkle - golden amber #fbbf24)
      if (cov2 > 0) {
        const starR = 251;
        const starG = 191;
        const starB = 36;

        finalR = Math.round(finalR * (1 - cov2) + starR * cov2);
        finalG = Math.round(finalG * (1 - cov2) + starG * cov2);
        finalB = Math.round(finalB * (1 - cov2) + starB * cov2);
      }

      // Render star 3 (tertiary bottom-left sparkle - bright amber #fde047)
      if (cov3 > 0) {
        const starR = 253;
        const starG = 224;
        const starB = 71;

        finalR = Math.round(finalR * (1 - cov3) + starR * cov3);
        finalG = Math.round(finalG * (1 - cov3) + starG * cov3);
        finalB = Math.round(finalB * (1 - cov3) + starB * cov3);
      }

      rawData[pxOffset] = Math.min(255, finalR);
      rawData[pxOffset + 1] = Math.min(255, finalG);
      rawData[pxOffset + 2] = Math.min(255, finalB);
      rawData[pxOffset + 3] = bgA;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", deflated);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Generate multi-resolution ICO file containing standard PNG chunks
function createIcoFile(pngBuffersWithSize) {
  const numImages = pngBuffersWithSize.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(numImages, 4); // Number of images

  const dirEntries = [];
  let currentOffset = 6 + numImages * 16;

  for (const { size, buffer } of pngBuffersWithSize) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // Width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // Size of image data
    entry.writeUInt32LE(currentOffset, 12); // Offset of image data

    dirEntries.push(entry);
    currentOffset += buffer.length;
  }

  const chunks = [header, ...dirEntries, ...pngBuffersWithSize.map((x) => x.buffer)];
  return Buffer.concat(chunks);
}

// 1. Generate PNGs
console.log("Generating Smart Language icons...");
const iconsDir = path.resolve(process.cwd(), "public/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const png16 = createSmartLanguagePng(16, 16);
const png32 = createSmartLanguagePng(32, 32);
const png48 = createSmartLanguagePng(48, 48);
const png64 = createSmartLanguagePng(64, 64);
const png192 = createSmartLanguagePng(192, 192);
const png512 = createSmartLanguagePng(512, 512, false);
const png512Maskable = createSmartLanguagePng(512, 512, true);

fs.writeFileSync(path.join(iconsDir, "icon-192.png"), png192);
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), png512);
fs.writeFileSync(path.join(iconsDir, "icon-maskable-512.png"), png512Maskable);
fs.writeFileSync(path.resolve(process.cwd(), "public/apple-touch-icon.png"), png192);

// 2. Generate multi-resolution favicon.ico (16, 32, 48, 64)
const icoBuffer = createIcoFile([
  { size: 16, buffer: png16 },
  { size: 32, buffer: png32 },
  { size: 48, buffer: png48 },
  { size: 64, buffer: png64 },
]);
fs.writeFileSync(path.resolve(process.cwd(), "public/favicon.ico"), icoBuffer);
console.log("Replaced public/favicon.ico with Smart Language icon!");

// 3. Generate beautiful vector icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient (Deep midnight navy to dark slate) -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>

    <!-- Radial Glow behind star -->
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.45" />
      <stop offset="50%" stop-color="#2563eb" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#1e3a8a" stop-opacity="0" />
    </radialGradient>

    <!-- Main Star Gradient -->
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#fef08a" />
    </linearGradient>

    <!-- Golden Sparkle Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="starShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6" />
      <feDropShadow dx="0" dy="0" stdDeviation="24" flood-color="#3b82f6" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Fundo Squircle Arredondado -->
  <rect width="512" height="512" rx="115" fill="url(#bgGrad)" />
  <rect width="508" height="508" x="2" y="2" rx="113" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-opacity="0.3" />

  <!-- Brilho Radial Central -->
  <circle cx="256" cy="256" r="210" fill="url(#glowGrad)" />

  <!-- Grande Estrela Central (Sparkles Principal do Smart Language) -->
  <g filter="url(#starShadow)">
    <path
      d="M256 96 C256 184 272 200 360 256 C272 312 256 328 256 416 C256 328 240 312 152 256 C240 200 256 184 256 96 Z"
      fill="url(#starGrad)"
    />
  </g>

  <!-- Estrela Secundária Dourada / Âmbar no Canto Superior Direito -->
  <g filter="url(#starShadow)">
    <path
      d="M375 110 C375 138 383 146 411 164 C383 182 375 190 375 218 C375 190 367 182 339 164 C367 146 375 138 375 110 Z"
      fill="url(#goldGrad)"
    />
  </g>

  <!-- Estrela Terciária Suave no Canto Inferior Esquerdo -->
  <path
    d="M135 340 C135 358 140 363 158 375 C140 387 135 392 135 410 C135 392 130 387 112 375 C130 363 135 358 135 340 Z"
    fill="#fde047"
    opacity="0.9"
  />
</svg>
`;

fs.writeFileSync(path.join(iconsDir, "icon.svg"), svgContent);
fs.writeFileSync(path.resolve(process.cwd(), "public/favicon.svg"), svgContent);
console.log("Vector icon.svg & favicon.svg generated successfully!");
