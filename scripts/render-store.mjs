// Renders every picture of the extension that is not drawn by hand: the store screenshots, the
// promo tiles, the social preview and the website's images. They are photographs of the REAL
// built extension (dist/chrome/content.js) running on a demo article (store/render/page.html) in
// headless Chrome, so they stay true to the product when it changes.
//
//   npm run render [name]       builds the extension first; needs Chrome, Edge or Brave.
//                               `name` renders only the jobs whose name contains it.
//
// Three stages:
//   1. the demo article in each scene, at 2x       -> dist/render/<scene>.png (+ where the widget is)
//   2. crops of those for the website              -> landing/img/*.webp   (sharp: crop + WebP)
//   3. slides and tiles composed from stages 1-2   -> store/screenshots/*.png, store/promo-*.png, store/og-1200x630.png
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { launch } from "chrome-launcher";
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import { startServer } from "./static-server.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = 8767;
const TMP = join(ROOT, "dist", "render");
const only = process.argv[2];
const wanted = (name) => !only || name.includes(only);

execFileSync(process.execPath, ["scripts/build.mjs", "chrome"], { cwd: ROOT, stdio: "inherit" });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
mkdirSync(join(ROOT, "landing", "img"), { recursive: true });
mkdirSync(join(ROOT, "store", "screenshots"), { recursive: true });

const server = await startServer(ROOT, PORT);
const chrome = await launch({ chromeFlags: ["--headless=new", "--lang=en-US", "--hide-scrollbars", "--force-color-profile=srgb"] });
const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
const url = (path) => `http://localhost:${PORT}/${path}`;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(path, width, height, scale) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: scale });
  await page.goto(url(path), { waitUntil: "load" });
  await page.evaluate(async () => { await document.fonts.ready; });
  return page;
}

// ── stage 1: the demo article in each scene ─────────────────────────────────────────────
/** Shows the panel (as the toolbar button does). */
async function showWidget(page) {
  await page.evaluate(() => window.__louderMessage({ type: "TOGGLE_PANEL" }));
  await page.waitForSelector('pierce/button[aria-label="Play"]');
  await pause(400); // entrance animation
}

/** Presses Play with the speech engine set to freeze on word `word` of sentence `skip`. */
async function playTo(page, { skip, word }) {
  await page.evaluate((s) => Object.assign(window.__speech, s, { spoken: 0 }), { skip, word });
  await page.click('pierce/button[aria-label="Play"]');
  await page.waitForFunction(() => CSS.highlights.has("louder-word"), { timeout: 10000 });
  await pause(500);
}

/** Widens the collapsed pill into the full control bar (timer, settings, speed, voice, skip). */
async function expand(page) {
  await page.click('pierce/button[aria-label="Expand"]');
  await page.mouse.move(2, 2); // keep the pointer's hover highlight out of the picture
  await pause(500);
}

async function openPopup(page, label) {
  await expand(page);
  await page.click(`pierce/button[aria-label^="${label}"]`);
  await pause(600); // popIn animation
}

/** Drags a real mouse selection over the first sentence of paragraph 2, then rests the pointer on the pill. */
async function selectText(page) {
  const { from, to } = await page.evaluate(() => {
    const node = document.getElementById("p2").firstChild;
    const r = document.createRange();
    r.setStart(node, 0); r.setEnd(node, node.textContent.indexOf(".") + 1);
    const rects = [...r.getClientRects()];
    const a = rects[0], b = rects[rects.length - 1];
    return { from: { x: a.left + 1, y: a.top + a.height / 2 }, to: { x: b.right - 1, y: b.top + b.height / 2, bottom: b.bottom } };
  });
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
  await pause(400);
  // the pill sits just under the selection with its left edge at the pointer; hovering expands it
  await page.mouse.move(to.x + 14, to.bottom + 24);
  await pause(300);
  await page.mouse.move(to.x + 20, to.bottom + 26, { steps: 3 });
  await pause(900);
  return { left: Math.min(from.x, to.x), top: from.y - 20, right: to.x + 160, bottom: to.bottom + 50 };
}

/** Box (CSS px) around the widget and its popup. */
const widgetBox = (page) => page.evaluate(() => {
  const host = document.getElementById("louder-host");
  if (!host || host.style.display === "none") return null;
  const rects = [host.getBoundingClientRect(), host.shadowRoot.querySelector(".panels-wrap")?.getBoundingClientRect()].filter(Boolean);
  return { left: Math.min(...rects.map((r) => r.left)), top: Math.min(...rects.map((r) => r.top)), right: Math.max(...rects.map((r) => r.right)), bottom: Math.max(...rects.map((r) => r.bottom)) };
});

