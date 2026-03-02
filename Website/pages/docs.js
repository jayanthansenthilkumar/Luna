/**
 * LUNA Docs Page
 */

'use strict';

const { h } = require('../../src/ui/engine');

function renderDocsPage() {
  const body = `
<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-logo"><span class="logo-icon">🌙</span><span class="logo-text">LUNA</span></a>
    <div class="nav-links">
      <a href="/#features">Features</a>
      <a href="/#platforms">Platforms</a>
      <a href="/#code">Code</a>
      <a href="/docs" class="active">Docs</a>
    </div>
    <div class="nav-actions">
      <a href="https://github.com/jayanthansenthilkumar/Luna" class="btn btn-ghost" target="_blank">GitHub</a>
    </div>
  </div>
</nav>
<main class="docs-page">
  <div class="container">
    <div class="docs-layout">
      <aside class="docs-sidebar">
        <h4>Getting Started</h4>
        <a href="#installation">Installation</a>
        <a href="#quick-start">Quick Start</a>
        <a href="#project-structure">Project Structure</a>
        <h4>Core</h4>
        <a href="#engine">Engine</a>
        <a href="#scheduler">Scheduler</a>
        <a href="#sandbox">Sandbox</a>
        <h4>Networking</h4>
        <a href="#http-server">HTTP Server</a>
        <a href="#router">Router</a>
        <a href="#middleware">Middleware</a>
        <a href="#websocket">WebSocket</a>
        <h4>UI</h4>
        <a href="#vdom">Virtual DOM</a>
        <a href="#signals">Signals & State</a>
        <a href="#ssr">SSR / SSG / ISR</a>
        <a href="#hydration">Hydration</a>
        <h4>Unique Features</h4>
        <a href="#qsr">Quantum State</a>
        <a href="#optimizer">Self-Evolving Optimizer</a>
        <a href="#ucc">Code Continuity</a>
      </aside>
      <div class="docs-content">

        <h1>LUNA Documentation</h1>
        <p class="docs-intro">Everything you need to build universal JavaScript applications with LUNA.</p>

        <section id="installation">
          <h2>Installation</h2>
          <pre><code>git clone https://github.com/jayanthansenthilkumar/Luna.git
cd Luna
npm link      # Makes 'luna' CLI globally available</code></pre>
        </section>

        <section id="quick-start">
          <h2>Quick Start</h2>
          <pre><code>luna create my-app
cd my-app
luna dev       # Start dev server on port 3000</code></pre>
          <p>Your app is now running at <code>http://localhost:3000</code>.</p>
        </section>

        <section id="project-structure">
          <h2>Project Structure</h2>
          <pre><code>my-app/
├── luna.json            # LUNA configuration
├── src/
│   ├── index.js         # Entry point
│   ├── pages/           # Page components
│   ├── components/      # Shared components
│   └── api/             # API routes
├── public/              # Static assets
└── tests/               # Test files</code></pre>
        </section>

        <section id="engine">
          <h2>Core Engine</h2>
          <p>The <code>LunaEngine</code> manages the runtime lifecycle with hooks:</p>
          <pre><code>const { LunaEngine } = require('@luna/runtime/core/engine');
const engine = new LunaEngine();

engine.hook('beforeInit', async (ctx) =&gt; {
  console.log('Initializing...');
});

await engine.init();
// Engine is now running with error handling & metrics</code></pre>
        </section>

        <section id="scheduler">
          <h2>Scheduler</h2>
          <p>Priority-based task scheduling with lock-free queues:</p>
          <pre><code>const { Scheduler } = require('@luna/runtime/core/scheduler');
const scheduler = new Scheduler({ workerThreads: 4 });
await scheduler.init();

scheduler.schedule(myTask, { priority: 'critical' });
scheduler.compute(heavyWork);    // CPU-bound
scheduler.io(fetchData);          // IO-bound</code></pre>
        </section>

        <section id="sandbox">
          <h2>Security Sandbox</h2>
          <p>Capability-based security gating:</p>
          <pre><code>const { Sandbox } = require('@luna/runtime/core/sandbox');
const sandbox = new Sandbox({
  capabilities: ['fs', 'net']   // Only FS and Network allowed
});

sandbox.execute('untrustedCode.js'); // Runs in isolated context</code></pre>
        </section>

        <section id="http-server">
          <h2>HTTP Server</h2>
          <pre><code>const { HttpServer } = require('@luna/runtime/net/http-server');
const { Router } = require('@luna/runtime/net/router');

const router = new Router();
router.get('/hello', (req, res) =&gt; {
  res.json({ message: 'Hello!' });
});

const server = new HttpServer({ router });
await server.listen(3000);</code></pre>
        </section>

        <section id="router">
          <h2>Router</h2>
          <p>Radix-tree based routing with params and wildcards:</p>
          <pre><code>router.get('/users/:id', handler);      // Params
router.get('/files/*', staticHandler);  // Wildcard

router.group('/api', (group) =&gt; {       // Groups
  group.get('/users', listUsers);
  group.post('/users', createUser);
});</code></pre>
        </section>

        <section id="middleware">
          <h2>Middleware</h2>
          <pre><code>const { cors, bodyParser, helmet, rateLimit }
  = require('@luna/runtime/net/middleware');

app.use(cors());
app.use(bodyParser());
app.use(helmet());
app.use(rateLimit({ windowMs: 60000, max: 100 }));</code></pre>
        </section>

        <section id="websocket">
          <h2>WebSocket</h2>
          <pre><code>const { WebSocketServer } = require('@luna/runtime/net/websocket');

const wss = new WebSocketServer(httpServer);
wss.on('connection', (ws) =&gt; {
  ws.join('chat');
  ws.send({ type: 'welcome' });
  wss.broadcast('chat', { type: 'joined' });
});</code></pre>
        </section>

        <section id="vdom">
          <h2>Virtual DOM</h2>
          <pre><code>const { h, Component } = require('@luna/runtime/ui/engine');

class Counter extends Component {
  constructor() {
    super({ count: 0 });
  }
  render() {
    return h('button', {
      onClick: () =&gt; this.setState({ count: this.state.count + 1 })
    }, \`Clicked \${this.state.count} times\`);
  }
}

// JSX-like factory
const page = h('div', { className: 'app' },
  h('h1', null, 'My App'),
  h(Counter)
);</code></pre>
        </section>

        <section id="signals">
          <h2>Signals & Reactive State</h2>
          <pre><code>const { Signal, Computed, Effect, Store }
  = require('@luna/runtime/ui/reactive-state');

const count = new Signal(0);
const doubled = new Computed(() =&gt; count.value * 2);

new Effect(() =&gt; {
  console.log('Count is now:', count.value);
});

count.value = 5; // Effect runs, doubled.value = 10

// Structured stores
const store = new Store({ todos: [] });
store.action('add', (s) =&gt; s.set('todos', [...s.get('todos'), payload]));
store.dispatch('add', 'Buy milk');</code></pre>
        </section>

        <section id="ssr">
          <h2>SSR / SSG / ISR</h2>
          <pre><code>const { SSREngine } = require('@luna/runtime/ui/ssr');
const ssr = new SSREngine();

// Server-side render
const html = await ssr.render(MyComponent, { title: 'Home' });

// Static site generation
const page = await ssr.generateStatic(MyComponent, props);

// Incremental static regeneration
ssr.setupISR(MyComponent, props, {
  revalidate: 60 // seconds
});</code></pre>
        </section>

        <section id="hydration">
          <h2>Hydration Strategies</h2>
          <pre><code>const { HydrationEngine } = require('@luna/runtime/ui/hydration');
const hydration = new HydrationEngine();

// Five strategies
hydration.hydrateTarget(target, 'full');         // Full hydration
hydration.hydrateTarget(target, 'partial');      // Partial
hydration.hydrateTarget(target, 'progressive');  // Progressive
hydration.hydrateTarget(target, 'lazy');         // Lazy (on interaction)
hydration.hydrateTarget(target, 'island');       // Island architecture</code></pre>
        </section>

        <section id="qsr">
          <h2>Quantum State Rendering</h2>
          <pre><code>const { QuantumStateRenderer }
  = require('@luna/runtime/qsr/quantum-state');

const qsr = new QuantumStateRenderer();

qsr.set('user', { name: 'Luna' });
qsr.subscribe('user', (val) =&gt; console.log(val));

// Derived state
qsr.derive('greeting', ['user'],
  (user) =&gt; \`Hello, \${user.name}!\`);

// Snapshot &amp; time-travel
const snap = qsr.snapshot();
qsr.restore(snap);</code></pre>
        </section>

        <section id="optimizer">
          <h2>Self-Evolving Runtime Optimizer</h2>
          <pre><code>const { SelfEvolvingOptimizer }
  = require('@luna/runtime/optimizer/self-evolving');

const opt = new SelfEvolvingOptimizer({
  hotPathThreshold: 100,
  memoizeThreshold: 50
});
opt.start();

const fn = opt.observe('compute', (x) =&gt; x * x);
fn(42); // Profiled, eventually auto-memoized

console.log(opt.getReport());
// { hotPaths: [...], memoized: [...], degrading: [...] }</code></pre>
        </section>

        <section id="ucc">
          <h2>Universal Code Continuity</h2>
          <pre><code>const { UniversalCodeContinuity }
  = require('@luna/runtime/ucc/continuity');

const ucc = new UniversalCodeContinuity();

ucc.module('analytics')
  .define({ track: (event) =&gt; console.log(event) })
  .platform('web', {
    track: (event) =&gt; fetch('/api/track', { body: event })
  })
  .platform('mobile', {
    track: (event) =&gt; NativeAnalytics.send(event)
  });

// Context migration
const ctx = ucc.createContext({ userId: 123 });
const serialized = ucc.exportContext(ctx.id);
// Transfer to another platform...
const imported = ucc.importContext(serialized);</code></pre>
        </section>

      </div>
    </div>
  </div>
</main>
<footer class="footer">
  <div class="container">
    <div class="footer-bottom">
      <p>© 2026 LUNA Project — MIT License</p>
    </div>
  </div>
</footer>
<script>
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
</script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation – LUNA</title>
  <link rel="stylesheet" href="/static/style.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  ${body}
</body>
</html>`;
}

module.exports = { renderDocsPage };
