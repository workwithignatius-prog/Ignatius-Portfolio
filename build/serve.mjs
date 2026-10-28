#!/usr/bin/env node
// Serves a built folder for local preview: node build/serve.mjs [dir] [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(process.argv[2] || "dist");
const port = Number(process.argv[3] || 8000);
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".gif": "image/gif", ".xml": "application/xml", ".txt": "text/plain", ".pdf": "application/pdf", ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    let file = path.join(dir, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(dir)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "Content-Type": types[".html"] });
      return fs.createReadStream(path.join(dir, "404.html")).on("error", () => res.end("Not found")).pipe(res);
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Previewing ${path.relative(process.cwd(), dir) || "."} at http://localhost:${port}`));
