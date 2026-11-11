// Previews the built website.
//
//   node scripts/serve.mjs [directory] [port]      (defaults: dist/site, 8123)
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./static-server.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const dir = resolve(ROOT, process.argv[2] ?? "dist/site");
const port = Number(process.argv[3] ?? 8123);

if (!existsSync(dir)) {
  console.error(`${dir} does not exist: run "node scripts/build-site.mjs" first`);
  process.exit(1);
}
await startServer(dir, port);
console.log(`Serving ${dir} at http://localhost:${port}/`);