const FROZEN = { skip: 1, word: 4 };
const SCENES = {
  playing: { size: [1100, 560], scene: "page=light&theme=dark&preset=amber", prep: async (p) => { await showWidget(p); await playTo(p, FROZEN); await expand(p); } },
  trigger: { size: [1100, 560], scene: "page=light&theme=dark&preset=amber", prep: async (p) => { await p.evaluate(() => scrollTo(0, 300)); await pause(200); return selectText(p); } },
  settings: { size: [1100, 560], scene: "page=dark&theme=dark&preset=forest&aside=0", prep: async (p) => { await showWidget(p); await playTo(p, FROZEN); await openPopup(p, "Settings"); } },
  voices: { size: [1100, 560], scene: "page=light&theme=light&preset=paper&aside=0", prep: async (p) => { await showWidget(p); await playTo(p, FROZEN); await openPopup(p, "Voice"); } },
  speed: { size: [1100, 560], scene: "page=dark&theme=dark&preset=midnight&speed=1.5&aside=0", prep: async (p) => { await showWidget(p); await playTo(p, FROZEN); await openPopup(p, "Speed"); } },
  // the two narrow cards (website gallery and promo tiles): the article's title, the line being read and a popup beside them
  tile: { size: [1100, 560], scene: "page=dark&theme=dark&preset=forest&aside=0&col=330&right=424", prep: async (p) => { await showWidget(p); await playTo(p, FROZEN); await openPopup(p, "Settings"); await p.evaluate(() => scrollTo(0, 50)); } },
  tilevoices: { size: [1100, 560], scene: "page=light&theme=light&preset=paper&aside=0&col=330&right=424", prep: async (p) => { await showWidget(p); await playTo(p, FROZEN); await openPopup(p, "Voice"); await p.evaluate(() => scrollTo(0, 50)); } },
  // a short, wide strip for the top of the website: the bar and the line being read under it
  hero: { size: [760, 230], scene: "page=light&theme=dark&preset=amber&aside=0&top=10&right=24", prep: async (p) => { await showWidget(p); await playTo(p, FROZEN); await expand(p); } },
};
const SCALE = 2;
const boxes = {};
for (const [name, scene] of Object.entries(SCENES)) {
  const page = await open(`store/render/page.html?${scene.scene}`, ...scene.size, SCALE);
  await page.waitForFunction(() => window.__ready === true);
  boxes[name] = (await scene.prep(page)) ?? (await widgetBox(page));
  await page.screenshot({ path: join(TMP, `${name}.png`) });
  await page.close();
  console.log(`scene ${name}`);
}

// ── stage 2: website images (crops + WebP) ──────────────────────────────────────────────
// A 2:1 window (CSS px) hugging the widget, at 2x; the website shows them in a three-column gallery.
const GALLERY = [640, 320];
async function crop(name, left, top, width, height, out, quality = 84) {
  const info = await sharp(join(TMP, `${name}.png`))
    .extract({ left: Math.round(left * SCALE), top: Math.round(top * SCALE), width: Math.round(width * SCALE), height: Math.round(height * SCALE) })
    .webp({ quality, effort: 5, smartSubsample: true })
    .toFile(join(ROOT, "landing", "img", out));
  console.log(`landing/img/${out} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
}
// from the text column's left edge, down from the top of the page: the same window for both narrow scenes
const narrowCard = () => [50, 0];

if (wanted("hero")) {
  const info = await sharp(join(TMP, "hero.png")).webp({ quality: 86, effort: 5, smartSubsample: true }).toFile(join(ROOT, "landing", "img", "hero.webp"));
  console.log(`landing/img/hero.webp (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
}
if (wanted("gallery")) {
  await crop("trigger", Math.max(0, boxes.trigger.left - 44), Math.max(0, boxes.trigger.top - 60), ...GALLERY, "gallery-trigger.webp");
  await crop("tile", ...narrowCard("tile"), ...GALLERY, "gallery-settings.webp");
  await crop("tilevoices", ...narrowCard("tilevoices"), ...GALLERY, "gallery-voices.webp");
}

// the card on the promo tiles: the tile scene, cropped from the narrow text column to the right edge of the bar
await sharp(join(TMP, "tile.png")).extract({ left: 50 * SCALE, top: 0, width: GALLERY[0] * SCALE, height: GALLERY[1] * SCALE }).toFile(join(TMP, "tile-card.png"));

// ── stage 3: slides and tiles ───────────────────────────────────────────────────────────
// [page, size, output]
const SLIDES = [
  ["store/render/slide.html?n=1", [1280, 800], "store/screenshots/01-playing-highlight.png"],
  ["store/render/slide.html?n=2", [1280, 800], "store/screenshots/02-selection-trigger.png"],
  ["store/render/slide.html?n=3", [1280, 800], "store/screenshots/03-settings-panel.png"],
  ["store/render/slide.html?n=4", [1280, 800], "store/screenshots/04-voice-picker.png"],
  ["store/render/slide.html?n=5", [1280, 800], "store/screenshots/05-speed-picker.png"],
  ["store/render/promo.html?kind=small", [440, 280], "store/promo-small-440x280.png"],
  ["store/render/promo.html?kind=marquee", [1400, 560], "store/promo-marquee-1400x560.png"],
  ["store/render/promo.html?kind=og", [1200, 630], "store/og-1200x630.png"],
];
for (const [path, [width, height], out] of SLIDES) {
  if (!wanted("slide") && !wanted("promo") && !wanted(out)) continue;
  const page = await open(path, width, height, 1);
  await pause(300);
  const png = await page.screenshot({ type: "png" });
  await page.close();
  // the stores want opaque 24-bit PNGs
  await sharp(png).flatten({ background: "#000" }).removeAlpha().png({ compressionLevel: 9 }).toFile(join(ROOT, out));
  console.log(`${out} (${width}x${height})`);
}

await browser.disconnect();
await chrome.kill();
server.close();
