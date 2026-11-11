// Minimal static file server, no dependencies: previews the built website.
//
//   node scripts/serve.mjs [directory] [port]      (defaults: dist/site, 8123)
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const dir = resolve(ROOT, process.argv[2] ?? "dist/site");
const port = Number(process.argv[3] ?? 8123);

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
};

if (!existsSync(dir)) {
  console.error(`${dir} does not exist: run "node scripts/build-site.mjs" first`);
  process.exit(1);
}

createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  let file = normalize(join(dir, pathname));
  if (!file.startsWith(dir)) { res.writeHead(403).end("Forbidden"); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) { res.writeHead(404).end("Not found"); return; }
  res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(port, () => console.log(`Serving ${dir} at http://localhost:${port}/`));
