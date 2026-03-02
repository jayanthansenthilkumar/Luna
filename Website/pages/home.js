/**
 * LUNA Landing Page – Home
 * 
 * All UI built with Luna's h() VNode factory and .toHTML() SSR.
 */

'use strict';

const { h } = require('../../src/ui/engine');

// ── Helpers ────────────────────────────────────────

function icon(svg) {
  return h('span', { className: 'icon', 'aria-hidden': 'true' }, h('RAW', null, svg));
}

// ── Layout ─────────────────────────────────────────

function Layout(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="LUNA – Universal JavaScript Operating Runtime. One Language. One Runtime. Every Platform.">
  <link rel="stylesheet" href="/static/style.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  ${body}
  <script>
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Animate elements on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Stats counter animation
    function animateCounter(el, target) {
      let current = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current.toLocaleString();
      }, 16);
    }
    document.querySelectorAll('[data-count]').forEach(el => {
      observer.observe(el);
      el.addEventListener('transitionend', () => {
        const target = parseInt(el.dataset.count);
        if (target) animateCounter(el, target);
      }, { once: true });
    });
  </script>
</body>
</html>`;
}

// ── Sections ───────────────────────────────────────

function Nav() {
  return h('nav', { className: 'nav' },
    h('div', { className: 'nav-inner' },
      h('a', { href: '/', className: 'nav-logo' },
        h('span', { className: 'logo-icon' }, '🌙'),
        h('span', { className: 'logo-text' }, 'LUNA')
      ),
      h('div', { className: 'nav-links' },
        h('a', { href: '#features' }, 'Features'),
        h('a', { href: '#platforms' }, 'Platforms'),
        h('a', { href: '#code' }, 'Code'),
        h('a', { href: '#architecture' }, 'Architecture'),
        h('a', { href: '/docs' }, 'Docs')
      ),
      h('div', { className: 'nav-actions' },
        h('a', { href: 'https://github.com/jayanthansenthilkumar/Luna', className: 'btn btn-ghost', target: '_blank' }, 'GitHub'),
        h('a', { href: '#get-started', className: 'btn btn-primary' }, 'Get Started')
      )
    )
  );
}

function Hero() {
  return h('section', { className: 'hero' },
    h('div', { className: 'hero-bg' }),
    h('div', { className: 'hero-content' },
      h('div', { className: 'hero-badge fade-in' },
        h('span', { className: 'badge-dot' }),
        h('span', null, 'v0.1.0 — Now Available')
      ),
      h('h1', { className: 'hero-title fade-in' },
        h('span', { className: 'hero-line' }, 'One Language.'),
        h('span', { className: 'hero-line gradient' }, 'One Runtime.'),
        h('span', { className: 'hero-line' }, 'Every Platform.')
      ),
      h('p', { className: 'hero-subtitle fade-in' },
        'LUNA is a universal JavaScript operating runtime that unifies backend, frontend, mobile, desktop, and edge into a single cohesive architecture. Write once — deploy everywhere with zero friction.'
      ),
      h('div', { className: 'hero-actions fade-in' },
        h('a', { href: '#get-started', className: 'btn btn-primary btn-lg' },
          h('span', null, 'Get Started'),
          h('span', { className: 'btn-arrow' }, '→')
        ),
        h('div', { className: 'code-snippet' },
          h('code', null, 'npx luna create my-app')
        )
      ),
      h('div', { className: 'hero-stats fade-in' },
        h('div', { className: 'stat' },
          h('span', { className: 'stat-value' }, '0'),
          h('span', { className: 'stat-label' }, 'Dependencies')
        ),
        h('div', { className: 'stat' },
          h('span', { className: 'stat-value' }, '25+'),
          h('span', { className: 'stat-label' }, 'Modules')
        ),
        h('div', { className: 'stat' },
          h('span', { className: 'stat-value' }, '5'),
          h('span', { className: 'stat-label' }, 'Platforms')
        ),
        h('div', { className: 'stat' },
          h('span', { className: 'stat-value' }, '58'),
          h('span', { className: 'stat-label' }, 'Tests Passing')
        )
      )
    )
  );
}

function Features() {
  const features = [
    {
      icon: '⚡',
      title: 'Core Engine',
      desc: 'Lock-free scheduler, capability-based sandbox, lifecycle hooks, and native OS APIs — the bedrock of every LUNA application.',
      tags: ['Scheduler', 'Sandbox', 'System API']
    },
    {
      icon: '🌐',
      title: 'Networking',
      desc: 'Built-in HTTP server with clustering, radix-tree router, middleware pipeline, WebSocket rooms, and Server-Sent Events.',
      tags: ['HTTP/2', 'WebSocket', 'SSE', 'Streaming']
    },
    {
      icon: '🎨',
      title: 'UI Rendering',
      desc: 'Custom Virtual DOM with diffing, signals-based reactivity, SSR/SSG/ISR, and five hydration strategies from full to island-based.',
      tags: ['VDOM', 'Signals', 'SSR', 'Hydration']
    },
    {
      icon: '📱',
      title: 'Mobile Bridge',
      desc: 'Access camera, GPS, notifications, biometrics, and haptics through a unified native API layer with shared-memory bridge.',
      tags: ['Camera', 'GPS', 'Biometrics', 'Haptics']
    },
    {
      icon: '🖥️',
      title: 'Desktop Shell',
      desc: 'Native window management, menus, system tray, dialogs, keyboard shortcuts — all from JavaScript.',
      tags: ['Windows', 'Menus', 'Tray', 'Shortcuts']
    },
    {
      icon: '🌍',
      title: 'Edge Runtime',
      desc: 'Deploy functions to global regions with geo-routing, distributed KV store, LRU cache, and vector-clock state sync.',
      tags: ['Geo-routing', 'KV Store', 'Distributed']
    }
  ];

  return h('section', { id: 'features', className: 'section features' },
    h('div', { className: 'container' },
      h('div', { className: 'section-header fade-in' },
        h('span', { className: 'section-label' }, 'Features'),
        h('h2', { className: 'section-title' }, 'Everything you need. Nothing you don\'t.'),
        h('p', { className: 'section-desc' }, 'Every subsystem is built from scratch in pure JavaScript with zero external dependencies.')
      ),
      h('div', { className: 'features-grid' },
        ...features.map((f, i) =>
          h('div', { className: `feature-card fade-in`, style: `--delay: ${i * 0.1}s` },
            h('div', { className: 'feature-icon' }, f.icon),
            h('h3', { className: 'feature-title' }, f.title),
            h('p', { className: 'feature-desc' }, f.desc),
            h('div', { className: 'feature-tags' },
              ...f.tags.map(t => h('span', { className: 'tag' }, t))
            )
          )
        )
      )
    )
  );
}

function Platforms() {
  const platforms = [
    { name: 'Backend', icon: '🟢', desc: 'Node.js server with clustering, streaming, and native OS APIs' },
    { name: 'Web', icon: '🔵', desc: 'SSR + hydrated SPA with VDOM, signals, and island architecture' },
    { name: 'Mobile', icon: '🟣', desc: 'Native bridge to camera, GPS, biometrics, haptics, and GPU' },
    { name: 'Desktop', icon: '🟠', desc: 'Window management, system tray, menus, dialogs, shortcuts' },
    { name: 'Edge', icon: '🔴', desc: 'Global deployment with geo-routing, KV store, and distributed cache' }
  ];

  return h('section', { id: 'platforms', className: 'section platforms' },
    h('div', { className: 'container' },
      h('div', { className: 'section-header fade-in' },
        h('span', { className: 'section-label' }, 'Platforms'),
        h('h2', { className: 'section-title' }, 'Write once. Run everywhere.'),
        h('p', { className: 'section-desc' }, 'The same JavaScript runs identically across five deployment targets with platform-adaptive code continuity.')
      ),
      h('div', { className: 'platform-flow fade-in' },
        ...platforms.map((p, i) =>
          h('div', { className: 'platform-node' },
            h('div', { className: 'platform-icon-wrap' },
              h('span', { className: 'platform-icon' }, p.icon)
            ),
            h('div', { className: 'platform-info' },
              h('h4', null, p.name),
              h('p', null, p.desc)
            ),
            i < platforms.length - 1 ? h('div', { className: 'platform-connector' }) : null
          )
        )
      )
    )
  );
}

function CodeShowcase() {
  const example1 = `const { createApp } = require('@luna/runtime');
