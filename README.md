# Михаил Бровкин

Личный сайт Product Engineer: B2B и Digital Signage, Москва.  
Тестовая публикация на GitHub Pages: [https://fyr77e.github.io/flowmaster-lab-site/](https://fyr77e.github.io/flowmaster-lab-site/). Кастомный домен не подключён.

## Требования

- Node.js 20+

## Команды

```bash
npm install
npm run dev       # http://localhost:5173/flowmaster-lab-site/
npm run build
npm run preview   # http://localhost:4173
```

Сайт собирается в `dist/` и публикуется на GitHub Pages из ветки `main` (workflow «Deploy to GitHub Pages»).

## Стек

- HTML, CSS, JS без UI-библиотек
- Сборка: Vite, `base: '/flowmaster-lab-site/'`
- Шрифты: self-hosted woff2 (Unbounded, Source Serif 4, IBM Plex Mono), кириллица + латиница, `font-display: swap`
- Без Google Fonts и без CDN
