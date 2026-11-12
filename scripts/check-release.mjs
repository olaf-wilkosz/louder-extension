// Release sanity checks, run by CI on every push and before a release is built:
//
//   node scripts/check-release.mjs [v1.2.3]    (optional tag to compare the version with)
//
// Catches the things that otherwise only fail at store upload or, worse, after it: versions out
// of sync, store text limits, files the manifest points at that don't exist, permissions that
// crept in, bundled third-party code without its license notice, and code patterns the stores
// reject or that would contradict the privacy policy ("no network requests of its own").
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { CHROME_MIN_VERSION, FIREFOX_MIN_VERSION, GECKO_ID } from "./build-config.mjs";
import { manifestFor } from "./manifest-targets.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (...parts) => readFileSync(join(ROOT, ...parts), "utf8");
const exists = (...parts) => existsSync(join(ROOT, ...parts));

const manifest = JSON.parse(read("manifest.json"));
const pkg = JSON.parse(read("package.json"));
const tag = process.argv[2];

// What the extension is allowed to ask for. Changing these lists is a deliberate decision: it
// also changes the store listing's permission justifications and the privacy policy page.
const EXPECTED_PERMISSIONS = ["activeTab", "contextMenus", "scripting", "storage"];
const EXPECTED_HOSTS = ["<all_urls>"];
const EXPECTED_CONTENT_MATCHES = ["<all_urls>"];

// Third-party packages that end up inside the built content.js / background.js. Each needs its
// license notice in THIRD_PARTY_NOTICES.md (the build ships that file with the package).
const BUNDLED_DEPENDENCIES = ["@mozilla/readability"];

// manifest file name -> the source file esbuild builds it from
const ENTRY_POINTS = { "content.js": "src/content/content.ts", "background.js": "src/background/background.ts" };

const problems = [];
const check = (ok, message) => { if (!ok) problems.push(message); };
const sorted = (list) => JSON.stringify([...(list ?? [])].sort());

// versions
check(manifest.version === pkg.version, `package.json version ${pkg.version} != manifest.json version ${manifest.version}`);
check(/^\d+\.\d+\.\d+$/.test(manifest.version), `manifest version "${manifest.version}" is not x.y.z`);
if (tag) check(tag === `v${manifest.version}`, `tag ${tag} does not match manifest version v${manifest.version}`);

// the CHANGELOG has a section for this version; a tagged release needs it dated, not "(unreleased)"
{
  const heading = read("CHANGELOG.md").split("\n").find((line) => line.startsWith(`## ${manifest.version}`));
  check(Boolean(heading), `CHANGELOG.md has no "## ${manifest.version}" section`);
  if (tag && heading) check(!/unreleased/i.test(heading), `CHANGELOG.md section "${heading}" still says unreleased: date it before tagging`);
}

// files the project promises to have
for (const file of ["LICENSE", "CHANGELOG.md", "SECURITY.md", ".github/ISSUE_TEMPLATE/config.yml", "docs/architecture.md", "docs/accessibility-testing.md", "store/README.md"]) {
  check(exists(...file.split("/")), `${file} is missing`);
}
check(read("SECURITY.md").includes("olaf-wilkosz/louder-extension/security/advisories/new"), "SECURITY.md must point at the private vulnerability reporting page");

// store limits (Chrome Web Store: name 75, summary 132)
check(manifest.name.length <= 75, `name is ${manifest.name.length} chars (max 75)`);
check(manifest.description.length <= 132, `description is ${manifest.description.length} chars (max 132)`);

// the store listing text must match the manifest summary (the store shows the manifest's)
{
  const listing = read("store", "listing-copy.md");
  check(listing.includes(manifest.description), "store/listing-copy.md does not contain the manifest description verbatim");
  const stated = listing.match(/\((\d+) characters\)/);
  if (stated) check(Number(stated[1]) === manifest.description.length, `store/listing-copy.md says the summary is ${stated[1]} characters, it is ${manifest.description.length}`);
}

