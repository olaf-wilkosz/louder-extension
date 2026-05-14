// One-time script: rasterise SVG icons to PNG for Chrome extension manifest.
// Run: node scripts/convert-icons.js
const fs   = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const sizes = [16, 32, 48, 128];
const src   = path.join(__dirname, "../public/icons");
const out   = path.join(__dirname, "../public/icons");

for (const size of sizes) {
  const svgPath = path.join(src, `icon${size}.svg`);
  const pngPath = path.join(out, `icon${size}.png`);
  if (!fs.existsSync(svgPath)) { console.warn(`Missing: ${svgPath}`); continue; }
  const svg  = fs.readFileSync(svgPath);
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  const png  = resvg.render().asPng();
  fs.writeFileSync(pngPath, png);
  console.log(`✓ icon${size}.png  (${png.length} bytes)`);
}
