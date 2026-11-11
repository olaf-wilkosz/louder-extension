// Prints the CHANGELOG section of a version, to be used as the GitHub Release notes:
//
//   node scripts/release-notes.mjs [version]      (default: the version in manifest.json)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const version = process.argv[2] ?? JSON.parse(readFileSync(new URL("manifest.json", root), "utf8")).version;
const lines = readFileSync(fileURLToPath(new URL("CHANGELOG.md", root)), "utf8").split("\n");

const start = lines.findIndex((line) => line.startsWith(`## ${version}`));
if (start < 0) {
  console.error(`CHANGELOG.md has no "## ${version}" section`);
  process.exit(1);
}
let end = lines.findIndex((line, i) => i > start && line.startsWith("## "));
if (end < 0) end = lines.length;
process.stdout.write(`${lines.slice(start + 1, end).join("\n").trim()}\n`);
