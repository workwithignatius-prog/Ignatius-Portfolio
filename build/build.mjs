#!/usr/bin/env node
// Builds the site from site/ into an output folder:
//   - copies every file (skipping _partials, _layouts, dotfiles and Markdown sources)
//   - fills <!-- include:name --> markers with site/_partials/name.html
//   - replaces {{variables}} (HTML-escaped) and {{{variables}}} (raw)
//   - turns site/blog/posts/*.md into blog/<slug>.html pages, addressed as /blog/<slug>
//   - writes the blog listing, the home page's latest posts and sitemap.xml
//
// Usage: node build/build.mjs [--out dist] [--drafts] [--dev]
//   --drafts  include posts marked `draft: true`
//   --dev     dev preview: drafts on, search engines off, site URL + "/dev"
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { marked } from "./vendor/marked/marked.esm.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(here, "../site");
const args = parseArgs(process.argv.slice(2));
const OUT = path.resolve(args.out || "dist");
const DEV = Boolean(args.dev);
const DRAFTS = DEV || Boolean(args.drafts);

const data = loadContent();
const SITE_URL = `${(data.siteUrl || "").replace(/\/$/, "")}${DEV ? "/dev" : ""}`;
const SITE_PATH = SITE_URL ? new URL(SITE_URL).pathname.replace(/\/?$/, "/") : "/";
const partials = new Map();
const folderFiles = new Map(); // folder → its file names, for finding the smaller photo copies
// A short code made from the stylesheet and scripts. Pages ask for styles.css?v=<code>, so each update
// reaches visitors at once, even where a cache (Cloudflare tells browsers 4 hours) would keep the old files.
const ASSET_VERSION = createHash("sha1")
  .update(["styles.css", "script.js", "content.js"].map((f) => read(path.join(SRC, f))).join("\n"))
  .digest("hex")
  .slice(0, 10);
// Accent colours a post can ask for in its front matter; they map to the site's --c0…--c5 tones.
const ACCENTS = ["red", "blue", "yellow", "green", "orange", "teal"];

marked.use({ gfm: true });

main();

function main() {
  if (OUT === "/" || SRC.startsWith(OUT + path.sep) || OUT === SRC) throw new Error(`Refusing to build into ${OUT}`);
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const posts = loadPosts();
  const pages = [];

  for (const file of walk(SRC)) {
    const rel = path.relative(SRC, file).split(path.sep).join("/");
    if (rel.split("/").some((part) => part.startsWith("_") || part.startsWith("."))) continue;
    if (rel.endsWith(".md")) continue;
    if (rel.endsWith(".html")) {
      pages.push(rel);
      write(rel, renderPage(rel, posts));
    } else {
      copy(file, path.join(OUT, rel));
    }
  }

  const layout = read(path.join(SRC, "_layouts/post.html"));
  posts.forEach((post, i) => {
    const rel = `blog/${post.slug}.html`;
    write(rel, renderPost(rel, layout, post, posts[i - 1], posts[i + 1]));
    // A post with a short slug can still be reached at the address its file name gives
    // (/blog/the-long-name/), so links shared before the slug was set keep working.
    if (post.fileSlug !== post.slug) write(`blog/${post.fileSlug}/index.html`, renderRedirect(post));
  });

  write("sitemap.xml", renderSitemap(pages, posts));
  if (!DEV) write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

  const drafts = posts.filter((p) => p.draft).length;
  console.log(`Built ${pages.length} pages and ${posts.length} post${posts.length === 1 ? "" : "s"}${drafts ? ` (${drafts} draft)` : ""} into ${path.relative(process.cwd(), OUT) || "."}`);
}

/* ---------- Pages ---------- */

function renderPage(rel, posts) {
  const { meta, body } = extractMeta(read(path.join(SRC, rel)), rel);
  const root = rel === "404.html" ? SITE_PATH : "../".repeat(rel.split("/").length - 1);
  const vars = {
    ...baseVars(rel, root),
    ...meta,
    pageTitle: meta.title || data.name,
    postsLatest: latestPostsHtml(posts, root),
    postsList: postListHtml(posts, root),
    postsTags: tagFilterHtml(posts),
  };
  return substitute(resolveIncludes(body, rel), vars, rel);
}

