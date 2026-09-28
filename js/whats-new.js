/* ============================================================
   Paca Landing — "What's new" release demos
   Looping GSAP timelines, one per release card: Jev AI, the browser
   extension, provider_cli agents, static environments, the
   automation engine, branding, ACP, the project-level AI chat
   and the activity diff + one-click revert. Initialized from
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

  /* ---------- browser extension: page annotations ---------- */
  const ext = $("#ext-demo");
  if (ext) {
    const page = $(".ext-page", ext);
    const cursor = $("#ext-cursor", ext);
    const target = $("#ext-target", ext);
    const pin = $("#ext-pin", ext);
    const pinLabel = $("#ext-pin-label", ext);
    const popover = $("#ext-popover", ext);
    const text = $("#ext-text", ext);
    const caret = $("#ext-caret", ext);
    const create = $("#ext-create", ext);
    const createLabel = $("#ext-create-label", ext);
    const toast = $("#ext-toast", ext);
    const openCount = $("#ext-open-count", ext);
    const COMMENT = text.textContent;

    // the cursor travels to the button's real rendered position, so the click lands
    // on the element at any card width
    function cursorTargetPos() {
      const p = page.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      return { left: t.left - p.left + t.width * 0.62, top: t.top - p.top + t.height * 0.55 };
    }

    // the pin hangs off the button's top-right corner; measured, for the same reason
    function pinPos() {
      const p = page.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      return { left: t.right - p.left - 9, top: t.top - p.top - 15 };
    }

    function resetExt() {
      const pp = pinPos();
      pin.style.left = pp.left + "px";
      pin.style.top = pp.top + "px";
      target.classList.remove("is-hover");
      pin.classList.remove("is-done");
      pinLabel.textContent = "1";
      create.classList.remove("is-hot");
      createLabel.textContent = "Create task";
      openCount.textContent = "3";
      text.textContent = "";
      gsap.set(cursor, { autoAlpha: 0, left: "66%", top: "22%", scale: 1 });
      gsap.set(pin, { autoAlpha: 0, scale: 0.5, y: -8 });
      gsap.set(popover, { autoAlpha: 0, y: 8 });
      gsap.set(caret, { autoAlpha: 0 });
      gsap.set(toast, { autoAlpha: 0, y: 10 });
    }
    resetExt();

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1.1,
      paused: true,
      defaults: { ease: "power2.out" },
      // re-measure the button on every pass so the click still lands after a resize
      onRepeat: () => tl.invalidate(),
    });

    const typeProxy = { i: 0 };
    // 1 — the cursor drifts onto the CTA, 2 — click drops a pin and opens the comment box,
    // 3 — Mai types, 4 — one click turns it into a task, 5 — fade and reset for the loop
    tl.to(cursor, { autoAlpha: 1, duration: 0.25 }, 0.3)
      .to(cursor, {
        left: () => cursorTargetPos().left,
        top: () => cursorTargetPos().top,
        duration: 1.0,
        ease: "power2.inOut",
      }, 0.35)
      .call(() => target.classList.add("is-hover"), null, 1.2)
      .to(cursor, { scale: 0.82, duration: 0.1, yoyo: true, repeat: 1 }, 1.45)
      .to(pin, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(2.2)" }, 1.55)
      .to(cursor, { autoAlpha: 0, duration: 0.3 }, 1.75)
      .to(popover, { autoAlpha: 1, y: 0, duration: 0.4 }, 1.85)
      .set(caret, { autoAlpha: 1 }, 2.0)
      .to(typeProxy, {
        i: COMMENT.length,
        duration: 1.6,
        ease: "none",
        onUpdate: () => { text.textContent = COMMENT.slice(0, Math.round(typeProxy.i)); },
      }, 2.2)
      .set(caret, { autoAlpha: 0 }, 4.1)
      .call(() => create.classList.add("is-hot"), null, 4.4)
      .to(create, { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1 }, 4.45)
      .call(() => { createLabel.textContent = "Created ✓"; }, null, 4.7)
      .call(() => { pin.classList.add("is-done"); pinLabel.textContent = "✓"; openCount.textContent = "4"; }, null, 4.95)
      .to(popover, { autoAlpha: 0, y: -6, duration: 0.35, ease: "power2.in" }, 5.05)
      .to(toast, { autoAlpha: 1, y: 0, duration: 0.45, ease: "back.out(1.6)" }, 5.2)
      .to(toast, { autoAlpha: 0, y: 6, duration: 0.35, ease: "power2.in" }, 8.4)
      .to(pin, { autoAlpha: 0, scale: 0.6, duration: 0.3, ease: "power2.in" }, 8.4)
      .call(() => { target.classList.remove("is-hover"); typeProxy.i = 0; }, null, 8.5)
      .call(resetExt, null, 8.85)
      .set({}, {}, 9.1); // pad the loop end

    timelines.push(tl);
    playWhileVisible(ext, tl);
  }

  /* ---------- provider_cli agent type ---------- */
  const cli = $("#cli-demo");
  if (cli) {
    const tiles = Array.from(cli.querySelectorAll(".cli-tile"));
    const cmdEl = $("#cli-cmd", cli);
    const cursor = $("#cli-cursor", cli);
    const out1 = $("#cli-out-1", cli);
    const out2 = $("#cli-out-2", cli);
    const CLIS = [
      { key: "claude", cmd: "claude /login" },
      { key: "codex", cmd: "codex login" },
      { key: "gemini", cmd: "gemini /auth" },
      { key: "cursor", cmd: "cursor-agent login" },
    ];

    function selectCli(key) {
      tiles.forEach((t) => t.classList.toggle("is-active", t.dataset.cli === key));
    }

    function resetCli() {
      selectCli(CLIS[0].key);
      cmdEl.textContent = "";
      gsap.set(cursor, { autoAlpha: 1 });
      gsap.set([out1, out2], { autoAlpha: 0, y: 4 });
    }
    resetCli();

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.6,
      paused: true,
      defaults: { ease: "power2.out" },
    });

    // one pass per CLI: pick the tile, type its login command once, then the
    // environment reports the persisted login and the synced MCP servers
    const PASS = 4.4;
    CLIS.forEach((c, i) => {
      const t0 = i * PASS;
      const proxy = { i: 0 };
      tl.call(() => {
          selectCli(c.key);
          cmdEl.textContent = "";
          proxy.i = 0;
        }, null, t0)
        .set(cursor, { autoAlpha: 1 }, t0)
        .to(proxy, {
          i: c.cmd.length,
          duration: 0.6,
          ease: "none",
          onUpdate: () => { cmdEl.textContent = c.cmd.slice(0, Math.round(proxy.i)); },
        }, t0 + 0.35)
        .to(cursor, { autoAlpha: 0, duration: 0.15 }, t0 + 1.05)
        .to(out1, { autoAlpha: 1, y: 0, duration: 0.35 }, t0 + 1.35)
        .to(out2, { autoAlpha: 1, y: 0, duration: 0.35 }, t0 + 1.9)
        .to([out1, out2], { autoAlpha: 0, y: 4, duration: 0.3, ease: "power2.in" }, t0 + PASS - 0.55);
    });
    tl.call(resetCli, null, CLIS.length * PASS - 0.2)
      .set({}, {}, CLIS.length * PASS); // pad the loop end

    timelines.push(tl);
    playWhileVisible(cli, tl);
  }

  /* ---------- static environments ---------- */
  const env = $("#env-demo");
  if (env) {
    const tabs = {
      terminal: { tab: $("#env-tab-terminal", env), pane: $("#env-pane-terminal", env) },
      ssh: { tab: $("#env-tab-ssh", env), pane: $("#env-pane-ssh", env) },
      ports: { tab: $("#env-tab-ports", env), pane: $("#env-pane-ports", env) },
    };
    const cmdEl = $("#env-cmd", env);
    const cursor = $("#env-cursor", env);
    const out1 = $("#env-out-1", env);
    const out2 = $("#env-out-2", env);
    const sshKey = $("#env-ssh-key", env);
    const sshCmd = $("#env-ssh-cmd", env);
    const sshCursor = $("#env-ssh-cursor", env);
    const sshOut = $("#env-ssh-out", env);
    const port1 = $("#env-port-1", env);
    const port2 = $("#env-port-2", env);
    const portAdd = $("#env-port-add", env);
    const CMD = "npm run dev";
    const SSH = "ssh dev-box";

    function showTab(name) {
      Object.keys(tabs).forEach((k) => {
        tabs[k].tab.classList.toggle("is-active", k === name);
        tabs[k].pane.classList.toggle("is-active", k === name);
      });
      gsap.fromTo(tabs[name].pane, { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" });
    }

    function resetEnv() {
      Object.keys(tabs).forEach((k) => {
        tabs[k].tab.classList.toggle("is-active", k === "terminal");
        tabs[k].pane.classList.toggle("is-active", k === "terminal");
      });
      gsap.set(tabs.terminal.pane, { clearProps: "opacity,visibility,transform" });
      cmdEl.textContent = "";
      sshCmd.textContent = "";
      gsap.set([cursor, sshCursor], { autoAlpha: 1 });
      gsap.set([out1, out2, sshOut], { autoAlpha: 0, y: 4 });
      gsap.set(sshKey, { autoAlpha: 0, y: 4 });
      gsap.set([port1, port2, portAdd], { autoAlpha: 0, x: -8 });
    }
    resetEnv();

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.8,
      paused: true,
      defaults: { ease: "power2.out" },
    });

    const typeA = { i: 0 };
    const typeB = { i: 0 };
    // 1 — terminal: start a dev server that outlives the chat, 2 — SSH: an authorized key
    // and a real shell into the same box, 3 — ports: forward 3000 for a live preview, 4 — reset
    tl.to(typeA, {
        i: CMD.length,
        duration: 0.55,
        ease: "none",
        onUpdate: () => { cmdEl.textContent = CMD.slice(0, Math.round(typeA.i)); },
      }, 0.4)
      .to(cursor, { autoAlpha: 0, duration: 0.15 }, 1.0)
      .to(out1, { autoAlpha: 1, y: 0, duration: 0.35 }, 1.35)
      .to(out2, { autoAlpha: 1, y: 0, duration: 0.35 }, 2.0)

      .call(() => showTab("ssh"), null, 4.4)
      .to(sshKey, { autoAlpha: 1, y: 0, duration: 0.3 }, 4.5)
      .to(typeB, {
        i: SSH.length,
        duration: 0.5,
        ease: "none",
        onUpdate: () => { sshCmd.textContent = SSH.slice(0, Math.round(typeB.i)); },
      }, 4.95)
      .to(sshCursor, { autoAlpha: 0, duration: 0.15 }, 5.5)
      .to(sshOut, { autoAlpha: 1, y: 0, duration: 0.35 }, 5.85)

      .call(() => showTab("ports"), null, 8.6)
      .to([port1, port2], { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.22 }, 8.9)
      .to(portAdd, { autoAlpha: 1, x: 0, duration: 0.3 }, 9.5)
      .to(port1, { boxShadow: "0 0 0 2px rgba(158, 217, 87, 0.35)", duration: 0.3, yoyo: true, repeat: 1 }, 10.2)

      .call(() => { typeA.i = 0; typeB.i = 0; }, null, 12.3)
      .call(resetEnv, null, 12.35)
      .set({}, {}, 12.6); // pad the loop end

    timelines.push(tl);
    playWhileVisible(env, tl);
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

  /* ---------- v0.17.0 · Jev AI ---------- */
  const jev = $("#jev-demo");
  if (jev) {
    const tabs = Array.from(jev.querySelectorAll(".jev-tab"));
    const panes = Array.from(jev.querySelectorAll(".jev-pane"));
    const pane = (k) => $(`[data-pane="${k}"]`, jev);
    const tabBar = (k) => $(`[data-jev="${k}"] i`, jev);

    // auto-route
    const routeQ = $("#jev-route-q", jev);
    const cands = Array.from(pane("route").querySelectorAll(".jev-cand"));
    const bars = cands.map((c) => $(".jev-bar i", c));
    const routeResult = $("#jev-route-result", jev);
    // auto-fill
    const fillFields = Array.from(pane("fill").querySelectorAll("[data-fill]"));
    const fillStatus = $("#jev-fill-status", jev);
    // auto-assign
    const members = Array.from(pane("assign").querySelectorAll(".jev-member"));
    const assignee = $("#jev-assignee", jev);
    const assignAct = $("#jev-assign-act", jev);
    const AUTO_HTML = assignee.innerHTML;
    const LINH_HTML = '<span class="avatar avatar-h2">L</span>Linh <span class="jev-kept">✦ via Jev</span>';
    // condition
    const wire = $("#jev-wire", jev);
    const meter = $("#jev-meter", jev);
    const conf = $("#jev-conf", jev);
    const branches = Array.from(pane("cond").querySelectorAll(".jev-branch"));
    const condStatus = $("#jev-cond-status", jev);

    function show(key) {
      tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.jev === key));
      panes.forEach((p) => {
        const on = p.dataset.pane === key;
        p.classList.toggle("is-active", on);
        if (on) gsap.fromTo(p, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" });
        else gsap.set(p, { autoAlpha: 0 });
      });
    }
    const lit = (els, winner) => els.forEach((e) => {
      e.classList.toggle("is-lit", e === winner);
      e.classList.toggle("is-dim", winner && e !== winner);
    });

    function resetRoute() {
      gsap.set(routeQ, { autoAlpha: 0, y: 8 });
      gsap.set(cands, { autoAlpha: 0, x: -8 });
      gsap.set(bars, { width: 0 });
      gsap.set(routeResult, { autoAlpha: 0, x: -6 });
      lit(cands, null);
    }
    function resetFill() {
      fillFields.forEach((f) => f.classList.remove("is-filled", "is-flash"));
      gsap.set(fillStatus, { autoAlpha: 0 });
    }
    function resetAssign() {
      members.forEach((m) => m.classList.remove("is-scan"));
      lit(members, null);
      assignee.innerHTML = AUTO_HTML;
      gsap.set(assignAct, { autoAlpha: 0, y: 6 });
    }
    function resetCond() {
      wire.classList.remove("is-live");
      meter.classList.remove("is-pass", "is-fail");
      gsap.set(meter, { width: 0 });
      conf.textContent = "0.00";
      lit(branches, null);
      branches.forEach((b) => b.classList.remove("is-dim"));
      gsap.set(condStatus, { autoAlpha: 0 });
    }
    function resetAll() {
      resetRoute(); resetFill(); resetAssign(); resetCond();
      gsap.set(tabs.map((t) => $("i", t)), { scaleX: 0 });
    }
    resetAll();

    const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "power2.out" } });
    const SCENE = { route: 0, fill: 6.2, assign: 11.6, cond: 17.4 };
    const END = 26.4;
    const keys = Object.keys(SCENE);
    keys.forEach((k, i) => {
      const t0 = SCENE[k];
      const t1 = i + 1 < keys.length ? SCENE[keys[i + 1]] : END;
      tl.call(() => show(k), null, t0)
        .fromTo(tabBar(k), { scaleX: 0 }, { scaleX: 1, duration: t1 - t0, ease: "none" }, t0)
        .set(tabBar(k), { scaleX: 0 }, t1 - 0.01);
    });

    // 1 — Auto-routing: a message arrives, Jev scores each agent's description, the best fit takes it
    let t = SCENE.route;
    tl.call(resetRoute, null, t)
      .to(routeQ, { autoAlpha: 1, y: 0, duration: 0.45 }, t + 0.35)
      .to(cands, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.12 }, t + 1.0);
    cands.forEach((c, i) => {
      tl.fromTo(bars[i], { width: 0 }, { width: `${Number(c.dataset.score) * 100}%`, duration: 0.9, ease: "power3.out" }, t + 1.6 + i * 0.08);
    });
    tl.call(() => lit(cands, cands.find((c) => c.classList.contains("is-win"))), null, t + 2.8)
      .to(routeResult, { autoAlpha: 1, x: 0, duration: 0.4 }, t + 3.2);

    // 2 — Auto-fill: blank fields populate one by one; the epic Mai set is left alone
    t = SCENE.fill;
    tl.call(resetFill, null, t);
    fillFields.forEach((f, i) => {
      tl.call(() => f.classList.add("is-filled", "is-flash"), null, t + 1.0 + i * 0.45)
        .call(() => f.classList.remove("is-flash"), null, t + 1.6 + i * 0.45);
    });
    tl.to(fillStatus, { autoAlpha: 1, duration: 0.35 }, t + 1.2 + fillFields.length * 0.45);

    // 3 — Auto-assign: scan member descriptions, pick the best match, explain it in the activity feed
    t = SCENE.assign;
    tl.call(resetAssign, null, t);
    members.forEach((m, i) => {
      tl.call(() => { members.forEach((x) => x.classList.toggle("is-scan", x === m)); }, null, t + 0.8 + i * 0.4);
    });
    tl.call(() => {
        members.forEach((x) => x.classList.remove("is-scan"));
        lit(members, members.find((m) => m.classList.contains("is-win")));
      }, null, t + 2.1)
      .call(() => { assignee.innerHTML = LINH_HTML; }, null, t + 2.5)
      .fromTo(assignee, { autoAlpha: 0, x: -4 }, { autoAlpha: 1, x: 0, duration: 0.35 }, t + 2.5)
      .to(assignAct, { autoAlpha: 1, y: 0, duration: 0.4 }, t + 3.0);

    // 4 — Jev Condition: a confident answer follows its branch; an unsure one falls back to Else
    t = SCENE.cond;
    const pass = (start, value, branchKey, status) => {
      const proxy = { v: 0 };
      const ok = value >= 0.7;
      tl.call(() => {
          resetCond();
          wire.classList.add("is-live");
        }, null, start)
        .fromTo(meter, { width: 0 }, { width: `${value * 100}%`, duration: 1.1, ease: "power2.out" }, start + 0.5)
        .fromTo(proxy, { v: 0 }, {
          v: value, duration: 1.1, ease: "power2.out",
          onUpdate: () => { conf.textContent = proxy.v.toFixed(2); },
        }, start + 0.5)
        .call(() => {
          meter.classList.add(ok ? "is-pass" : "is-fail");
          const w = branches.find((b) => b.dataset.branch === branchKey);
          lit(branches, w);
          condStatus.textContent = status;
        }, null, start + 1.7)
        .to(condStatus, { autoAlpha: 1, duration: 0.3 }, start + 1.8);
    };
    pass(t + 0.2, 0.88, "yes", "0.88 ≥ 0.70 → Yes branch");
    pass(t + 4.5, 0.41, "else", "0.41 < 0.70 — Jev is unsure → Else");
    tl.call(resetAll, null, END - 0.05).set({}, {}, END);

    timelines.push(tl);
    playWhileVisible(jev, tl);
  }

  return timelines.length ? timelines : null;
};
