// Builds the extension from src/ (TypeScript, bundled with esbuild):
//
//   node scripts/build.mjs [chrome|firefox|all] [--zip]
//
//   chrome    -> dist/            Chrome / Edge / Brave, load it unpacked (the default)
//   firefox   -> dist-firefox/    Firefox / Zen: the same code with a Firefox manifest
//   all       -> both
//   --zip     also write release/louder-<version>-<target>.zip (what the stores get)
//
// The output folders are emptied, never deleted: a browser may have one loaded unpacked
// (and Windows refuses to remove a folder that is in use). The Chrome build stays in `dist/`
// on purpose: an unpacked extension's id comes from its path, and with it the settings
// stored in chrome.storage.
import { build } from "esbuild";
import { zipSync } from "fflate";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { CHROME_MIN_VERSION, OUT_DIRS, SLUG } from "./build-config.mjs";
import { manifestFor } from "./manifest-targets.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8"));
const ICON_SIZES = [16, 32, 48, 128];
// Shipped next to the code: the bundled Readability (Apache-2.0) requires its notice to travel with it.
const LEGAL_FILES = ["LICENSE", "THIRD_PARTY_NOTICES.md"];

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

async function buildTarget(target, { zip }) {
  const out = join(ROOT, OUT_DIRS[target]);
  if (existsSync(out)) {
    for (const entry of readdirSync(out)) rmSync(join(out, entry), { recursive: true });
  } else {
    mkdirSync(out, { recursive: true });
  }

  writeFileSync(join(out, "manifest.json"), `${JSON.stringify(manifestFor(manifest, target), null, 2)}\n`);
  for (const file of LEGAL_FILES) copyFileSync(join(ROOT, file), join(out, file));
  mkdirSync(join(out, "icons"));
  for (const size of ICON_SIZES) copyFileSync(join(ROOT, `public/icons/icon${size}.png`), join(out, `icons/icon${size}.png`));

  await build({
    entryPoints: [join(ROOT, "src/content/content.ts"), join(ROOT, "src/background/background.ts")],
    bundle: true,
    outdir: out,
    entryNames: "[name]",
    format: "iife",
    platform: "browser",
    target: [`chrome${CHROME_MIN_VERSION}`],
    sourcemap: false,
    minify: false,
    define: { "process.env.NODE_ENV": '"production"' },
  });
  console.log(`${target}: ${relative(ROOT, out)}/`);

  if (zip) {
    // manifest.json at the archive root, stable order and timestamps: the same sources give the same zip
    const files = Object.fromEntries(
      listFiles(out).sort().map((path) => [relative(out, path).replaceAll("\\", "/"), readFileSync(path)]),
    );
    mkdirSync(join(ROOT, "release"), { recursive: true });
    const zipPath = join(ROOT, "release", `${SLUG}-${manifest.version}-${target}.zip`);
    writeFileSync(zipPath, zipSync(files, { level: 9, mtime: new Date("2026-01-01T00:00:00Z") }));
    console.log(`${target}: ${relative(ROOT, zipPath)} (${Object.keys(files).length} files, ${(statSync(zipPath).size / 1024).toFixed(1)} KB)`);
  }
}

const args = process.argv.slice(2);
const wanted = args.find((arg) => !arg.startsWith("--")) ?? "chrome";
const targets = wanted === "all" ? ["chrome", "firefox"] : [wanted];
for (const target of targets) {
  if (!(target in OUT_DIRS)) throw new Error(`Unknown target "${target}" (chrome | firefox | all)`);
}
for (const target of targets) await buildTarget(target, { zip: args.includes("--zip") });
console.log("Build complete");
