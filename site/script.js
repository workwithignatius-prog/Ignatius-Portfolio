(() => {
  const data = window.PORTFOLIO;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const page = document.body.dataset.page || "";
  const root = document.body.dataset.root || "";

  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  // The palette colour for item i, its shade for text on paper, and the text colour to put on top of it.
  const tone = (i) => `--c: var(--c${i % 6}); --ct: var(--c${i % 6}-t); --con: var(--c${i % 6}-on)`;
  const asset = (p) => (/^(https?:)?\/\//.test(p) ? p : root + String(p).replace(/^\//, ""));
  const social = (label) => (data.socials || []).find((s) => s.label.toLowerCase() === label.toLowerCase() && s.url);

  const storage = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { sessionStorage.setItem(key, val); } catch { /* storage unavailable */ } },
  };

  const ICONS = {
    music: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="2.5" y="14" width="5" height="7" rx="2"/><rect x="16.5" y="14" width="5" height="7" rx="2"/></svg>',
    film: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="10" width="18" height="11" rx="2"/><path d="M3 10l2.6-5.5h14.9L19 10"/><path d="M9.5 4.5L7.5 10M15.2 4.5l-2 5.5"/></svg>',
    design: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l5 8-5 10-5-10z"/><circle cx="12" cy="11.5" r="1.6"/><path d="M12 13.1V21"/></svg>',
    content: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="3"/><path d="M16 10.5l6-3.5v10l-6-3.5z"/></svg>',
    calisthenics: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2v8.5M17 2v8.5"/><circle cx="7" cy="15" r="4.5"/><circle cx="17" cy="15" r="4.5"/></svg>',
    gym: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></svg>',
  };

  // Little animated cut-outs that follow each passion word in the hero statement.
  const STICKERS = {
    music: '<svg viewBox="0 0 24 24"><g class="st-nod"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="2.5" y="14" width="5" height="7" rx="2"/><rect x="16.5" y="14" width="5" height="7" rx="2"/></g></svg>',
    film: '<svg viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="11" rx="2"/><path d="M8 13.5l2 3M13 13.5l2 3"/><g class="st-clap"><path d="M3.2 9.4l16.6-4.6 1 3.4-16.6 4.6z"/></g></svg>',
    design: '<svg viewBox="0 0 24 24"><path class="st-line" d="M2.5 20.5c2.5-2.5 4.5 1 7-1.5s4.5 1 7-1.5"/><g class="st-pen"><path d="M13.5 3.5l6 6-7.5 7.5-3.8 1.3 1.3-3.8z"/><path d="M11.5 12.5l2 2"/></g></svg>',
    content: '<svg viewBox="0 0 24 24"><rect x="2" y="6" width="14" height="12" rx="3"/><path d="M16 10.5l6-3.5v10l-6-3.5z"/><circle class="st-rec" cx="6.2" cy="10.2" r="1.7"/></svg>',
    calisthenics: '<svg viewBox="0 0 24 24"><g class="st-swing"><path d="M7 1v8.5M17 1v8.5"/><circle cx="7" cy="14" r="4.5"/><circle cx="17" cy="14" r="4.5"/></g></svg>',
    gym: '<svg viewBox="0 0 24 24"><g class="st-lift"><path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></g></svg>',
  };

  /* Adds the photo to a frame; keeps the monogram if the file is missing. */
  function mountPhoto(frame) {
    if (!frame || !data.photo) return;
    const img = new Image();
    img.alt = data.fullName;
    img.decoding = "async";
    img.onload = () => {
      frame.querySelector(".portrait__fallback")?.remove();
      frame.appendChild(img);
    };
    img.src = asset(data.photo);
  }

  /* ---------- Shared on every page ---------- */
  function renderCommon() {
    $$("[data-calendly]").forEach((a) => {
      if (a.dataset.cursor) a.dataset.cursor = data.calendlyUrl ? "Book a call" : "Say hi";
      if (!data.calendlyUrl) return;
      a.href = data.calendlyUrl;
      a.target = "_blank";
      a.rel = "noopener";
    });
    $$("[data-calendly-only]").forEach((el) => (el.hidden = !data.calendlyUrl));
    $$("[data-email-link]").forEach((a) => {
      a.href = `mailto:${data.email}`;
      a.textContent = data.email;
    });
    $$("[data-social-link]").forEach((a) => {
      const s = social(a.dataset.socialLink);
      if (s) a.href = s.url;
      else a.closest("li")?.remove();
    });
    $$("[data-socials-list]").forEach((li) => {
      li.outerHTML = (data.socials || [])
        .filter((s) => s.url)
        .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`)
        .join("");
    });
    $$("[data-location]").forEach((el) => (el.textContent = data.location));
    $$("[data-city]").forEach((el) => (el.textContent = data.city || data.location));
    $$("[data-region]").forEach((el) => (el.textContent = data.region || ""));
    stamps();
    $$("[data-tz]").forEach((el) => (el.textContent = data.timezoneLabel || ""));
    $$("[data-availability]").forEach((el) => (el.hidden = !data.available));
    $$("[data-availability-text]").forEach((el) => (el.textContent = data.availability));
    $$("[data-nav]").forEach((a) => {
      const on = a.dataset.nav === page || (page === "post" && a.dataset.nav === "blog");
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "page");
    });
    const topic = $("#fTopic");
    if (topic) topic.innerHTML = data.contactTopics.map((o) => `<option>${esc(o)}</option>`).join("");
  }

  /* A postage stamp of Chennai, with a postmark that shows the local time. */
  function stamps() {
    const ring = [data.city, data.region].filter(Boolean).join(" · ").toUpperCase();
    $$("[data-stamp]").forEach((el, i) => {
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", `Postage stamp: ${[data.city, data.region].filter(Boolean).join(", ")}`);
      el.innerHTML = `
        <span class="stamp__paper">
          <img class="stamp__art" src="${asset("assets/chennai.svg")}" alt="" width="120" height="150">
          <span class="stamp__value mono">₹5</span>
          <span class="stamp__name">${esc(data.city || data.location)}</span>
        </span>
        <svg class="postmark" viewBox="0 0 170 84" aria-hidden="true">
          <defs><path id="postmark${i}" d="M10.5 42a31.5 31.5 0 1 1 63 0a31.5 31.5 0 1 1 -63 0"/></defs>
          <circle cx="42" cy="42" r="38"/><circle cx="42" cy="42" r="25"/>
          <text class="postmark__ring"><textPath href="#postmark${i}" textLength="194" lengthAdjust="spacing">${esc(ring)} ·</textPath></text>
          <text class="postmark__time" x="42" y="45.5" text-anchor="middle" data-clock>--:--</text>
          <path class="postmark__waves" d="M86 26q7-6 14 0t14 0t14 0t14 0t14 0M86 42q7-6 14 0t14 0t14 0t14 0t14 0M86 58q7-6 14 0t14 0t14 0t14 0t14 0"/>
        </svg>`;
    });
  }

  /* "The B-sides": album sleeves with generated cover art and a record that slides out. */
  function albums(el) {
    if (!el || !data.passions) return;
    el.innerHTML = data.passions
      .map((p, i) => {
        const art = ICONS[p.art] ? p.art : "music";
        const cover = p.cover
          ? `<img class="album__img" src="${esc(asset(p.cover))}" alt="" loading="lazy">`
          : `<span class="album__vol mono">Vol. ${pad(i + 1)}</span>
             <span class="album__artist mono">itsigni</span>
             <span class="album__icon">${ICONS[art]}</span>
             <span class="album__name">${esc(p.title)}</span>`;
        const inner = `
            <span class="album__vinyl"><span class="album__label"></span></span>
            <span class="album__cover" data-art="${art}">${cover}
              <span class="album__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
            </span>`;
        const sleeve = p.link
          ? `<a class="album__sleeve" href="${esc(p.link)}" target="_blank" rel="noopener" data-cursor="Open">${inner}</a>`
          : `<button class="album__sleeve" type="button" aria-pressed="false" aria-label="Spin the ${esc(p.title)} record" data-cursor="Play">${inner}</button>`;
        return `
        <article class="album reveal" style="${tone(i)}">
          ${sleeve}
          <h3 class="album__title">${esc(p.title)}</h3>
          <p class="album__tag">${esc(p.tagline)}</p>
        </article>`;
      })
      .join("");
    el.addEventListener("click", (e) => {
      const btn = e.target.closest("button.album__sleeve");
      if (!btn) return;
      const on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      btn.closest(".album").classList.toggle("is-playing", on);
      btn.dataset.cursor = on ? "Pause" : "Play";
    });
  }

  /* Liner notes: a line or two on each B-side, with its link when there is one. */
  function notes(el) {
    if (!el || !data.passions) return;
    const verb = { music: "Listen", film: "Watch", content: "Follow" };
    el.innerHTML = data.passions
      .map(
        (p, i) => `
        <li class="note reveal" style="${tone(i)}">
          <span class="note__num">${pad(i + 1)}</span>
          <h3 class="note__title">${esc(p.title)}<span class="note__tag">${esc(p.tagline)}</span></h3>
          <div class="note__body">
            <p class="note__story">${esc(p.story || p.tagline)}</p>
            ${p.link ? `<a class="note__link" href="${esc(p.link)}" target="_blank" rel="noopener">${verb[p.art] || "See it"} <span aria-hidden="true">↗</span></a>` : ""}
          </div>
        </li>`
      )
      .join("");
  }

  /* The hero's big line: each passion's word is underlined in its colour and links to its record. */
  function statement(el) {
    if (!el || !data.headline) return;
    const words = new Map();
    (data.passions || []).forEach((p, i) => {
      if (p.word && !words.has(p.word.toLowerCase())) words.set(p.word.toLowerCase(), i);
    });
    const used = new Set();
    const pattern = [...words.keys()].map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    el.innerHTML = !pattern ? esc(data.headline) : esc(data.headline).replace(new RegExp(`\\b(${pattern})\\b`, "gi"), (w) => {
      const i = words.get(w.toLowerCase());
      if (used.has(i)) return w;
      used.add(i);
      const art = data.passions[i].art;
      const sticker = STICKERS[art] ? `<span class="sticker sticker--${art}" aria-hidden="true">${STICKERS[art]}</span>` : "";
      return `<a class="hero__word" href="#b-sides" data-album="${i}" data-cursor="Play" style="${tone(i)}">${w}${sticker}</a>`;
    });
  }

  /* ---------- Home ---------- */
  function renderHome() {
    const nameEl = $("#heroName");
    if (!nameEl) return;
    $("#heroGreet").textContent = data.greeting;
    $("#heroNameText").textContent = `${data.name}!`;
    nameEl.innerHTML = [...`${data.name}!`]
      .map((c, i) => `<span class="ch" style="--hc: var(--c${i % 6}); --n: ${i}"><span>${esc(c)}</span></span>`)
      .join("");
    $("#heroBadge").textContent = data.heroBadge || `a.k.a. ${data.handle}`;
    statement($("#heroStatement"));
    $("#heroDay").textContent = `By day, I'm a ${data.role}.`;
    $("#heroSocials").innerHTML = (data.socials || [])
      .filter((s) => s.url)
      .map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} <span aria-hidden="true">↗</span></a></li>`)
      .join("");
    // Passions as chat messages, alternating either side of the portrait from top to bottom.
    // On screens where the bubbles reach into the photo (up to 1200px wide), they keep clear of the
    // face, which fills 14% to 63% of the photo's height: the first two sit above the head and the
    // rest beside the shoulders (`--top-clear`).
    const passions = data.passions || [];
    const n = passions.length;
    $("#chat").innerHTML = passions
      .map((p, i) => {
        const top = n > 1 ? 4 + (i * 84) / (n - 1) : 40;
        const clear = i < 2 ? [-2, 3][i] : n > 3 ? 67 + ((i - 2) * 24) / (n - 3) : 75;
        return `
        <li class="chat__msg" style="${tone(i)}; --i: ${i}; --top: ${top.toFixed(1)}%; --top-clear: ${clear.toFixed(1)}%">
          <a class="chat__bubble" href="#b-sides" data-album="${i}" data-cursor="Play">
            <span class="chat__typing" aria-hidden="true"><span><i></i><i></i><i></i></span></span>
            <span class="chat__body"><span>${ICONS[p.art] || ICONS.music}${esc(p.title)}</span></span>
          </a>
        </li>`;
      })
      .join("");
    mountPhoto($(".portrait__frame"));
    albums($("#albums"));
    notes($("#notes"));

    const items = data.marquee.map((m) => `<span>${esc(m)} <i>✦</i></span>`).join("");
    $("#marquee").innerHTML = items + items;
    // Words wrapped in *stars* are coloured.
    let key = false;
    $("#statement").innerHTML = data.statement.split(/\s+/).map((w) => {
      if (w.startsWith("*")) { key = true; w = w.slice(1); }
      const ends = /\*\W*$/.test(w);
      const html = `<span class="w${key ? " w--key" : ""}">${esc(w.replace(/\*(?=\W*$)/, ""))}</span>`;
      if (ends) key = false;
      return html;
    }).join(" ");
  }

  /* Fit "Ignatius!" to the full width. */
  function fitName() {
    const el = $("#heroName");
    if (!el) return;
    el.style.fontSize = "100px";
    el.style.width = "max-content";
    const natural = el.getBoundingClientRect().width;
    el.style.width = "";
    const box = el.parentElement.getBoundingClientRect().width;
    el.style.fontSize = `${Math.floor((100 * box * 0.995) / natural)}px`;
  }

  /* The a.k.a. bubble floats above the last two characters of the name (the S and the !). */
  function placeBadge() {
    const badge = $("#heroBadge");
    const chars = $$("#heroName .ch");
    if (!badge || chars.length < 2) return;
    badge.style.left = badge.style.right = badge.style.top = "";
    if (matchMedia("(max-width: 900px)").matches) return;
    const box = badge.offsetParent.getBoundingClientRect();
    const s = chars[chars.length - 2].getBoundingClientRect();
    const bang = chars[chars.length - 1].getBoundingClientRect();
    const left = (s.left + bang.right) / 2 - box.left - badge.offsetWidth / 2;
    badge.style.left = `${Math.round(Math.min(left, box.width - badge.offsetWidth))}px`;
    badge.style.right = "auto";
    // Just clear of the tops of the letters.
    badge.style.top = `${Math.round(Math.max(-8, s.top - box.top - badge.offsetHeight - 12))}px`;
  }

  /* Two-column hero: tuck the portrait just under the name, centred on the gap between its last two
     letters (the U and the S), and small enough to fit on the first screen. Stacked layouts keep it centred. */
  function placePhoto() {
    const photo = $(".hero__photo");
    const chars = $$("#heroName .ch");
    if (!photo || chars.length < 3) return;
    const visual = photo.parentElement;
    visual.style.marginTop = photo.style.width = photo.style.translate = "";
    if (matchMedia("(max-width: 900px)").matches) return;

    const nameBottom = $("#heroName").getBoundingClientRect().bottom + scrollY;
    const top = nameBottom + 22;
    const natural = photo.getBoundingClientRect();
    const fit = (innerHeight - top - 24) * (natural.width / natural.height);
    if (fit < natural.width) photo.style.width = `${Math.max(260, fit)}px`;
    const box = photo.getBoundingClientRect();
    visual.style.marginTop = `${top - (box.top + scrollY)}px`;

    // How far the bubbles on each side reach past the photo once their text is showing.
    const chat = $("#chat");
    const overlap = (parseFloat(getComputedStyle(chat).getPropertyValue("--overlap")) || 0) / 100;
    const reach = (side) => Math.max(0, ...$$(`.chat__msg:nth-child(${side})`, chat).map((m) => {
      const cs = getComputedStyle($(".chat__bubble", m));
      return $(".chat__body > span", m).scrollWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) - overlap * box.width;
    }));
    const a = chars[chars.length - 3].getBoundingClientRect();
    const b = chars[chars.length - 2].getBoundingClientRect();
    const want = (a.right + b.left) / 2 - (box.left + box.width / 2);
    const room = 24; // edge margin, including the bubbles' 9px parallax drift
    const most = document.documentElement.clientWidth - room - (box.right + reach("even"));
    const least = $(".hero__intro").getBoundingClientRect().right + room - (box.left - reach("odd"));
    photo.style.translate = `${Math.round(Math.max(least, Math.min(want, most)))}px 0`;
  }

  /* ---------- About page ---------- */
  function renderAboutPage() {
    const text = $("#aboutText");
    if (!text) return;
    $("#aboutLead").textContent = data.tagline;
    text.innerHTML = data.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
    mountPhoto($("#aboutPhoto"));
    $("#facts").innerHTML = data.about.facts
      .map((f, i) => `<li class="fact glow reveal" style="${tone(i)}"><span class="mono">${esc(f.label)}</span><b>${esc(f.value)}</b></li>`)
      .join("");
    albums($("#albums"));
  }

  /* ---------- Blog ---------- */
  function initBlogFilter() {
    const bar = $("#tagFilter");
    if (!bar) return;
    if (!bar.querySelector("[data-tag]")) return bar.remove();
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tag]");
      if (!btn) return;
      const tag = btn.dataset.tag;
      $$("[data-tag]", bar).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      let shown = 0;
      $$(".post-card").forEach((card) => {
        const on = !tag || card.dataset.tags.split("|").includes(tag);
        card.hidden = !on;
        if (on) shown++;
      });
      $("#postNone").hidden = shown > 0;
    });
  }

  /* ---------- Nav: menu, hide on scroll, progress ---------- */
  function initNav() {
    const nav = $("#nav");
    const toggle = $("#navToggle");
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
    $("#navLinks").addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });

    const progress = $("#progress");
    let lastY = scrollY;
    addEventListener("scroll", () => {
      const y = scrollY;
      nav.classList.toggle("is-scrolled", y > 30);
      nav.classList.toggle("is-hidden", y > lastY && y > 400 && !nav.classList.contains("is-open"));
      lastY = y;
      progress.style.transform = `scaleX(${y / Math.max(1, document.documentElement.scrollHeight - innerHeight)})`;
    }, { passive: true });
  }

  function initClock() {
    const clocks = $$("[data-clock]");
    if (!clocks.length) return;
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit", timeZone: data.timezone });
    } catch {
      fmt = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" });
    }
    const tick = () => {
      const now = new Date();
      const text = fmt.format(now);
      clocks.forEach((el) => {
        if (el.dataset.clock !== "split") { el.textContent = text; return; }
        const parts = fmt.formatToParts(now);
        const period = parts.find((p) => p.type === "dayPeriod");
        const time = parts.filter((p) => p.type !== "dayPeriod").map((p) => p.value).join("").trim();
        el.innerHTML = period ? `${esc(time)}<small>${esc(period.value)}</small>` : esc(time);
      });
    };
    tick();
    setInterval(tick, 15000);
  }

  /* ---------- Copy buttons + toast ---------- */
  function toast(msg) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove("is-visible"), 1800);
  }

  async function copyText(text, done) {
    try {
      await navigator.clipboard.writeText(text);
      toast(done);
    } catch {
      toast(text);
    }
  }

  function initCopy() {
    $$("[data-copy-email]").forEach((b) => b.addEventListener("click", () => copyText(data.email, "✓ Email copied")));
    $$("[data-copy-link]").forEach((b) => b.addEventListener("click", () => copyText(location.href, "✓ Link copied")));
  }

  /* ---------- Contact form ---------- */
  function initForm() {
    const form = $("#contactForm");
    if (!form) return;
    const status = $("#formStatus");
    const submit = $("#formSubmit");
    const say = (msg, kind = "") => { status.textContent = msg; status.className = `form__status ${kind && `is-${kind}`}`; };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let firstBad = null;
      [$("#fName"), $("#fEmail"), $("#fMessage")].forEach((f) => {
        const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value.trim()));
        f.closest(".field").classList.toggle("is-invalid", bad);
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        say("Please add your name, a valid email and a short message.", "error");
        firstBad.focus();
        return;
      }
      if (form._gotcha.value) return; // spam bot

      const entry = Object.fromEntries(new FormData(form));
      delete entry._gotcha;

      if (!data.formAccessKey) {
        const body = `Name: ${entry.name}\nEmail: ${entry.email}\nLink: ${entry.link || "-"}\nAbout: ${entry.topic}\n\n${entry.message}`;
        location.href = `mailto:${data.email}?subject=${encodeURIComponent(`${entry.topic} — ${entry.name}`)}&body=${encodeURIComponent(body)}`;
        say(`Your email app should open with the message ready to send. If it doesn't, write to ${data.email}.`);
        return;
      }

      // Web3Forms emails the message to the inbox the access key was created with.
      const mail = {
        access_key: data.formAccessKey,
        subject: `New message from ${entry.name.trim()}: ${entry.topic}`,
        from_name: `${data.handle} website`,
        name: entry.name.trim(),
        email: entry.email.trim(),
      };
      if (entry.link.trim()) mail["Website or social"] = entry.link.trim();
      mail["Reaching out about"] = entry.topic;
      mail.message = entry.message.trim();

      submit.disabled = true;
      say("Sending…");
      const stop = new AbortController();
      const timer = setTimeout(() => stop.abort(), 15000);
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(mail),
          signal: stop.signal,
        });
        const reply = await res.json().catch(() => ({}));
        if (!res.ok || !reply.success) throw new Error(reply.message || `HTTP ${res.status}`);
        form.reset();
        say(`Sent! Thanks, ${mail.name.split(/\s+/)[0]}. I'll reply to ${mail.email} soon.`, "ok");
        toast("✓ Message sent");
      } catch {
        say(`Your message couldn't be sent. Please try again, or email ${data.email}.`, "error");
      } finally {
        clearTimeout(timer);
        submit.disabled = false;
      }
    });
  }

  /* ---------- Text effects ---------- */
  const GLYPHS = "!<>-_\\/[]{}=+*^?#01";
  function scramble(el) {
    if (reduceMotion || el.dataset.scrambled) return;
    el.dataset.scrambled = "1";
    const final = el.textContent;
    let frame = 0;
    const total = 26;
    const tick = () => {
      const progress = frame / total;
      el.textContent = [...final]
        .map((ch, i) => (ch === " " || i / final.length < progress ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join("");
      if (frame++ < total) requestAnimationFrame(tick);
      else el.textContent = final;
    };
    tick();
  }

  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add("is-in");
        if (el.matches("[data-scramble]")) scramble(el);
        io.unobserve(el);
      });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.setProperty("--rd", `${Math.min(siblings.indexOf(el), 5) * 80}ms`);
      io.observe(el);
    });
  }

  function initStatement() {
    const box = $("#statement");
    if (!box) return;
    const words = $$(".w", box);
    const update = () => {
      const r = box.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const lit = Math.round(k * words.length);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Hover effects: tilt, parallax, magnetic buttons ---------- */
  function initPointerFx() {
    if (!finePointer || reduceMotion) return;

    // The portrait leans towards the pointer.
    $$(".tilt").forEach((el) => {
      const max = Number(el.dataset.tilt || 6);
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.classList.add("is-tilting");
        el.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * max}deg`);
        el.style.setProperty("--rx", `${(0.5 - (e.clientY - r.top) / r.height) * max}deg`);
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("is-tilting");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });

    // The hero chat bubbles drift against the pointer.
    const hero = $("[data-hero]");
    hero?.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });

    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
    });
  }

  /* ---------- Custom cursor: a chat-bubble pin that swings as it moves and says what a click does ---------- */
  function initCursor() {
    const cursor = $("#cursor");
    if (!cursor) return;
    if (!finePointer || reduceMotion) return cursor.remove();
    document.documentElement.classList.add("has-cursor");
    const bubble = $(".cursor__bubble", cursor);
    const label = $(".cursor__label", cursor);
    let x = -100, y = -100, lastX = x, lastY = y, vx = 0, vy = 0, seen = false;
    let angle = 0, spin = 0, scale = 1, grow = 0, down = false, mode = "";
    // Label widths are measured on the mono font; measure again once it has loaded.
    document.fonts?.ready.then(() => (label.textContent = ""));

    const react = (t) => {
      if (!t || !t.closest) return;
      cursor.classList.toggle("is-hidden", !!t.closest("input, textarea, select"));
      cursor.classList.toggle("is-dark", !!t.closest("[data-dark]"));
      const labelled = t.closest("[data-cursor]");
      const text = labelled ? labelled.dataset.cursor || "View" : "";
      if (text && text !== label.textContent) {
        label.textContent = text;
        cursor.style.setProperty("--lw", `${label.offsetWidth + 30}px`);
      }
      mode = text ? "label" : t.closest("a, button, summary, label, [role='button']") ? "link" : "";
      cursor.classList.toggle("is-label", mode === "label");
      cursor.classList.toggle("is-link", mode === "link");
    };
    addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!seen) {
        seen = true;
        lastX = x;
        lastY = y;
      }
      cursor.classList.add("is-visible");
      react(e.target);
    }, { passive: true });
    addEventListener("scroll", () => { if (seen) react(document.elementFromPoint(x, y)); }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
    addEventListener("pointerdown", () => (down = true));
    addEventListener("pointerup", () => {
      down = false;
      cursor.classList.remove("is-click");
      void cursor.offsetWidth; // restart the burst
      cursor.classList.add("is-click");
    });

    (function loop() {
      // The tip sits exactly on the pointer; the bubble hangs from it and swings on a spring.
      vx += (x - lastX - vx) * 0.3;
      vy += (y - lastY - vy) * 0.3;
      lastX = x;
      lastY = y;
      const target = mode === "label" ? 0 : Math.max(-38, Math.min(38, (vx - vy) * 1.7));
      spin = (spin + (target - angle) * 0.14) * 0.78;
      angle += spin;
      const size = (mode === "link" ? 1.4 : 1) * (down ? 0.8 : 1);
      grow = (grow + (size - scale) * 0.22) * 0.68;
      scale += grow;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      bubble.style.transform = `rotate(${angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Hero: passions arrive as chat messages, typing dots first ---------- */
  function initChat() {
    const chat = $("#chat");
    if (!chat) return () => {};
    const msgs = $$(".chat__msg", chat);
    const words = $$(".hero__word");
    // Pointing at a passion, as a word in the statement or as a bubble, nudges its bubble,
    // lights up its word and jumps the portrait film to its scene.
    const mark = (i) => {
      msgs.forEach((m, j) => m.classList.toggle("is-hinted", j === i));
      words.forEach((w) => w.classList.toggle("is-on", Number(w.dataset.album) === i));
    };
    const clips = initFilm(mark);
    let touched = false;
    // Only a passion itself takes over from the tour; passing over the rest of the text doesn't.
    const pick = (e) => {
      const link = e.target.closest("[data-album]");
      if (link) { touched = true; clips.stop(); }
      if (link || !clips.touring) clips.show(link ? Number(link.dataset.album) : -1);
    };
    [$("#heroStatement"), chat].forEach((el) => {
      if (!el) return;
      el.addEventListener("pointerover", pick);
      el.addEventListener("pointerleave", () => { if (!clips.touring) clips.show(-1); });
      el.addEventListener("focusin", pick);
      el.addEventListener("focusout", (e) => { if (!clips.touring && !e.relatedTarget?.closest?.("[data-album]")) clips.show(-1); });
    });
    // A bubble or a passion word jumps to its record in the B-sides and puts it on.
    $("[data-hero]").addEventListener("click", (e) => {
      const link = e.target.closest("[data-album]");
      const sleeve = link && $$("#albums .album__sleeve")[Number(link.dataset.album)];
      if (sleeve && sleeve.matches("button") && sleeve.getAttribute("aria-pressed") !== "true") setTimeout(() => sleeve.click(), 700);
    });
    return () => {
      if (reduceMotion) return msgs.forEach((m) => m.classList.add("is-sent"));
      msgs.forEach((m, i) => {
        setTimeout(() => m.classList.add("is-typing"), 300 + i * 550);
        setTimeout(() => m.classList.add("is-sent"), 1000 + i * 550);
      });
      // Once the bubbles are in, the portrait plays the film, unless the visitor got there first.
      setTimeout(() => { if (!touched) clips.tour(); }, 2200 + msgs.length * 550);
    };
  }

  /* The hero film (`heroFilm` in content.js) plays inside the portrait. It starts and ends on the
     photo, so it slips in and out of it: once after the bubbles arrive, again when the portrait is
     clicked, and from a passion's scene while that passion is pointed at. Nothing loads until it's
     needed; reduced motion and data saver keep the photo. */
  function initFilm(mark) {
    const frame = $(".portrait__frame");
    const film = data.heroFilm;
    if (!frame || reduceMotion || !film || !film.src || !(film.scenes || []).length) {
      return { show: mark, tour() {}, stop() {}, touring: false };
    }
    const scenes = film.scenes.slice().sort((a, b) => a.at - b.at);
    const sceneAt = (t) => scenes.reduce((p, s) => (t >= s.at ? s.passion : p), -1);
    let v = null;
    let on = false;
    let touring = false;
    let visible = true;

    const video = () => {
      if (v) return v;
      v = document.createElement("video");
      v.className = "portrait__clip";
      v.muted = v.defaultMuted = true;
      v.playsInline = true;
      v.preload = "auto";
      v.setAttribute("muted", "");
      v.setAttribute("playsinline", "");
      v.setAttribute("aria-hidden", "true");
      v.addEventListener("playing", () => { if (on) v.classList.add("is-on"); });
      v.addEventListener("timeupdate", () => { if (on) mark(sceneAt(v.currentTime)); });
      v.addEventListener("ended", () => hide());
      v.src = asset(film.src);
      frame.appendChild(v);
      return v;
    };

    const play = (from) => {
      const el = video();
      on = true;
      const go = () => {
        // play() first: on a film that has ended it rewinds to the start, so seek after it.
        if (visible) el.play().catch(() => {});
        el.currentTime = from;
      };
      if (el.readyState >= 1) go();
      else el.addEventListener("loadedmetadata", go, { once: true });
      if (!el.paused) el.classList.add("is-on"); // still fading out: bring it straight back
    };

    const hide = () => {
      on = false;
      touring = false;
      mark(-1);
      if (!v) return;
      v.classList.remove("is-on");
      setTimeout(() => { if (!on) v.pause(); }, 400);
    };

    const show = (i) => {
      const scene = scenes.find((s) => s.passion === i);
      if (i < 0 || !scene) { if (on) hide(); return mark(i); } // no scene of its own: the photo stays
      mark(i);
      if (on && v && !v.paused && sceneAt(v.currentTime) === i) return; // already there
      play(scene.at);
    };

    const stop = () => { touring = false; };

    const tour = () => {
      if (!visible || navigator.connection?.saveData) return;
      touring = true;
      play(0);
    };

    // Clicking the portrait plays the whole film again.
    const portrait = frame.closest(".portrait");
    if (portrait) {
      portrait.dataset.cursor = "Play";
      portrait.addEventListener("click", () => { touring = true; play(0); });
    }

    // The film rests while the hero is off screen.
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!v || !on) return;
      if (visible) v.play().catch(() => {});
      else v.pause();
    }).observe(frame);

    return { show, tour, stop, get touring() { return touring; } };
  }

  /* ---------- Loader (home, first visit): greetings + a ring that fills ---------- */
  function preload(done) {
    const el = $("#loader");
    if (!el || reduceMotion || storage.get("loaded")) { el?.remove(); return done(); }
    storage.set("loaded", "1");
    document.body.classList.add("is-loading");
    const word = $("#loaderWord");
    const count = $("#loaderCount");
    const arc = $("#loaderArc");
    const greetings = data.greetings && data.greetings.length ? data.greetings : ["Hello"];
    const circumference = 339.3;
    const dur = 2100;
    const start = performance.now();
    let shown = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      removeEventListener("keydown", finish);
      removeEventListener("pointerdown", finish);
      el.classList.add("is-done");
      setTimeout(done, 350);
      setTimeout(() => { document.body.classList.remove("is-loading"); el.remove(); }, 1000);
    };
    addEventListener("keydown", finish);
    addEventListener("pointerdown", finish);

    word.textContent = greetings[0];
    (function step(t) {
      if (finished) return;
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      count.textContent = Math.round(eased * 100);
      arc.style.strokeDashoffset = circumference * (1 - eased);
      const next = Math.min(greetings.length - 1, Math.floor(k * greetings.length));
      if (next !== shown) {
        shown = next;
        word.classList.add("is-swap");
        setTimeout(() => { word.textContent = greetings[shown]; word.classList.remove("is-swap"); }, 160);
      }
      if (k < 1) requestAnimationFrame(step);
      else setTimeout(finish, 350);
    })(start);
  }

  renderCommon();
  renderHome();
  renderAboutPage();
  const layoutHero = () => { fitName(); placePhoto(); placeBadge(); };
  layoutHero();
  addEventListener("resize", layoutHero);
  if (document.fonts) document.fonts.ready.then(layoutHero);
  initClock();
  initBlogFilter();
  initNav();
  initCopy();
  initForm();
  initStatement();
  initPointerFx();
  initCursor();
  const startChat = initChat();
  preload(() => {
    document.body.classList.add("is-ready");
    initReveal();
    startChat();
  });
})();
