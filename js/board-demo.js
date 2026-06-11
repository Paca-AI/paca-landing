/* ============================================================
   Paca Landing — Hero Scrumban board simulation
   A looping GSAP timeline: the AI agent picks up a task, works
   it across the board, and a human teammate follows. Uses Flip
   for column-to-column card moves.
   ============================================================ */

window.initBoardDemo = function initBoardDemo() {
  const gsap = window.gsap;
  const Flip = window.Flip;
  const board = document.getElementById("board");
  if (!gsap || !Flip || !board) return null;

  const $ = (s, root) => (root || document).querySelector(s);
  const cards = {
    oauth: $("#card-oauth"),
    bug: $("#card-bug"),
    spec: $("#card-spec"),
    presence: $("#card-presence"),
    valkey: $("#card-valkey"),
  };
  const slots = {
    todo: $('[data-slot="todo"]'),
    doing: $('[data-slot="doing"]'),
    done: $('[data-slot="done"]'),
  };
  const counts = {
    todo: $('[data-count="todo"]'),
    doing: $('[data-count="doing"]'),
    done: $('[data-count="done"]'),
  };
  const feedList = $("#feed-list");
  const ava = $('[data-ava="oauth"]', cards.oauth);
  const prog = $(".tprog", cards.oauth);
  const progFill = $(".tprog-fill", cards.oauth);
  const check = $(".tcheck", cards.oauth);
  const allCards = Object.values(cards);

  /* ---------- helpers ---------- */

  function setCount(key, n) {
    const el = counts[key];
    if (!el) return;
    el.textContent = n;
    gsap.fromTo(el, { scale: 1.25 }, { scale: 1, duration: 0.3, ease: "back.out(3)" });
  }

  function flipMove(card, slot) {
    const state = Flip.getState(allCards);
    slot.prepend(card);
    Flip.from(state, {
      duration: 0.75,
      ease: "power3.inOut",
      absolute: true,
      zIndex: 5,
    });
  }

  let typingLine = null;

  function addFeed(kind, avaText, html, { typing = false } = {}) {
    if (!feedList) return;
    if (typingLine) {
      typingLine.remove();
      typingLine = null;
    }
    const line = document.createElement("div");
    line.className = "feed-line";
    line.innerHTML =
      '<span class="feed-ava ' + kind + '">' + avaText + "</span>" +
      '<div class="feed-body"><p class="feed-text">' + html +
      (typing ? ' <span class="feed-dots"><i></i><i></i><i></i></span>' : "") +
      '</p><span class="feed-time">just now</span></div>';
    feedList.appendChild(line);
    if (typing) typingLine = line;

    gsap.from(line, { autoAlpha: 0, y: 8, duration: 0.4, ease: "power2.out" });

    const extra = feedList.children.length - 4;
    for (let i = 0; i < extra; i++) {
      const old = feedList.children[i];
      gsap.to(old, {
        autoAlpha: 0,
        height: 0,
        marginBottom: -10,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => old.remove(),
      });
    }
  }

  function resetBoard() {
    // restore DOM order
    slots.todo.append(cards.oauth, cards.bug, cards.spec);
    slots.doing.append(cards.presence);
    slots.done.append(cards.valkey);
    gsap.set(allCards, { clearProps: "transform,zIndex,opacity,visibility" });

    cards.oauth.classList.remove("agent-active", "tcard-done");
    ava.className = "avatar avatar-empty";
    ava.textContent = "";
    gsap.set(prog, { autoAlpha: 0 });
    gsap.set(progFill, { width: "0%" });
    progFill.classList.remove("full");
    check.classList.remove("on");
    gsap.set(check, { clearProps: "all" });

    counts.todo.textContent = "3";
    counts.doing.textContent = "1";
    counts.done.textContent = "1";

    if (feedList) feedList.innerHTML = "";
    typingLine = null;
  }

  /* ---------- the loop ---------- */

  const tl = gsap.timeline({
    repeat: -1,
    repeatDelay: 0.4,
    defaults: { ease: "power2.out" },
    paused: true,
  });

  // 1 — agent claims the task
  tl.call(() => {
    cards.oauth.classList.add("agent-active");
    ava.className = "avatar avatar-ai";
    ava.textContent = "AI";
    gsap.fromTo(ava, { scale: 0 }, { scale: 1, duration: 0.45, ease: "back.out(2.5)" });
    addFeed("ai", "AI", 'Paca Agent picked up <span class="mono">PACA-128</span>');
  }, null, 0.7);

  // 2 — move to In Progress
  tl.call(() => {
    flipMove(cards.oauth, slots.doing);
    setCount("todo", 2);
    setCount("doing", 2);
  }, null, 1.7);

  // 3 — agent works: BDD spec
  tl.call(() => {
    addFeed("ai", "AI", "Drafting BDD scenarios", { typing: true });
  }, null, 2.9);
  tl.to(prog, { autoAlpha: 1, duration: 0.3 }, 3.0);
  tl.to(progFill, { width: "64%", duration: 1.6, ease: "power1.inOut" }, 3.1);

  // 4 — spec ready, finish work
  tl.call(() => {
    addFeed("ai", "AI", 'BDD spec ready · PR <span class="mono">#214</span> opened');
  }, null, 5.4);
  tl.to(progFill, { width: "100%", duration: 0.7, ease: "power1.inOut" }, 5.5);
  tl.call(() => progFill.classList.add("full"), null, 6.2);

  // 5 — checks pass
  tl.call(() => {
    addFeed("sys", "✓", 'QA checks passed on <span class="mono">PACA-128</span>');
  }, null, 6.9);

  // 6 — move to Done
  tl.call(() => {
    flipMove(cards.oauth, slots.done);
    setCount("doing", 1);
    setCount("done", 2);
    gsap.to(prog, { autoAlpha: 0, duration: 0.3, delay: 0.4 });
  }, null, 7.7);
  tl.call(() => {
    cards.oauth.classList.add("tcard-done");
    cards.oauth.classList.remove("agent-active");
    check.classList.add("on");
    gsap.fromTo(check, { scale: 0.4 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
  }, null, 8.5);

  // 7 — human teammate follows
  tl.call(() => {
    flipMove(cards.bug, slots.doing);
    setCount("todo", 1);
    setCount("doing", 2);
    addFeed("hum", "M", 'Mai started <span class="mono">PACA-131</span>');
  }, null, 9.6);

  tl.call(() => {
    addFeed("sys", "↺", "Sprint burndown updated");
  }, null, 11.2);

  // 8 — fade + reset for seamless loop
  tl.to([".board-cols", ".board-feed"], { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, 13.2);
  tl.call(resetBoard, null, 13.75);
  tl.to([".board-cols", ".board-feed"], { autoAlpha: 1, duration: 0.5 }, 13.9);
  tl.set({}, {}, 14.4); // pad the loop end

  /* ---------- play only while visible ---------- */
  if (window.ScrollTrigger) {
    window.ScrollTrigger.create({
      trigger: board,
      start: "top 95%",
      end: "bottom -20%",
      onEnter: () => tl.play(),
      onEnterBack: () => tl.play(),
      onLeave: () => tl.pause(),
      onLeaveBack: () => tl.pause(),
    });
  } else {
    tl.play();
  }

  return tl;
};
