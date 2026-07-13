/* ============================================================
   Paca Landing — "What's new in v0.9" demos
   Two looping GSAP timelines: the automation-workflow hand-off
   (task done → next task auto-assigned down the graph) and an
   agent building the same pipeline over MCP. Initialized from
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

  /* ---------- automation workflow hand-off ---------- */
  const flow = $("#flow-demo");
  if (flow) {
    const body = $(".flow-body", flow);
    const node1 = $("#fn-1");
    const node2 = $("#fn-2");
    const node3 = $("#fn-3");
    const s1 = $("#fn1-status");
    const s2 = $("#fn2-status");
    const s3 = $("#fn3-status");
    const f1 = $("#fn1-fill");
    const f2 = $("#fn2-fill");
    const f3 = $("#fn3-fill");
    const l1 = $("#fl1-fill");
    const l2 = $("#fl2-fill");
    const a2 = $("#fn2-ava");
    const a3 = $("#fn3-ava");
    const rule = $("#flow-rule");

    function setStatus(el, label, cls) {
      el.textContent = label;
      el.classList.remove("is-doing", "is-done");
      if (cls) el.classList.add(cls);
    }

    function resetFlow() {
      node1.classList.remove("is-done");
      node1.classList.add("is-live");
      node2.classList.remove("is-live", "is-done");
      node3.classList.remove("is-live");
      setStatus(s1, "IN PROGRESS", "is-doing");
      setStatus(s2, "QUEUED", null);
      setStatus(s3, "QUEUED", null);
      rule.classList.remove("on");
      gsap.set(f1, { width: "38%" });
      gsap.set([f2, f3], { width: 0 });
      gsap.set([l1, l2], { scaleY: 0 });
      gsap.set([a2, a3], { autoAlpha: 0.22, scale: 0.7 });
    }
    resetFlow();

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1.4,
      paused: true,
      defaults: { ease: "power2.out" },
    });

    // 1 — Mai finishes the spec, 2 — the edge fires and the dev agent is
    // auto-assigned, 3 — the cascade repeats to hand QA its task
    tl.to(f1, { width: "100%", duration: 1.3, ease: "power1.inOut" }, 0.5)
      .call(() => {
        node1.classList.remove("is-live");
        node1.classList.add("is-done");
        setStatus(s1, "DONE ✓", "is-done");
      }, null, 1.95)
      .to(l1, { scaleY: 1, duration: 0.35, ease: "power1.in" }, 2.25)
      .call(() => {
        node2.classList.add("is-live");
        setStatus(s2, "IN PROGRESS", "is-doing");
        rule.classList.add("on");
      }, null, 2.65)
      .to(a2, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)" }, 2.65)
      .to(f2, { width: "100%", duration: 1.7, ease: "power1.inOut" }, 3.25)
      .call(() => {
        node2.classList.remove("is-live");
        node2.classList.add("is-done");
        setStatus(s2, "DONE ✓", "is-done");
      }, null, 5.15)
      .to(l2, { scaleY: 1, duration: 0.35, ease: "power1.in" }, 5.45)
      .call(() => {
        node3.classList.add("is-live");
        setStatus(s3, "IN PROGRESS", "is-doing");
      }, null, 5.85)
      .to(a3, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)" }, 5.85)
      .to(f3, { width: "72%", duration: 1.4, ease: "power1.inOut" }, 6.4)
      .to(body, { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, 9.1)
      .call(resetFlow, null, 9.6)
      .to(body, { autoAlpha: 1, duration: 0.45 }, 9.7)
      .set({}, {}, 10.3); // pad the loop end

    timelines.push(tl);
    playWhileVisible(flow, tl);
  }

  /* ---------- agent builds the pipeline over MCP ---------- */
  const mcp = $("#mcp-demo");
  if (mcp) {
    const lines = Array.from(mcp.querySelectorAll(".mcp-line"));
    const oks = Array.from(mcp.querySelectorAll(".mcp-ok"));
    const toast = $("#mcp-toast");

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1.2,
      paused: true,
      defaults: { ease: "power2.out" },
    });

    // tool calls land one by one, each acknowledged, then the pipeline goes live
    tl.set(lines, { autoAlpha: 0, x: -10 }, 0)
      .set(oks, { autoAlpha: 0, scale: 0.4 }, 0)
      .set(toast, { autoAlpha: 0, y: 8 }, 0);

    lines.forEach((line, i) => {
      const t = 0.5 + i * 0.95;
      tl.to(line, { autoAlpha: 1, x: 0, duration: 0.4 }, t)
        .to(oks[i], { autoAlpha: 1, scale: 1, duration: 0.35, ease: "back.out(2.4)" }, t + 0.5);
    });

    tl.to(toast, { autoAlpha: 1, y: 0, duration: 0.45 }, 4.8)
      .to(lines.concat(toast), { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, 8.8)
      .set({}, {}, 9.3); // pad the loop end

    timelines.push(tl);
    playWhileVisible(mcp, tl);
  }

  return timelines.length ? timelines : null;
};
