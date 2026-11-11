// Minimal static file server, no dependencies. Used by serve.mjs (website preview), the site audit
// and the render script.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
};

/** Serves `directory` on `port`; resolves to the listening server. */
export function startServer(directory, port) {
  const dir = resolve(directory);
  return new Promise((done, fail) => {
    const server = createServer((req, res) => {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      let file = normalize(join(dir, pathname));
      if (!file.startsWith(dir)) { res.writeHead(403).end("Forbidden"); return; }
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
      if (!existsSync(file)) { res.writeHead(404).end("Not found"); return; }
      res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
      res.end(readFileSync(file));
    });
    server.once("error", fail);
    server.listen(port, () => done(server));
  });
}
