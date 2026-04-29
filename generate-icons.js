// Generates minimal placeholder PNG icons using raw PNG encoding (no deps).
// PNG structure: signature + IHDR + IDAT + IEND chunks.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buf) {
  let crc = 0xffffffff;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makePng(size, r, g, b) {
  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);  // width
  ihdr.writeUInt32BE(size, 4);  // height
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 2;   // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw image data: each row = filter byte (0) + RGB pixels
  const rowLen = 1 + size * 3;
  const raw = Buffer.allocUnsafe(size * rowLen);
  for (let y = 0; y < size; y++) {
    const off = y * rowLen;
    raw[off] = 0; // filter type none
    for (let x = 0; x < size; x++) {
      // Draw a simple play-button triangle on a dark background
      const cx = size / 2, cy = size / 2;
      const px = x - cx, py = y - cy;
      const inCircle = px * px + py * py <= (size * 0.45) ** 2;
      // Triangle: pointing right
      const inTriangle =
        px >= -size * 0.2 &&
        Math.abs(py) <= (px + size * 0.2) * 0.7;
      const pr = inCircle ? (inTriangle ? 255 : r) : 26;
      const pg = inCircle ? (inTriangle ? 230 : g) : 26;
      const pb = inCircle ? (inTriangle ? 102 : b) : 46;
      raw[off + 1 + x * 3 + 0] = pr;
      raw[off + 1 + x * 3 + 1] = pg;
      raw[off + 1 + x * 3 + 2] = pb;
    }
  }

  const compressed = zlib.deflateSync(raw);

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

for (const size of [16, 48, 128]) {
  // Dark navy background, yellow circle, white triangle
  const buf = makePng(size, 26, 26, 46);
  fs.writeFileSync(path.join(outDir, `icon${size}.png`), buf);
  console.log(`Generated icon${size}.png`);
}
