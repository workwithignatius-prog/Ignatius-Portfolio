(() => {
  const data = window.PORTFOLIO;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  const pad = (n) => String(n).padStart(2, "0");
  const tone = (i) => `--c: var(--c${i % 6}); --c-soft: var(--c${i % 6}-soft)`;

  const storage = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { sessionStorage.setItem(key, val); } catch { /* storage unavailable */ } },
  };

  /* ---------- Render content ---------- */
  function render() {
    $$("[data-handle]").forEach((el) => (el.textContent = data.handle));
    $("#heroName").innerHTML = [...data.name].map((c) => `<span class="ch"><span>${esc(c)}</span></span>`).join("");
    $("#heroName").setAttribute("aria-label", data.name);
    $("#heroRole").textContent = data.role;
    $("#heroTagline").textContent = data.tagline;
    $("#heroLocation").textContent = data.location;
    $("#availability").hidden = !data.available;
    $("#year").textContent = new Date().getFullYear();
    if (data.resumeUrl) Object.assign($("#resumeBtn"), { href: data.resumeUrl, hidden: false });

    const ring = "scroll · explore · scroll · explore · ";
    $(".hero__scroll-ring").innerHTML = [...ring]
      .map((c, i) => `<span style="transform: translateX(-50%) rotate(${(360 / ring.length) * i}deg)">${c === " " ? "&nbsp;" : esc(c)}</span>`)
      .join("");

    const items = data.marquee.map((m) => `<span>${esc(m)} <i>✦</i></span>`).join("");
    $("#marquee").innerHTML = items + items;

    $("#statement").innerHTML = data.statement.split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");

    $("#filters").innerHTML = data.filters
      .map((f, i) => `<button class="filter" role="tab" aria-selected="${i === 0}" data-filter="${esc(f)}">${esc(f)}</button>`)
      .join("");

    $("#worklist").innerHTML = data.projects
      .map((p, i) => `
        <li class="work reveal" data-category="${esc(p.category)}" style="${tone(i)}">
          <button class="work__row" type="button" data-index="${i}">
            <span class="work__thumb">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : pad(i + 1)}</span>
            <span class="work__num">${pad(i + 1)}</span>
            <span class="work__title">${esc(p.title)}<span class="work__summary">${esc(p.summary)}</span></span>
            <span class="work__cat">${esc(p.category)}</span>
            <span class="work__year">${esc(p.year)}</span>
            <span class="work__arrow" aria-hidden="true">→</span>
          </button>
        </li>`)
      .join("");

    $("#stats").innerHTML = data.stats
      .map((s, i) => `<li class="reveal" style="${tone(i)}"><strong data-count="${Number(s.value) || 0}" data-suffix="${esc(s.suffix || "")}">0${esc(s.suffix || "")}</strong><span>${esc(s.label)}</span></li>`)
      .join("");

    $("#servicesList").innerHTML = data.services
      .map((s, i) => `
        <article class="service reveal" style="${tone(i + 1)}">
          <span class="service__num">[${pad(i + 1)}]</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.detail)}</p>
          <ul class="chips">${s.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        </article>`)
      .join("");

    $("#process").innerHTML = data.process
      .map((p, i) => `<li class="reveal" style="${tone(i)}"><h3>${esc(p.step)}</h3><p>${esc(p.detail)}</p></li>`)
      .join("");

    if (data.about.photo) $("#aboutPhoto").innerHTML = `<img src="${esc(data.about.photo)}" alt="${esc(data.name)}">`;
    $("#aboutText").innerHTML = data.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
    $("#skills").innerHTML = data.about.skills.map((s) => `<li>${esc(s)}</li>`).join("");
    $("#timeline").innerHTML = data.experience
      .map((e) => `
        <li>
          <span class="timeline__period">${esc(e.period)}</span>
          <div><h3>${esc(e.title)}</h3><span class="timeline__org">${esc(e.org)}</span><p>${esc(e.detail)}</p></div>
        </li>`)
      .join("");

    if (data.testimonials.length) {
      const q = data.testimonials
        .map((t, i) => `
          <figure class="quote" style="${tone(i + 2)}">
            <blockquote>${esc(t.quote)}</blockquote>
            <figcaption><strong>${esc(t.author)}</strong> · ${esc(t.role)}</figcaption>
          </figure>`)
        .join("");
      $("#quotes").innerHTML = q + q;
    } else {
      $("#testimonials").hidden = true;
    }

    if (data.faq.length) {
      $("#faqList").innerHTML = data.faq
        .map((f) => `<details class="reveal"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`)
        .join("");
    } else {
      $("#faq").hidden = true;
    }

    const mail = `mailto:${data.email}`;
    $("#ctaLink").href = mail;
    Object.assign($("#emailLink"), { href: mail, textContent: data.email });
    $("#socials").innerHTML = data.socials
      .filter((s) => s.url)
      .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">./${esc(s.label.toLowerCase())}</a>`)
      .join("");
  }

  /* ---------- Hero name fits the full width ---------- */
  function fitName() {
    const el = $("#heroName");
    el.style.fontSize = "100px";
    el.style.width = "max-content";
    const natural = el.getBoundingClientRect().width;
    el.style.width = "";
    const box = getComputedStyle(el.parentElement);
    const width = el.parentElement.clientWidth - parseFloat(box.paddingLeft) - parseFloat(box.paddingRight);
    el.style.fontSize = `${Math.floor((100 * width * 0.995) / natural)}px`;
  }

  /* ---------- Live clock ---------- */
  function initClock() {
    const el = $("#clock");
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit", timeZone: data.timezone });
    } catch {
      fmt = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" });
    }
    const tick = () => (el.textContent = fmt.format(new Date()));
    tick();
    setInterval(tick, 15000);
  }

  /* ---------- Filters ---------- */
  function initFilters() {
    $("#filters").addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      const f = btn.dataset.filter;
      $$(".filter").forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      $$(".work").forEach((w) => w.classList.toggle("is-hidden", f !== "All" && w.dataset.category !== f));
    });
  }

  /* ---------- Case study modal ---------- */
  function initModal() {
    const modal = $("#modal");
    $("#worklist").addEventListener("click", (e) => {
      const row = e.target.closest(".work__row");
      if (!row) return;
      const p = data.projects[row.dataset.index];
      $("#modalFile").textContent = `${slug(p.title)}.case`;
      $("#modalBody").innerHTML = `
        <p class="label">${esc(p.category)} · ${esc(p.year)}</p>
        <h3 id="modalTitle">${esc(p.title)}</h3>
        <div class="modal__facts">
          <span>Client<b>${esc(p.client || "—")}</b></span>
          <span>Role<b>${esc(p.role)}</b></span>
          <span>Year<b>${esc(p.year)}</b></span>
        </div>
        <div class="modal__media">${p.image ? `<img src="${esc(p.image)}" alt="">` : ""}</div>
        <h4>Problem</h4><p>${esc(p.caseStudy.problem)}</p>
        <h4>Process</h4><p>${esc(p.caseStudy.process)}</p>
        <h4>Outcome</h4><p>${esc(p.caseStudy.outcome)}</p>
        <ul class="chips" style="margin-top:22px">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        ${p.link ? `<a class="btn btn--primary" href="${esc(p.link)}" target="_blank" rel="noopener">View live project ↗</a>` : ""}`;
      $("#preview").classList.remove("is-visible");
      modal.showModal();
    });
    $("#modalClose").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  }

  /* ---------- Nav: menu, hide on scroll down, active section ---------- */
  function initNav() {
    const nav = $("#nav");
    const toggle = $("#navToggle");
    const setOpen = (open) => { nav.classList.toggle("is-open", open); toggle.setAttribute("aria-expanded", String(open)); };
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

    const links = $$(".nav__links a");
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${en.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["work", "services", "about", "contact"].forEach((id) => spy.observe(document.getElementById(id)));
  }

  /* ---------- Copy email ---------- */
  function initCopy() {
    const toast = $("#toast");
    $("#copyEmail").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(data.email);
        toast.textContent = "✓ email copied";
      } catch {
        toast.textContent = data.email;
      }
      toast.classList.add("is-visible");
      clearTimeout(toast._t);
      toast._t = setTimeout(() => toast.classList.remove("is-visible"), 1800);
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
    const suffix = el.dataset.suffix;
    if (reduceMotion || !target) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const dur = 1400;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Reveal on scroll ---------- */
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
    }, { threshold: 0.15 });
    $$(".reveal").forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 90}ms`;
      io.observe(el);
    });
  }

  /* ---------- Statement lights up word by word as you scroll ---------- */
  function initStatement() {
    const words = $$("#statement .w");
    const box = $("#statement");
    const update = () => {
      const r = box.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const lit = Math.round(k * words.length);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Pointer effects: cursor, project preview, magnetic, glow ---------- */
  function initPointerFx() {
    if (!finePointer || reduceMotion) return;

    const cursor = $("#cursor");
    const label = $(".cursor__label", cursor);
    const preview = $("#preview");
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, px = x, py = y;

    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      cursor.classList.add("is-visible");
      const row = e.target.closest(".work__row");
      cursor.classList.toggle("is-view", !!row);
      label.textContent = row ? "view" : "";
      cursor.classList.toggle("is-hover", !row && !!e.target.closest("a, button, summary"));
    });
    document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));

    $("#worklist").addEventListener("pointerover", (e) => {
      const row = e.target.closest(".work__row");
      if (!row) return;
      const i = Number(row.dataset.index);
      const p = data.projects[i];
      preview.style.setProperty("--c", `var(--c${i % 6})`);
      preview.innerHTML = p.image ? `<img src="${esc(p.image)}" alt="">` : pad(i + 1);
      preview.classList.add("is-visible");
    });
    $("#worklist").addEventListener("pointerleave", () => preview.classList.remove("is-visible"));

    (function loop() {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      px += (x - px) * 0.1; py += (y - py) * 0.1;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      preview.style.transform = `translate(${px}px, ${py}px) rotate(${(x - px) * 0.04}deg)`;
      requestAnimationFrame(loop);
    })();

    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
    });

    $$(".service").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Particle network ---------- */
  function initNetwork() {
    if (reduceMotion) return;
    const canvas = $("#net");
    const ctx = canvas.getContext("2d");
    const mouse = { x: -9999, y: -9999 };
    let w, h, dpr, points = [];

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = innerWidth * dpr;
      h = canvas.height = innerHeight * dpr;
      const count = Math.min(70, Math.round((innerWidth * innerHeight) / 20000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3 * dpr, vy: (Math.random() - 0.5) * 0.3 * dpr,
      }));
    }
    addEventListener("resize", resize);
    addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
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
              ctx.strokeStyle = `rgba(51, 85, 255, ${(1 - d / max) * 0.16})`;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
          ctx.fillStyle = "rgba(21, 19, 31, 0.25)";
          ctx.fillRect(a.x - dpr, a.y - dpr, 2 * dpr, 2 * dpr);
        }
      }
      requestAnimationFrame(draw);
    })();
  }

  /* ---------- Preloader ---------- */
  function preload(done) {
    if (reduceMotion || storage.get("loaded")) return done();
    storage.set("loaded", "1");
    document.body.classList.add("is-loading");
    const count = $("#loaderCount");
    const bar = $("#loaderBar");
    const start = performance.now();
    const dur = 1500;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      removeEventListener("keydown", finish);
      removeEventListener("pointerdown", finish);
      const el = $("#loader");
      el.classList.add("is-done");
      setTimeout(() => { document.body.classList.remove("is-loading"); el.remove(); }, 800);
      setTimeout(done, 350);
    };
    addEventListener("keydown", finish);
    addEventListener("pointerdown", finish);
    (function step(t) {
      if (finished) return;
      const k = Math.min(1, (t - start) / dur);
      const n = Math.round(100 * (1 - Math.pow(1 - k, 2)));
      count.textContent = String(n).padStart(3, "0");
      bar.style.width = `${n}%`;
      if (k < 1) requestAnimationFrame(step);
      else setTimeout(finish, 200);
    })(start);
  }

  render();
  fitName();
  addEventListener("resize", fitName);
  if (document.fonts) document.fonts.ready.then(fitName);
  initClock();
  initFilters();
  initModal();
  initNav();
  initCopy();
  initStatement();
  initPointerFx();
  initNetwork();
  preload(() => {
    document.body.classList.add("is-ready");
    initReveal();
  });
})();
