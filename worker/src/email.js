// The two emails the contact form sends, both from no-reply@itsigni.com:
//   renderOwnerEmail     the visitor's message, to hello@itsigni.com (Reply-To is the visitor)
//   renderThankYouEmail  a short thank-you to the visitor (Reply-To is hello@itsigni.com)
// Built like the site: paper background, the itsigni. wordmark, a dark chat-bubble badge, a bordered
// card with the yellow block shadow and the topic as a coloured pill. Tables and inline styles, so
// every email app shows the same thing.

export const SITE = "https://itsigni.com";

// Keep in step with contactTopics in site/content.js (a test checks that they match).
export const TOPICS = ["Just saying hi", "A collaboration", "Music", "An ad film or video", "Design", "Content", "Something else"];

const C = {
  paper: "#f5f0e6", card: "#fffdf8", ink: "#1c1a17", body: "#2e2a25", muted: "#6b6358",
  red: "#d2421f", redInk: "#b5381a", yellow: "#f5b700", line: "rgba(28,26,23,0.12)",
};
// The site's six item colours, c0 to c5 in styles.css: [background, text on it].
const TONES = [["#d2421f", "#ffffff"], ["#2457a6", "#ffffff"], ["#f5b700", "#1c1a17"], ["#2a7549", "#ffffff"], ["#e8742a", "#1c1a17"], ["#0f6e6a", "#ffffff"]];
const DISPLAY = "'Syne','Arial Black','Helvetica Neue',Arial,sans-serif";
const FONT = "'Plus Jakarta Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
const MONO = "'JetBrains Mono',ui-monospace,Menlo,Consolas,monospace";
const LABEL = `font:600 11px/1.4 ${MONO};letter-spacing:0.12em;text-transform:uppercase;color:${C.muted};`;

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const linkify = (url) => (/^https?:\/\/\S+$/i.test(url) ? url : /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(url) ? `https://${url}` : "");
const toneOf = (topic) => TONES[Math.max(0, TOPICS.indexOf(topic)) % TONES.length];

