# Erdem İnterneti®

Unveil.fr ilham alınarak tasarlanmış, 3D kart destesi galerisine sahip minimalist portfolio sitesi.

## Tech Stack

- **Vite** — build tool
- **Three.js** — WebGL 3D rendering
- **GSAP** — sayfa geçişleri ve animasyonlar
- **Vanilla CSS** — sıfır framework

## Geliştirme

```bash
npm install
npm run dev
```

## Deploy

GitHub Actions otomatik deploy: `main` branch'e push → GitHub Pages

## Yapı

```
src/
├── main.js           # App entry point
├── style.css         # Global design system
├── data/projects.js  # Proje verileri
├── core/
│   ├── Router.js     # Hash-based SPA router
│   └── Cursor.js     # Custom cursor
├── three/
│   ├── Scene.js      # Three.js setup
│   └── CardDeck.js   # 3D kart destesi
├── pages/            # Sayfa component'leri
└── components/       # Nav, Transition
```

## vite.config.js — Base URL

GitHub repo adına göre güncelle:

```js
base: '/REPO-ADINIZ/'
```