function renderPost(rel, layout, post, newer, older) {
  const root = "../";
  const vars = {
    ...baseVars(rel, root),
    page: "post",
    pageTitle: `${post.title} · ${data.name}`,
    title: post.title,
    description: post.excerpt,
    ogType: "article",
    ogImage: post.cover && !/^https?:/.test(post.cover) ? `${SITE_URL}/${post.cover}` : post.cover || `${SITE_URL}/assets/me.jpg`,
    dateISO: post.date.toISOString().slice(0, 10),
    dateLabel: formatDate(post.date),
    readingTime: String(post.readingTime),
    titleEncoded: encodeURIComponent(post.title),
    tagsHtml: post.tags.map((t) => `<li>${esc(t)}</li>`).join(""),
    draftHtml: post.draft ? `<p class="post-draft mono">Draft: only visible in the dev preview</p>` : "",
    // A portrait cover sits beside the title; a landscape one runs wide below it.
    heroClass: !post.cover ? "" : post.coverSize && post.coverSize.h > post.coverSize.w ? "post-hero--split" : "post-hero--wide",
    toneStyle: tone(post, 0),
    coverHtml: post.cover
      ? `<figure class="post-cover"><img src="${esc(assetUrl(post.cover, root))}"${srcsetAttr(post.cover, root,
          post.coverSize && post.coverSize.h > post.coverSize.w ? "(max-width: 506px) calc(100vw - 46px), 470px" : "(max-width: 1132px) calc(100vw - 32px), 1100px"
        )} alt="${esc(post.coverAlt || "")}"${
          post.coverSize ? ` width="${post.coverSize.w}" height="${post.coverSize.h}"` : ""
        }${post.coverPosition ? ` style="object-position: ${esc(post.coverPosition)}"` : ""} fetchpriority="high"></figure>`
      : "",
    content: postHtml(post.html, root),
    postNavHtml: [
      newer ? `<a class="post-nav__link" href="${root}blog/${newer.slug}"><span class="mono">Newer</span><b>${esc(newer.title)}</b></a>` : "<span></span>",
      older ? `<a class="post-nav__link post-nav__link--older" href="${root}blog/${older.slug}"><span class="mono">Older</span><b>${esc(older.title)}</b></a>` : "<span></span>",
    ].join(""),
  };
  return substitute(resolveIncludes(layout, "_layouts/post.html"), vars, rel);
}

// A tiny page at a post's old address that forwards to its short one. Search engines treat an
// instant refresh as a permanent move, and the canonical link names the address to keep.
function renderRedirect(post) {
  const to = `${SITE_PATH}blog/${post.slug}`;
  const url = `${SITE_URL}/blog/${post.slug}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(post.title)}</title>
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${esc(to)}">
<script>location.replace(${JSON.stringify(to)} + location.search + location.hash);</script>
</head>
<body>
<p>This post has moved to <a href="${esc(to)}">${esc(url.replace(/^https?:\/\//, ""))}</a>.</p>
</body>
</html>
`;
}

