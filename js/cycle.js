/* ============================================================
   Paca Landing — "How it works" P·A·C·A orbit
   Desktop: the section pins and scroll scrubs one revolution
   of the orbit — a comet plus three teammate chips (M, T, AI)
   travel the ring while each quarter activates a phase panel
   with its own micro-scene. Mobile: compact progress rail +
   in-view scenes, no pin. Without JS or with reduced motion
   the markup reads as a finished static shot — same pattern
   as whats-new.js.
   ============================================================ */

window.initCycle = function initCycle() {
  const gsap = window.gsap;
  if (!gsap || !window.ScrollTrigger) return;

  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));

  const section = $("#cycle");
  if (!section) return;

  const orbit = $("#cycle-orbit");
  const ringProg = $("#ring-prog");
  const comet = $("#ring-comet");
  const nodes = $$(".ring-node", section);
  const tags = $$(".node-tag", section);
  const orbiters = $$(".orbiter", section);
  const panels = $$(".cphase", section);
  const stepEl = $("#cycle-step");
  const phaseEl = $("#cycle-phase");
  const subEl = $("#cycle-sub");

  const CX = 230, CY = 230, R = 170;          // ring geometry (viewBox units)
  const CIRC = 2 * Math.PI * R;
  const TRAIL = [13, 26, 39];                  // orbiter lag behind the comet, degrees

  /* The markup is authored in its finished state; statics that scenes
     mutate via classList must be restored when a context reverts. */
  function restoreStatics() {
    $$("[data-author]", section).forEach((a) => a.classList.remove("writing"));
    $$(".check-row", section).forEach((r) => r.classList.add("ok"));
    const card = $("#scn-act-card");
    if (card) card.classList.add("scn-card-live");
  }

  /* ============================================
     Per-phase micro-scenes (paused timelines)
     ============================================ */
  function buildScenes() {
    const scenes = [];

    /* 01 · Plan — human + agent co-author the spec */
    {
      const root = $(".scn-plan", section);
      const lines = $$(".doc-line", root);
      const chips = $$(".scn-chip", root);
      const m = $('[data-author="m"]', root);
      const ai = $('[data-author="ai"]', root);

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      tl.set(lines, { clipPath: "inset(0% 100% 0% 0%)" }, 0)
        .set(chips, { autoAlpha: 0, y: 8 }, 0)
        .call(() => { m.classList.remove("writing"); ai.classList.remove("writing"); }, null, 0.01)
        .call(() => m.classList.add("writing"), null, 0.15);
      lines.forEach((ln, i) => {
        tl.to(ln, { clipPath: "inset(0% -2% 0% 0%)", duration: 0.55, ease: "steps(16)" }, 0.2 + i * 0.65);
      });
      tl.call(() => { m.classList.remove("writing"); ai.classList.add("writing"); }, null, 1.5)
        .to(chips, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.2 }, 3.0)
        .call(() => ai.classList.remove("writing"), null, 3.7);
      scenes.push(tl);
    }

    /* 02 · Act — the agent pulls a task across the board */
    {
      const root = $(".scn-act", section);
      const card = $("#scn-act-card");
      const fill = $("#scn-act-fill");
      const ava = $("#scn-act-ava");
      const todoSlot = $('[data-slot="todo"]', root);

      // Where the featured card "comes from": below the existing To Do card.
      // Function-based so invalidate() re-measures after layout changes.
      const fromX = () => {
        const ref = todoSlot.firstElementChild.getBoundingClientRect();
        const cur = Number(gsap.getProperty(card, "x")) || 0;
        return ref.left - (card.getBoundingClientRect().left - cur);
      };
      const fromY = () => {
        const ref = todoSlot.firstElementChild.getBoundingClientRect();
        const cur = Number(gsap.getProperty(card, "y")) || 0;
        return ref.bottom + 7 - (card.getBoundingClientRect().top - cur);
      };

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      tl.set(card, { x: fromX, y: fromY }, 0)
        .set(fill, { scaleX: 0 }, 0)
        .set(ava, { autoAlpha: 0, scale: 0.4 }, 0)
        .call(() => card.classList.remove("scn-card-live"), null, 0.01)
        .to(ava, { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2.5)" }, 0.45)
        .to(card, { x: 0, y: 0, duration: 0.7, ease: "power3.inOut" }, 0.95)
        .call(() => card.classList.add("scn-card-live"), null, 1.6)
        .to(fill, { scaleX: 0.999, duration: 1.1, ease: "power2.out" }, 1.8);
      scenes.push(tl);
    }

    /* 03 · Check — agent verification, human approval */
    {
      const root = $(".scn-check", section);
      const rows = $$(".check-row", root);
      const stamp = $("#scn-stamp");

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      tl.set(rows, { autoAlpha: 0.25, x: -6 }, 0)
        .set(stamp, { autoAlpha: 0, scale: 1.6, rotation: -12 }, 0)
        .call(() => rows.forEach((r) => r.classList.remove("ok")), null, 0.01);
      rows.forEach((row, i) => {
        const t = 0.3 + i * 0.55;
        tl.to(row, { autoAlpha: 1, x: 0, duration: 0.35 }, t)
          .call(() => row.classList.add("ok"), null, t + 0.22);
      });
      tl.to(stamp, { autoAlpha: 1, scale: 1, rotation: -4, duration: 0.5, ease: "back.out(2.2)" }, 2.7);
      scenes.push(tl);
    }

    /* 04 · Adapt — velocity morphs, the loop closes */
    {
      const root = $(".scn-adapt", section);
      const bars = $$(".abar", root);
      const path = $("#scn-loop-path");
      const head = $("#scn-loop-head");
      const chip = $(".scn-chip", root);
      const foot = $(".scn-foot", root);
      const len = path.getTotalLength();
      const FROM = [0.55, 0.78, 1.3, 0.62, 0.14]; // sprint-12 shape, relative to final

      const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.out" } });
      tl.set(bars, { scaleY: (i) => FROM[i] }, 0)
        .set(path, { strokeDasharray: len, strokeDashoffset: len }, 0)
        .set(head, { autoAlpha: 0 }, 0)
        .set([chip, foot], { autoAlpha: 0, y: 8 }, 0)
        .to(bars, { scaleY: 1, duration: 0.75, ease: "power3.inOut", stagger: 0.08 }, 0.25)
        .to(path, { strokeDashoffset: 0, duration: 0.75, ease: "power2.inOut" }, 1.05)
        .to(head, { autoAlpha: 1, duration: 0.2 }, 1.7)
        .to(chip, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.8)
        .to(foot, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.95);
      scenes.push(tl);
    }

    // Render each first frame so pre-activation panels show the scene's
    // start (not the authored final state). Calls are suppressed.
    scenes.forEach((s) => s.seek(0.001, true).pause());
    return scenes;
  }

  const mm = gsap.matchMedia();

  /* ============================================
     Desktop — pinned, scroll-scrubbed orbit
     ============================================ */
  mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
    section.classList.add("is-live");

    const scenes = buildScenes();
    const names = panels.map((p) => p.dataset.name);
    const verbs = panels.map((p) => p.dataset.verb);

    gsap.set(ringProg, { strokeDasharray: CIRC, strokeDashoffset: CIRC });
    gsap.set(panels, { autoAlpha: 0, y: 26 });
    nodes.forEach((n) => n.classList.remove("on"));
    tags.forEach((t) => t.classList.remove("on"));

    let wrapR = orbit.clientWidth * (R / 460);
    const sync = () => { wrapR = orbit.clientWidth * (R / 460); };
    ScrollTrigger.addEventListener("refreshInit", sync);

    const place = (p) => {
      const deg = -90 + 360 * p;
      const rad = (deg * Math.PI) / 180;
      gsap.set(comet, { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) });
      gsap.set(ringProg, { strokeDashoffset: CIRC * (1 - p) });
      orbiters.forEach((el, i) => {
        const d = ((deg - TRAIL[i]) * Math.PI) / 180;
        gsap.set(el, {
          xPercent: -50,
          yPercent: -50,
          x: wrapR * Math.cos(d),
          y: wrapR * Math.sin(d),
        });
      });
    };

    let active = -1;
    const setPhase = (i) => {
      if (i === active) return;
      const prev = active;
      active = i;

      nodes.forEach((n, idx) => {
        const on = idx <= i;
        const was = n.classList.contains("on");
        n.classList.toggle("on", on);
        if (tags[idx]) tags[idx].classList.toggle("on", on);
        if (on && !was && prev !== -1) {
          gsap.fromTo($("circle", n), { scale: 1 },
            { scale: 1.3, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "center center" });
        }
      });

      stepEl.textContent = "0" + (i + 1) + " / 04";
      phaseEl.textContent = names[i];
      subEl.textContent = verbs[i];
      gsap.fromTo([phaseEl, subEl], { y: 12, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out", stagger: 0.06, overwrite: "auto" });

      panels.forEach((pn, idx) => {
        if (idx === i) {
          gsap.fromTo(pn, { autoAlpha: 0, y: prev > i ? -28 : 28 },
            { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.06, overwrite: "auto" });
          scenes[idx].invalidate().restart();
        } else {
          gsap.to(pn, { autoAlpha: 0, y: idx < i ? -28 : 28, duration: 0.28, ease: "power2.in", overwrite: "auto" });
          scenes[idx].pause();
        }
      });
    };

    const state = { p: 0 };
    gsap.to(state, {
      p: 1,
      ease: "none",
      onUpdate: () => {
        place(state.p);
        setPhase(Math.min(3, Math.floor(state.p * 4)));
      },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=320%",
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => place(state.p),
        onToggle: (self) => {
          if (self.isActive) scenes[active] && scenes[active].invalidate().restart();
          else scenes.forEach((s) => s.pause());
        },
      },
    });

    place(0);
    setPhase(0);

    return () => {
      section.classList.remove("is-live");
      ScrollTrigger.removeEventListener("refreshInit", sync);
      nodes.forEach((n) => n.classList.add("on"));
      tags.forEach((t) => t.classList.add("on"));
      restoreStatics();
    };
  });

  /* ============================================
     Mobile — progress rail + in-view scenes
     ============================================ */
  mm.add("(max-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
    section.classList.add("is-rail");

    const scenes = buildScenes();
    const railFill = $("#rail-fill");
    const railNodes = $$(".rail-node", section);
    const panelsBox = $("#cycle-panels");

    railNodes.forEach((n) => n.classList.remove("on"));
    gsap.set(railFill, { scaleX: 0 });

    gsap.to(railFill, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: panelsBox,
        start: "top 72%",
        end: "bottom 78%",
        scrub: 0.4,
        onUpdate: (self) => {
          railNodes.forEach((n, idx) => n.classList.toggle("on", idx <= self.progress * 3 + 0.001));
        },
      },
    });

    panels.forEach((pn, idx) => {
      gsap.set(pn, { autoAlpha: 0, y: 26 });
      ScrollTrigger.create({
        trigger: pn,
        start: "top 85%",
        once: true,
        onEnter: () => gsap.to(pn, { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out" }),
      });
      ScrollTrigger.create({
        trigger: pn,
        start: "top 78%",
        end: "bottom 12%",
        onEnter: () => scenes[idx].invalidate().restart(),
        onEnterBack: () => scenes[idx].play(),
        onLeave: () => scenes[idx].pause(),
        onLeaveBack: () => scenes[idx].pause(),
      });
    });

    return () => {
      section.classList.remove("is-rail");
      railNodes.forEach((n) => n.classList.add("on"));
      restoreStatics();
    };
  });

  /* Reduced motion: no context runs — the authored markup already
     reads as the finished state. */
};
