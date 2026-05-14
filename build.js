const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const outDir = "dist";
if (fs.existsSync(outDir)) {
  for (const entry of fs.readdirSync(outDir))
    fs.rmSync(path.join(outDir, entry), { recursive: true });
} else {
  fs.mkdirSync(outDir, { recursive: true });
}

function copy(src, dest) {
  fs.copyFileSync(src, path.join(outDir, dest));
}

copy("manifest.json", "manifest.json");

const iconsOut = path.join(outDir, "icons");
if (!fs.existsSync(iconsOut)) fs.mkdirSync(iconsOut, { recursive: true });
for (const size of [16, 48, 128]) {
  copy(`public/icons/icon${size}.png`, `icons/icon${size}.png`);
}

esbuild
  .build({
    entryPoints: [
      "src/content/content.ts",
      "src/background/background.ts",
    ],
    bundle: true,
    outdir: outDir,
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
