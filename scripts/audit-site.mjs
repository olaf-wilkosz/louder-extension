// Quality gate for the built website: Lighthouse (its accessibility audits are axe-core's) on
// every page, served locally from dist/site.
//
//   npm run site && npm run audit:site
//
// Accessibility, best practices and SEO must be a perfect 100; performance is the median of
// three runs (a single run is noisy) and must be at least 90. Needs a Chrome install
// (CHROME_PATH or the usual locations; GitHub's Ubuntu runners have one).
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PORT = 8124;
const PAGES = ["index.html", "privacy.html"];
const PERFORMANCE_RUNS = 3;
const MIN = { accessibility: 100, "best-practices": 100, seo: 100, performance: 90 };

if (!existsSync(`${ROOT}dist/site/index.html`)) {
  console.error('dist/site is missing: run "npm run site" first');
  process.exit(1);
}

const server = spawn(process.execPath, ["scripts/serve.mjs", "dist/site", String(PORT)], { cwd: ROOT, stdio: ["ignore", "pipe", "inherit"] });
await new Promise((resolve) => server.stdout.once("data", resolve));
const chrome = await launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });

const failures = [];
try {
  for (const page of PAGES) {
    const url = `http://localhost:${PORT}/${page}`;
    const runs = [];
    for (let i = 0; i < PERFORMANCE_RUNS; i++) {
      const { lhr } = await lighthouse(url, { port: chrome.port, output: "json", logLevel: "error", onlyCategories: Object.keys(MIN) });
      runs.push(lhr);
    }
    for (const [category, min] of Object.entries(MIN)) {
      const scores = runs.map((r) => Math.round((r.categories[category].score ?? 0) * 100)).sort((a, b) => a - b);
      // accessibility, best practices and SEO are deterministic: every run must pass; performance uses the median
      const score = category === "performance" ? scores[Math.floor(scores.length / 2)] : scores[0];
      const ok = score >= min;
      console.log(`${ok ? "ok  " : "FAIL"} ${page.padEnd(13)} ${category.padEnd(15)} ${score} (need ${min})`);
      if (!ok) {
        failures.push(`${page} ${category}: ${score} < ${min}`);
        const worst = runs.find((r) => Math.round((r.categories[category].score ?? 0) * 100) === scores[0]);
        for (const ref of worst.categories[category].auditRefs) {
          const audit = worst.audits[ref.id];
          if (audit.score !== null && audit.score < 1 && ref.weight > 0) console.log(`       - ${audit.title}${audit.displayValue ? ` (${audit.displayValue})` : ""}`);
        }
      }
    }
  }
} finally {
  await chrome.kill();
  server.kill();
}

if (failures.length > 0) {
  console.error(`Site audit failed:\n${failures.map((f) => `  - ${f}`).join("\n")}`);
  process.exit(1);
}
console.log("Site audit passed");
