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

  function statTiles(el) {
    if (!el) return;
    el.innerHTML = data.stats
      .map(
        (s, i) => `
        <li class="tile glow" style="${tone(i)}">
          <strong data-count="${Number(s.value) || 0}" data-prefix="${esc(s.prefix || "")}" data-suffix="${esc(s.suffix || "")}">${esc(s.prefix || "")}0${esc(s.suffix || "")}</strong>
          <span>${esc(s.label)}</span>
        </li>`
      )
      .join("");
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
    $("#heroCompanies").innerHTML = data.experience.map((x) => `<li>${esc(x.company)}</li>`).join("");
    $("#nowRole").textContent = data.current.role;
    $("#nowAt").textContent = `at ${data.current.company} · since ${data.current.since}`;
    statTiles($("#heroStats"));
    $("#heroChips").innerHTML = data.heroChips
      .map((c, i) => `<li class="chip-float chip-float--${i}"><span class="chip-float__icon">${ICONS[c.icon] || ICONS.spark}</span>${esc(c.text)}</li>`)
      .join("");
    mountPhoto($(".portrait__frame"));

    const ring = $("[data-ring]");
    if (ring) {
      const text = ring.dataset.ring;
      ring.innerHTML = [...text]
        .map((c, i) => `<span style="transform: translateX(-50%) rotate(${(360 / text.length) * i}deg)">${c === " " ? "&nbsp;" : esc(c)}</span>`)
        .join("");
    }

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
      modal.showModal();
    });
    $("#modalClose").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  }

  /* ---------- Experience page ---------- */
  function renderExperiencePage() {
    const list = $("#xpTimeline");
    if (!list) return;
    statTiles($("#xpStats"));
    list.innerHTML = data.experience
      .map((x, i) => {
        const mark = x.company.replace(/[^A-Za-z]/g, "").slice(0, 2);
        return `
        <li class="xp__item glow reveal" id="xp-${slug(x.company)}" style="${tone(i)}">
          <div class="xp__side">
            <span class="xp__mark" aria-hidden="true">${esc(mark.charAt(0).toUpperCase() + mark.slice(1))}</span>
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
        preview.style.setProperty("--c", `var(--c${i % 6})`);
        preview.innerHTML = `<span class="preview__name">${esc(xp.company)}</span><span class="preview__meta mono">${esc(xp.period)}</span><span class="preview__cta mono">Click for details ↗</span>`;
        preview.classList.add("is-visible");
      });
      rows.addEventListener("pointerleave", () => preview.classList.remove("is-visible"));
    }

    (function loop() {
      sx += (x - sx) * 0.12;
      sy += (y - sy) * 0.12;
      px += (x - px) * 0.14;
      py += (y - py) * 0.14;
      if (spot) spot.style.transform = `translate(${sx}px, ${sy}px)`;
      if (preview) preview.style.transform = `translate(${px}px, ${py}px) rotate(${(x - px) * 0.05}deg)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Particle network ---------- */
  function initNetwork() {
    const canvas = $("#net");
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext("2d");
    const mouse = { x: -9999, y: -9999 };
    let w, h, dpr, points = [];

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = innerWidth * dpr;
      h = canvas.height = innerHeight * dpr;
      const count = Math.min(60, Math.round((innerWidth * innerHeight) / 24000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3 * dpr, vy: (Math.random() - 0.5) * 0.3 * dpr,
      }));
    }
    addEventListener("resize", resize);
    addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
    resize();

    (function draw() {
      if (!document.hidden) {
        ctx.clearRect(0, 0, w, h);
        const max = 130 * dpr;
        for (const p of points) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          if (Math.hypot(p.x - mouse.x, p.y - mouse.y) < max * 1.4) { p.x += (mouse.x - p.x) * 0.004; p.y += (mouse.y - p.y) * 0.004; }
        }
        ctx.lineWidth = dpr;
        for (let i = 0; i < points.length; i++) {
          const a = points[i];
          for (let j = i + 1; j < points.length; j++) {
            const b = points[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < max) {
              ctx.strokeStyle = `rgba(108, 71, 255, ${(1 - d / max) * 0.16})`;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
          ctx.fillStyle = "rgba(18, 15, 43, 0.22)";
          ctx.fillRect(a.x - dpr, a.y - dpr, 2 * dpr, 2 * dpr);
        }
      }
      requestAnimationFrame(draw);
    })();
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
  initNetwork();
  preload(() => {
    document.body.classList.add("is-ready");
    initReveal();
  });
})();
