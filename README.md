# Vansh Portfolio — urfd.net Clone

A personal portfolio website inspired by [urfd.net](https://urfd.net/), built with **React**, **TypeScript**, **Tailwind CSS v3**, and **Vite**.

## Pages

| Route | Description |
|-------|-------------|
| `#home` | Visual showcase — cycle through curated artworks with keyboard nav |
| `#writings` | Essays on design, creative engineering & minimalism |
| `#stuff` | Gallery / Index view of projects, experiments, hardware, visuals |
| `#guestbook` | Sign & like entries — persisted in localStorage |

## Features cloned from urfd.net

- **Parenthetical nav links** — `(Home)` wrapping on hover/active, inspired by urfd's `.op-link`
- **Logo hover reveal** — `vansh` → `Ur Friend ↗` crossfade on hover
- **Expandable About drawer** — Bio, live IST clock, social links hidden until toggled
- **Gallery hover dimming** — Hovering one card dims all others to 10% opacity
- **Index mode cursor preview** — Floating image follows the cursor in table view
- **Filename-style captions** — `hypercanvas_01.pic`, `shader_bloom.gif`, `aura_synth.app`
- **Tactile Web Audio micro-clicks** — Sound feedback on every interaction (mutable)
- **`::selection` lime tint** — Exact `#d2fd78` selection color from urfd.net

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Home |
| `2` | Writings |
| `3` | Stuff |
| `4` | Guestbook |
| `←` / `→` / `Space` | Cycle Home slides |
| `S` | Shuffle Stuff items |
| `M` | Toggle tactile audio |
| `Esc` | Close modals |

## Stack

- React 18 + TypeScript
- Tailwind CSS v3
- Vite 8
- Lucide React icons
- Canvas Confetti

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

*Inspired by Kevin Lam's [urfd.net](https://urfd.net/). All content, data and imagery are placeholder/demo.*
