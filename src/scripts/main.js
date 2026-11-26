const reduce = document.documentElement.classList.contains("rm");
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const header = document.getElementById("header");
const darkSections = document.querySelectorAll(".projects, .team");

function updateHeader() {
  if (!header) return;
  const y = header.getBoundingClientRect().bottom + 4;
  let dark = false;
  darkSections.forEach((s) => {
    const r = s.getBoundingClientRect();
    if (r.top < y && r.bottom > y) dark = true;
  });
  header.classList.toggle("is-dark", dark);
}
window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", updateHeader);
updateHeader();

const timers = new Set();
function later(ms, fn, bag = timers) {
  const id = setTimeout(() => {
    bag.delete(id);
    fn();
  }, ms);
  bag.add(id);
  return id;
}
function clearBag(bag) {
  bag.forEach((id) => clearTimeout(id));
  bag.clear();
}

/* ── Hero: live edit ── */
const RAW =
  "Разрабатываю инновационные ИИ-решения и автоматизирую процессы, чтобы повысить эффективность и вывести продукт на новый уровень.";
const STRIKE1 = new Set([
  "инновационные",
  "чтобы",
  "повысить",
  "эффективность",
  "вывести",
  "продукт",
  "на",
  "новый",
  "уровень.",
]);
const STRIKE2 = new Set(["Разрабатываю", "ИИ-решения", "и", "автоматизирую", "процессы,"]);

const hero = document.querySelector(".hero");
const draftEl = document.getElementById("draft");
const finalEl = document.getElementById("manifesto");
const noteEl = document.getElementById("edit-note");
const signEl = document.getElementById("sign");
const chips = {
  writer: document.querySelector('[data-chip="writer"]'),
  zalim: document.querySelector('[data-chip="zalim"]'),
  cut: document.querySelector('[data-chip="cut"]'),
};
const heroBag = new Set();
let heroPlaying = false;
const originalManifesto = finalEl ? finalEl.innerHTML : "";
const defaultNote = noteEl ? noteEl.innerHTML : "";

function tokens(text) {
  return text.split(/(\s+)/);
}
function buildDraft() {
  draftEl.innerHTML = "";
  tokens(RAW).forEach((tok) => {
    const s = document.createElement("span");
    if (/^\s+$/.test(tok)) s.textContent = tok;
    else {
      s.className = "word";
      s.dataset.w = tok;
      s.textContent = tok;
    }
    draftEl.appendChild(s);
  });
}
function typeRaw(done) {
  const parts = tokens(RAW);
  draftEl.innerHTML = "";
  let i = 0;
  let acc = "";
  const step = () => {
    acc += parts[i];
    draftEl.textContent = acc;
    i += 1;
    if (i < parts.length) later(38, step, heroBag);
    else {
      buildDraft();
      if (done) done();
    }
  };
  step();
}
function strike(level) {
  draftEl.querySelectorAll(".word").forEach((el) => {
    const w = el.dataset.w;
    if ((level === 1 && STRIKE1.has(w)) || (level === 2 && STRIKE2.has(w))) {
      el.classList.add("strike");
    }
  });
}
function landFinal() {
  draftEl.hidden = true;
  finalEl.innerHTML = "";
  finalEl.classList.add("land");
  let delay = 0;
  ["Собираю", "системы,", "которые", "работают", "сами."].forEach((w) => {
    const line = document.createElement("span");
    line.className = "line";
    [...w].forEach((ch) => {
      const s = document.createElement("span");
      s.className = "letter";
      s.textContent = ch;
      s.style.animationDelay = `${delay * 0.028}s`;
      line.appendChild(s);
      delay += 1;
    });
    finalEl.appendChild(line);
  });
}
function resetHero() {
  clearBag(heroBag);
  heroPlaying = false;
  hero.classList.remove("is-playing");
  Object.values(chips).forEach((c) => c && c.classList.remove("is-on"));
  noteEl.innerHTML = defaultNote;
  draftEl.hidden = true;
  draftEl.innerHTML = "";
  finalEl.classList.remove("land");
  finalEl.innerHTML = originalManifesto;
  signEl.classList.add("is-on");
}
function playHero() {
  if (reduce) {
    resetHero();
    return;
  }
  clearBag(heroBag);
  heroPlaying = true;
  hero.classList.add("is-playing");
  draftEl.hidden = false;
  signEl.classList.remove("is-on");
  Object.values(chips).forEach((c) => c && c.classList.remove("is-on"));
  chips.writer.classList.add("is-on");
  noteEl.textContent = "Технический писатель: набрасываю черновик…";
  typeRaw(() => {
    later(500, () => {
      chips.writer.classList.remove("is-on");
      chips.zalim.classList.add("is-on");
      noteEl.innerHTML = "<em>Залим:</em> воды много. Оставь суть.";
      strike(1);
    }, heroBag);
    later(1600, () => {
      chips.zalim.classList.remove("is-on");
      chips.cut.classList.add("is-on");
      noteEl.innerHTML = "<em>Монтажёр:</em> режу.";
      strike(2);
    }, heroBag);
    later(2400, () => {
      hero.classList.remove("is-playing");
      noteEl.innerHTML = "<em>Монтажёр:</em> снято. Осталась одна фраза.";
      landFinal();
      heroPlaying = false;
    }, heroBag);
    later(3700, () => {
      signEl.classList.add("is-on");
      chips.cut.classList.remove("is-on");
    }, heroBag);
  });
}
function pauseHero() {
  if (!heroPlaying) return;
  clearBag(heroBag);
  heroPlaying = false;
  hero.classList.remove("is-playing");
  finalEl.classList.remove("land");
  finalEl.innerHTML = originalManifesto;
  draftEl.hidden = true;
  noteEl.innerHTML = defaultNote;
  Object.values(chips).forEach((c) => c && c.classList.remove("is-on"));
  signEl.classList.add("is-on");
}