// supported browsers: one number, used by the bundle target, the manifest, the README and the listing
check(manifest.minimum_chrome_version === String(CHROME_MIN_VERSION), `manifest minimum_chrome_version is ${manifest.minimum_chrome_version}, scripts/build-config.mjs says ${CHROME_MIN_VERSION}`);
{
  const chrome = `${CHROME_MIN_VERSION}+`;
  const firefox = `${parseInt(FIREFOX_MIN_VERSION, 10)}+`;
  for (const file of ["README.md", join("store", "listing-copy.md")]) {
    const text = read(file);
    check(text.includes(chrome), `${file} does not state the minimum Chrome version (${chrome})`);
    check(text.includes(firefox), `${file} does not state the minimum Firefox version (${firefox})`);
  }
}

// the Firefox variant: event page instead of a service worker, add-on id, nothing collected
{
  const firefox = manifestFor(manifest, "firefox");
  check(!firefox.background?.service_worker && sorted(firefox.background?.scripts) === sorted([manifest.background?.service_worker]), "Firefox manifest must run the background script as an event page (background.scripts)");
  check(firefox.browser_specific_settings?.gecko?.id === GECKO_ID, "Firefox manifest has no add-on id");
  check(firefox.browser_specific_settings?.gecko?.strict_min_version === FIREFOX_MIN_VERSION, "Firefox manifest strict_min_version differs from scripts/build-config.mjs");
  check(sorted(firefox.browser_specific_settings?.gecko?.data_collection_permissions?.required) === sorted(["none"]), 'Firefox manifest must declare data_collection_permissions.required = ["none"]');
  check(sorted(firefox.permissions) === sorted(manifest.permissions) && sorted(firefox.host_permissions) === sorted(manifest.host_permissions), "Firefox manifest must request exactly the same permissions as the Chrome one");
}

// permissions
check(sorted(manifest.permissions) === sorted(EXPECTED_PERMISSIONS), `permissions changed: ${JSON.stringify(manifest.permissions)} (expected ${JSON.stringify(EXPECTED_PERMISSIONS)})`);
check(sorted(manifest.host_permissions) === sorted(EXPECTED_HOSTS), `host permissions changed: ${JSON.stringify(manifest.host_permissions)}`);
check(sorted(manifest.content_scripts?.flatMap((c) => c.matches)) === sorted(EXPECTED_CONTENT_MATCHES), `content script matches changed: ${JSON.stringify(manifest.content_scripts?.map((c) => c.matches))}`);
for (const section of ["optional_permissions", "optional_host_permissions", "externally_connectable", "web_accessible_resources", "content_security_policy"]) {
  check(!(section in manifest), `unexpected manifest section: ${section}`);
}

// the privacy policy page explains every permission the manifest asks for
{
  const privacy = read("landing", "privacy.html").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
  for (const name of [...manifest.permissions, ...manifest.host_permissions]) {
    check(privacy.includes(name), `landing/privacy.html does not mention the permission "${name}"`);
  }
}

// files the manifest points at exist (icons are copied from public/icons by the build; scripts are built from src/)
for (const icon of new Set([...Object.values(manifest.icons ?? {}), ...Object.values(manifest.action?.default_icon ?? {})])) {
  check(exists("public", "icons", basename(icon)), `manifest points at ${icon} but public/icons/${basename(icon)} is missing`);
}
for (const script of [manifest.background?.service_worker, ...(manifest.content_scripts ?? []).flatMap((c) => c.js)]) {
  const source = ENTRY_POINTS[script];
  check(source && exists(source), `manifest points at ${script}, which is not built from an existing source file (${source ?? "unknown entry"})`);
}

// source files
function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}
const sourceFiles = listFiles(join(ROOT, "src")).filter((f) => f.endsWith(".ts"));
const lineOf = (text, index) => text.slice(0, index).split("\n").length;

