/**
 * About Page  —  app/about/page.js  →  /about
 */
module.exports = function AboutPage() {
  return {
    tag: 'div',
    props: { className: 'page-section' },
    children: [
      { tag: 'h1', props: {}, children: ['About LUNA'] },
      {
        tag: 'p', props: {}, children: [
          'LUNA is a Universal JavaScript Operating Runtime — a unified platform that brings together backend, frontend, mobile, desktop, edge, and distributed systems into one cohesive architecture. Write JavaScript once, deploy everywhere with zero platform friction.'
        ]
      },

      // Stats
      {
        tag: 'div',
        props: { className: 'about-stats' },
        children: [
          {
            tag: 'div', props: { className: 'stat-item' }, children: [
              { tag: 'span', props: { className: 'stat-number' }, children: ['6'] },
              { tag: 'span', props: { className: 'stat-label' }, children: ['Platform Targets'] }
            ]
          },
          {
            tag: 'div', props: { className: 'stat-item' }, children: [
              { tag: 'span', props: { className: 'stat-number' }, children: ['0'] },
              { tag: 'span', props: { className: 'stat-label' }, children: ['Dependencies'] }
            ]
          },
          {
            tag: 'div', props: { className: 'stat-item' }, children: [
              { tag: 'span', props: { className: 'stat-number' }, children: ['20+'] },
              { tag: 'span', props: { className: 'stat-label' }, children: ['Subsystems'] }
            ]
          },
          {
            tag: 'div', props: { className: 'stat-item' }, children: [
              { tag: 'span', props: { className: 'stat-number' }, children: ['MIT'] },
              { tag: 'span', props: { className: 'stat-label' }, children: ['License'] }
            ]
          }
        ]
      },

      { tag: 'h2', props: {}, children: ['Why LUNA?'] },
      {
        tag: 'p', props: {}, children: [
          'Modern JavaScript development is fragmented. Different runtimes for the server, different frameworks for the browser, separate toolchains for mobile and desktop. LUNA eliminates this fragmentation by providing a single runtime that targets every platform natively.'
        ]
      },
      {
        tag: 'p', props: {}, children: [
          'With zero external dependencies, the entire runtime is self-contained — from HTTP serving and routing to virtual DOM rendering and reactive state management. Everything works together out of the box.'
        ]
      },

      { tag: 'h2', props: {}, children: ['Core Capabilities'] },
      {
        tag: 'ul',
        props: { className: 'about-features' },
        children: [
          { tag: 'li', props: {}, children: ['⚙ LunaEngine — Lifecycle hooks, error boundaries, metrics, extensions'] },
          { tag: 'li', props: {}, children: ['⚡ Priority Scheduler — Lock-free queues, worker pools, 5 priority levels'] },
          { tag: 'li', props: {}, children: ['🔒 Sandbox — Capability-based security: fs, net, env, process, ffi, gpu, camera'] },
          { tag: 'li', props: {}, children: ['🌐 Networking — HTTP server, radix-tree router, middleware, WebSocket, SSE'] },
          { tag: 'li', props: {}, children: ['🎨 UI Rendering — Virtual DOM, reactive signals, SSR/SSG/ISR, 5 hydration strategies'] },
          { tag: 'li', props: {}, children: ['📱 Mobile Bridge — Camera, GPS, biometrics, push notifications, GPU acceleration'] },
          { tag: 'li', props: {}, children: ['🖥 Desktop Shell — Window management, menus, system tray, keyboard shortcuts'] },
          { tag: 'li', props: {}, children: ['☁ Edge Runtime — Regional deploy, distributed cache, KV store, geo-routing'] },
          { tag: 'li', props: {}, children: ['📦 LPM — Built-in package manager with registry, semver, lockfiles, templates'] },
          { tag: 'li', props: {}, children: ['🔮 Quantum State Rendering — Unified live-state graph across all platforms'] },
          { tag: 'li', props: {}, children: ['🧠 Self-Evolving Optimizer — Auto-detects hot paths and memoizes pure functions'] },
          { tag: 'li', props: {}, children: ['🔄 Universal Code Continuity — Platform-adaptive modules with state portability'] }
        ]
      },

      { tag: 'h2', props: {}, children: ['Open Source'] },
      {
        tag: 'p', props: {}, children: [
          'LUNA is open source under the MIT License. Contributions are welcome — whether it\'s bug reports, feature requests, documentation improvements, or code contributions.'
        ]
      },
      {
        tag: 'p', props: {}, children: [
          { tag: 'a', props: { href: 'https://github.com/jayanthansenthilkumar/Luna', className: 'btn btn-primary', style: 'margin-top:0.5rem' }, children: ['View on GitHub →'] }
        ]
      }
    ]
  };
};
