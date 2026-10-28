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
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
  const pad = (n) => String(n).padStart(2, "0");
  const tone = (i) => `--c: var(--c${i % 6})`;
  const asset = (p) => (/^(https?:)?\/\//.test(p) ? p : root + String(p).replace(/^\//, ""));
  const social = (label) => (data.socials || []).find((s) => s.label.toLowerCase() === label.toLowerCase() && s.url);
  const chips = (list) => `<ul class="chips">${list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

  const storage = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { sessionStorage.setItem(key, val); } catch { /* storage unavailable */ } },
  };

  const ICONS = {
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>',
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.1 7.9L22 12l-7.9 2.1L12 22l-2.1-7.9L2 12l7.9-2.1z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 22s7-6.6 7-12.3A7 7 0 0 0 5 9.7C5 15.4 12 22 12 22zm0-9.3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>',
    music: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="2.5" y="14" width="5" height="7" rx="2"/><rect x="16.5" y="14" width="5" height="7" rx="2"/></svg>',
    film: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="10" width="18" height="11" rx="2"/><path d="M3 10l2.6-5.5h14.9L19 10"/><path d="M9.5 4.5L7.5 10M15.2 4.5l-2 5.5"/></svg>',
    design: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l5 8-5 10-5-10z"/><circle cx="12" cy="11.5" r="1.6"/><path d="M12 13.1V21"/></svg>',
    content: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="3"/><path d="M16 10.5l6-3.5v10l-6-3.5z"/></svg>',
    calisthenics: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2v8.5M17 2v8.5"/><circle cx="7" cy="15" r="4.5"/><circle cx="17" cy="15" r="4.5"/></svg>',
    gym: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></svg>',
    medal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 3.2l1.2 2.5 2.7.3-2 1.9.5 2.7L12 10.8l-2.4 1.3.5-2.7-2-1.9 2.7-.3zM8.2 15.3L6.8 22.5 12 20l5.2 2.5-1.4-7.2A8.4 8.4 0 0 1 12 16.5a8.4 8.4 0 0 1-3.8-1.2z"/></svg>',
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
    const resume = $("#resumeBtn");
    if (resume && data.resumeUrl) Object.assign(resume, { href: asset(data.resumeUrl), hidden: false });
  }

  function numbers(el) {
    if (!el) return;
    el.innerHTML = data.stats
      .map(
        (n, i) => `
        <li class="reveal" style="${tone(i)}">
          <strong data-count="${Number(n.value) || 0}" data-prefix="${esc(n.prefix || "")}" data-suffix="${esc(n.suffix || "")}">${esc(n.prefix || "")}0${esc(n.suffix || "")}</strong>
          <span>${esc(n.label)}</span>
        </li>`
      )
      .join("");
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
        <article class="album reveal" style="--c: var(--c${i % 6}); --c-pair: var(--c${(i + 2) % 6})">
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

  function logoMark(x, cls) {
    return x.logo
      ? `<span class="${cls} ${cls}--logo"><img src="${esc(asset(x.logo))}" alt="${esc(x.company)} logo"></span>`
      : `<span class="${cls}" aria-hidden="true">${esc(x.company.replace(/[^A-Za-z]/g, "").slice(0, 2).replace(/^./, (c) => c.toUpperCase()))}</span>`;
  }

  function awards(el) {
    if (!el) return;
    el.innerHTML = data.achievements
      .map(
        (a, i) => `
        <article class="award glow reveal" style="${tone(i)}">
          <span class="award__icon">${ICONS.star}</span>
          <h3 class="award__title">${esc(a.title)}</h3>
          <p class="award__org mono">${esc(a.org)}</p>
          <p class="award__text">${esc(a.text)}</p>
        </article>`
      )
      .join("");
  }

  /* ---------- Home ---------- */
  function renderHome() {
    const nameEl = $("#heroName");
    if (!nameEl) return;
    $("#heroGreet").textContent = data.greeting;
    $("#heroNameText").textContent = `${data.name}!`;
    nameEl.innerHTML = [...`${data.name}!`].map((c) => `<span class="ch"><span>${esc(c)}</span></span>`).join("");
    $("#heroBadge").textContent = data.heroBadge || data.role;
    $("#heroRole").textContent = data.role;
    $("#heroTagline").textContent = data.tagline;
    $("#heroNow").innerHTML = `Currently <b>${esc(data.current.role)}</b> at <b>${esc(data.current.company)}</b>`;
    $("#heroCompanies").innerHTML = data.experience.map((x) => `<li>${esc(x.company)}</li>`).join("");
    $("#orbit").innerHTML = (data.passions || [])
      .map((p, i) => `<li class="orbit__item" style="${tone(i)}"><span class="orbit__icon">${ICONS[p.art] || ICONS.music}</span><span class="orbit__label">${esc(p.title)}</span></li>`)
      .join("");
    mountPhoto($(".portrait__frame"));
    numbers($("#xpNumbers"));
    albums($("#albums"));

    const items = data.marquee.map((m) => `<span>${esc(m)} <i>✦</i></span>`).join("");
    $("#marquee").innerHTML = items + items;
    $("#statement").innerHTML = data.statement.split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");

    $("#xpRows").innerHTML = data.experience
      .map(
        (x, i) => `
        <li class="work reveal" style="${tone(i)}">
          <button class="work__row" type="button" data-xp="${i}">
            <span class="work__num">${pad(i + 1)}</span>
            <span class="work__title">${esc(x.company)}<span class="work__summary">${esc(x.role)}</span></span>
            <span class="work__cat">${esc(x.tags[0] || "")}</span>
            <span class="work__year">${esc(x.period)}</span>
            <span class="work__arrow" aria-hidden="true">→</span>
          </button>
        </li>`
      )
      .join("");
    awards($("#awards"));

    $("#servicesList").innerHTML = data.services
      .map(
        (s, i) => `
        <article class="service reveal" style="${tone(i)}">
          <span class="service__num mono">${pad(i + 1)}</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.detail)}</p>
          ${chips(s.tags)}
        </article>`
      )
      .join("");

    $("#processList").innerHTML = data.process
      .map((p, i) => `<li class="reveal" style="${tone(i)}"><h3>${esc(p.step)}</h3><p>${esc(p.detail)}</p></li>`)
      .join("");
  }

  /* Fit "Ignatius!" to the full width, then line up the gradient across the letters. */
  function fitName() {
    const el = $("#heroName");
    if (!el) return;
    el.style.fontSize = "100px";
    el.style.width = "max-content";
    const natural = el.getBoundingClientRect().width;
    el.style.width = "";
    const box = el.parentElement.getBoundingClientRect().width;
    el.style.fontSize = `${Math.floor((100 * box * 0.995) / natural)}px`;
    const { left, width } = el.getBoundingClientRect();
    $$(".ch", el).forEach((ch) => {
      const inner = ch.firstElementChild;
      inner.style.setProperty("--w", `${width}px`);
      inner.style.setProperty("--x", `${left - ch.getBoundingClientRect().left}px`);
    });
  }

  function initModal() {
    const modal = $("#modal");
    const rows = $("#xpRows");
    if (!modal || !rows) return;
    rows.addEventListener("click", (e) => {
      const row = e.target.closest("[data-xp]");
      if (!row) return;
      const x = data.experience[row.dataset.xp];
      $("#modalFile").textContent = `${slug(x.company)}.experience`;
      $("#modalBody").innerHTML = `
        <p class="label">${esc(x.period)}</p>
        <h3 id="modalTitle">${esc(x.company)}</h3>
        <p class="modal__role">${esc(x.role)}</p>
        <div class="modal__facts">
          <span>Period<b>${esc(x.period)}</b></span>
          <span>Location<b>${esc(x.location)}</b></span>
          ${x.award ? `<span>Highlight<b>${esc(x.award)}</b></span>` : ""}
        </div>
        <p class="modal__summary">${esc(x.summary)}</p>
        <h4>What I did</h4>
        <ul class="checklist">${x.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
        ${chips(x.tags)}
        <a class="btn btn--primary" href="${root}experience.html#xp-${slug(x.company)}">Open on the experience page <span aria-hidden="true">→</span></a>`;
      $("#preview")?.classList.remove("is-visible");
      document.documentElement.classList.add("cursor-off");
      modal.showModal();
    });
    modal.addEventListener("close", () => document.documentElement.classList.remove("cursor-off"));
    $("#modalClose").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  }

  /* ---------- Experience page ---------- */
  function renderExperiencePage() {
    const list = $("#xpTimeline");
    if (!list) return;
    numbers($("#xpNumbers"));
    list.innerHTML = data.experience
      .map((x, i) => {
        return `
        <li class="xp__item glow reveal" id="xp-${slug(x.company)}" style="${tone(i)}">
          <div class="xp__side">
            ${logoMark(x, "xp__mark")}
            <p class="xp__period mono">${esc(x.period)}</p>
            <p class="xp__company">${esc(x.company)}</p>
            <p class="xp__location">${esc(x.location)}</p>
          </div>
          <div class="xp__main">
            <h2 class="xp__role">${esc(x.role)}</h2>
            <p class="xp__summary">${esc(x.summary)}</p>
            <ul class="checklist">${x.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
            <div class="xp__foot">
              ${chips(x.tags)}
              ${x.award ? `<p class="xp__award"><span class="xp__award-icon">${ICONS.star}</span>${esc(x.award)}</p>` : ""}
            </div>
          </div>
        </li>`;
      })
      .join("");
    awards($("#awards"));
    if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
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
    $("#toolboxGrid").innerHTML = data.toolbox
      .map((g, i) => `<article class="tool-group glow reveal" style="${tone(i)}"><h3 class="tool-group__title mono">${esc(g.group)}</h3>${chips(g.items)}</article>`)
      .join("");
    albums($("#albums"));
    $("#competencyCloud").innerHTML = data.competencies.map((c, i) => `<li style="${tone(i)}">${esc(c)}</li>`).join("");
    $("#certs").innerHTML = data.certifications
      .map(
        (c, i) => `
        <li class="cert glow reveal" style="${tone(i)}">
          <span class="cert__icon">${ICONS.medal}</span>
          <p class="cert__name">${esc(c.name)}</p>
          <p class="cert__issuer mono">${esc(c.issuer)}</p>
        </li>`
      )
      .join("");
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
    const tick = () => clocks.forEach((el) => (el.textContent = fmt.format(new Date())));
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

      if (!data.formEndpoint) {
        const body = `Name: ${entry.name}\nEmail: ${entry.email}\nCompany: ${entry.company || "-"}\nAbout: ${entry.topic}\n\n${entry.message}`;
        location.href = `mailto:${data.email}?subject=${encodeURIComponent(`${entry.topic} — ${entry.name}`)}&body=${encodeURIComponent(body)}`;
        say(`Your email app should open with the message ready to send. If it doesn't, write to ${data.email}.`);
        return;
      }

      submit.disabled = true;
      say("Sending…");
      try {
        const res = await fetch(data.formEndpoint, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        say("Thanks! Your message is on its way. I'll reply within two working days.", "ok");
      } catch {
        say(`Your message couldn't be sent. Please try again, or email ${data.email}.`, "error");
      } finally {
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

  function countUp(el) {
    const target = Number(el.dataset.count);
    const { prefix = "", suffix = "" } = el.dataset;
    if (reduceMotion || !target) { el.textContent = prefix + target + suffix; return; }
    const start = performance.now();
    const dur = 1400;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add("is-in");
        if (el.matches("[data-scramble]")) scramble(el);
        $$("[data-count]", el).forEach(countUp);
        io.unobserve(el);
      });
    }, { threshold: 0.12 });
    $$(".reveal").forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 80}ms`;
      io.observe(el);
    });
    $$("[data-count]").filter((el) => !el.closest(".reveal")).forEach(countUp);
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

  /* ---------- Hover effects: spotlight, glowing borders, tilt, parallax, magnetic, preview ---------- */
  function initPointerFx() {
    if (!finePointer || reduceMotion) return;

    // A soft light that follows the pointer across the page.
    const spot = $("#spotlight");
    let x = innerWidth / 2, y = innerHeight / 3, sx = x, sy = y;
    addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      spot?.classList.add("is-on");
      // Borders and dark panels light up where the pointer is.
      for (let el = e.target.closest?.(".glow, [data-glow]"); el; el = el.parentElement?.closest(".glow, [data-glow]")) {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => spot?.classList.remove("is-on"));

    // Cards and the portrait lean towards the pointer.
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

    // Hero badges drift with the pointer at different depths.
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

    // Experience rows: a card follows the pointer.
    const preview = $("#preview");
    const rows = $("#xpRows");
    let px = x, py = y;
    if (preview && rows) {
      rows.addEventListener("pointerover", (e) => {
        const row = e.target.closest("[data-xp]");
        if (!row) return;
        const i = Number(row.dataset.xp);
        const xp = data.experience[i];
        if (preview.dataset.xp === String(i) && preview.classList.contains("is-visible")) return;
        preview.dataset.xp = String(i);
        preview.style.setProperty("--c", `var(--c${i % 6})`);
        preview.innerHTML = `
          <span class="preview__logo">${xp.logo ? `<img src="${esc(asset(xp.logo))}" alt="">` : `<span class="preview__word">${esc(xp.company)}</span>`}</span>
          <span class="preview__meta"><b>${esc(xp.company)}</b><span class="mono">${esc(xp.period)}</span></span>`;
        preview.classList.remove("is-visible");
        void preview.offsetWidth; // restart the pop-in for each company
        preview.classList.add("is-visible");
      });
      rows.addEventListener("pointerleave", () => { preview.classList.remove("is-visible"); delete preview.dataset.xp; });
    }

    (function loop() {
      sx += (x - sx) * 0.12;
      sy += (y - sy) * 0.12;
      px += (x - px) * 0.14;
      py += (y - py) * 0.14;
      if (spot) spot.style.transform = `translate(${sx}px, ${sy}px)`;
      if (preview) preview.style.transform = `translate(${px + 72}px, ${py - 110}px) rotate(${(x - px) * 0.05}deg)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Custom cursor: an inverting dot and ring, a colour trail, labels on hover ---------- */
  function initCursor() {
    const cursor = $("#cursor");
    if (!cursor) return;
    if (!finePointer || reduceMotion) return cursor.remove();
    document.documentElement.classList.add("has-cursor");
    const ring = $(".cursor__ring", cursor);
    const dot = $(".cursor__dot", cursor);
    const label = $(".cursor__label", cursor);
    const trailBox = $(".cursor__trail", cursor);
    const stops = [[108, 71, 255], [180, 60, 255], [255, 62, 138], [255, 176, 32]];
    const mix = (t) => {
      const k = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(k)), f = k - i;
      return `rgb(${stops[i].map((c, j) => Math.round(c + (stops[i + 1][j] - c) * f)).join(",")})`;
    };
    const N = 12;
    trailBox.innerHTML = Array.from({ length: N }, (_, i) => `<i style="background:${mix(i / (N - 1))}"></i>`).join("");
    const trail = [...trailBox.children].map((el) => ({ el, x: -100, y: -100 }));
    let x = -100, y = -100, rx = x, ry = y, lastX = x, lastY = y, speed = 0, seen = false;

    const react = (t) => {
      if (!t || !t.closest) return;
      cursor.classList.toggle("is-hidden", !!t.closest("input, textarea, select"));
      const labelled = t.closest("[data-cursor], .work__row");
      const text = labelled ? labelled.dataset.cursor || "View" : "";
      if (text) label.textContent = text;
      cursor.classList.toggle("is-label", !!text);
      cursor.classList.toggle("is-link", !text && !!t.closest("a, button, summary, label, [role='button']"));
    };
    addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!seen) {
        seen = true;
        rx = x; ry = y;
        trail.forEach((t) => { t.x = x; t.y = y; });
      }
      cursor.classList.add("is-visible");
      react(e.target);
    }, { passive: true });
    addEventListener("scroll", () => { if (seen) react(document.elementFromPoint(x, y)); }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
    addEventListener("pointerdown", () => cursor.classList.add("is-down"));
    addEventListener("pointerup", () => {
      cursor.classList.remove("is-down", "is-click");
      void cursor.offsetWidth;
      cursor.classList.add("is-click");
    });

    (function loop() {
      rx += (x - rx) * 0.22;
      ry += (y - ry) * 0.22;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      let px = x, py = y;
      trail.forEach((t, i) => {
        t.x += (px - t.x) * 0.42;
        t.y += (py - t.y) * 0.42;
        t.el.style.transform = `translate(${t.x}px, ${t.y}px) scale(${1 - i / N})`;
        px = t.x;
        py = t.y;
      });
      speed += (Math.hypot(x - lastX, y - lastY) - speed) * 0.2;
      lastX = x;
      lastY = y;
      cursor.style.setProperty("--trail", Math.min(1, speed / 10).toFixed(2));
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Hero: passions orbit the portrait in 3D, passing behind it ---------- */
  function initOrbit() {
    const orbit = $("#orbit");
    const visual = $("#heroVisual");
    const frame = $(".portrait__frame");
    if (!orbit || !visual || !frame) return;
    const items = $$(".orbit__item", orbit);
    if (!items.length) return;
    let angle = -Math.PI / 2;
    let paused = false;
    let geo = null;
    visual.addEventListener("pointerenter", () => (paused = true));
    visual.addEventListener("pointerleave", () => (paused = false));

    const measure = () => {
      const v = visual.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      const cx = f.left - v.left + f.width / 2;
      const room = () => Math.min(cx, v.width - cx) - Math.max(...items.map((it) => it.offsetWidth)) / 2 - 4;
      orbit.classList.remove("orbit--compact");
      if (room() < f.width * 0.5) orbit.classList.add("orbit--compact");
      geo = { cx, cy: f.top - v.top + f.height * 0.62, rx: Math.max(70, Math.min(f.width * 0.74, room())), ry: f.height * 0.16 };
    };
    const place = () => {
      items.forEach((it, i) => {
        const a = angle + (i / items.length) * Math.PI * 2;
        const depth = (Math.sin(a) + 1) / 2; // 0 = behind the photo, 1 = in front
        it.style.transform = `translate(${geo.cx + Math.cos(a) * geo.rx}px, ${geo.cy + Math.sin(a) * geo.ry}px) translate(-50%, -50%) scale(${(0.72 + depth * 0.32).toFixed(3)})`;
        it.style.zIndex = depth > 0.5 ? 4 : 1;
        it.style.opacity = (0.4 + depth * 0.6).toFixed(2);
      });
    };
    measure();
    place();
    addEventListener("resize", () => { measure(); place(); });
    if (document.fonts) document.fonts.ready.then(() => { measure(); place(); });
    if (reduceMotion) return;
    (function loop() {
      if (!paused) angle += 0.0032;
      place();
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Hero: "… and a music producer / an ad film maker / …" ---------- */
  function initRoller() {
    const roller = $("#roleRoller");
    if (!roller) return;
    const words = data.alsoRoles || [];
    const and = $(".hero__and");
    if (!words.length) return roller.closest(".hero__roles-also")?.remove();
    const article = (w) => (/^[aeiou]/i.test(w) ? "and an" : "and a");
    const fit = (el) => (roller.style.width = `${el.offsetWidth}px`);
    roller.innerHTML = `<span class="roller__word">${esc(words[0])}</span>`;
    and.textContent = article(words[0]);
    fit(roller.firstElementChild);
    if (document.fonts) document.fonts.ready.then(() => fit(roller.lastElementChild));
    addEventListener("resize", () => fit(roller.lastElementChild));
    if (reduceMotion || words.length < 2) return;
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % words.length;
      const old = roller.lastElementChild;
      const next = document.createElement("span");
      next.className = "roller__word is-in";
      next.textContent = words[i];
      roller.appendChild(next);
      fit(next);
      and.textContent = article(words[i]);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        next.classList.remove("is-in");
        old.classList.add("is-out");
      }));
      setTimeout(() => old.remove(), 700);
    }, 2600);
  }

  /* ---------- Loader (home, first visit): greetings + gradient ring ---------- */
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
  renderExperiencePage();
  renderAboutPage();
  fitName();
  addEventListener("resize", fitName);
  if (document.fonts) document.fonts.ready.then(fitName);
  initClock();
  initModal();
  initBlogFilter();
  initNav();
  initCopy();
  initForm();
  initStatement();
  initPointerFx();
  initCursor();
  initOrbit();
  initRoller();
  preload(() => {
    document.body.classList.add("is-ready");
    initReveal();
  });
})();
