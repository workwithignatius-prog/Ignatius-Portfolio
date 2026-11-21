// The contact form's mail route: itsigni.com/api/contact, a Cloudflare Worker.
//
// The site's contact form posts here. Each message is emailed to hello@itsigni.com from
// no-reply@itsigni.com, with Reply-To set to the visitor, and the visitor gets a short thank-you
// from the same address, with Reply-To set to hello@itsigni.com. Resend sends both.
//
// Settings are the [vars] in wrangler.toml. The Resend API key is the Worker secret RESEND_API_KEY,
// which the deploy workflow copies from the GitHub secret of the same name.

import { renderOwnerEmail, renderThankYouEmail } from "./email.js";

const MAX = { name: 80, email: 254, link: 200, topic: 60, message: 5000 };
const MAX_BODY = 32 * 1024; // characters: far more than the longest message the form allows
const LIMIT = { count: 3, window: 10 * 60 * 1000 }; // messages per visitor (IP address) per 10 minutes
const EMAIL = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u2028\u2029]/g;

// Recent messages per IP address. Each Worker instance keeps its own list, so this slows down
// someone hammering the form rather than being a hard limit.
const recent = new Map();

export default {
  fetch: (request, env) => handle(request, env),
};

export async function handle(request, env, now = Date.now()) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ORIGINS || "").split(/[\s,]+/).filter(Boolean).includes(origin);
  const cors = allowed ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {};
  const json = (status, body, headers = {}) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors, ...headers },
    });
  const fail = (status, message, extra = {}, headers = {}) => json(status, { success: false, message, ...extra }, headers);

  if (request.method === "OPTIONS") {
    if (!allowed) return new Response(null, { status: 403 });
    return new Response(null, {
      status: 204,
      headers: { ...cors, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" },
    });
  }
  if (request.method !== "POST") return fail(405, "Send the form with POST.", {}, { Allow: "POST, OPTIONS" });
  if (!allowed) return fail(403, "This form only takes messages sent from itsigni.com.");
  if (!env.RESEND_API_KEY) return fail(503, "The mail route isn't set up yet.", { code: "not_configured" });

  if (Number(request.headers.get("Content-Length")) > MAX_BODY) return fail(413, "That message is too long to send.");
  const raw = await request.text();
  if (raw.length > MAX_BODY) return fail(413, "That message is too long to send.");
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "The form didn't send anything readable.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail(400, "The form didn't send anything readable.");
  // A bot filled in the hidden field: say it worked and send nothing.
  if (body._gotcha || body.botcheck) return json(200, { success: true, confirmation: true });

  const entry = read(body);
  const problem = check(entry);
  if (problem) return fail(400, problem[1], { field: problem[0] });

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (tooMany(ip, now)) {
    return fail(429, `You've sent a few messages in a row. Please wait a few minutes, or email ${env.TO}.`, {}, { "Retry-After": "600" });
  }

  const owner = renderOwnerEmail({ ...entry, sentAt: new Date(now) });
  const delivered = await send(env, { from: env.FROM, to: [env.TO], reply_to: entry.email, subject: owner.subject, html: owner.html, text: owner.text });
  if (!delivered.ok) return fail(502, "Your message couldn't be sent just now.", { code: delivered.code });

  const thanks = renderThankYouEmail(entry);
  const confirmed = await send(env, { from: env.FROM, to: [entry.email], reply_to: env.TO, subject: thanks.subject, html: thanks.html, text: thanks.text });
  return json(200, { success: true, confirmation: confirmed.ok });
}

/* ---------- Reading the form ---------- */

const str = (v) => (typeof v === "string" ? v : "");
// One line: no line breaks or control characters (they could break an email header).
const line = (v) => str(v).replace(CONTROL, " ").replace(/\s+/g, " ").trim();
// Running text: keeps line breaks, drops control characters.
const prose = (v) => str(v).replace(/\r\n?/g, "\n").replace(CONTROL, "").replace(/[ \t]+$/gm, "").replace(/\n{4,}/g, "\n\n\n").trim();

function read(body) {
  return {
    name: line(body.name),
    email: line(body.email),
    link: line(body.link),
    topic: line(body.topic).slice(0, MAX.topic) || "Something else",
    message: prose(body.message),
  };
}

// The first problem with the form, as [field, message], or null.
function check({ name, email, link, message }) {
  if (!name) return ["name", "Please add your name."];
  if (name.length > MAX.name) return ["name", `Please keep your name under ${MAX.name} characters.`];
  const [local = ""] = email.split("@");
  if (email.length > MAX.email || !EMAIL.test(email) || local.length > 64 || /^\.|\.\.|\.$/.test(local)) {
    return ["email", "Please check your email address."];
  }
  if (link.length > MAX.link) return ["link", "Please shorten the website or social link."];
  if (!message) return ["message", "Please add a short message."];
  if (message.length > MAX.message) return ["message", "Please keep your message under 5,000 characters."];
  return null;
}

function tooMany(ip, now) {
  const since = now - LIMIT.window;
  const times = (recent.get(ip) || []).filter((t) => t > since);
  const over = times.length >= LIMIT.count;
  if (!over) times.push(now);
  recent.set(ip, times);
  if (recent.size > 5000) for (const [key, list] of recent) if (!list.some((t) => t > since)) recent.delete(key);
  return over;
}

/* ---------- Sending ---------- */

// One email through Resend. Returns { ok, id } or { ok: false, code }. A busy signal (429) gets one retry.
async function send(env, mail) {
  for (let attempt = 1; ; attempt++) {
    let res;
    let data = {};
    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(mail),
        signal: AbortSignal.timeout(6000),
      });
      data = await res.json().catch(() => ({}));
    } catch (err) {
      console.log(JSON.stringify({ event: "resend_unreachable", error: String(err) }));
      return { ok: false, code: "unreachable" };
    }
    if (res.ok && data.id) return { ok: true, id: data.id };
    if (res.status === 429 && attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      continue;
    }
    console.log(JSON.stringify({ event: "resend_error", status: res.status, name: data.name, message: data.message }));
    return { ok: false, code: data.name || `http_${res.status}` };
  }
}
