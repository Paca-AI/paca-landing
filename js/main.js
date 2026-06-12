/* ============================================================
   Paca Landing — interactions & GSAP orchestration
   ============================================================ */
(function () {
  "use strict";

  const hasGsap = typeof window.gsap !== "undefined";
  if (hasGsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);
    if (window.Flip) gsap.registerPlugin(Flip);
  }

  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));

  /* ============================================
     Always-on features (no motion required)
     ============================================ */

  // Nav background on scroll
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const burger = $("#nav-burger");
  const setMenu = (open) => {
    nav.classList.toggle("menu-open", open);
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("menu-open")));
  $$(".mobile-menu a").forEach((a) =>
    a.addEventListener("click", () => setMenu(false))
  );

  // Copy buttons
  $$(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add("copied");
        const label = $(".copy-label", btn);
        if (label) label.textContent = "Copied";
        setTimeout(() => {
          btn.classList.remove("copied");
          if (label) label.textContent = "Copy";
        }, 1600);
      } catch (e) {
        /* clipboard unavailable — ignore */
      }
    });
  });

  // GitHub star count (graceful fallback)
  fetch("https://api.github.com/repos/Paca-AI/paca")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data || typeof data.stargazers_count !== "number") return;
      const n = data.stargazers_count;
      const fmt = n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
      const pill = $("#star-count");
      pill.textContent = "★ " + fmt;
      pill.hidden = false;
    })
    .catch(() => {});

  if (!hasGsap) return; // static page still fully works

  /* ============================================
     Motion (respects prefers-reduced-motion)
     ============================================ */
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    /* ---------- Hero intro (waits for webfonts so SplitText
       measures the real glyphs) ---------- */
    const heroTitle = $("#hero-title");
    const heroBits = ['.kicker-chip', '[data-hero="sub"]', '[data-hero="cta"]', ".board"];
    gsap.set(heroBits, { autoAlpha: 0 });
    gsap.set(heroTitle, { autoAlpha: 0 });

    // Explicitly kick off the display-font loads — fonts.ready alone can
    // resolve before lazily-loaded webfonts are requested.
    const fontsLoaded = Promise.race([
      Promise.all([
        document.fonts.load('700 1rem "Syne"'),
        document.fonts.load('400 1rem "DM Sans"'),
        document.fonts.load('600 1rem "JetBrains Mono"'),
      ]).then(() => document.fonts.ready),
      new Promise((res) => setTimeout(res, 1800)),
    ]);

    fontsLoaded.then(() => {
      const introTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      introTl.to(".kicker-chip", { autoAlpha: 1, y: 0, duration: 0.7, startAt: { y: 18 } }, 0.1);

      if (window.SplitText && heroTitle) {
        const split = new SplitText(heroTitle, { type: "words", wordsClass: "ht-word" });
        gsap.set(heroTitle, { perspective: 600, autoAlpha: 1 });
        introTl.from(
          split.words,
          {
            autoAlpha: 0,
            yPercent: 65,
            rotateX: -28,
            transformOrigin: "50% 100%",
            duration: 0.85,
            stagger: 0.05,
          },
          0.25
        );
      } else {
        introTl.to(heroTitle, { autoAlpha: 1, y: 0, duration: 0.9, startAt: { y: 26 } }, 0.25);
      }

      introTl.to('[data-hero="sub"]', { autoAlpha: 1, y: 0, duration: 0.7, startAt: { y: 22 } }, 0.8);
      introTl.to('[data-hero="cta"]', { autoAlpha: 1, y: 0, duration: 0.6, startAt: { y: 18 } }, 0.95);
      introTl.to(
        ".board",
        {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          duration: 1.1,
          ease: "power3.out",
          startAt: { y: 56, rotateX: 7, transformOrigin: "50% 0%" },
          clearProps: "transform",
        },
        1.1
      );
    });

    /* ---------- Board simulation ---------- */
    let boardTl = null;
    if (window.initBoardDemo) boardTl = window.initBoardDemo();

    /* ---------- What's-new demos (chat + diff/revert) ---------- */
    let wnTls = null;
    if (window.initWhatsNewDemos) wnTls = window.initWhatsNewDemos();

    /* ---------- Generic scroll reveals ---------- */
    const revealEls = $$("[data-reveal]");
    revealEls.forEach((el) => gsap.set(el, { autoAlpha: 0, y: 26 }));
    ScrollTrigger.batch(revealEls, {
      start: "top 88%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.09,
          overwrite: true,
        }),
    });

    /* ---------- P·A·C·A cycle ---------- */
    const RING_LEN = 791.7; // 2πr, r = 126
    const ringProg = $("#ring-prog");
    const ringNodes = $$(".ring-node");
    const phaseEls = $$(".phase");
    const stepEl = $("#cycle-step");
    const phaseNameEl = $("#cycle-phase");
    let currentPhase = -1;

    function setPhase(i) {
      if (i === currentPhase || i < 0 || i > 3) return;
      currentPhase = i;

      if (ringProg) {
        gsap.to(ringProg, {
          strokeDashoffset: RING_LEN * (1 - (i + 1) / 4),
          duration: 0.8,
          ease: "power2.inOut",
        });
      }
      ringNodes.forEach((n, idx) => n.classList.toggle("active", idx <= i));
      phaseEls.forEach((p, idx) => p.classList.toggle("active", idx === i));

      if (stepEl && phaseNameEl) {
        stepEl.textContent = "0" + (i + 1) + " / 04";
        const name = phaseEls[i].dataset.name;
        gsap.fromTo(
          phaseNameEl,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }
        );
        phaseNameEl.textContent = name;
      }
    }

    phaseEls.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 62%",
        end: "bottom 38%",
        onEnter: () => setPhase(i),
        onEnterBack: () => setPhase(i),
      });
    });
    setPhase(0);

    /* ---------- Terminal typing ---------- */
    const CMD =
      "curl -fsSL https://github.com/Paca-AI/paca/releases/latest/download/install.sh | bash";
    const cmdEl = $("#term-cmd");
    const outLines = $$(".term-out-line");

    if (cmdEl) {
      cmdEl.textContent = "";
      gsap.set(outLines, { autoAlpha: 0, x: -8 });

      ScrollTrigger.create({
        trigger: ".term",
        start: "top 78%",
        once: true,
        onEnter: () => {
          const proxy = { i: 0 };
          gsap.to(proxy, {
            i: CMD.length,
            duration: CMD.length * 0.022,
            ease: "none",
            onUpdate: () => {
              cmdEl.textContent = CMD.slice(0, Math.round(proxy.i));
            },
            onComplete: () => {
              gsap.to(outLines, {
                autoAlpha: 1,
                x: 0,
                duration: 0.45,
                stagger: 0.38,
                ease: "power2.out",
                delay: 0.35,
              });
            },
          });
        },
      });
    }

    /* ---------- cleanup on context revert ---------- */
    return () => {
      if (boardTl) boardTl.kill();
      if (wnTls) wnTls.forEach((t) => t.kill());
    };
  });

  /* Reduced motion: show everything as-is; board stays static */
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set("[data-reveal]", { clearProps: "all" });
  });
})();