document.getElementById("hero-replay")?.addEventListener("click", () => {
  playHero();
});

/* ── Project clips ── */
const CLIP_WORDS = {
  smartplayer: ["SmartPlayer", "собирает сцену"],
  agents: ["Команда", "агентов"],
  auto: ["Контуры", "держат ритм"],
};

function setupClip(article) {
  const key = article.dataset.clip;
  const btn = article.querySelector(".play");
  const title = article.querySelector(".clip-title");
  const ph = article.querySelector(".playhead");
  const tc = article.querySelector(".tc");
  const segs = [...article.querySelectorAll(".seg")];
  const original = title.textContent;
  const bag = new Set();
  let raf = 0;
  let start = 0;
  let playing = false;
  const DUR = 6000;

  const fmt = (ms) => `00:00:${String(Math.min(6, Math.floor(ms / 1000))).padStart(2, "0")}`;

  function stop(resetTitle = false) {
    playing = false;
    cancelAnimationFrame(raf);
    clearBag(bag);
    btn.textContent = "▶";
    btn.setAttribute("aria-label", btn.getAttribute("aria-label").replace("Пауза:", "Воспроизвести"));
    if (resetTitle) title.textContent = original;
  }

  function frame(now) {
    if (!start) start = now;
    const t = Math.min(DUR, now - start);
    const p = t / DUR;
    ph.style.left = `${p * 100}%`;
    tc.textContent = fmt(t);
    segs.forEach((seg, i) => {
      const delay = 400 + i * 900;
      const w = Math.max(0, Math.min(1, (t - delay) / 1800));
      seg.style.width = `${w * (40 + i * 6)}%`;
    });
    if (t >= 900 && title.dataset.phase !== "b") {
      title.dataset.phase = "b";
      const words = CLIP_WORDS[key] || [original];
      title.textContent = words[1] || original;
    }
    if (t < DUR && playing) raf = requestAnimationFrame(frame);
    else {
      stop(false);
      title.textContent = original;
      title.dataset.phase = "";
      ph.style.left = "100%";
      segs.forEach((seg, i) => { seg.style.width = `${44 + i * 4}%`; });
    }
  }

  function play() {
    if (reduce) return;
    stop(true);
    playing = true;
    start = 0;
    title.dataset.phase = "a";
    title.textContent = (CLIP_WORDS[key] || [original])[0];
    btn.textContent = "❚❚";
    const label = btn.getAttribute("aria-label") || "";
    btn.setAttribute("aria-label", label.replace("Воспроизвести", "Пауза:"));
    segs.forEach((seg) => { seg.style.width = "0"; });
    raf = requestAnimationFrame(frame);
  }

  function pause() {
    if (!playing) return;
    stop(true);
    ph.style.left = "0";
  }

  btn.addEventListener("click", () => {
    if (playing) pause();
    else play();
  });

  return { play, pause, el: article, get playing() { return playing; } };
}

const clips = [...document.querySelectorAll(".clip")].map(setupClip);

