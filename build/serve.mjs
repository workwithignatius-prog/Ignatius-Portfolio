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
  ".mp4": "video/mp4", ".webm": "video/webm",
};

http
  .createServer((req, res) => {
    let file = path.join(dir, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(dir)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    // Pages are linked without ".html" (/about), as GitHub Pages serves them.
    if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`;
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "Content-Type": types[".html"] });
      return fs.createReadStream(path.join(dir, "404.html")).on("error", () => res.end("Not found")).pipe(res);
    }
    const type = types[path.extname(file).toLowerCase()] || "application/octet-stream";
    const size = fs.statSync(file).size;
    // Byte ranges let videos seek, as they can on GitHub Pages.
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
    if (range && (range[1] !== "" || range[2] !== "")) {
      const start = range[1] === "" ? Math.max(0, size - Number(range[2])) : Number(range[1]);
      const end = range[1] !== "" && range[2] !== "" ? Math.min(Number(range[2]), size - 1) : size - 1;
      if (start > end) return res.writeHead(416, { "Content-Range": `bytes */${size}` }).end();
      res.writeHead(206, { "Content-Type": type, "Content-Length": end - start + 1, "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes" });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { "Content-Type": type, "Content-Length": size, "Accept-Ranges": "bytes" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Previewing ${path.relative(process.cwd(), dir) || "."} at http://localhost:${port}`));
