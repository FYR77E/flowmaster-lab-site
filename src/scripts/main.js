const root = document.documentElement;
const reduce = root.classList.contains("rm");
const noSda = root.classList.contains("nosda");

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

/* ---------- language ---------- */
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
}
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});

/* ---------- mobile menu ---------- */
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
  if (window.innerWidth > 880) setNav(false);
});

setLang(currentLang());

/* ---------- manifesto: split into words that light up on scroll ---------- */
const wordSets = [];
document.querySelectorAll("[data-words]").forEach((p) => {
  const words = p.textContent.trim().split(/[ \t\r\n]+/); // keep non-breaking spaces inside words
  const n = words.length;
  p.textContent = "";
  const spans = words.map((t, k) => {
    const s = 8 + (78 * k) / n;
    const e = s + 78 / n + 3;
    const span = document.createElement("span");
    span.className = "w";
    span.style.setProperty("--s", `${s.toFixed(1)}%`);
    span.style.setProperty("--e", `${e.toFixed(1)}%`);
    span.dataset.at = String(s / 100);
    span.textContent = `${t} `;
    p.appendChild(span);
    return span;
  });
  wordSets.push(spans);
});

/* ---------- fallback for browsers without scroll-driven animations ---------- */
if (reduce) {
  document.querySelectorAll(".w").forEach((w) => w.classList.add("on"));
} else if (noSda) {
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".rv, .zm").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".rv, .zm").forEach((el) => el.classList.add("is-in"));
  }

  const manifest = document.querySelector(".manifest");
  const track = document.getElementById("track");
  const trackLine = track?.querySelector(".track-line i");
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    if (manifest) {
      const r = manifest.getBoundingClientRect();
      const span = r.height - vh;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
      wordSets.forEach((spans) => {
        spans.forEach((w) => w.classList.toggle("on", p >= Number(w.dataset.at)));
      });
    }
    if (track && trackLine) {
      const r = track.getBoundingClientRect();
      const total = r.height + vh;
      const p = Math.min(1, Math.max(0, (vh - r.top) / total));
      const scaled = Math.min(1, Math.max(0, (p - 0.1) / 0.6));
      trackLine.style.setProperty("--p", scaled.toFixed(3));
    }
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}
