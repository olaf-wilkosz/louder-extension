// Minimal static file server for previewing the landing page locally, no deps.
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const port = 8123;

const MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
  ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg",
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const filePath = path.join(root, urlPath === "/" ? "/landing/index.html" : urlPath);
  if (!filePath.startsWith(root)) { res.writeHead(403); res.end(); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`));
