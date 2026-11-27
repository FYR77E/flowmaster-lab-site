# Михаил Бровкин

Личный сайт Product Engineer: B2B и Digital Signage, Москва.  
Публикация: [https://flowmaster-lab.com](https://flowmaster-lab.com).

## Требования

- Node.js 20+

## Команды

```bash
npm install
npm run dev       # http://localhost:5173/
npm run build
npm run preview   # http://localhost:4173/
```

Сайт собирается в `dist/` и публикуется на GitHub Pages из ветки `main` (workflow «Deploy to GitHub Pages»). Префикс путей задаётся переменной `SITE_BASE` (сейчас `/`, под домен `flowmaster-lab.com`).

## Стек

- HTML, CSS, JS без UI-библиотек
- Сборка: Vite, `base` из `SITE_BASE` (по умолчанию `/`)
- Шрифты: self-hosted woff2 (Unbounded, Source Serif 4, IBM Plex Mono), кириллица + латиница, `font-display: swap`
- Без Google Fonts и без CDN
