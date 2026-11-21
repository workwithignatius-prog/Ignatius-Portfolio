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
  red: "#d2421f", redInk: "#b5381a", yellow: "#f5b700", line: "#e4e2dd",
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

// Email apps such as Zoho drop CSS like word-break, so a long word or link would push the card
// wider than a phone. These put the break points into the text itself.
const chunks = (word, size) => word.match(new RegExp(`.{1,${size}}`, "gu")) || [word];
// Escapes text and lets words over 16 characters break every 12 (<wbr> adds no hyphen).
const breakable = (s) => String(s).split(/(\s+)/).map((w) => ([...w].length > 16 ? chunks(w, 12).map(esc).join("<wbr>") : esc(w))).join("");
// One line of the visitor's message: escaped, with web addresses made clickable.
const URL_IN_TEXT = /\bhttps?:\/\/[^\s<>"]*[^\s<>".,;:!?'")\]]/gi;
function rich(line) {
  let html = "";
  let last = 0;
  for (const m of line.matchAll(URL_IN_TEXT)) {
    html += breakable(line.slice(last, m.index));
    html += `<a href="${esc(m[0])}" style="color:${C.ink};text-decoration:underline;">${breakable(m[0])}</a>`;
    last = m.index + m[0].length;
  }
  return html + breakable(line.slice(last));
}

// The big Syne headline. Syne capitals are wide, and on a 320px phone the card leaves 236px for
// text. So the headline takes the largest size, up to 36px, at which every word fits, and a word too
// wide even at 24px gets soft hyphens where it may break. Widths are Syne ExtraBold capitals in em,
// letter-spacing included, measured in a browser; anything else counts as 1.3em to be safe.
const SYNE = { A: 1.13, B: 1.1, C: 1.28, D: 1.27, E: 1.1, F: 1.09, G: 1.3, H: 1.25, I: 0.39, J: 0.97, K: 1.18, L: 0.91, M: 1.54, N: 1.26, O: 1.29, P: 1.14, Q: 1.29, R: 1.2, S: 1.02, T: 1.06, U: 1.25, V: 1.13, W: 1.85, X: 1.1, Y: 1.03, Z: 1.17, "!": 0.36, ",": 0.27, ".": 0.3, "'": 0.27, "’": 0.27, "-": 0.56 };
const ROOM = 236;
const emWidth = (s) => [...s.toUpperCase()].reduce((sum, c) => sum + (SYNE[c] ?? 1.3), 0);
function headline(text) {
  const runs = [];
  const words = text.trim().split(/\s+/).map((word) => {
    const pieces = [""];
    for (const ch of word) {
      const last = pieces.length - 1;
      if (pieces[last] && emWidth(pieces[last] + ch) + SYNE["-"] > ROOM / 24) pieces.push(ch);
      else pieces[last] += ch;
    }
    pieces.forEach((piece, i) => runs.push(emWidth(piece) + (i < pieces.length - 1 ? SYNE["-"] : 0)));
    return pieces.map(esc).join("&shy;");
  });
  const size = Math.max(24, Math.min(36, Math.floor(ROOM / Math.max(...runs))));
  return `<h1 style="margin:0 0 16px;font:800 ${size}px/1.05 ${DISPLAY};letter-spacing:-0.035em;text-transform:uppercase;color:${C.ink};">${words.join(" ")}</h1>`;
}

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
  // The address goes in as typed: some apps break a mailto link whose @ is encoded.
  const replyHref = `mailto:${email.replace(/[%?#&]/g, encodeURIComponent)}?subject=${encodeURIComponent(`Re: ${topic}`)}`;
  const linkUrl = link ? linkify(link) : "";
  const paragraphs = message.trim().split(/\n{2,}/).map((p) => p.split("\n").map(rich).join("<br>"));
  const underline = `color:${C.ink};text-decoration:none;border-bottom:2px solid ${C.yellow};`;
  // Label and value sit side by side when there's room, and stack on a phone.
  const row = (label, value) => `
                    <tr>
                      <td style="padding:12px 0 10px;border-top:1px solid ${C.line};font-size:0;">
                        <div style="display:inline-block;vertical-align:top;width:150px;font:600 11px/22px ${MONO};letter-spacing:0.12em;text-transform:uppercase;color:${C.muted};">${label}</div>
                        <div style="display:inline-block;vertical-align:top;width:100%;max-width:340px;font:500 15px/22px ${FONT};color:${C.ink};">${value}</div>
                      </td>
                    </tr>`;

  const subject = `New message from ${name.trim()}: ${topic}`;
  const card = `
                  <p style="margin:0 0 10px;font:600 11px/1.4 ${MONO};letter-spacing:0.14em;text-transform:uppercase;color:${C.redInk};">From the contact form</p>
                  ${headline(name)}
                  <div style="margin:0 0 26px;">
                  ${pill(topic)}
                  </div>

                  <!-- The message, as a chat bubble -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                    <tr>
                      <td style="background:${C.paper};border-radius:22px 22px 22px 5px;padding:20px 22px;font:400 17px/1.65 ${FONT};color:${C.body};">
                        ${paragraphs.map((p, i) => `<p style="margin:${i ? "14px" : "0"} 0 0;">${p}</p>`).join("\n                        ")}
                      </td>
                    </tr>
                  </table>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px;">${row("Email", `<a href="mailto:${esc(email)}" style="${underline}">${breakable(email)}</a>`)}${link ? row("Website or social", linkUrl ? `<a href="${esc(linkUrl)}" style="${underline}">${breakable(link)}</a>` : breakable(link)) : ""}${row("Reaching out about", breakable(topic))}
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
                  ${headline(first ? `Thanks, ${first}!` : "Thanks for writing!")}
                  <p style="margin:0 0 24px;font:400 17px/1.65 ${FONT};color:${C.body};">${lead}</p>
${known ? `
                  <div style="margin:0 0 18px;font-size:0;">
                    <div style="display:inline-block;vertical-align:middle;margin:0 12px 8px 0;${LABEL}">You wrote about</div>
                    <div style="display:inline-block;vertical-align:middle;margin:0 0 8px;">
                  ${pill(topic)}
                    </div>
                  </div>
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
                  <div style="font-size:0;">
                    <div style="display:inline-block;vertical-align:top;margin:0 10px 10px 0;">
                        ${button(`${SITE}/blog/`, "Read the blog")}
                    </div>
                    <div style="display:inline-block;vertical-align:top;margin:0 0 10px;">
                        ${button(`${SITE}/#b-sides`, "See the B-sides", true)}
                    </div>
                  </div>

                  <!-- Sign-off -->
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
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
