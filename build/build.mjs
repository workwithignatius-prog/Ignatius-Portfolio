#!/usr/bin/env node
// Builds the site from site/ into an output folder:
//   - copies every file (skipping _partials, _layouts, dotfiles and Markdown sources)
//   - fills <!-- include:name --> markers with site/_partials/name.html
//   - replaces {{variables}} (HTML-escaped) and {{{variables}}} (raw)
//   - turns site/blog/posts/*.md into blog/<slug>/index.html pages
//   - writes the blog listing, the home page's latest posts and sitemap.xml
//
// Usage: node build/build.mjs [--out dist] [--drafts] [--dev]
//   --drafts  include posts marked `draft: true`
//   --dev     dev preview: drafts on, search engines off, site URL + "/dev"
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
    const rel = `blog/${post.slug}/index.html`;
    write(rel, renderPost(rel, layout, post, posts[i - 1], posts[i + 1]));
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
    pageTitle: meta.title || data.fullName,
    postsLatest: latestPostsHtml(posts, root),
    postsList: postListHtml(posts, root),
    postsTags: tagFilterHtml(posts),
  };
  return substitute(resolveIncludes(body, rel), vars, rel);
}

function renderPost(rel, layout, post, newer, older) {
  const root = "../../";
  const vars = {
    ...baseVars(rel, root),
    page: "post",
    pageTitle: `${post.title} — ${data.fullName}`,
    title: post.title,
    description: post.excerpt,
    ogType: "article",
    ogImage: post.cover && !/^https?:/.test(post.cover) ? `${SITE_URL}/${post.cover}` : post.cover || `${SITE_URL}/assets/me.jpg`,
    dateISO: post.date.toISOString().slice(0, 10),
    dateLabel: formatDate(post.date),
    readingTime: String(post.readingTime),
    titleEncoded: encodeURIComponent(post.title),
    tagsHtml: post.tags.map((t) => `<li>${esc(t)}</li>`).join(""),
    draftHtml: post.draft ? `<p class="post-draft mono">Draft — only visible in the dev preview</p>` : "",
    // A portrait cover sits beside the title; a landscape one runs wide below it.
    heroClass: !post.cover ? "" : post.coverSize && post.coverSize.h > post.coverSize.w ? "post-hero--split" : "post-hero--wide",
    toneStyle: tone(post, 0),
    coverHtml: post.cover
      ? `<figure class="post-cover"><img src="${esc(assetUrl(post.cover, root))}" alt="${esc(post.coverAlt || "")}"${
          post.coverSize ? ` width="${post.coverSize.w}" height="${post.coverSize.h}"` : ""
        }${post.coverPosition ? ` style="object-position: ${esc(post.coverPosition)}"` : ""} fetchpriority="high"></figure>`
      : "",
    content: postHtml(post.html, root),
    postNavHtml: [
      newer ? `<a class="post-nav__link" href="${root}blog/${newer.slug}/"><span class="mono">Newer</span><b>${esc(newer.title)}</b></a>` : "<span></span>",
      older ? `<a class="post-nav__link post-nav__link--older" href="${root}blog/${older.slug}/"><span class="mono">Older</span><b>${esc(older.title)}</b></a>` : "<span></span>",
    ].join(""),
  };
  return substitute(resolveIncludes(layout, "_layouts/post.html"), vars, rel);
}

function baseVars(rel, root) {
  const clean = rel.replace(/(^|\/)index\.html$/, "$1");
  const url = `${SITE_URL}/${clean}`;
  return {
    root,
    home: root || "./",
    page: "",
    title: data.fullName,
    description: data.metaDescription || data.tagline || "",
    url,
    urlEncoded: encodeURIComponent(url),
    siteUrl: SITE_URL,
    ogType: "website",
    ogImage: `${SITE_URL}/assets/me.jpg`,
    robots: DEV ? "noindex, nofollow" : "index, follow",
    year: String(new Date().getFullYear()),
    fullName: data.fullName,
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
      ? `Book a call, <a href="${root}contact.html">send me a message</a>`
      : `<a href="${root}contact.html">Send me a message</a>`,
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

  const seen = new Set();
  for (const p of posts) {
    if (seen.has(p.slug)) throw new Error(`Two posts share the address "blog/${p.slug}/" — give one a different file name or slug`);
    seen.add(p.slug);
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
  const slug = slugify(String(meta.slug || (fromName ? fromName[2] : file.replace(/\.md$/, ""))));
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
  return photoBlocks(html)
    .replace(/(src|href)="\/(?!\/)/g, `$1="${root}`)
    .replace(/<img /g, '<img loading="lazy" decoding="async" ')
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

function photoBlocks(html) {
  return html.replace(/<p>((?:\s*<img\b[^>]*>\s*)+)<\/p>/g, (_, imgs) => {
    const figures = imgs.match(/<img\b[^>]*>/g).map((tag) => {
      const attr = (name) => (new RegExp(`\\s${name}="([^"]*)"`).exec(tag) || [])[1] || "";
      const src = attr("src");
      const size = /^\//.test(src) ? imageSize(src) : null;
      const img = `<img src="${src}" alt="${attr("alt")}"${size ? ` width="${size.w}" height="${size.h}"` : ""}>`;
      const caption = attr("title");
      return { html: `<figure>${img}${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`, wide: size && size.w > size.h };
    });
    if (figures.length === 1) return figures[0].html.replace("<figure>", `<figure class="photo${figures[0].wide ? " photo--wide" : ""}">`);
    return `<div class="photos" style="--n: ${figures.length}">${figures.map((f) => f.html).join("")}</div>`;
  });
}

function postCard(post, root, i, featured = false) {
  const pos = post.coverPosition ? ` style="object-position: ${esc(post.coverPosition)}"` : "";
  const media = post.cover
    ? `<img src="${esc(assetUrl(post.cover, root))}" alt="" loading="lazy"${pos}>`
    : `<span class="post-card__mark" aria-hidden="true">${esc(post.title.trim().charAt(0).toUpperCase())}</span>`;
  return `
        <article class="post-card glow${featured ? " post-card--featured" : ""}" data-tags="${esc(post.tags.map((t) => t.toLowerCase()).join("|"))}" style="${tone(post, i)}">
          <a class="post-card__link" href="${root}blog/${post.slug}/">
            <div class="post-card__media">${media}</div>
            <div class="post-card__body">
              ${post.draft ? '<span class="post-card__draft mono">Draft</span>' : ""}
              <ul class="post-card__tags">${post.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
              <h3 class="post-card__title">${esc(post.title)}</h3>
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
      <div class="post-grid post-grid--list" id="postGrid">${posts.map((p, i) => postCard(p, root, i, i === 0)).join("")}
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
    .map((p) => `${SITE_URL}/${p.replace(/(^|\/)index\.html$/, "$1")}`)
    .concat(posts.map((p) => `${SITE_URL}/blog/${p.slug}/`));
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
