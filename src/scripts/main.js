const root = document.documentElement;
const reduce = root.classList.contains("rm");

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const header = document.getElementById("header");
const darkSections = document.querySelectorAll(".projects");

function updateHeader() {
  if (!header) return;
  const y = header.getBoundingClientRect().bottom + 16;
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

const progress = document.getElementById("scroll-progress");
function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  progress.style.width = `${p * 100}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

function currentLang() {
  return root.lang === "en" ? "en" : "ru";
}
function setLang(lang) {
  const next = lang === "en" ? "en" : "ru";
  root.lang = next;
  try { localStorage.setItem("fm-lang", next); } catch (e) { /* ignore */ }
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === next));
  });
  const nav = document.getElementById("site-nav");
  if (nav) nav.setAttribute("aria-label", next === "en" ? "Site sections" : "Разделы сайта");
  document.querySelectorAll(".nav-toggle").forEach((btn) => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-label", next === "en"
      ? (open ? "Close menu" : "Open menu")
      : (open ? "Закрыть меню" : "Открыть меню"));
  });
  refreshProcessLabel();
}
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

const navToggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
function setNav(open) {
  document.body.classList.toggle("nav-open", open);
  if (navToggle) {
    navToggle.setAttribute("aria-expanded", String(open));
    setLang(currentLang());
  }
}
navToggle?.addEventListener("click", () => {
  setNav(!document.body.classList.contains("nav-open"));
});
nav?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => setNav(false));
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setNav(false);
});
window.addEventListener("resize", () => {
  if (window.innerWidth >= 880) setNav(false);
});

const STAGES = {
  ru: [
    "Требования — собираю и оцениваю реализуемость.",
    "Прототип — собираю с помощью ИИ и проверяю сценарии.",
    "Ревью — один делает, другой проверяет.",
    "Пилот — настраиваю стенды и сопровождаю запуск.",
  ],
  en: [
    "Requirements — I gather them and assess feasibility.",
    "Prototype — I build it with AI tools and test the scenarios.",
    "Review — one builds, another reviews.",
    "Pilot — I set up test environments and run the rollout.",
  ],
};
const processEl = document.getElementById("process-line");
let processTimer = 0;
let processIdx = 0;

function refreshProcessLabel() {
  const el = document.getElementById("process-line");
  if (!el || typeof processIdx === "undefined") return;
  const list = STAGES[currentLang()];
  el.innerHTML = `<b>${list[processIdx % list.length]}</b>`;
}
function cycleProcess() {
  if (reduce || !document.getElementById("process-line")) {
    processIdx = 0;
    refreshProcessLabel();
    return;
  }
  processIdx = (processIdx + 1) % STAGES.ru.length;
  refreshProcessLabel();
}
function startProcess() {
  clearInterval(processTimer);
  processIdx = 0;
  refreshProcessLabel();
  if (reduce) return;
  processTimer = setInterval(cycleProcess, 2800);
}
function stopProcess() {
  clearInterval(processTimer);
}

setLang(currentLang());
if (document.getElementById("process-line")) startProcess();

if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-in");
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopProcess();
  else startProcess();
});