function baseVars(rel, root) {
  // Pages are addressed without ".html" (/about), which GitHub Pages serves from about.html.
  const clean = rel.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "");
  const url = `${SITE_URL}/${clean}`;
  const photoSrcset = srcsetFor(data.photo, root);
  return {
    root,
    home: root || "./",
    page: "",
    title: data.name,
    description: data.metaDescription || data.tagline || "",
    url,
    urlEncoded: encodeURIComponent(url),
    siteUrl: SITE_URL,
    ogType: "website",
    ogImage: `${SITE_URL}/assets/me.jpg`,
    robots: DEV ? "noindex, nofollow" : "index, follow",
    year: String(new Date().getFullYear()),
    v: ASSET_VERSION,
    photoSrc: assetUrl(data.photo || "assets/me.jpg", root),
    photoSrcset,
    photoSet: photoSrcset ? ` srcset="${esc(photoSrcset)}"` : "",
    name: data.name,
    role: data.role,
    location: data.location,
    email: data.email,
    contactLabel: "Contact",
    contactTitle: "Let's make something",
    contactLead:
      "A beat, a film, a design, a collab or just a hello: I'd love to hear about it. I usually reply within two working days.",
    // Without a Calendly link there's no call to book, so the copy doesn't offer one.
    reachHtml: data.calendlyUrl
      ? `Book a call, <a href="${root}contact">send me a message</a>`
      : `<a href="${root}contact">Send me a message</a>`,
    contactWays: data.calendlyUrl
      ? "You can book a call, email me directly, or use the form below."
      : "You can email me directly or use the form below.",
    devBadge: DEV ? `<p class="dev-badge mono">Dev preview · drafts visible · not live</p>` : "",
  };
}

/* ---------- Templates ---------- */

// Pages may start with a comment block of `key: value` lines, used as {{variables}}.
function extractMeta(src, file) {
  const m = /^\s*<!--meta\s*\n([\s\S]*?)-->\s*/.exec(src);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split("\n")) {
    if (!line.trim()) continue;
    const i = line.indexOf(":");
    if (i === -1) throw new Error(`${file}: meta line needs "key: value" — "${line.trim()}"`);
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: src.slice(m[0].length) };
}

function resolveIncludes(html, file, depth = 0) {
  if (depth > 10) throw new Error(`${file}: includes nested too deeply`);
  return html.replace(/<!--\s*include:([\w-]+)\s*-->/g, (_, name) => resolveIncludes(partial(name, file), `_partials/${name}.html`, depth + 1));
}

function partial(name, from) {
  if (!partials.has(name)) {
    const file = path.join(SRC, "_partials", `${name}.html`);
    if (!fs.existsSync(file)) throw new Error(`${from}: no partial named "${name}" (looked for site/_partials/${name}.html)`);
    partials.set(name, read(file));
  }
  return partials.get(name);
}

// One pass, so inserted values are never re-scanned. Unknown names fail the build.
function substitute(html, vars, file) {
  html = html.replace(/<!--\s*posts:(latest|list|tags)\s*-->/g, (_, kind) => `{{{posts${kind[0].toUpperCase()}${kind.slice(1)}}}}`);
  return html.replace(/\{\{\{\s*(\w+)\s*\}\}\}|\{\{\s*(\w+)\s*\}\}/g, (match, raw, escaped) => {
    const key = raw || escaped;
    if (!(key in vars)) throw new Error(`${file}: unknown template variable {{${key}}}`);
    return raw ? String(vars[key]) : esc(vars[key]);
  });
}

/* ---------- Blog posts ---------- */

function loadPosts() {
  const dir = path.join(SRC, "blog/posts");
  if (!fs.existsSync(dir)) return [];
  const posts = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && !f.startsWith("."))
    .map((f) => parsePost(f, read(path.join(dir, f))))
    .filter((p) => DRAFTS || !p.draft);

  // Each post's address, and the old one it forwards from, must be its own.
  const seen = new Map();
  for (const p of posts) {
    for (const slug of new Set([p.slug, p.fileSlug])) {
      if (slug === "index") throw new Error(`site/blog/posts/${p.file}: "index" is the blog page's own address, so choose another slug`);
      if (seen.has(slug)) throw new Error(`Two posts would use the address "blog/${slug}" (${seen.get(slug)} and ${p.file}): give one a different slug`);
      seen.set(slug, p.file);
    }
  }
  return posts.sort((a, b) => b.date - a.date || a.order - b.order || a.title.localeCompare(b.title));
}

