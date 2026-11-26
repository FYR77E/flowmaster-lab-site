# Flowmaster Lab

Личный сайт-визитка [flowmaster-lab.com](https://flowmaster-lab.com).  
Первый экран — «прямой эфир» (черновик режут до одной фразы), проекты — как клипы SmartPlayer, команда — диспетчерская агентов.

Тексты и проекты на странице пока **примерные**. Деплой на свой домен и DNS — только по решению владельца.

Черновик для проверки на GitHub Pages: [https://fyr77e.github.io/flowmaster-lab-site/](https://fyr77e.github.io/flowmaster-lab-site/). Тексты пока примерные. Кастомный домен не подключён.


## Требования

- Node.js 20+

## Команды

```bash
npm install
npm run dev       # локальный сервер, http://localhost:5173/flowmaster-lab-site/
npm run build     # статическая сборка в dist/
npm run preview   # проверка сборки, http://localhost:4173
```

Готовый сайт собирается в `dist/`. На GitHub Pages он публикуется автоматически из ветки `main` (workflow «Deploy to GitHub Pages»).

## Стек

- HTML, CSS, JS без UI-библиотек
- Сборка: Vite, `base: '/flowmaster-lab-site/'` (адрес GitHub Pages)
- Шрифты: self-hosted woff2 (Unbounded, Source Serif 4, IBM Plex Mono), кириллица + латиница, `font-display: swap`
- Без Google Fonts и без CDN

## Доступность и устройства

- Контент виден без JavaScript; анимация — прогрессивное улучшение
- `prefers-reduced-motion`: сразу финальный красивый кадр
- Светлая и тёмная тема по системе
- Safe-area для iPhone, фокус с клавиатуры, контраст WCAG AA, семантика, `lang="ru"`

## Что нужно от владельца

Живые тексты, фото, описание реальных проектов, подтверждение почты `hello@flowmaster-lab.com` (или другое имя ящика) и «да» на деплой и DNS.