/* ── Team desks ── */
const desksRoot = document.getElementById("desks");
const copyEl = desksRoot?.querySelector("[data-copy]");
const ticket = desksRoot?.querySelector(".ticket");
const colName = desksRoot?.querySelector(".col-name");
const tStatus = desksRoot?.querySelector(".ticket-status");
const clipBar = desksRoot?.querySelector(".clip-bar");
const filmHead = desksRoot?.querySelector(".head");
const tcLine = desksRoot?.querySelector(".tc-line");
const writerDesk = desksRoot?.querySelector('[data-desk="writer"]');
const zalimDesk = desksRoot?.querySelector('[data-desk="zalim"]');
const cutDesk = desksRoot?.querySelector('[data-desk="cut"]');
const COPY = copyEl ? copyEl.textContent.trim() : "";
const teamBag = new Set();
let teamPlaying = false;

function teamStatic() {
  if (!copyEl) return;
  copyEl.textContent = COPY;
  ticket.classList.add("is-done");
  colName.textContent = "готово";
  tStatus.textContent = "принято · смысл оставлен";
  clipBar.classList.add("is-cut");
  filmHead.style.left = "58%";
  tcLine.innerHTML = "in 00:04 &nbsp; out <em>00:09</em> &nbsp; снято";
  [writerDesk, zalimDesk, cutDesk].forEach((d) => d.classList.remove("is-on"));
}

function playTeam() {
  if (!copyEl || reduce) {
    teamStatic();
    return;
  }
  clearBag(teamBag);
  teamPlaying = true;
  copyEl.textContent = "";
  ticket.classList.remove("is-done");
  colName.textContent = "бэклог";
  tStatus.textContent = "карточка ещё пустая";
  clipBar.classList.remove("is-cut");
  filmHead.style.left = "8%";
  tcLine.innerHTML = "in 00:04 &nbsp; out <em>00:16</em> &nbsp; сырой дубль";
  writerDesk.classList.add("is-on");
  let i = 0;
  const type = () => {
    i += 1;
    copyEl.textContent = COPY.slice(0, i);
    if (i < COPY.length) later(22, type, teamBag);
  };
  type();
  later(500, () => {
    zalimDesk.classList.add("is-on");
    tStatus.textContent = "в бэклоге";
  }, teamBag);
  later(900, () => {
    cutDesk.classList.add("is-on");
    filmHead.style.transition = "left 2.1s cubic-bezier(.4,0,.2,1)";
    filmHead.style.left = "58%";
  }, teamBag);
  later(1600, () => {
    colName.textContent = "в работе";
    tStatus.textContent = "режет объём, оставляет смысл";
  }, teamBag);
  later(2800, () => {
    clipBar.classList.add("is-cut");
    tcLine.innerHTML = "in 00:04 &nbsp; out <em>00:09</em> &nbsp; снято";
    cutDesk.classList.remove("is-on");
    filmHead.style.transition = "";
  }, teamBag);
  later(3400, () => {
    ticket.classList.add("is-done");
    colName.textContent = "готово";
    tStatus.textContent = "принято · смысл оставлен";
    zalimDesk.classList.remove("is-on");
  }, teamBag);
  later(4200, () => {
    writerDesk.classList.remove("is-on");
    teamPlaying = false;
  }, teamBag);
}
function pauseTeam() {
  if (!teamPlaying) return;
  clearBag(teamBag);
  teamPlaying = false;
  if (filmHead) filmHead.style.transition = "";
  teamStatic();
}
document.getElementById("team-replay")?.addEventListener("click", playTeam);

/* ── Intersection: play in view, pause off-screen ── */
const io = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const on = e.isIntersecting && e.intersectionRatio >= 0.28;
          if (e.target === hero) {
            if (on && !hero.dataset.played) {
              hero.dataset.played = "1";
              playHero();
            } else if (!on) pauseHero();
          }
          if (e.target.id === "team") {
            if (on && !e.target.dataset.played) {
              e.target.dataset.played = "1";
              playTeam();
            } else if (!on) pauseTeam();
          }
          clips.forEach((c) => {
            if (e.target === c.el && !on) c.pause();
          });
        });
      },
      { threshold: [0, 0.28, 0.6] }
    )
  : null;

if (io) {
  if (hero) io.observe(hero);
  const team = document.getElementById("team");
  if (team) io.observe(team);
  clips.forEach((c) => io.observe(c.el));
} else if (!reduce) {
  playHero();
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseHero();
    pauseTeam();
    clips.forEach((c) => c.pause());
  }
});
