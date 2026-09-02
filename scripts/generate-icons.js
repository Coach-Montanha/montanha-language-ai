import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

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

function createPng(width, height) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk("IHDR", ihdr);

  // Scanlines (filter 0 + RGBA)
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  const radius = width / 2;
  const cornerR = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter none

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Check rounded corner bounding box
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

      // Background gradient: dark blue (30, 64, 175) to bright blue (59, 130, 246)
      const gradRatio = (x + y) / (width + height);
      let r = Math.round(30 + gradRatio * 29);
      let g = Math.round(64 + gradRatio * 66);
      let b = Math.round(175 + gradRatio * 71);
      let a = 255;

      // Draw stylized speech bubble in center
      const cx = width * 0.5;
      const cy = height * 0.48;
      const bw = width * 0.35;
      const bh = height * 0.25;

      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);

      if (dx < bw && dy < bh) {
        r = 255;
        g = 255;
        b = 255;
      }

      // Speech bubble pointer triangle
      if (x > cx - width * 0.25 && x < cx - width * 0.1 && y >= cy + bh && y < cy + bh + height * 0.1) {
        const triX = x - (cx - width * 0.25);
        const triY = y - (cy + bh);
        if (triX < (height * 0.1 - triY)) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      // Blue emblem inside bubble
      if (dx < bw * 0.5 && dy < bh * 0.4) {
        r = 37;
        g = 99;
        b = 235;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk("IDAT", deflated);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve(process.cwd(), "public/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate 192x192
const png192 = createPng(192, 192);
fs.writeFileSync(path.join(iconsDir, "icon-192.png"), png192);

// Generate 512x512
const png512 = createPng(512, 512);
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), png512);
fs.writeFileSync(path.join(iconsDir, "icon-maskable-512.png"), png512);

// Generate apple-touch-icon.png
fs.writeFileSync(path.resolve(process.cwd(), "public/apple-touch-icon.png"), png192);

console.log("PWA Icons generated successfully!");