function parsePost(file, src) {
  const where = `site/blog/posts/${file}`;
  const { meta, body } = frontMatter(src, where);
  const fromName = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/.exec(file);
  const dateText = String(meta.date || (fromName && fromName[1]) || "");
  const date = new Date(`${dateText}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText) || Number.isNaN(date.getTime())) {
    throw new Error(`${where}: add a date like "date: 2026-10-28", or start the file name with it`);
  }
  if (!meta.title) throw new Error(`${where}: add a title, e.g. "title: My first post"`);
  // The address: the slug line if there is one, otherwise the file name after the date.
  const fileSlug = slugify(fromName ? fromName[2] : file.replace(/\.md$/, ""));
  const slug = meta.slug ? slugify(String(meta.slug)) : fileSlug;
  const tags = (Array.isArray(meta.tags) ? meta.tags : String(meta.tags || "").split(",")).map((t) => String(t).trim()).filter(Boolean);
  const words = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const accent = meta.accent ? String(meta.accent).toLowerCase() : "";
  if (accent && !ACCENTS.includes(accent)) throw new Error(`${where}: accent must be one of ${ACCENTS.join(", ")} — "${meta.accent}"`);
  const order = meta.order === undefined ? 0 : Number(meta.order);
  if (!Number.isFinite(order)) throw new Error(`${where}: order must be a number — "${meta.order}"`);
  const cover = meta.cover ? String(meta.cover).replace(/^\//, "") : "";
  return {
    file,
    slug,
    fileSlug,
    date,
    title: String(meta.title),
    excerpt: String(meta.excerpt || firstParagraph(body)),
    tags,
    cover,
    coverAlt: meta.coverAlt ? String(meta.coverAlt) : "",
    coverPosition: meta.coverPosition ? String(meta.coverPosition) : "",
    coverSize: cover && !/^https?:/.test(cover) ? imageSize(cover) : null,
    accent: accent ? ACCENTS.indexOf(accent) : -1,
    order,
    draft: meta.draft === true,
    readingTime: Math.max(1, Math.round(words / 220)),
    html: marked.parse(body),
  };
}

// Width and height of a JPEG or PNG under site/, or null when it can't be read.
function imageSize(rel) {
  const file = path.join(SRC, rel.replace(/^\//, "").split("?")[0]);
  if (!file.startsWith(SRC + path.sep) || !fs.existsSync(file)) return null;
  const b = fs.readFileSync(file);
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
    i += 2 + len;
  }
  return null;
}

// A post's accent as the card/page tone variables (falls back to the card's position in the list).
function tone(post, i) {
  const n = post.accent >= 0 ? post.accent : i % ACCENTS.length;
  return `--c: var(--c${n}); --ct: var(--c${n}-t); --con: var(--c${n}-on)`;
}

function frontMatter(src, where) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const i = line.indexOf(":");
    if (i === -1) throw new Error(`${where}: front matter lines look like "key: value" — "${line.trim()}"`);
    const value = line.slice(i + 1).trim();
    meta[line.slice(0, i).trim()] = /^\[.*\]$/.test(value)
      ? value.slice(1, -1).split(",").map((s) => unquote(s.trim())).filter(Boolean)
      : value === "true" ? true : value === "false" ? false : unquote(value);
  }
  return { meta, body: m[2] };
}

function firstParagraph(body) {
  const block = body
    .replace(/```[\s\S]*?```/g, "")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .find((b) => b && !/^(#|!\[|>|[-*] |\d+\. |\|)/.test(b));
  const text = (block || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, "")}…` : text;
}

// Site-relative links in posts ("/assets/x.jpg") become relative to the post page.
// A paragraph of images becomes photos with captions (an image's title is its caption):
// one landscape photo runs wide, two or more sit side by side.
function postHtml(html, root) {
  return photoBlocks(html, root)
    .replace(/<aside class="noticed">([\s\S]*?)<\/aside>/g, '<div class="noticed">$1</div>')
    .replace(/(src|href)="\/(?!\/)/g, `$1="${root}`)
    .replace(/<img /g, '<img loading="lazy" decoding="async" ')
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

function photoBlocks(html, root) {
  return html.replace(/<p>((?:\s*<img\b[^>]*>\s*)+)<\/p>/g, (_, imgs) => {
    const tags = imgs.match(/<img\b[^>]*>/g);
    const figures = tags.map((tag) => {
      const attr = (name) => (new RegExp(`\\s${name}="([^"]*)"`).exec(tag) || [])[1] || "";
      const src = attr("src");
      const size = /^\//.test(src) ? imageSize(src) : null;
      // How wide it shows: side-by-side photos share the text column, a landscape one runs wider, a portrait one is up to 480px.
      const sizes = tags.length > 1
        ? `(max-width: 560px) calc(100vw - 32px), ${Math.round((720 - 18 * (tags.length - 1)) / tags.length)}px`
        : size && size.w > size.h ? "(max-width: 1072px) calc(100vw - 32px), 1040px" : "(max-width: 512px) calc(100vw - 32px), 480px";
      const set = /^\//.test(src) ? srcsetAttr(src, root, sizes) : "";
      const img = `<img src="${src}"${set} alt="${attr("alt")}"${size ? ` width="${size.w}" height="${size.h}"` : ""}>`;
      const caption = attr("title");
      return { html: `<figure>${img}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`, wide: size && size.w > size.h };
    });
    if (figures.length === 1) return figures[0].html.replace("<figure>", `<figure class="photo${figures[0].wide ? " photo--wide" : ""}">`);
    return `<div class="photos" style="--n: ${figures.length}">${figures.map((f) => f.html).join("")}</div>`;
  });
}

