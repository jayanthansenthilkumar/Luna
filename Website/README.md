# LUNA Framework — Official Website

The official marketing site and documentation for [LUNA](https://github.com/jayanthansenthilkumar/Luna), the Universal JavaScript Operating Runtime.

## Getting Started

```bash
cd Website
luna dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, features, platforms, code examples, CLI |
| `/about` | About LUNA — stats, feature list, open source |
| `/blog` | Blog index — 6 articles on LUNA topics |
| `/blog/:slug` | Individual blog posts |
| `/docs` | Documentation index with sidebar navigation |
| `/docs/installation` | Installation guide |
| `/docs/quickstart` | 5-step quick start |
| `/docs/project-structure` | Directory layout conventions |
| `/docs/core` | Engine & lifecycle hooks |
| `/docs/scheduler` | Priority scheduler |
| `/docs/sandbox` | Capability-based security |
| `/docs/system-api` | Unified system API |
| `/docs/networking` | HTTP server & clustering |
| `/docs/routing` | Radix-tree router |
| `/docs/middleware` | Built-in & custom middleware |
| `/docs/websocket` | WebSocket server with rooms |
| `/docs/streaming` | SSE & HTTP streaming |
| `/docs/ui` | Virtual DOM engine |
| `/docs/reactive-state` | Signals, computed, effects, stores |
| `/docs/ssr` | SSR / SSG / ISR strategies |
| `/docs/hydration` | 5 hydration strategies |
| `/docs/ui-router` | File-based page router |
| `/docs/platforms` | Platform targets overview |
| `/docs/mobile` | Mobile Bridge (iOS / Android) |
| `/docs/desktop` | Desktop Shell (macOS / Win / Linux) |
| `/docs/edge` | Edge Runtime |
| `/docs/qsr` | Quantum State Reconciliation |
| `/docs/optimizer` | Self-Evolving Optimizer |
| `/docs/ucc` | Universal Code Continuity |
| `/docs/cli` | CLI reference (13 commands) |
| `/docs/lpm` | Luna Package Manager |
| `/docs/build` | Build system |
| `/docs/configuration` | luna.json & luna.config.js |

## Project Structure

```
Website/
├── app/
│   ├── layout.js           # Root layout (navbar + footer)
│   ├── page.js             # Landing page
│   ├── globals.css          # Global styles (dark theme)
│   ├── loading.js           # Loading spinner
│   ├── not-found.js         # 404 page
│   ├── error.js             # Error boundary
│   ├── about/page.js        # About page
│   ├── blog/
│   │   ├── page.js          # Blog index
│   │   └── [slug]/page.js   # Blog posts
│   ├── docs/
│   │   ├── page.js          # Docs index + shared sidebar
│   │   ├── installation/    # ... 27 sub-pages
│   │   └── ...
│   └── api/
│       ├── hello/route.js
│       └── health/route.js
├── components/
│   ├── Button.js
│   └── Card.js
├── lib/utils.js
├── public/
├── luna.json
└── luna.config.js
```

## Commands

| Command | Description |
|---------|-------------|
| `luna dev` | Start development server with HMR |
| `luna start` | Start production server |
| `luna build` | Build for deployment |
| `luna build --target web` | Build web bundle |
| `luna fetch <pkg>` | Install a package |
| `luna test` | Run tests |

## Learn More

- [LUNA GitHub](https://github.com/jayanthansenthilkumar/Luna)
- [LUNA Runtime Source](../src/)