// The first word of a name, for greetings, when it looks like a name: letters, apostrophes and
// hyphens. Anything else, such as a web address typed into the name box, is never repeated back.
export function firstName(name) {
  const word = String(name).trim().split(/\s+/)[0] || "";
  if (!/^\p{L}[\p{L}\p{M}'’-]{0,29}$/u.test(word)) return "";
  const [head, ...rest] = [...word];
  return head.toUpperCase() + rest.join("");
}

/* ---------- Pieces ---------- */

const pill = (topic) => {
  const [bg, fg] = toneOf(topic);
  return `<table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:${bg};color:${fg};border-radius:999px;padding:8px 15px;font:700 13px/1 ${FONT};">${esc(topic)}</td>
                    </tr>
                  </table>`;
};

// A rounded "pill" button: primary is the site's red "Let's talk" button, ghost its outlined twin.
const button = (href, label, ghost = false) => `<table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="${ghost ? `border:2px solid ${C.ink};` : `background:${C.red};`}border-radius:999px;">
                              <a href="${esc(href)}" style="display:inline-block;padding:${ghost ? "12px 22px" : "14px 24px"};font:700 15px/1 ${FONT};color:${ghost ? C.ink : "#ffffff"};text-decoration:none;">${label} &nbsp;&#8599;</a>
                            </td>
                          </tr>
                        </table>`;

function page({ title, preheader, corner = "", badge, card, footer }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
  @media (max-width: 520px) {
    .px { padding-left: 20px !important; padding-right: 20px !important; }
    .h1 { font-size: 30px !important; }
    .stack td { display: block !important; width: auto !important; }
    .stack td:first-child { border-top: 1px solid rgba(28,26,23,0.12) !important; padding-bottom: 2px !important; }
    .stack td:last-child { border-top: 0 !important; padding-top: 0 !important; }
    .pair .cell { display: block !important; padding: 0 0 10px !important; }
    .btns .cell { display: block !important; padding: 0 0 10px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};">
  <tr>
    <td align="center" style="padding:36px 14px 44px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

        <!-- Wordmark -->
        <tr>
          <td style="padding:0 6px 22px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font:800 28px/1 ${DISPLAY};letter-spacing:-0.03em;color:${C.ink};"><a href="${SITE}" style="color:${C.ink};text-decoration:none;">itsigni<span style="color:${C.red};">.</span></a></td>
                <td align="right" style="${LABEL}">${esc(corner)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Chat-bubble badge, like the hero's -->
        <tr>
          <td style="padding:0 6px 16px;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:${C.ink};border-radius:22px 22px 22px 5px;padding:11px 20px;font:600 13px/1 ${MONO};letter-spacing:0.04em;color:${C.paper};">
                  <span style="color:${C.yellow};">&#9679;</span>&nbsp;&nbsp;${badge}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- The card, with the yellow block shadow -->
        <tr>
          <td style="padding:0 6px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.card};border:2px solid ${C.ink};border-radius:26px;box-shadow:10px 10px 0 ${C.yellow};">
              <tr>
                <td class="px" style="padding:32px 34px 34px;">
${card}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:30px 6px 0;font:500 12px/1.7 ${MONO};letter-spacing:0.02em;color:${C.muted};">
            ${footer}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// Plain-text copy: drop empty lines that would double up.
const plain = (lines) => lines.filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n").trim();

/* ---------- To you: the visitor's message ---------- */

export function renderOwnerEmail({ name, email, link = "", topic = "Something else", message, sentAt = new Date() }) {
  const first = name.trim().split(/\s+/)[0];
  const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).format(sentAt) + " IST";
  const replyHref = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: ${topic}`)}`;
  const linkUrl = link ? linkify(link) : "";
  const paragraphs = esc(message.trim()).split(/\n{2,}/).map((p) => p.replace(/\n/g, "<br>"));
  const underline = `color:${C.ink};text-decoration:underline;text-decoration-color:${C.yellow};`;
  const row = (label, value) => `
                    <tr>
                      <td style="padding:12px 0;border-top:1px solid ${C.line};${LABEL}width:150px;vertical-align:top;">${label}</td>
                      <td style="padding:12px 0;border-top:1px solid ${C.line};font:500 15px/1.5 ${FONT};color:${C.ink};vertical-align:top;word-break:break-word;">${value}</td>
                    </tr>`;

  const subject = `New message from ${name.trim()}: ${topic}`;
  const card = `
                  <p style="margin:0 0 10px;font:600 11px/1.4 ${MONO};letter-spacing:0.14em;text-transform:uppercase;color:${C.redInk};">From the contact form</p>
                  <h1 class="h1" style="margin:0 0 16px;font:800 36px/1.02 ${DISPLAY};letter-spacing:-0.035em;text-transform:uppercase;color:${C.ink};word-break:break-word;">${esc(name.trim())}</h1>
                  <div style="margin:0 0 26px;">
                  ${pill(topic)}
                  </div>

                  <!-- The message, as a chat bubble -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                    <tr>
                      <td style="background:${C.paper};border-radius:22px 22px 22px 5px;padding:20px 22px;font:400 17px/1.65 ${FONT};color:${C.body};word-break:break-word;">
                        ${paragraphs.map((p, i) => `<p style="margin:${i ? "14px" : "0"} 0 0;">${p}</p>`).join("\n                        ")}
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="stack" style="margin:0 0 30px;">${row("Email", `<a href="mailto:${esc(email)}" style="${underline}">${esc(email)}</a>`)}${link ? row("Website or social", linkUrl ? `<a href="${esc(linkUrl)}" style="${underline}">${esc(link)}</a>` : esc(link)) : ""}${row("Reaching out about", esc(topic))}
                  </table>

                  <!-- Reply button, like the site's "Let's talk" -->
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:${C.red};border-radius:999px;">
                        <a href="${replyHref}" style="display:inline-block;padding:15px 28px;font:700 16px/1 ${FONT};color:#ffffff;text-decoration:none;">Reply to ${esc(first)} &nbsp;&#8599;</a>
                      </td>
                    </tr>
                  </table>`;

  const html = page({
    title: subject,
    preheader: `${first}: ${message.trim().replace(/\s+/g, " ").slice(0, 110)}`,
    corner: when,
    badge: "New message on itsigni.com",
    card,
    footer: `Sent from the contact form at <a href="${SITE}/contact" style="color:${C.muted};">itsigni.com/contact</a>.<br>
            Hitting reply answers ${esc(first)} directly.<br>
            Chennai, India`,
  });

  const text = plain([
    `New message on itsigni.com — ${when}`,
    "",
    `From: ${name.trim()} <${email}>`,
    link ? `Website or social: ${link}` : "",
    `Reaching out about: ${topic}`,
    "",
    message.trim(),
    "",
    `Reply to this email to answer ${first} directly.`,
  ]);

  return { subject, html, text };
}

/* ---------- To the visitor: thank you ---------- */

// It never repeats the visitor's message or link, and shows the topic only when it's one of the
// form's own choices, so the form can't be used to send other people someone else's words.
export function renderThankYouEmail({ name, topic }) {
  const first = firstName(name);
  const known = TOPICS.includes(topic);
  const subject = first ? `Thanks for reaching out, ${first}!` : "Thanks for reaching out!";
  const lead = "Your message reached me safely. I read every one myself, and I'll write back to you soon.";

  const card = `
                  <p style="margin:0 0 10px;font:600 11px/1.4 ${MONO};letter-spacing:0.14em;text-transform:uppercase;color:${C.redInk};">Heyyya from Chennai</p>
                  <h1 class="h1" style="margin:0 0 16px;font:800 36px/1.02 ${DISPLAY};letter-spacing:-0.035em;text-transform:uppercase;color:${C.ink};">${first ? `Thanks, ${esc(first)}!` : "Thanks for writing!"}</h1>
                  <p style="margin:0 0 24px;font:400 17px/1.65 ${FONT};color:${C.body};">${lead}</p>
${known ? `
                  <table role="presentation" cellpadding="0" cellspacing="0" class="pair" style="margin:0 0 26px;">
                    <tr>
                      <td class="cell" style="padding:0 12px 0 0;${LABEL}vertical-align:middle;">You wrote about</td>
                      <td class="cell" style="vertical-align:middle;">
                  ${pill(topic)}
                      </td>
                    </tr>
                  </table>
` : ""}
                  <!-- A chat bubble, like the hero's -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px;">
                    <tr>
                      <td style="background:${C.paper};border-radius:22px 22px 22px 5px;padding:18px 22px;font:400 16px/1.6 ${FONT};color:${C.body};">
                        <b style="color:${C.ink};">Thought of something else?</b> Just reply to this email. It comes straight to me.
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 12px;${LABEL}">While you wait</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" class="btns">
                    <tr>
                      <td class="cell" style="padding:0 10px 0 0;">
                        ${button(`${SITE}/blog/`, "Read the blog")}
                      </td>
                      <td class="cell">
                        ${button(`${SITE}/#b-sides`, "See the B-sides", true)}
                      </td>
                    </tr>
                  </table>

                  <!-- Sign-off -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0 0;">
                    <tr>
                      <td style="padding:24px 0 0;border-top:1px solid ${C.line};">
                        <p style="margin:0 0 4px;font:400 16px/1.5 ${FONT};color:${C.body};">Talk soon,</p>
                        <p style="margin:0;font:800 28px/1.1 ${DISPLAY};letter-spacing:-0.03em;color:${C.ink};">Ignatius<span style="color:${C.red};">.</span></p>
                        <p style="margin:6px 0 0;${LABEL}">a.k.a. itsigni</p>
                      </td>
                    </tr>
                  </table>`;

  const html = page({
    title: subject,
    preheader: `${lead} Replies to this email come straight to me.`,
    badge: "Message received",
    card,
    footer: `You're getting this because this address was entered in the contact form at <a href="${SITE}/contact" style="color:${C.muted};">itsigni.com/contact</a>. If that wasn't you, you can ignore this email.<br>
            Chennai, India`,
  });

  const text = plain([
    first ? `Thanks, ${first}!` : "Thanks for writing!",
    "",
    lead,
    "",
    known ? `You wrote about: ${topic}` : "",
    "",
    "Thought of something else? Just reply to this email. It comes straight to me.",
    "",
    "While you wait:",
    `Read the blog: ${SITE}/blog/`,
    `See the B-sides: ${SITE}/#b-sides`,
    "",
    "Talk soon,",
    "Ignatius (a.k.a. itsigni)",
    "",
    "--",
    "You're getting this because this address was entered in the contact form at itsigni.com/contact. If that wasn't you, you can ignore this email.",
  ]);

  return { subject, html, text };
}
