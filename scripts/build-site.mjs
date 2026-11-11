// Assembles the website into dist/site: landing/ as it is, plus the images that live
// elsewhere in the repo (extension icons, the Open Graph picture), plus small redirect pages
// for the URLs the site had before it moved from /landing/ to the root.
//
//   node scripts/build-site.mjs        then:  node scripts/serve.mjs   (http://localhost:8123)
//
// Run by the Pages workflow. Fails when a page points at a file that is not in the site, or
// loads anything from another host (fonts included): the privacy policy promises none.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "dist", "site");
const SITE_URL = "https://olaf-wilkosz.github.io/louder-extension";

// [source in the repo, path in the site]
const EXTRA_FILES = [
  ["public/icons/icon32.png", "img/icon32.png"],
  ["public/icons/icon128.png", "img/icon128.png"],
  ["store/promo-marquee-1400x560.png", "img/og.png"],
];

// Empty the folder rather than deleting it: a preview server or shell may be sitting in it
mkdirSync(OUT, { recursive: true });
for (const entry of readdirSync(OUT)) rmSync(join(OUT, entry), { recursive: true, force: true });

cpSync(join(ROOT, "landing"), OUT, { recursive: true });
for (const [from, to] of EXTRA_FILES) {
  if (!existsSync(join(ROOT, from))) throw new Error(`Missing ${from}`);
  mkdirSync(dirname(join(OUT, to)), { recursive: true });
  cpSync(join(ROOT, from), join(OUT, to));
}

// The site used to live at /landing/ (it was published straight from the repository root).
// Keep those addresses working: a redirect page for each.
mkdirSync(join(OUT, "landing"), { recursive: true });
for (const page of ["index.html", "privacy.html"]) {
  const target = `${SITE_URL}/${page === "index.html" ? "" : page}`;
  writeFileSync(join(OUT, "landing", page), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved — Louder</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${target}">
<meta http-equiv="refresh" content="0; url=../${page}">
</head>
<body>
<p>This page moved to <a href="../${page}">${target}</a>.</p>
</body>
</html>
`);
}

// Verify what was assembled
const problems = [];
const pages = readdirSync(OUT).filter((f) => f.endsWith(".html"));
for (const page of pages) {
  const html = readFileSync(join(OUT, page), "utf8");
  for (const [tag, name] of html.matchAll(/<(script|img|iframe|source|link|a)\b[^>]*>/gi)) {
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    const url = attrs.src ?? attrs.href;
    if (!url) continue;
    if (/^(https?:)?\/\//.test(url)) {
      // Links to other sites are fine as links; nothing may be LOADED from another host
      const loads = name.toLowerCase() !== "a" && !(name.toLowerCase() === "link" && !/(stylesheet|preload|icon|prefetch)/.test(attrs.rel ?? ""));
      if (loads) problems.push(`${page} loads ${url} from another host`);
      continue;
    }
    if (/^(mailto:|tel:|#|data:)/.test(url)) continue;
    const file = join(OUT, url.split("#")[0].split("?")[0] || page);
    if (!existsSync(file)) problems.push(`${page} points at ${url}, which is not in the site`);
  }
}
const css = readFileSync(join(OUT, "style.css"), "utf8");
for (const [, url] of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
  if (/^(https?:)?\/\//.test(url)) problems.push(`style.css loads ${url} from another host`);
  else if (!url.startsWith("data:") && !existsSync(join(OUT, url))) problems.push(`style.css points at ${url}, which is not in the site`);
}
if (problems.length > 0) {
  console.error(`Site check failed:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`Site assembled in ${relative(ROOT, OUT)} (${pages.length} pages, ${EXTRA_FILES.length} extra files, redirects for the old /landing/ URLs)`);
