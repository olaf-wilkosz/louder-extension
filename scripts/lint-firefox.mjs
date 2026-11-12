// Lints the Firefox build the way Mozilla's reviewers do (web-ext lint = addons-linter), and
// fails on anything we cannot explain.
//
//   npm run build:firefox && npm run lint:firefox
//
// Errors always fail. Warnings fail too, with one documented exception: the bundled Mozilla
// Readability assigns innerHTML on a *copy* of the page it is asked to parse (never on the
// live page, never with page-controlled markup reaching our own UI), and the linter flags that
// third-party code. Our own code has no innerHTML at all (scripts/check-release.mjs forbids it),
// so a warning counts as that exception only when it points inside the Readability part of the
// bundle; the same finding anywhere else fails.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { OUT_DIRS } from "./build-config.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const dir = join(ROOT, OUT_DIRS.firefox);
if (!existsSync(join(dir, "manifest.json"))) {
  console.error(`${OUT_DIRS.firefox} is missing: run "npm run build:firefox" first`);
  process.exit(1);
}

// where Readability sits in the (unminified) bundle: from its marker to the first of our own files
const bundle = readFileSync(join(dir, "content.js"), "utf8").split("\n");
const markerLine = (re) => bundle.findIndex((line) => re.test(line)) + 1; // 1-based, 0 = not found
const readabilityStart = markerLine(/^\s*\/\/ node_modules\/@mozilla\/readability\//);
const ownCodeStart = markerLine(/^\s*\/\/ src\//);
if (!readabilityStart || !ownCodeStart || ownCodeStart < readabilityStart) {
  console.error("Could not find the Readability / own-code markers in content.js: has the bundler's comment format changed?");
  process.exit(1);
}
const inReadability = (message) => message.file === "content.js" && message.line >= readabilityStart && message.line < ownCodeStart;

const bin = join(ROOT, "node_modules", "web-ext", "bin", "web-ext.js");
const run = spawnSync(process.execPath, [bin, "lint", "--source-dir", dir, "--output", "json", "--no-config-discovery"], {
  encoding: "utf8", env: { ...process.env, NO_UPDATE_NOTIFIER: "1" },
});
let report;
try {
  report = JSON.parse(run.stdout);
} catch {
  console.error(`web-ext lint produced no report:\n${run.stdout}\n${run.stderr}`);
  process.exit(1);
}

const describe = (m) => `${m.code}: ${m.message} (${m.file ?? "manifest"}${m.line ? `:${m.line}` : ""})`;
const problems = [
  ...report.errors.map((m) => `error ${describe(m)}`),
  ...report.warnings.filter((m) => !(m.code === "UNSAFE_VAR_ASSIGNMENT" && inReadability(m))).map((m) => `warning ${describe(m)}`),
  ...report.notices.map((m) => `notice ${describe(m)}`),
];
const allowed = report.warnings.length - report.warnings.filter((m) => !(m.code === "UNSAFE_VAR_ASSIGNMENT" && inReadability(m))).length;

if (problems.length > 0) {
  console.error(`Firefox lint failed:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`Firefox lint passed (0 errors; ${allowed} innerHTML warnings, all inside the bundled Readability, lines ${readabilityStart}-${ownCodeStart - 1})`);