function postCard(post, root, i, featured = false, level = 3) {
  const pos = post.coverPosition ? ` style="object-position: ${esc(post.coverPosition)}"` : "";
  const sizes = featured
    ? "(max-width: 640px) calc(100vw - 32px), 560px"
    : "(max-width: 640px) calc(100vw - 32px), (max-width: 1000px) calc(50vw - 40px), 400px";
  const dims = post.coverSize ? ` width="${post.coverSize.w}" height="${post.coverSize.h}"` : "";
  const media = post.cover
    ? `<img src="${esc(assetUrl(post.cover, root))}"${srcsetAttr(post.cover, root, sizes)}${dims} alt="" loading="lazy" decoding="async"${pos}>`
    : `<span class="post-card__mark" aria-hidden="true">${esc(post.title.trim().charAt(0).toUpperCase())}</span>`;
  return `
        <article class="post-card glow${featured ? " post-card--featured" : ""}" data-tags="${esc(post.tags.map((t) => t.toLowerCase()).join("|"))}" style="${tone(post, i)}">
          <a class="post-card__link" href="${root}blog/${post.slug}">
            <div class="post-card__media">${media}</div>
            <div class="post-card__body">
              ${post.draft ? '<span class="post-card__draft mono">Draft</span>' : ""}
              <ul class="post-card__tags">${post.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
              <h${level} class="post-card__title">${esc(post.title)}</h${level}>
              <p class="post-card__excerpt">${esc(post.excerpt)}</p>
              <p class="post-card__meta mono"><time datetime="${post.date.toISOString().slice(0, 10)}">${formatDate(post.date)}</time> · ${post.readingTime} min read</p>
            </div>
          </a>
        </article>`;
}

function latestPostsHtml(posts, root) {
  if (!posts.length) return "";
  return `
    <section class="section" id="blog">
      <header class="section__head">
        <div>
          <p class="label">From the blog</p>
          <h2 class="reveal" data-scramble>Latest writing</h2>
        </div>
        <a class="link-arrow" href="${root}blog/">All posts <span aria-hidden="true">→</span></a>
      </header>
      <div class="post-grid">${posts.slice(0, 3).map((p, i) => postCard(p, root, i)).join("")}
      </div>
    </section>`;
}

