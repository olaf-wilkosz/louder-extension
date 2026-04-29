const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const outDir = "dist";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Copy static files
function copy(src, dest) {
  fs.copyFileSync(src, path.join(outDir, dest));
}

copy("manifest.json", "manifest.json");
copy("src/popup/popup.html", "popup.html");

// Copy icons
const iconsOut = path.join(outDir, "icons");
if (!fs.existsSync(iconsOut)) fs.mkdirSync(iconsOut, { recursive: true });
for (const size of [16, 48, 128]) {
  copy(`public/icons/icon${size}.png`, `icons/icon${size}.png`);
}

// Bundle all three entry points
esbuild
  .build({
    entryPoints: [
      "src/popup/popup.ts",
      "src/content/content.ts",
      "src/background/background.ts",
    ],
    bundle: true,
    outdir: outDir,
    // Flatten output — no subdirs
    entryNames: "[name]",
    format: "iife",
    platform: "browser",
    target: ["chrome112"],
    sourcemap: false,
    minify: false,
    define: {
      "process.env.NODE_ENV": '"production"',
    },
  })
  .then(() => console.log("Build complete → dist/"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
