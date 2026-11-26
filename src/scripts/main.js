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

/* ── Language ── */
function currentLang() {
  return document.documentElement.lang === "en" ? "en" : "ru";
}
function setLang(lang) {
  const next = lang === "en" ? "en" : "ru";
  document.documentElement.lang = next;
  try { localStorage.setItem("fm-lang", next); } catch (e) { /* ignore */ }
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === next));
  });
  const nav = document.querySelector(".nav");
  if (nav) nav.setAttribute("aria-label", next === "en" ? "Site sections" : "Разделы сайта");
}
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});
setLang(currentLang());

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

/* ── Hero: process live block ── */
const NOTES = {
  ru: [
    "Собираю требования, оцениваю реализуемость.",
    "Собираю прототип с помощью ИИ, проверяю сценарии.",
    "Один делает — другой проверяет.",
    "Настраиваю тестовые стенды, сопровождаю пилоты.",
  ],
  en: [
    "I gather requirements and assess feasibility.",
    "I build a prototype with AI tools and test the scenarios.",
    "One builds, another reviews.",
    "I set up test environments and run pilots.",
  ],
};
const CHIP_ORDER = ["req", "proto", "review", "pilot"];

const hero = document.querySelector(".hero");
const noteEl = document.getElementById("edit-note");
const chips = Object.fromEntries(
  CHIP_ORDER.map((k) => [k, document.querySelector(`[data-chip="${k}"]`)])
);
const heroBag = new Set();
let heroPlaying = false;

function langNotes() {
  return NOTES[currentLang()];
}
function resetHero() {
  clearBag(heroBag);
  heroPlaying = false;
  Object.values(chips).forEach((c) => c && c.classList.remove("is-on"));
  if (noteEl) noteEl.textContent = "";
}
function playHero() {
  if (reduce) {
    resetHero();
    return;
  }
  clearBag(heroBag);
  heroPlaying = true;
  Object.values(chips).forEach((c) => c && c.classList.remove("is-on"));
  const notes = langNotes();
  CHIP_ORDER.forEach((key, i) => {
    later(i * 900, () => {
      Object.values(chips).forEach((c) => c && c.classList.remove("is-on"));
      chips[key]?.classList.add("is-on");
      if (noteEl) noteEl.textContent = notes[i] || "";
    }, heroBag);
  });
  later(CHIP_ORDER.length * 900 + 400, () => {
    Object.values(chips).forEach((c) => c && c.classList.remove("is-on"));
    if (noteEl) noteEl.textContent = "";
    heroPlaying = false;
  }, heroBag);
}
function pauseHero() {
  if (!heroPlaying) return;
  resetHero();
}
document.getElementById("hero-replay")?.addEventListener("click", () => {
  playHero();
});

/* ── Project clips (playhead only, titles stay as written) ── */
function setupClip(article) {
  const btn = article.querySelector(".play");
  const ph = article.querySelector(".playhead");
  const tc = article.querySelector(".tc");
  const segs = [...article.querySelectorAll(".seg")];
  const bag = new Set();
  let raf = 0;
  let start = 0;
  let playing = false;
  const DUR = 6000;
  const fmt = (ms) => `00:00:${String(Math.min(6, Math.floor(ms / 1000))).padStart(2, "0")}`;

  function stop() {
    playing = false;
    cancelAnimationFrame(raf);
    clearBag(bag);
    if (btn) {
      btn.textContent = "▶";
      const label = btn.getAttribute("aria-label") || "";
      btn.setAttribute("aria-label", label.replace("Пауза:", "Воспроизвести"));
    }
  }
  function frame(now) {
    if (!start) start = now;
    const t = Math.min(DUR, now - start);
    const p = t / DUR;
    if (ph) ph.style.left = `${p * 100}%`;
    if (tc) tc.textContent = fmt(t);
    segs.forEach((seg, i) => {
      const delay = 400 + i * 900;
      const w = Math.max(0, Math.min(1, (t - delay) / 1800));
      seg.style.width = `${w * (40 + i * 6)}%`;
    });
    if (t < DUR && playing) raf = requestAnimationFrame(frame);
    else {
      stop();
      if (ph) ph.style.left = "100%";
      segs.forEach((seg, i) => { seg.style.width = `${44 + i * 4}%`; });
    }
  }
  function play() {
    if (reduce) return;
    stop();
    playing = true;
    start = 0;
    if (btn) {
      btn.textContent = "❚❚";
      const label = btn.getAttribute("aria-label") || "";
      btn.setAttribute("aria-label", label.replace("Воспроизвести", "Пауза:"));
    }
    segs.forEach((seg) => { seg.style.width = "0"; });
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    if (!playing) return;
    stop();
    if (ph) ph.style.left = "0";
  }
  btn?.addEventListener("click", () => {
    if (playing) pause();
    else play();
  });
  return { play, pause, el: article, get playing() { return playing; } };
}
const clips = [...document.querySelectorAll(".clip")].map(setupClip);

/* ── Approach desks: highlight in sequence ── */
const desksRoot = document.getElementById("desks");
const approachDesks = desksRoot
  ? [...desksRoot.querySelectorAll("[data-desk]")]
  : [];
const teamBag = new Set();
let teamPlaying = false;

function teamStatic() {
  approachDesks.forEach((d) => d.classList.remove("is-on"));
}
function playTeam() {
  if (!approachDesks.length || reduce) {
    teamStatic();
    return;
  }
  clearBag(teamBag);
  teamPlaying = true;
  approachDesks.forEach((d) => d.classList.remove("is-on"));
  approachDesks.forEach((d, i) => {
    later(i * 800, () => {
      approachDesks.forEach((x) => x.classList.remove("is-on"));
      d.classList.add("is-on");
    }, teamBag);
  });
  later(approachDesks.length * 800 + 600, () => {
    approachDesks.forEach((d) => d.classList.remove("is-on"));
    teamPlaying = false;
  }, teamBag);
}
function pauseTeam() {
  if (!teamPlaying) return;
  clearBag(teamBag);
  teamPlaying = false;
  teamStatic();
}

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
          if (e.target.id === "approach") {
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
  const approach = document.getElementById("approach");
  if (approach) io.observe(approach);
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
