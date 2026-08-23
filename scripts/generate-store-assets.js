// One-time script: render Chrome Web Store promo tiles (small + marquee)
// as PNGs from an SVG template reusing the extension's icon mark.
// Run: node scripts/generate-store-assets.js
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const outDir = path.join(__dirname, "../store");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// The bubble mark from public/icons/icon128.svg, as a reusable <symbol>.
const MARK = `
<symbol id="mark" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#46edd5"></stop>
      <stop offset="100%" stop-color="#007d6f"></stop>
    </linearGradient>
    <radialGradient id="gh" cx="35%" cy="28%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"></stop>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"></stop>
    </radialGradient>
    <linearGradient id="gbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1c2e2b"></stop>
      <stop offset="100%" stop-color="#0d1a18"></stop>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28.16" fill="url(#gbg)"></rect>
  <g transform="translate(3.58,3.58)" opacity="0.55">
    <path fill="#004a43" d="M 41.27 14.14 H 86.73 Q 111.36 14.14 111.36 38.77 V 61.2 Q 111.36 85.82 86.73 85.82 H 41.27 Q 16.64 85.82 16.64 61.2 V 38.77 Q 16.64 14.14 41.27 14.14 Z"></path>
  </g>
  <path fill="url(#g1)" d="M 41.27 14.14 H 86.73 Q 111.36 14.14 111.36 38.77 V 61.2 Q 111.36 85.82 86.73 85.82 H 67.79 L 54.53 111.42 L 46.95 85.82 H 41.27 Q 16.64 85.82 16.64 61.2 V 38.77 Q 16.64 14.14 41.27 14.14 Z"></path>
  <path fill="url(#gh)" d="M 41.27 14.14 H 86.73 Q 111.36 14.14 111.36 38.77 V 61.2 Q 111.36 85.82 86.73 85.82 H 67.79 L 54.53 111.42 L 46.95 85.82 H 41.27 Q 16.64 85.82 16.64 61.2 V 38.77 Q 16.64 14.14 41.27 14.14 Z"></path>
  <rect x="58.55" y="26.33" width="16.64" height="30.82" rx="8.32" fill="#004a43" opacity="0.65"></rect>
  <circle cx="66.87" cy="70.77" r="10.24" fill="#004a43" opacity="0.65"></circle>
  <rect x="55.68" y="23.46" width="16.64" height="30.82" rx="8.32" fill="#0a1614"></rect>
  <circle cx="64" cy="67.9" r="10.24" fill="#0a1614"></circle>
</symbol>`;

// Same layered radial-glow treatment as the landing page background
// (landing/index.html's body { background: radial-gradient(...) }),
// so the store promo tiles read as part of the same visual system.
const BG_GRADIENTS = `
<radialGradient id="glowTL" cx="12%" cy="-10%" r="75%">
  <stop offset="0%" stop-color="#46edd5" stop-opacity="0.16"></stop>
  <stop offset="100%" stop-color="#46edd5" stop-opacity="0"></stop>
</radialGradient>
<radialGradient id="glowTR" cx="100%" cy="8%" r="65%">
  <stop offset="0%" stop-color="#007d6f" stop-opacity="0.22"></stop>
  <stop offset="100%" stop-color="#007d6f" stop-opacity="0"></stop>
</radialGradient>
<linearGradient id="bgBase" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#0a1614"></stop>
  <stop offset="45%" stop-color="#0d1a18"></stop>
  <stop offset="100%" stop-color="#09140f"></stop>
</linearGradient>`;

function tile({ width, height, iconSize, iconX, iconY, wordmarkSize, taglineSize, textX, wordmarkY, taglineY, tagline }) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>${MARK}${BG_GRADIENTS}</defs>
  <rect width="${width}" height="${height}" fill="url(#bgBase)"></rect>
  <rect width="${width}" height="${height}" fill="url(#glowTL)"></rect>
  <rect width="${width}" height="${height}" fill="url(#glowTR)"></rect>
  <use href="#mark" x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}"></use>
  <text x="${textX}" y="${wordmarkY}" font-family="Segoe UI, Arial, sans-serif" font-size="${wordmarkSize}" font-weight="700" fill="#46edd5">Louder</text>
  <text x="${textX}" y="${taglineY}" font-family="Segoe UI, Arial, sans-serif" font-size="${taglineSize}" font-weight="400" fill="#9fb8b3">${tagline}</text>
</svg>`;
}

const targets = [
  {
    name: "promo-small-440x280.png",
    svg: tile({
      width: 440, height: 280,
      iconSize: 130, iconX: 35, iconY: 75,
      wordmarkSize: 42, taglineSize: 15,
      textX: 195, wordmarkY: 138, taglineY: 166,
      tagline: "Text-to-speech reader",
    }),
  },
  {
    name: "promo-marquee-1400x560.png",
    svg: tile({
      width: 1400, height: 560,
      iconSize: 280, iconX: 140, iconY: 140,
      wordmarkSize: 88, taglineSize: 34,
      textX: 480, wordmarkY: 300, taglineY: 360,
      tagline: "Distraction-free text-to-speech reader",
    }),
  },
];

for (const t of targets) {
  const resvg = new Resvg(t.svg, { fitTo: { mode: "original" } });
  const png = resvg.render().asPng();
  fs.writeFileSync(path.join(outDir, t.name), png);
  console.log(`✓ ${t.name}  (${png.length} bytes)`);
}