// bundled third-party code: every non-relative import is declared, installed, and credited
{
  const imported = new Set();
  for (const path of sourceFiles) {
    for (const [, from] of read(relative(ROOT, path)).matchAll(/^\s*import\b[^;]*?\bfrom\s+["']([^"']+)["']/gm)) {
      if (!from.startsWith(".")) imported.add(from.startsWith("@") ? from.split("/").slice(0, 2).join("/") : from.split("/")[0]);
    }
  }
  check(sorted([...imported]) === sorted(BUNDLED_DEPENDENCIES), `src imports ${JSON.stringify([...imported].sort())} but BUNDLED_DEPENDENCIES is ${JSON.stringify(BUNDLED_DEPENDENCIES)}`);
  const notices = read("THIRD_PARTY_NOTICES.md");
  for (const dep of BUNDLED_DEPENDENCIES) {
    check(notices.includes(dep), `THIRD_PARTY_NOTICES.md does not credit ${dep}`);
    check(dep in (pkg.devDependencies ?? {}) || dep in (pkg.dependencies ?? {}), `${dep} is bundled but not listed in package.json`);
  }
}

// the site's privacy page lives at the site root; nothing may still link to its old /landing/ address
for (const file of ["README.md", "SECURITY.md", join("store", "listing-copy.md")]) {
  check(!read(file).includes("louder-extension/landing/"), `${file} still links to the old /landing/ address of the site`);
}
check(exists("landing", "fonts", "OFL.txt") && read("THIRD_PARTY_NOTICES.md").includes("DM Sans"), "the self-hosted website font needs landing/fonts/OFL.txt and a credit in THIRD_PARTY_NOTICES.md");

// store pictures: the stores reject wrong sizes and 32-bit (alpha) PNGs, so check what is committed
{
  const SIZES = {
    "store/screenshots/01-playing-highlight.png": [1280, 800], "store/screenshots/02-selection-trigger.png": [1280, 800],
    "store/screenshots/03-settings-panel.png": [1280, 800], "store/screenshots/04-voice-picker.png": [1280, 800],
    "store/screenshots/05-speed-picker.png": [1280, 800], "store/promo-small-440x280.png": [440, 280],
    "store/promo-marquee-1400x560.png": [1400, 560], "store/og-1200x630.png": [1200, 630], "store/icon-128.png": [128, 128],
  };
  for (const [file, [w, h]] of Object.entries(SIZES)) {
    if (!exists(...file.split("/"))) { problems.push(`${file} is missing (npm run render creates it)`); continue; }
    const png = readFileSync(join(ROOT, ...file.split("/")));
    const ok = png.toString("latin1", 1, 4) === "PNG";
    check(ok && png.readUInt32BE(16) === w && png.readUInt32BE(20) === h, `${file} must be a ${w}x${h} PNG`);
    if (ok && file.startsWith("store/screenshots/")) check(png[25] === 2, `${file} must be 24-bit RGB without alpha (the stores reject 32-bit PNGs)`);
  }
}

// licensing and package metadata
check(pkg.license === "MIT" && /^MIT License/.test(read("LICENSE")), "package.json license and LICENSE must both be MIT");
check(pkg.private === true, "package.json must stay private (this repo is not published to npm)");
check(/olaf-wilkosz\/louder-extension/.test(pkg.repository?.url ?? ""), "package.json repository.url does not point at this repository");

// code patterns the stores reject, and things this extension promises never to do
const FORBIDDEN = [
  [/\beval\s*\(|new Function\s*\(/, "eval / new Function"],
  [/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|importScripts/, "a network API (the privacy policy promises no network requests of its own)"],
  [/chrome\.cookies|\bdocument\.cookie\b/, "cookie access"],
  [/insertAdjacentHTML|\.(inner|outer)HTML\b|document\.write\s*\(|createContextualFragment|text\/html/, "HTML injection (build DOM with createElement/textContent; SVG icons go through setIcon, which parses them as XML)"],
  [/https?:\/\/(?!www\.w3\.org\/2000\/svg|github\.com\/olaf-wilkosz)[\w.-]+/, "a URL outside the allowed hosts (remote resources)"],
];
for (const path of sourceFiles) {
  const name = relative(ROOT, path).replaceAll("\\", "/");
  const text = readFileSync(path, "utf8");
  for (const [pattern, what] of FORBIDDEN) {
    const match = pattern.exec(text);
    check(!match, `${name}:${match ? lineOf(text, match.index) : 0} contains ${what}`);
  }
}

if (problems.length > 0) {
  console.error(`Release check failed:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`Release check passed: ${manifest.name} v${manifest.version} (${manifest.description.length}/132 chars in the description)`);
