# luna_site

Built with [LUNA](https://github.com/jayanthansenthilkumar/Luna) — Universal JavaScript Operating Runtime.

## Getting Started

```bash
cd luna_site
luna dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
luna_site/
├── app/                    # File-based routing
│   ├── layout.js           # Root layout (wraps all pages)
│   ├── page.js             # Home page  →  /
│   ├── globals.css          # Global stylesheet
│   ├── loading.js           # Loading state
│   ├── not-found.js         # 404 page
│   ├── error.js             # Error boundary
│   ├── about/
│   │   └── page.js          # About page  →  /about
│   ├── blog/
│   │   ├── page.js          # Blog index  →  /blog
│   │   └── [slug]/
│   │       └── page.js      # Blog post   →  /blog/:slug
│   └── api/
│       ├── hello/
│       │   └── route.js     # API route   →  GET/POST /api/hello
│       └── health/
│           └── route.js     # Health check →  GET /api/health
├── components/             # Reusable components
│   ├── Button.js
│   └── Card.js
├── lib/                    # Utility functions
│   └── utils.js
├── public/                 # Static files (served at root)
│   └── favicon.svg
├── luna.json               # Project manifest
└── luna.config.js          # Runtime configuration
```

## Routing Conventions

| File | Route |
|------|-------|
| `app/page.js` | `/` |
| `app/about/page.js` | `/about` |
| `app/blog/[slug]/page.js` | `/blog/:slug` |
| `app/api/hello/route.js` | `/api/hello` |

## Commands

| Command | Description |
|---------|-------------|
| `luna dev` | Start development server |
| `luna start` | Start production server |
| `luna build` | Build for deployment |
| `luna fetch <pkg>` | Install a package |
| `luna test` | Run tests |

## Learn More

- [LUNA Documentation](https://github.com/jayanthansenthilkumar/Luna)
