(() => {
  const data = window.PORTFOLIO;
  const $ = (sel, root = document) => root.querySelector(sel);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const storage = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { sessionStorage.setItem(key, val); } catch { /* storage unavailable */ } },
  };

  /* ---------- Render content ---------- */
  function render() {
    document.querySelectorAll("[data-handle]").forEach((el) => (el.textContent = data.handle));
    $("#heroName").textContent = data.name;
    $("#heroRole").textContent = data.role;
    $("#heroTagline").textContent = data.tagline;
    $("#availability").hidden = !data.available;
    $("#year").textContent = new Date().getFullYear();

    if (data.resumeUrl) {
      const btn = $("#resumeBtn");
      btn.href = data.resumeUrl;
      btn.hidden = false;
    }

    $("#stats").innerHTML = data.stats
      .map((s) => `<li class="glass"><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`)
      .join("");

    $("#filters").innerHTML = data.filters
      .map((f, i) => `<button class="filter" role="tab" aria-selected="${i === 0}" data-filter="${esc(f)}">${esc(f)}</button>`)
      .join("");

    $("#projects").innerHTML = data.projects
      .map((p, i) => `
        <article class="card glass reveal" data-category="${esc(p.category)}" data-index="${i}">
          <button class="card__open" type="button" aria-label="Open case study: ${esc(p.title)}"></button>
          <div class="window__bar"><i></i><i></i><i></i><span class="mono">${esc(slug(p.title))}.case</span></div>
          <div class="card__media">
            ${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy">` : `<span class="card__placeholder">${String(i + 1).padStart(2, "0")}</span>`}
          </div>
          <div class="card__body">
            <div class="card__meta"><span>${esc(p.category)}</span><span>${esc(p.year)}</span></div>
            <h3 class="card__title">${esc(p.title)}</h3>
            <p class="card__summary">${esc(p.summary)}</p>
            <ul class="chips">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          </div>
        </article>`)
      .join("");

    const photo = $("#aboutPhoto");
    if (data.about.photo) photo.innerHTML = `<img src="${esc(data.about.photo)}" alt="${esc(data.name)}">`;
    $("#aboutText").innerHTML = data.about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
    $("#skills").innerHTML = data.about.skills.map((s) => `<li>${esc(s)}</li>`).join("");

    $("#timeline").innerHTML = data.experience
      .map((e) => `
        <li class="glass reveal">
          <span class="timeline__period">${esc(e.period)}</span>
          <h3>${esc(e.title)}</h3>
          <span class="timeline__org">${esc(e.org)}</span>
          <p>${esc(e.detail)}</p>
        </li>`)
      .join("");

    const quotes = $("#quotes");
    if (data.testimonials.length) {
      quotes.innerHTML = data.testimonials
        .map((t) => `
          <figure class="quote glass reveal">
            <blockquote>${esc(t.quote)}</blockquote>
            <figcaption><strong>${esc(t.author)}</strong> · ${esc(t.role)}</figcaption>
          </figure>`)
        .join("");
    } else {
      $("#testimonials").hidden = true;
    }

    $("#termWho").textContent = `${data.name} — ${data.role}${data.location ? " · " + data.location : ""}`;
    const email = $("#emailLink");
    email.href = `mailto:${data.email}`;
    email.textContent = data.email;
    $("#socials").innerHTML = data.socials
      .filter((s) => s.url)
      .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">./${esc(s.label.toLowerCase())}</a>`)
      .join("");
  }

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";

  /* ---------- Filters ---------- */
  function initFilters() {
    $("#filters").addEventListener("click", (e) => {
      const btn = e.target.closest(".filter");
      if (!btn) return;
      const f = btn.dataset.filter;
      document.querySelectorAll(".filter").forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      document.querySelectorAll(".card").forEach((card) => {
        card.classList.toggle("is-hidden", f !== "All" && card.dataset.category !== f);
      });
    });
  }

  /* ---------- Case study modal ---------- */
  function initModal() {
    const modal = $("#modal");
    $("#projects").addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      const p = data.projects[card.dataset.index];
      $("#modalFile").textContent = `${slug(p.title)}.case`;
      $("#modalBody").innerHTML = `
        <p class="label">${esc(p.category)} · ${esc(p.year)}</p>
        <h3 id="modalTitle">${esc(p.title)}</h3>
        <p>${esc(p.role)}</p>
        <div class="modal__media">${p.image ? `<img src="${esc(p.image)}" alt="">` : ""}</div>
        <h4>Problem</h4><p>${esc(p.caseStudy.problem)}</p>
        <h4>Process</h4><p>${esc(p.caseStudy.process)}</p>
        <h4>Outcome</h4><p>${esc(p.caseStudy.outcome)}</p>
        <ul class="chips" style="margin-top:22px">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        ${p.link ? `<a class="btn btn--primary" href="${esc(p.link)}" target="_blank" rel="noopener">View live project →</a>` : ""}`;
      modal.showModal();
    });
    $("#modalClose").addEventListener("click", () => modal.close());
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
  }

  /* ---------- Nav ---------- */
  function initNav() {
    const nav = $("#nav");
    const toggle = $("#navToggle");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $("#navLinks").addEventListener("click", (e) => {
      if (e.target.closest("a")) { nav.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    });
    addEventListener("scroll", () => nav.classList.toggle("is-scrolled", scrollY > 30), { passive: true });

    const links = [...document.querySelectorAll(".nav__links a")];
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${en.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["work", "about", "experience", "contact"].forEach((id) => spy.observe(document.getElementById(id)));
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

  /* ---------- Text scramble ---------- */
  const GLYPHS = "!<>-_\\/[]{}—=+*^?#01";
  function scramble(el) {
    if (reduceMotion || el.dataset.scrambled) return;
    el.dataset.scrambled = "1";
    const final = el.textContent;
    let frame = 0;
    const total = 24;
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

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        en.target.querySelectorAll("[data-scramble]").forEach(scramble);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 80}ms`;
      io.observe(el);
    });
  }

  /* ---------- Card tilt + magnetic buttons + cursor ---------- */
  function initPointerFx() {
    if (!finePointer || reduceMotion) return;

    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        card.style.transform = `rotateY(${(x - 0.5) * 8}deg) rotateX(${(0.5 - y) * 8}deg) translateZ(0)`;
      });
      card.addEventListener("pointerleave", () => (card.style.transform = ""));
    });

    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      btn.addEventListener("pointerleave", () => (btn.style.transform = ""));
    });

    const cursor = $("#cursor");
    const label = $(".cursor__label", cursor);
    let x = 0, y = 0, cx = 0, cy = 0;
    addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      cursor.classList.add("is-visible");
      const card = e.target.closest(".card");
      cursor.classList.toggle("is-view", !!card);
      label.textContent = card ? "view" : "";
      cursor.classList.toggle("is-hover", !card && !!e.target.closest("a, button"));
    });
    document.addEventListener("pointerleave", () => cursor.classList.remove("is-visible"));
    (function loop() {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    })();
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
      const count = Math.min(80, Math.round((innerWidth * innerHeight) / 18000));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35 * dpr, vy: (Math.random() - 0.5) * 0.35 * dpr,
      }));
    }
    addEventListener("resize", resize);
    addEventListener("pointermove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
    resize();

    const link = 130;
    (function draw() {
      if (!document.hidden) {
        ctx.clearRect(0, 0, w, h);
        const max = link * dpr;
        for (const p of points) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dm < max * 1.4) { p.x += (mouse.x - p.x) * 0.004; p.y += (mouse.y - p.y) * 0.004; }
        }
        for (let i = 0; i < points.length; i++) {
          const a = points[i];
          for (let j = i + 1; j < points.length; j++) {
            const b = points[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < max) {
              ctx.strokeStyle = `rgba(92, 242, 255, ${(1 - d / max) * 0.22})`;
              ctx.lineWidth = dpr;
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            }
          }
          ctx.fillStyle = "rgba(238, 240, 255, 0.55)";
          ctx.fillRect(a.x - dpr, a.y - dpr, 2 * dpr, 2 * dpr);
        }
      }
      requestAnimationFrame(draw);
    })();
  }

  /* ---------- Boot sequence ---------- */
  function boot(done) {
    if (reduceMotion || storage.get("booted")) return done();
    storage.set("booted", "1");
    document.body.classList.add("is-booting");
    const log = $("#bootLog");
    const lines = [
      "IGNI-OS v2.0 (c) " + new Date().getFullYear(),
      "> checking memory ........ ok",
      "> mounting /projects ..... ok",
      "> loading creativity ..... 100%",
      `> hello, I'm ${data.name}.`,
    ];
    let i = 0, finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      removeEventListener("keydown", finish);
      removeEventListener("pointerdown", finish);
      const el = $("#boot");
      el.classList.add("is-done");
      setTimeout(() => { document.body.classList.remove("is-booting"); el.remove(); }, 600);
      done();
    };
    addEventListener("keydown", finish);
    addEventListener("pointerdown", finish);
    (function next() {
      if (finished) return;
      if (i < lines.length) { log.textContent += lines[i++] + "\n"; setTimeout(next, 280); }
      else setTimeout(finish, 450);
    })();
  }

  render();
  initFilters();
  initModal();
  initNav();
  initCopy();
  initPointerFx();
  initNetwork();
  boot(() => {
    scramble($("#heroName"));
    initReveal();
  });
})();