const { h } = require('@luna/runtime/ui');
const { Signal } = require('@luna/runtime/state');

const app = createApp();
await app.init();

// Reactive state
const count = new Signal(0);

// Server route
app.get('/api/count', (req, res) =&gt; {
  res.json({ count: count.value });
});

// SSR component
app.get('/', (req, res) =&gt; {
  const page = h('div', { className: 'app' },
    h('h1', null, 'Hello from LUNA'),
    h('p', null, \`Count: \${count.value}\`)
  );
  res.html(page.toHTML());
});

await app.listen(3000);`;

  const example2 = `// Quantum State — syncs everywhere instantly
app.qsr.set('user', { name: 'Luna', theme: 'dark' });

app.qsr.subscribe('user', (value) =&gt; {
  console.log('State changed:', value);
  // Triggers on backend, web, mobile, edge
});

// Derived state
app.qsr.derive('greeting', ['user'], (user) =&gt;
  \`Hello, \${user.name}!\`
);

// Snapshot &amp; time-travel
const snap = app.qsr.snapshot();
app.qsr.set('user', { name: 'Nova' });
app.qsr.restore(snap); // back to 'Luna'`;

  const example3 = `// Self-Evolving Optimizer
const compute = app.optimizer.observe('heavy',
  (data) =&gt; data.map(x =&gt; x * x).filter(x =&gt; x &gt; 100)
);

// After 100+ calls, auto-detected as hot path
// After 50+ calls, auto-memoized if pure
compute([1, 2, 3, 11, 12, 13]);

// Universal Code Continuity
app.ucc.module('storage')
  .define({ save: (d) =&gt; d })
  .platform('backend', {
    save: (d) =&gt; fs.writeFileSync('/data', d)
  })
  .platform('web', {
    save: (d) =&gt; localStorage.setItem('d', d)
  });

const storage = app.ucc.getModule('storage');
storage.save('cross-platform!');`;

  return h('section', { id: 'code', className: 'section code-section' },
    h('div', { className: 'container' },
      h('div', { className: 'section-header fade-in' },
        h('span', { className: 'section-label' }, 'Developer Experience'),
        h('h2', { className: 'section-title' }, 'Clean, powerful, intuitive.'),
        h('p', { className: 'section-desc' }, 'APIs designed to feel natural. No boilerplate. No ceremony.')
      ),
      h('div', { className: 'code-tabs fade-in' },
        h('div', { className: 'code-tab-headers' },
          h('button', { className: 'code-tab active', 'data-tab': 'tab1' }, 'Server + UI'),
          h('button', { className: 'code-tab', 'data-tab': 'tab2' }, 'Quantum State'),
          h('button', { className: 'code-tab', 'data-tab': 'tab3' }, 'Optimizer + UCC')
        ),
        h('div', { className: 'code-panels' },
          h('div', { className: 'code-panel active', id: 'tab1' },
            h('pre', null, h('code', { className: 'language-js' }, example1))
          ),
          h('div', { className: 'code-panel', id: 'tab2' },
            h('pre', null, h('code', { className: 'language-js' }, example2))
          ),
          h('div', { className: 'code-panel', id: 'tab3' },
            h('pre', null, h('code', { className: 'language-js' }, example3))
          )
        )
      )
    )
  );
}

function Architecture() {
  return h('section', { id: 'architecture', className: 'section architecture' },
    h('div', { className: 'container' },
      h('div', { className: 'section-header fade-in' },
        h('span', { className: 'section-label' }, 'Architecture'),
        h('h2', { className: 'section-title' }, 'Engineered from the ground up.'),
        h('p', { className: 'section-desc' }, 'Every layer is modular, composable, and designed to work together seamlessly.')
      ),
      h('div', { className: 'arch-diagram fade-in' },
        h('div', { className: 'arch-layer arch-unique' },
          h('div', { className: 'arch-label' }, 'Unique Differentiators'),
          h('div', { className: 'arch-items' },
            h('span', { className: 'arch-item' }, 'Quantum State Rendering'),
            h('span', { className: 'arch-item' }, 'Self-Evolving Optimizer'),
            h('span', { className: 'arch-item' }, 'Universal Code Continuity')
          )
        ),
        h('div', { className: 'arch-layer arch-platform' },
          h('div', { className: 'arch-label' }, 'Platform Layers'),
          h('div', { className: 'arch-items' },
            h('span', { className: 'arch-item' }, 'Backend Engine'),
            h('span', { className: 'arch-item' }, 'Web UI'),
            h('span', { className: 'arch-item' }, 'Mobile Bridge'),
            h('span', { className: 'arch-item' }, 'Desktop Shell'),
            h('span', { className: 'arch-item' }, 'Edge Runtime')
          )
        ),
        h('div', { className: 'arch-layer arch-net' },
          h('div', { className: 'arch-label' }, 'Network & UI'),
          h('div', { className: 'arch-items' },
            h('span', { className: 'arch-item' }, 'HTTP Server'),
            h('span', { className: 'arch-item' }, 'Router'),
            h('span', { className: 'arch-item' }, 'WebSocket'),
            h('span', { className: 'arch-item' }, 'VDOM'),
            h('span', { className: 'arch-item' }, 'SSR/SSG/ISR'),
            h('span', { className: 'arch-item' }, 'Signals')
          )
        ),
        h('div', { className: 'arch-layer arch-core' },
          h('div', { className: 'arch-label' }, 'Core Runtime'),
          h('div', { className: 'arch-items' },
            h('span', { className: 'arch-item' }, 'Engine'),
            h('span', { className: 'arch-item' }, 'Scheduler'),
            h('span', { className: 'arch-item' }, 'Sandbox'),
            h('span', { className: 'arch-item' }, 'System API'),
            h('span', { className: 'arch-item' }, 'Module Resolver')
          )
        ),
        h('div', { className: 'arch-layer arch-tools' },
          h('div', { className: 'arch-label' }, 'Developer Tools'),
          h('div', { className: 'arch-items' },
            h('span', { className: 'arch-item' }, 'LPM Package Manager'),
            h('span', { className: 'arch-item' }, 'Build System'),
            h('span', { className: 'arch-item' }, 'CLI')
          )
        )
      )
    )
  );
}

function Differentiators() {
  const items = [
    {
      id: 'qsr',
      title: 'Quantum State Rendering',
      icon: '⚛',
      desc: 'A unified live-state graph where UI, backend, and edge state exist in superposition. Any mutation propagates instantly to every subscriber on every platform.',
      points: [
        'Cross-platform reactive state graph',
        'Conflict resolution (last-write-wins / merge / CRDT)',
        'Derived computed state with dependency tracking',
        'Snapshot & time-travel debugging',
        'State export/import for persistence & transfer'
      ]
    },
    {
      id: 'optimizer',
      title: 'Self-Evolving Runtime',
      icon: '🧬',
      desc: 'The runtime observes its own execution patterns and adapts. Hot paths are detected, pure functions are auto-memoized, and scheduling is rebalanced dynamically.',
      points: [
        'Automatic hot path detection',
        'Pure function auto-memoization',
        'Memory pressure adaptation',
        'Execution graph optimization',
        'Real-time profiling & telemetry'
      ]
    },
    {
      id: 'ucc',
      title: 'Universal Code Continuity',
      icon: '🔗',
      desc: 'One execution fabric. Write platform-agnostic logic with platform-specific overrides. Migrate execution contexts across platforms at runtime.',
      points: [
        'Platform-adaptive modules with overrides',
        'Capability detection per platform',
        'Execution context serialization & migration',
        'Cross-platform state portability',
        'Seamless backend ↔ web ↔ mobile ↔ edge'
      ]
    }
  ];

  return h('section', { id: 'differentiators', className: 'section differentiators' },
    h('div', { className: 'container' },
      h('div', { className: 'section-header fade-in' },
        h('span', { className: 'section-label' }, 'What Makes Luna Different'),
        h('h2', { className: 'section-title' }, 'Three capabilities no other runtime has.')
      ),
      h('div', { className: 'diff-list' },
        ...items.map((item, i) =>
          h('div', { className: `diff-card fade-in`, style: `--delay: ${i * 0.15}s` },
            h('div', { className: 'diff-header' },
              h('span', { className: 'diff-icon' }, item.icon),
              h('h3', null, item.title)
            ),
            h('p', { className: 'diff-desc' }, item.desc),
            h('ul', { className: 'diff-points' },
              ...item.points.map(p => h('li', null, p))
            )
          )
        )
      )
    )
  );
}

function GetStarted() {
  return h('section', { id: 'get-started', className: 'section get-started' },
    h('div', { className: 'container' },
      h('div', { className: 'cta-card fade-in' },
        h('h2', null, 'Start building with LUNA'),
        h('p', null, 'Get up and running in under 30 seconds.'),
        h('div', { className: 'cta-steps' },
          h('div', { className: 'cta-step' },
            h('span', { className: 'step-num' }, '1'),
            h('div', null,
              h('h4', null, 'Create your project'),
              h('code', null, 'npx luna create my-app')
            )
          ),
          h('div', { className: 'cta-step' },
            h('span', { className: 'step-num' }, '2'),
            h('div', null,
              h('h4', null, 'Start developing'),
              h('code', null, 'cd my-app && luna dev')
            )
          ),
          h('div', { className: 'cta-step' },
            h('span', { className: 'step-num' }, '3'),
            h('div', null,
              h('h4', null, 'Build for any platform'),
              h('code', null, 'luna build backend web mobile')
            )
          )
        ),
        h('div', { className: 'cta-actions' },
          h('a', { href: 'https://github.com/jayanthansenthilkumar/Luna', className: 'btn btn-primary btn-lg', target: '_blank' },
            'View on GitHub →'
          ),
          h('a', { href: '/docs', className: 'btn btn-ghost btn-lg' },
            'Read the Docs'
          )
        )
      )
    )
  );
}

function Footer() {
  return h('footer', { className: 'footer' },
    h('div', { className: 'container' },
      h('div', { className: 'footer-inner' },
        h('div', { className: 'footer-brand' },
          h('span', { className: 'logo-icon' }, '🌙'),
          h('span', { className: 'logo-text' }, 'LUNA'),
          h('p', null, 'Universal JavaScript Operating Runtime')
        ),
        h('div', { className: 'footer-links' },
          h('div', { className: 'footer-col' },
            h('h5', null, 'Resources'),
            h('a', { href: '/docs' }, 'Documentation'),
            h('a', { href: '#code' }, 'Examples'),
            h('a', { href: '#architecture' }, 'Architecture')
          ),
          h('div', { className: 'footer-col' },
            h('h5', null, 'Community'),
            h('a', { href: 'https://github.com/jayanthansenthilkumar/Luna', target: '_blank' }, 'GitHub'),
            h('a', { href: 'https://github.com/jayanthansenthilkumar/Luna/issues', target: '_blank' }, 'Issues'),
            h('a', { href: 'https://github.com/jayanthansenthilkumar/Luna/discussions', target: '_blank' }, 'Discussions')
          ),
          h('div', { className: 'footer-col' },
            h('h5', null, 'Project'),
            h('a', { href: '#features' }, 'Features'),
            h('a', { href: '#differentiators' }, 'Why LUNA'),
            h('a', { href: '#get-started' }, 'Get Started')
          )
        )
      ),
      h('div', { className: 'footer-bottom' },
        h('p', null, '© 2026 LUNA Project — MIT License'),
        h('p', { className: 'footer-meta' }, 'This page is server-rendered by the LUNA framework itself.')
      )
    )
  );
}

// ── Page Render ────────────────────────────────────

function renderPage(qsr) {
  const nav = Nav().toHTML();
  const hero = Hero().toHTML();
  const features = Features().toHTML();
  const platforms = Platforms().toHTML();
  const code = CodeShowcase().toHTML();
  const arch = Architecture().toHTML();
  const diff = Differentiators().toHTML();
  const cta = GetStarted().toHTML();
  const footer = Footer().toHTML();

  const body = `${nav}${hero}${features}${platforms}${code}${arch}${diff}${cta}${footer}`;
  return Layout('LUNA – Universal JavaScript Operating Runtime', body);
}

module.exports = { renderPage };
