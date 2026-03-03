/**
 * Home Page  -  app/page.js  →  /
 * 
 * LUNA Framework Landing Page
 */
module.exports = function HomePage() {
  return {
    tag: 'div',
    props: { className: 'page home' },
    children: [
      // ── Hero Section ──
      {
        tag: 'section',
        props: { className: 'hero' },
        children: [
          {
            tag: 'div', props: { className: 'hero-badge' }, children: [
              { tag: 'span', props: {}, children: ['v0.1.0 - Now Open Source'] }
            ]
          },
          { tag: 'h1', props: {}, children: ['The Universal JavaScript', { tag: 'br', props: {}, children: [] }, 'Operating Runtime'] },
          {
            tag: 'p', props: { className: 'subtitle' }, children: [
              'Write JavaScript once - deploy everywhere. Backend, frontend, mobile, desktop, and edge unified in a single zero-dependency runtime.'
            ]
          },
          {
            tag: 'div',
            props: { className: 'hero-actions' },
            children: [
              { tag: 'a', props: { href: '/docs', className: 'btn btn-primary' }, children: ['Get Started →'] },
              { tag: 'a', props: { href: 'https://github.com/jayanthansenthilkumar/Luna', className: 'btn btn-secondary' }, children: ['View on GitHub'] }
            ]
          },
          {
            tag: 'div',
            props: { className: 'hero-code' },
            children: [
              {
                tag: 'div', props: { className: 'code-header' }, children: [
                  { tag: 'span', props: { className: 'code-dot red' }, children: [] },
                  { tag: 'span', props: { className: 'code-dot yellow' }, children: [] },
                  { tag: 'span', props: { className: 'code-dot green' }, children: [] },
                  { tag: 'span', props: { className: 'code-title' }, children: ['Terminal'] }
                ]
              },
              {
                tag: 'pre', props: { className: 'code-block' }, children: [
                  {
                    tag: 'code', props: {}, children: [
                      '$ npm i -g @luna/runtime\n$ luna create my-app\n$ cd my-app\n$ luna dev\n\n  ◐ LUNA v0.1.0\n  ✓ Server running at http://localhost:3000\n  ✓ HMR enabled - watching for changes'
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },

      // ── Platform Targets ──
      {
        tag: 'section',
        props: { className: 'platforms-section' },
        children: [
          { tag: 'h2', props: { className: 'section-title' }, children: ['One Codebase. Six Platforms.'] },
          {
            tag: 'p', props: { className: 'section-subtitle' }, children: [
              'LUNA adapts your code to every target environment automatically - no separate toolchains needed.'
            ]
          },
          {
            tag: 'div',
            props: { className: 'platform-grid' },
            children: [
              {
                tag: 'div', props: { className: 'platform-item' }, children: [
                  { tag: 'div', props: { className: 'platform-icon' }, children: ['⚙'] },
                  { tag: 'h4', props: {}, children: ['Backend'] },
                  { tag: 'p', props: {}, children: ['HTTP server, routing, middleware, WebSocket, SSE'] }
                ]
              },
              {
                tag: 'div', props: { className: 'platform-item' }, children: [
                  { tag: 'div', props: { className: 'platform-icon' }, children: ['🌐'] },
                  { tag: 'h4', props: {}, children: ['Web'] },
                  { tag: 'p', props: {}, children: ['SSR, SSG, ISR, Virtual DOM, reactive state, hydration'] }
                ]
              },
              {
                tag: 'div', props: { className: 'platform-item' }, children: [
                  { tag: 'div', props: { className: 'platform-icon' }, children: ['📱'] },
                  { tag: 'h4', props: {}, children: ['Mobile'] },
                  { tag: 'p', props: {}, children: ['Camera, GPS, biometrics, haptics, push notifications'] }
                ]
              },
              {
                tag: 'div', props: { className: 'platform-item' }, children: [
                  { tag: 'div', props: { className: 'platform-icon' }, children: ['🖥'] },
                  { tag: 'h4', props: {}, children: ['Desktop'] },
                  { tag: 'p', props: {}, children: ['Window management, menus, system tray, native dialogs'] }
                ]
              },
              {
                tag: 'div', props: { className: 'platform-item' }, children: [
                  { tag: 'div', props: { className: 'platform-icon' }, children: ['⚡'] },
                  { tag: 'h4', props: {}, children: ['Edge'] },
                  { tag: 'p', props: {}, children: ['Regional deploy, KV store, distributed cache, geo-routing'] }
                ]
              },
              {
                tag: 'div', props: { className: 'platform-item' }, children: [
                  { tag: 'div', props: { className: 'platform-icon' }, children: ['🔮'] },
                  { tag: 'h4', props: {}, children: ['QSR'] },
                  { tag: 'p', props: {}, children: ['Quantum State Rendering - unified live-state across targets'] }
                ]
              }
            ]
          }
        ]
      },

      // ── Core Features ──
      {
        tag: 'section',
        props: { className: 'features-section' },
        children: [
          { tag: 'h2', props: { className: 'section-title' }, children: ['Built for Modern JavaScript'] },
          {
            tag: 'p', props: { className: 'section-subtitle' }, children: [
              'Everything you need to build production applications - no external dependencies required.'
            ]
          },
          {
            tag: 'div',
            props: { className: 'features' },
            children: [
              {
                tag: 'div',
                props: { className: 'feature-card' },
                children: [
                  { tag: 'div', props: { className: 'feature-icon' }, children: ['🚀'] },
                  { tag: 'h3', props: {}, children: ['Zero Dependencies'] },
                  { tag: 'p', props: {}, children: ['The entire runtime is self-contained. No node_modules bloat - just pure JavaScript powering everything from HTTP to rendering.'] }
                ]
              },
              {
                tag: 'div',
                props: { className: 'feature-card' },
                children: [
                  { tag: 'div', props: { className: 'feature-icon' }, children: ['📁'] },
                  { tag: 'h3', props: {}, children: ['File-Based Routing'] },
                  { tag: 'p', props: {}, children: ['Next.js-style app/ directory. Pages become routes. API routes with route.js. Dynamic segments with [brackets]. Layouts propagate.'] }
                ]
              },
              {
                tag: 'div',
                props: { className: 'feature-card' },
                children: [
                  { tag: 'div', props: { className: 'feature-icon' }, children: ['🔒'] },
                  { tag: 'h3', props: {}, children: ['Sandboxed Execution'] },
                  { tag: 'p', props: {}, children: ['Capability-based security model. Modules declare permissions for fs, net, env, process, ffi, gpu, camera, and location access.'] }
                ]
              },
              {
                tag: 'div',
                props: { className: 'feature-card' },
                children: [
                  { tag: 'div', props: { className: 'feature-icon' }, children: ['⚡'] },
                  { tag: 'h3', props: {}, children: ['Priority Scheduler'] },
                  { tag: 'p', props: {}, children: ['Lock-free task queues with 5 priority levels: critical, high, normal, low, idle. Worker pools with configurable threads.'] }
                ]
              },
              {
                tag: 'div',
                props: { className: 'feature-card' },
                children: [
                  { tag: 'div', props: { className: 'feature-icon' }, children: ['🌊'] },
                  { tag: 'h3', props: {}, children: ['Streaming SSR'] },
                  { tag: 'p', props: {}, children: ['Server-side rendering with streaming, incremental static regeneration, and five hydration strategies including island-based.'] }
                ]
              },
              {
                tag: 'div',
                props: { className: 'feature-card' },
                children: [
                  { tag: 'div', props: { className: 'feature-icon' }, children: ['📦'] },
                  { tag: 'h3', props: {}, children: ['Built-in Package Manager'] },
                  { tag: 'p', props: {}, children: ['LPM (Luna Package Manager) with semver resolution, lockfiles, registry integration, and project scaffolding templates.'] }
                ]
              }
            ]
          }
        ]
      },

      // ── Three Differentiators ──
      {
        tag: 'section',
        props: { className: 'differentiators-section' },
        children: [
          { tag: 'h2', props: { className: 'section-title' }, children: ['What Makes LUNA Different'] },
          {
            tag: 'div',
            props: { className: 'diff-grid' },
            children: [
              {
                tag: 'div',
                props: { className: 'diff-card' },
                children: [
                  { tag: 'span', props: { className: 'diff-number' }, children: ['01'] },
                  { tag: 'h3', props: {}, children: ['Quantum State Rendering'] },
                  { tag: 'p', props: {}, children: ['A unified live-state graph where UI, backend, and edge state exist in superposition. Changes propagate instantly across every connected client and platform with automatic conflict resolution.'] }
                ]
              },
              {
                tag: 'div',
                props: { className: 'diff-card' },
                children: [
                  { tag: 'span', props: { className: 'diff-number' }, children: ['02'] },
                  { tag: 'h3', props: {}, children: ['Self-Evolving Optimizer'] },
                  { tag: 'p', props: {}, children: ['The runtime observes execution patterns at runtime, detects hot paths, auto-memoizes pure functions, and dynamically adapts scheduling - your app gets faster the longer it runs.'] }
                ]
              },
              {
                tag: 'div',
                props: { className: 'diff-card' },
                children: [
                  { tag: 'span', props: { className: 'diff-number' }, children: ['03'] },
                  { tag: 'h3', props: {}, children: ['Universal Code Continuity'] },
                  { tag: 'p', props: {}, children: ['One execution fabric where platform-adaptive modules let you write a single function that automatically adapts to backend, web, mobile, desktop, or edge - with context migration and state portability.'] }
                ]
              }
            ]
          }
        ]
      },

      // ── Code Example Section ──
      {
        tag: 'section',
        props: { className: 'code-section' },
        children: [
          { tag: 'h2', props: { className: 'section-title' }, children: ['Simple, Powerful API'] },
          {
            tag: 'p', props: { className: 'section-subtitle' }, children: [
              'Build full-stack applications with a clean, intuitive API - no boilerplate.'
            ]
          },
          {
            tag: 'div',
            props: { className: 'code-examples' },
            children: [
              {
                tag: 'div',
                props: { className: 'code-example' },
                children: [
                  { tag: 'h4', props: {}, children: ['HTTP Server + Routing'] },
                  {
                    tag: 'div', props: { className: 'hero-code' }, children: [
                      {
                        tag: 'div', props: { className: 'code-header' }, children: [
                          { tag: 'span', props: { className: 'code-dot red' }, children: [] },
                          { tag: 'span', props: { className: 'code-dot yellow' }, children: [] },
                          { tag: 'span', props: { className: 'code-dot green' }, children: [] },
                          { tag: 'span', props: { className: 'code-title' }, children: ['server.js'] }
                        ]
                      },
                      {
                        tag: 'pre', props: { className: 'code-block' }, children: [
                          {
                            tag: 'code', props: {}, children: [
                              "const { createApp } = require('@luna/runtime');\nconst app = createApp();\n\nawait app.init();\n\napp.router.get('/api/users', async (req, res) => {\n  res.json({ users: await db.getAll() });\n});\n\napp.router.post('/api/users', async (req, res) => {\n  const user = await db.create(req.body);\n  res.status(201).json(user);\n});\n\nawait app.listen(3000);"
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                tag: 'div',
                props: { className: 'code-example' },
                children: [
                  { tag: 'h4', props: {}, children: ['Reactive State + UCC'] },
                  {
                    tag: 'div', props: { className: 'hero-code' }, children: [
                      {
                        tag: 'div', props: { className: 'code-header' }, children: [
                          { tag: 'span', props: { className: 'code-dot red' }, children: [] },
                          { tag: 'span', props: { className: 'code-dot yellow' }, children: [] },
                          { tag: 'span', props: { className: 'code-dot green' }, children: [] },
                          { tag: 'span', props: { className: 'code-title' }, children: ['state.js'] }
                        ]
                      },
                      {
                        tag: 'pre', props: { className: 'code-block' }, children: [
                          {
                            tag: 'code', props: {}, children: [
                              "const { Signal, Computed } = require('@luna/runtime');\n\nconst count = new Signal(0);\nconst doubled = new Computed(() => count.value * 2);\n\n// Universal Code Continuity\napp.ucc.module('storage')\n  .define({ save: (data) => data })\n  .platform('backend', {\n    save: (data) => fs.writeFileSync('/tmp/d', data)\n  })\n  .platform('web', {\n    save: (data) => localStorage.setItem('d', data)\n  });"
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },

      // ── Architecture Overview ──
      {
        tag: 'section',
        props: { className: 'architecture-section' },
        children: [
          { tag: 'h2', props: { className: 'section-title' }, children: ['Architecture'] },
          {
            tag: 'p', props: { className: 'section-subtitle' }, children: [
              'A layered runtime with pluggable subsystems - each component works independently or as part of the whole.'
            ]
          },
          {
            tag: 'div',
            props: { className: 'hero-code arch-diagram' },
            children: [
              {
                tag: 'pre', props: { className: 'code-block' }, children: [
                  {
                    tag: 'code', props: {}, children: [
                      '┌──────────────────────────────────────────────────────┐\n│                     LUNA Runtime                      │\n├────────┬────────┬────────┬────────┬────────┬─────────┤\n│Backend │  Web   │ Mobile │Desktop │  Edge  │   QSR   │\n│ Engine │   UI   │ Bridge │ Shell  │Runtime │  State  │\n├────────┴────────┴────────┴────────┴────────┴─────────┤\n│                    Core Layer                         │\n│  Engine │ Scheduler │ Sandbox │ System API │ Modules  │\n├──────────────────────────────────────────────────────┤\n│                Build & Deployment                     │\n│  Bundler │ Minifier │ Asset Pipeline │ Multi-target   │\n├──────────────────────────────────────────────────────┤\n│              Package Manager (LPM)                    │\n│  Registry │ Resolver │ Lockfile │ SemVer │ Templates  │\n└──────────────────────────────────────────────────────┘'
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },

      // ── CLI Commands ──
      {
        tag: 'section',
        props: { className: 'cli-section' },
        children: [
          { tag: 'h2', props: { className: 'section-title' }, children: ['Powerful CLI'] },
          {
            tag: 'p', props: { className: 'section-subtitle' }, children: [
              'A full command-line interface for every workflow - from scaffolding to deployment.'
            ]
          },
          {
            tag: 'div',
            props: { className: 'cli-grid' },
            children: [
              {
                tag: 'div', props: { className: 'cli-item' }, children: [
                  { tag: 'code', props: {}, children: ['luna create my-app'] },
                  { tag: 'span', props: {}, children: ['Scaffold a new project from templates'] }
                ]
              },
              {
                tag: 'div', props: { className: 'cli-item' }, children: [
                  { tag: 'code', props: {}, children: ['luna dev'] },
                  { tag: 'span', props: {}, children: ['Start dev server with HMR'] }
                ]
              },
              {
                tag: 'div', props: { className: 'cli-item' }, children: [
                  { tag: 'code', props: {}, children: ['luna build web mobile'] },
                  { tag: 'span', props: {}, children: ['Multi-target builds'] }
                ]
              },
              {
                tag: 'div', props: { className: 'cli-item' }, children: [
                  { tag: 'code', props: {}, children: ['luna fetch express'] },
                  { tag: 'span', props: {}, children: ['Install packages via LPM'] }
                ]
              },
              {
                tag: 'div', props: { className: 'cli-item' }, children: [
                  { tag: 'code', props: {}, children: ['luna test'] },
                  { tag: 'span', props: {}, children: ['Run the test suite'] }
                ]
              },
              {
                tag: 'div', props: { className: 'cli-item' }, children: [
                  { tag: 'code', props: {}, children: ['luna publish'] },
                  { tag: 'span', props: {}, children: ['Publish to Luna registry'] }
                ]
              }
            ]
          }
        ]
      },

      // ── CTA Section ──
      {
        tag: 'section',
        props: { className: 'cta-section' },
        children: [
          { tag: 'h2', props: {}, children: ['Ready to Build the Future?'] },
          { tag: 'p', props: {}, children: ['Get started with LUNA in under 60 seconds.'] },
          {
            tag: 'div',
            props: { className: 'hero-actions' },
            children: [
              { tag: 'a', props: { href: '/docs', className: 'btn btn-primary' }, children: ['Read the Docs →'] },
              { tag: 'a', props: { href: 'https://github.com/jayanthansenthilkumar/Luna', className: 'btn btn-secondary' }, children: ['Star on GitHub'] }
            ]
          }
        ]
      }
    ]
  };
};