function postListHtml(posts, root) {
  if (!posts.length) {
    const linkedin = (data.socials || []).find((s) => /linkedin/i.test(s.label) && s.url);
    return `
      <div class="empty glow">
        <span class="empty__mark" aria-hidden="true">✍</span>
        <h2>The first post is on its way</h2>
        <p>Small stories about the things I notice are coming soon.${linkedin ? " Follow me on LinkedIn to catch the first one." : ""}</p>
        ${linkedin ? `<div class="empty__cta"><a class="btn btn--primary" href="${esc(linkedin.url)}" target="_blank" rel="noopener">Follow on LinkedIn</a></div>` : ""}
      </div>`;
  }
  return `
      <div class="post-grid post-grid--list" id="postGrid">${posts.map((p, i) => postCard(p, root, i, i === 0, 2)).join("")}
      </div>
      <p class="post-grid__none" id="postNone" hidden>No posts with that tag yet.</p>`;
}

function tagFilterHtml(posts) {
  const tags = [...new Set(posts.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));
  if (!tags.length) return "";
  return [`<button class="filter" type="button" data-tag="" aria-pressed="true">All</button>`]
    .concat(tags.map((t) => `<button class="filter" type="button" data-tag="${esc(t.toLowerCase())}" aria-pressed="false">${esc(t)}</button>`))
    .join("");
}

/* ---------- Sitemap ---------- */

function renderSitemap(pages, posts) {
  const urls = pages
    .filter((p) => p !== "404.html")
    .map((p) => `${SITE_URL}/${p.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "")}`)
    .concat(posts.map((p) => `${SITE_URL}/blog/${p.slug}`));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u)}</loc></url>`).join("\n")}
</urlset>
`;
}

/* ---------- Helpers ---------- */

function loadContent() {
  const sandbox = { window: {} };
  vm.runInNewContext(read(path.join(SRC, "content.js")), sandbox, { filename: "site/content.js" });
  if (!sandbox.window.PORTFOLIO) throw new Error("site/content.js must set window.PORTFOLIO");
  return sandbox.window.PORTFOLIO;
}

function parseArgs(list) {
  const out = {};
  for (let i = 0; i < list.length; i++) {
    const m = /^--([\w-]+)$/.exec(list[i]);
    if (!m) throw new Error(`Unknown argument: ${list[i]}`);
    out[m[1]] = list[i + 1] && !list[i + 1].startsWith("--") ? list[++i] : true;
  }
  return out;
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

/* ---------- Responsive images ---------- */

// The WebP copies of a photo that build/images.py made (photo-480w.webp, photo-800w.webp… and one at
// full size), as a srcset; the original photo stays the largest choice only if there's no full-size copy.
// "" when there are no copies or the photo isn't local.
function srcsetFor(rel, root) {
  if (!rel || /^(https?:)?\/\//.test(rel)) return "";
  const clean = rel.replace(/^\//, "");
  const size = imageSize(clean);
  if (!size) return "";
  const dir = path.posix.dirname(clean);
  const stem = path.posix.basename(clean).replace(/\.[^.]+$/, "");
  if (!folderFiles.has(dir)) {
    const abs = path.join(SRC, dir);
    folderFiles.set(dir, fs.existsSync(abs) ? fs.readdirSync(abs) : []);
  }
  const copies = folderFiles.get(dir)
    .map((f) => /^(.*)-(\d+)w\.webp$/.exec(f))
    .filter((m) => m && m[1] === stem && Number(m[2]) <= size.w)
    .map((m) => ({ file: m[0], w: Number(m[2]) }))
    .sort((a, b) => a.w - b.w);
  if (!copies.length) return "";
  const list = copies.map((c) => `${root}${dir}/${c.file} ${c.w}w`);
  if (copies[copies.length - 1].w < size.w) list.push(`${root}${clean} ${size.w}w`);
  return list.join(", ");
}

// srcset and sizes attributes for an <img>, or "" without copies.
function srcsetAttr(rel, root, sizes) {
  const set = srcsetFor(rel, root);
  return set ? ` srcset="${esc(set)}" sizes="${sizes}"` : "";
}

function assetUrl(p, root) {
  return /^(https?:)?\/\//.test(p) ? p : root + p.replace(/^\//, "");
}

function formatDate(d) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "post";
}

function unquote(s) {
  return s.replace(/^(['"])(.*)\1$/, "$2");
}

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function copy(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}
