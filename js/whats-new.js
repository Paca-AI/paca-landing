/* ============================================================
   Paca Landing — "What's new in v0.4" demos
   Two looping GSAP timelines: the project-level AI chat and
   the activity diff + one-click revert. Initialized from
   main.js only when motion is allowed; without JS or with
   reduced motion the markup reads as a finished static shot.
   ============================================================ */

window.initWhatsNewDemos = function initWhatsNewDemos() {
  const gsap = window.gsap;
  if (!gsap) return null;

  const $ = (s, root) => (root || document).querySelector(s);
  const timelines = [];

  function playWhileVisible(el, tl) {
    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: el,
        start: "top 92%",
        end: "bottom -10%",
        onEnter: () => tl.play(),
        onEnterBack: () => tl.play(),
        onLeave: () => tl.pause(),
        onLeaveBack: () => tl.pause(),
      });
    } else {
      tl.play();
    }
  }

  /* ---------- in-app AI chat ---------- */
  const chat = $("#chat-demo");
  if (chat) {
    const q = $('[data-chat="q"]', chat);
    const typing = $('[data-chat="typing"]', chat);
    const answer = $('[data-chat="a"]', chat);
    const chips = Array.from(chat.querySelectorAll(".made-chip"));

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.9,
      paused: true,
      defaults: { ease: "power2.out" },
    });

    // 1 — Mai asks, 2 — agent thinks, 3 — reply + created items
    tl.set([q, answer], { autoAlpha: 0, y: 10 }, 0)
      .set(chips, { autoAlpha: 0, y: 8 }, 0)
      .set(typing, { display: "none", autoAlpha: 0 }, 0)
      .to(q, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.4)
      .set(typing, { display: "flex" }, 1.4)
      .to(typing, { autoAlpha: 1, duration: 0.3 }, 1.45)
      .to(typing, { autoAlpha: 0, duration: 0.25 }, 3.1)
      .set(typing, { display: "none" }, 3.35)
      .to(answer, { autoAlpha: 1, y: 0, duration: 0.5 }, 3.4)
      .to(chips, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.22 }, 3.9)
      .to([q, answer], { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, 8.6)
      .set({}, {}, 9.1); // pad the loop end

    timelines.push(tl);
    playWhileVisible(chat, tl);
  }

  /* ---------- diff & revert ---------- */
  const demo = $("#revert-demo");
  if (demo) {
    const entry = $("#act-main");
    const btn = $("#revert-btn");
    const label = $("#revert-label");
    const delLine = $("#diff-del");
    const addLine = $("#diff-add");
    const sign = $("#d-sign");
    const toast = $("#revert-toast");

    function resetRevert() {
      btn.classList.remove("is-hot");
      label.textContent = "Revert";
      delLine.classList.remove("diff-res");
      sign.textContent = "−";
      gsap.set(addLine, { clearProps: "all" });
      gsap.set(toast, { autoAlpha: 0, y: 6 });
    }
    resetRevert();

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1.2,
      paused: true,
      defaults: { ease: "power2.out" },
    });

    // 1 — the button "clicks", 2 — diff collapses to the old value,
    // 3 — reverted state + toast, 4 — fade and reset for the loop
    tl.call(() => btn.classList.add("is-hot"), null, 1.2)
      .to(btn, { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1 }, 1.2)
      .to(
        addLine,
        {
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power2.inOut",
        },
        1.7
      )
      .call(() => {
        delLine.classList.add("diff-res");
        sign.textContent = "✓";
        label.textContent = "Reverted";
      }, null, 2.15)
      .to(toast, { autoAlpha: 1, y: 0, duration: 0.4 }, 2.5)
      .to(entry, { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, 6.2)
      .to(toast, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 6.2)
      .call(resetRevert, null, 6.65)
      .to(entry, { autoAlpha: 1, duration: 0.45 }, 6.8)
      .set({}, {}, 7.3); // pad the loop end

    timelines.push(tl);
    playWhileVisible(demo, tl);
  }

  /* ---------- event-driven automation engine ---------- */
  const auto = $("#automation-demo");
  if (auto) {
    const canvas = $("#auto-canvas", auto);
    const svg = $("#auto-lines", auto);
    const pathTrigger = $("#auto-path-trigger", auto);
    const pathTrue = $("#auto-path-true", auto);
    const pathElse = $("#auto-path-else", auto);
    const pulse = $("#auto-pulse", auto);
    const nodeTrigger = $("#auto-node-trigger", auto);
    const nodeCond = $("#auto-node-cond", auto);
    const nodeTrue = $("#auto-node-true", auto);
    const nodeElse = $("#auto-node-else", auto);
    const runTrue = $("#auto-run-true", auto);
    const runElse = $("#auto-run-else", auto);
    const labelTrue = $("#auto-label-true", auto);
    const labelElse = $("#auto-label-else", auto);

    // measures the real rendered connection ports and redraws the connectors to meet
    // them exactly, so the diagram lines up at any card width — no hand-tuned coordinates
    let anchor = { trigger: { x: 0, y: 0 }, condR: { x: 0, y: 0 } };
    function layoutPaths() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const canvasRect = canvas.getBoundingClientRect();
      const port = (node, which) => {
        const el = node.querySelector(".auto-port-" + which);
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - canvasRect.left,
          y: r.top + r.height / 2 - canvasRect.top,
        };
      };
      const trigger = port(nodeTrigger, "out");
      const condL = port(nodeCond, "in");
      const condR = port(nodeCond, "out");
      const truePt = port(nodeTrue, "in");
      const elsePt = port(nodeElse, "in");

      pathTrigger.setAttribute("d", `M${trigger.x},${trigger.y} H${condL.x}`);
      const curve = (from, to) => {
        const mid = from.x + (to.x - from.x) * 0.5;
        return `M${from.x},${from.y} C${mid},${from.y} ${mid},${to.y} ${to.x},${to.y}`;
      };
      pathTrue.setAttribute("d", curve(condR, truePt));
      pathElse.setAttribute("d", curve(condR, elsePt));

      // park the branch labels just past the split, clear of the curve itself
      const labelX = condR.x + (truePt.x - condR.x) * 0.5;
      labelTrue.setAttribute("x", labelX);
      labelTrue.setAttribute("y", condR.y - (condR.y - truePt.y) * 0.5 - 6);
      labelElse.setAttribute("x", labelX);
      labelElse.setAttribute("y", condR.y + (elsePt.y - condR.y) * 0.5 + 12);

      anchor = { trigger, condR };
    }
    layoutPaths();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layoutPaths, 150);
    });

    // moves the pulse dot along an SVG path's own geometry — no MotionPathPlugin needed
    function travel(path, duration) {
      const proxy = { t: 0 };
      const len = path.getTotalLength();
      return gsap.to(proxy, {
        t: 1,
        duration,
        ease: "power1.inOut",
        onUpdate: () => {
          const pt = path.getPointAtLength(proxy.t * len);
          pulse.setAttribute("cx", pt.x);
          pulse.setAttribute("cy", pt.y);
        },
      });
    }

    function resetAuto() {
      [pathTrigger, pathTrue, pathElse, labelTrue, labelElse].forEach((p) =>
        p.classList.remove("is-active")
      );
      [nodeTrigger, nodeCond, nodeTrue, nodeElse].forEach((n) => n.classList.remove("is-active"));
      gsap.set(pulse, { autoAlpha: 0, attr: { cx: () => anchor.trigger.x, cy: () => anchor.trigger.y } });
      gsap.set([runTrue, runElse], { autoAlpha: 0 });
    }
    resetAuto();

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1,
      paused: true,
      defaults: { ease: "power2.out" },
    });

    // 1 — trigger fires, pulse reaches the condition
    tl.call(() => {
        nodeTrigger.classList.add("is-active");
        pathTrigger.classList.add("is-active");
      }, null, 0.3)
      .set(pulse, { autoAlpha: 1 }, 0.3)
      .add(travel(pathTrigger, 0.55), 0.3)
      .call(() => nodeCond.classList.add("is-active"), null, 0.9)
      // 2 — condition routes true this pass: agent dispatched, hold, fade
      .call(() => {
        pathTrue.classList.add("is-active");
        labelTrue.classList.add("is-active");
      }, null, 1.15)
      .add(travel(pathTrue, 0.55), 1.15)
      .call(() => nodeTrue.classList.add("is-active"), null, 1.7)
      .to(runTrue, { autoAlpha: 1, duration: 0.3 }, 1.75)
      .to(pulse, { autoAlpha: 0, duration: 0.2 }, 1.75)
      .call(() => {
        pathTrue.classList.remove("is-active");
        labelTrue.classList.remove("is-active");
        nodeTrue.classList.remove("is-active");
        nodeCond.classList.remove("is-active");
        nodeTrigger.classList.remove("is-active");
        pathTrigger.classList.remove("is-active");
      }, null, 3.2)
      .to(runTrue, { autoAlpha: 0, duration: 0.25 }, 3.2)
      // 3 — condition re-fires, this time routes to the else branch
      .call(() => {
        nodeCond.classList.add("is-active");
        pathElse.classList.add("is-active");
        labelElse.classList.add("is-active");
      }, null, 3.7)
      .set(pulse, { autoAlpha: 1, attr: { cx: () => anchor.condR.x, cy: () => anchor.condR.y } }, 3.7)
      .add(travel(pathElse, 0.55), 3.7)
      .call(() => nodeElse.classList.add("is-active"), null, 4.25)
      .to(runElse, { autoAlpha: 1, duration: 0.3 }, 4.3)
      .to(pulse, { autoAlpha: 0, duration: 0.2 }, 4.3)
      // 4 — reset everything for the loop
      .call(resetAuto, null, 5.8)
      .set({}, {}, 6.6); // pad the loop end

    timelines.push(tl);
    playWhileVisible(auto, tl);
  }

  /* ---------- workspace branding ---------- */
  const branding = $("#branding-demo");
  if (branding) {
    const swatches = [
      { name: "lime", el: $("#brand-swatch-lime", branding) },
      { name: "violet", el: $("#brand-swatch-violet", branding) },
      { name: "sky", el: $("#brand-swatch-sky", branding) },
    ];

    function selectAccent(name) {
      branding.dataset.accent = name;
      swatches.forEach((s) => s.el.classList.toggle("is-active", s.name === name));
    }
    selectAccent("lime");

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1,
      paused: true,
      defaults: { ease: "power2.out" },
    });

    // step the accent through violet and sky, then back to lime before the loop repeats
    tl.call(() => selectAccent("violet"), null, 1.7)
      .call(() => selectAccent("sky"), null, 4.0)
      .call(() => selectAccent("lime"), null, 6.3)
      .set({}, {}, 7.2); // pad the loop end

    timelines.push(tl);
    playWhileVisible(branding, tl);
  }

  /* ---------- ACP agent support ---------- */
  const acp = $("#acp-demo");
  if (acp) {
    const cmdEl = $("#acp-cmd", acp);
    const cursor = $("#acp-cursor", acp);
    const statusEl = $("#acp-status", acp);
    const statusLabel = $("#acp-status-label", acp);
    const out1 = $("#acp-out-1", acp);
    const out2 = $("#acp-out-2", acp);
    const msg = $("#acp-msg", acp);
    const CMD = "paca-acp-bridge start";

    function resetAcp() {
      cmdEl.textContent = "";
      statusLabel.textContent = "idle";
      statusEl.classList.remove("is-live");
      gsap.set(cursor, { autoAlpha: 1 });
      gsap.set([out1, out2], { autoAlpha: 0, y: 4 });
      gsap.set(msg, { autoAlpha: 0, y: 6 });
    }
    resetAcp();

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1.2,
      paused: true,
      defaults: { ease: "power2.out" },
    });

    const typeProxy = { i: 0 };
    // 1 — command types out, 2 — bridge authenticates and opens a session,
    // 3 — status flips live, 4 — the agent answers from paca-core, 5 — reset
    tl.to(
        typeProxy,
        {
          i: CMD.length,
          duration: 0.7,
          ease: "none",
          onUpdate: () => {
            cmdEl.textContent = CMD.slice(0, Math.round(typeProxy.i));
          },
        },
        0.3
      )
      .to(cursor, { autoAlpha: 0, duration: 0.15 }, 1.05)
      .call(() => { statusLabel.textContent = "connecting…"; }, null, 1.1)
      .to(out1, { autoAlpha: 1, y: 0, duration: 0.35 }, 1.5)
      .to(out2, { autoAlpha: 1, y: 0, duration: 0.35 }, 2.1)
      .call(() => {
        statusLabel.textContent = "connected";
        statusEl.classList.add("is-live");
      }, null, 2.45)
      .to(msg, { autoAlpha: 1, y: 0, duration: 0.45 }, 2.85)
      .to([msg, out1, out2], { autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 6.6)
      .call(resetAcp, null, 7.05)
      .set({}, {}, 7.6); // pad the loop end

    timelines.push(tl);
    playWhileVisible(acp, tl);
  }

  return timelines.length ? timelines : null;
};
