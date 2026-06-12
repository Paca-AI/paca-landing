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

  return timelines.length ? timelines : null;
};
