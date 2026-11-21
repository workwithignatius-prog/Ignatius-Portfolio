// Tests for the contact form's mail route. Resend is replaced by a stand-in that records each email.
// Run: node --test worker/test/worker.test.mjs
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { handle } from "../src/index.js";
import { TOPICS, firstName, renderThankYouEmail } from "../src/email.js";

const here = new URL(".", import.meta.url);
const read = (rel) => fs.readFileSync(new URL(rel, here), "utf8");

// The real settings: the [vars] in wrangler.toml, plus a stand-in Resend key.
const vars = Object.fromEntries(
  [...read("../wrangler.toml").split(/^\[vars\]$/m)[1].split(/^\[/m)[0].matchAll(/^(\w+)\s*=\s*"([^"]*)"/gm)].map((m) => [m[1], m[2]]),
);
const env = { ...vars, RESEND_API_KEY: "re_test_key" };

let sent; // the emails "sent" in the current test
let reply; // how the stand-in Resend answers: (n) => [status, body] for the nth email
beforeEach(() => {
  sent = [];
  reply = (n) => [200, { id: `email-${n}` }];
  globalThis.fetch = async (url, init) => {
    assert.equal(url, "https://api.resend.com/emails");
    sent.push({ headers: init.headers, ...JSON.parse(init.body) });
    const [status, body] = reply(sent.length);
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  };
});

let ipCount = 0;
function post(body, { origin = "https://itsigni.com", ip = `203.0.113.${++ipCount}`, headers = {} } = {}) {
  return new Request("https://itsigni.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": ip, ...(origin ? { Origin: origin } : {}), ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
const good = { name: "Priya Raman", email: "priya@example.com", link: "instagram.com/priya", topic: "A collaboration", message: "Hi!\n\nLoved the B-sides. Shall we make something?" };
const call = async (request) => {
  const res = await handle(request, env);
  return { res, body: await res.json().catch(() => null) };
};

test("the form's topics match site/content.js", () => {
  const sandbox = { window: {} };
  vm.runInNewContext(read("../../site/content.js"), sandbox);
  assert.deepEqual(TOPICS, [...sandbox.window.PORTFOLIO.contactTopics],
    "The topics in worker/src/email.js differ from contactTopics in site/content.js: update TOPICS in worker/src/email.js to match.");
});

test("a good message emails you, then thanks the visitor", async () => {
  const { res, body } = await call(post(good));
  assert.equal(res.status, 200);
  assert.deepEqual(body, { success: true, confirmation: true });
  assert.equal(sent.length, 2);

  const [owner, thanks] = sent;
  assert.equal(owner.headers.Authorization, "Bearer re_test_key");
  assert.equal(owner.from, "itsigni <no-reply@itsigni.com>");
  assert.deepEqual(owner.to, ["hello@itsigni.com"]);
  assert.equal(owner.reply_to, "priya@example.com");
  assert.equal(owner.subject, "New message from Priya Raman: A collaboration");
  assert.match(owner.html, /Loved the B-sides/);
  assert.match(owner.html, /href="https:\/\/instagram\.com\/priya"/);
  assert.match(owner.text, /From: Priya Raman <priya@example\.com>/);

  assert.equal(thanks.from, "itsigni <no-reply@itsigni.com>");
  assert.deepEqual(thanks.to, ["priya@example.com"]);
  assert.equal(thanks.reply_to, "hello@itsigni.com");
  assert.equal(thanks.subject, "Thanks for reaching out, Priya!");
  assert.match(thanks.html, /Thanks, Priya!/);
  assert.match(thanks.html, /A collaboration/);
  assert.match(thanks.text, /You wrote about: A collaboration/);
});

test("the thank-you never repeats the visitor's message or link", async () => {
  await call(post({ ...good, message: "Buy cheap things at spam.example now", link: "spam.example/deal" }));
  const thanks = sent[1];
  for (const part of [thanks.html, thanks.text, thanks.subject]) {
    assert.doesNotMatch(part, /spam\.example|cheap things/);
  }
});

test("names that aren't names aren't repeated back", async () => {
  await call(post({ ...good, name: "www.spam.example Deals" }));
  const thanks = sent[1];
  assert.equal(thanks.subject, "Thanks for reaching out!");
  assert.match(thanks.html, /Thanks for writing!/);
  assert.doesNotMatch(thanks.html + thanks.text, /spam\.example/);
  assert.equal(firstName("priya"), "Priya");
  assert.equal(firstName("O'Neil Smith"), "O'Neil");
  assert.equal(firstName("Zoë"), "Zoë");
  assert.equal(firstName("அருண் குமார்"), "அருண்");
  assert.equal(firstName("https://x.example"), "");
});

test("a topic that isn't one of the form's choices stays out of the thank-you", async () => {
  await call(post({ ...good, topic: "Visit spam.example" }));
  assert.match(sent[0].subject, /: Visit spam\.example$/);
  assert.doesNotMatch(sent[1].html + sent[1].text, /spam\.example|You wrote about/);
  assert.doesNotMatch(renderThankYouEmail({ name: "Priya", topic: "Nope" }).html, /You wrote about/);
});

test("line breaks can't sneak into the email headers", async () => {
  await call(post({ ...good, name: "Priya\r\nBcc: victim@example.com", topic: "Music\nX-Evil: 1" }));
  assert.equal(sent[0].subject, "New message from Priya Bcc: victim@example.com: Music X-Evil: 1");
  assert.doesNotMatch(sent[0].subject, /[\r\n]/);
});

test("the message is shown as text, never as HTML", async () => {
  await call(post({ ...good, message: `<script>alert(1)</script><img src=x onerror=alert(2)> "quoted" & more` }));
  const { html } = sent[0];
  assert.doesNotMatch(html, /<script>|<img src=x/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /&quot;quoted&quot; &amp; more/);
});

test("a link that isn't a web address is shown but not linked", async () => {
  await call(post({ ...good, link: "javascript:alert(1)" }));
  assert.doesNotMatch(sent[0].html, /href="javascript:/);
  assert.match(sent[0].html, /javascript:alert\(1\)/);
});

test("missing or bad fields are explained, and nothing is sent", async () => {
  const cases = [
    [{ ...good, name: "  " }, "name", /add your name/],
    [{ ...good, name: "x".repeat(81) }, "name", /under 80/],
    [{ ...good, email: "priya@" }, "email", /check your email/],
    [{ ...good, email: "priya@example" }, "email", /check your email/],
    [{ ...good, email: "pri..ya@example.com" }, "email", /check your email/],
    [{ ...good, email: "Priya <priya@example.com>" }, "email", /check your email/],
    [{ ...good, link: "x".repeat(201) }, "link", /shorten/],
    [{ ...good, message: " \n " }, "message", /short message/],
    [{ ...good, message: "x".repeat(5001) }, "message", /under 5,000/],
    [{ ...good, name: ["Priya"] }, "name", /add your name/],
  ];
  for (const [form, field, message] of cases) {
    const { res, body } = await call(post(form));
    assert.equal(res.status, 400, JSON.stringify(form).slice(0, 80));
    assert.equal(body.field, field);
    assert.match(body.message, message);
  }
  assert.equal(sent.length, 0);
});

test("a bot that fills the hidden field is told it worked, and nothing is sent", async () => {
  const { res, body } = await call(post({ ...good, _gotcha: "http://spam.example" }));
  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(sent.length, 0);
});

test("only itsigni.com pages can send the form", async () => {
  for (const origin of ["https://evil.example", "https://itsigni.com.evil.example", ""]) {
    const { res } = await call(post(good, { origin }));
    assert.equal(res.status, 403, origin || "(no origin)");
  }
  assert.equal((await call(post(good, { origin: "https://www.itsigni.com" }))).res.status, 200);
  const preflight = await handle(new Request("https://itsigni.com/api/contact", { method: "OPTIONS", headers: { Origin: "https://itsigni.com" } }), env);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("Access-Control-Allow-Origin"), "https://itsigni.com");
  const stranger = await handle(new Request("https://itsigni.com/api/contact", { method: "OPTIONS", headers: { Origin: "https://evil.example" } }), env);
  assert.equal(stranger.status, 403);
});

test("other methods, unreadable bodies and huge bodies are turned away", async () => {
  const get = await handle(new Request("https://itsigni.com/api/contact", { headers: { Origin: "https://itsigni.com" } }), env);
  assert.equal(get.status, 405);
  assert.equal((await call(post("not json"))).res.status, 400);
  assert.equal((await call(post("[1,2]"))).res.status, 400);
  assert.equal((await call(post({ ...good, message: "x".repeat(40000) }))).res.status, 413);
  assert.equal(sent.length, 0);
});

test("without the Resend key it says so instead of failing quietly", async () => {
  const res = await handle(post(good), { ...env, RESEND_API_KEY: "" });
  assert.equal(res.status, 503);
  assert.equal((await res.json()).code, "not_configured");
});

test("if Resend refuses your copy, the form is told it failed (so the site can use its backup)", async () => {
  reply = () => [403, { statusCode: 403, name: "validation_error", message: "The itsigni.com domain is not verified." }];
  const { res, body } = await call(post(good));
  assert.equal(res.status, 502);
  assert.deepEqual(body, { success: false, message: "Your message couldn't be sent just now.", code: "validation_error" });
  assert.equal(sent.length, 1, "no thank-you when your copy failed");
});

test("if only the thank-you fails, the message still counts as sent", async () => {
  reply = (n) => (n === 1 ? [200, { id: "ok" }] : [422, { name: "validation_error", message: "Invalid `to` field." }]);
  const { res, body } = await call(post(good));
  assert.equal(res.status, 200);
  assert.deepEqual(body, { success: true, confirmation: false });
});

test("a busy Resend gets one retry", async () => {
  reply = (n) => (n === 1 ? [429, { name: "rate_limit_exceeded" }] : [200, { id: `email-${n}` }]);
  const { body } = await call(post(good));
  assert.deepEqual(body, { success: true, confirmation: true });
  assert.equal(sent.length, 3);
});

test("one visitor can send 3 messages in 10 minutes", async () => {
  const ip = "198.51.100.7";
  for (let i = 0; i < 3; i++) assert.equal((await call(post(good, { ip }))).res.status, 200);
  const { res, body } = await call(post(good, { ip }));
  assert.equal(res.status, 429);
  assert.match(body.message, /wait a few minutes, or email hello@itsigni\.com/);
  assert.equal(res.headers.get("Retry-After"), "600");
  assert.equal((await call(post(good, { ip: "198.51.100.8" }))).res.status, 200, "other visitors aren't affected");
  const later = await handle(post(good, { ip }), env, Date.now() + 11 * 60 * 1000);
  assert.equal(later.status, 200, "the limit wears off");
});
