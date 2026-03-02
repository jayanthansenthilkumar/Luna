# LUNA – Universal JavaScript Operating Runtime

> One Language. One Runtime. Every Platform.

LUNA is a unified JavaScript runtime that brings together backend, frontend, mobile, desktop, edge, and distributed systems into one cohesive architecture. Write JavaScript once — deploy everywhere with zero platform friction.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    LUNA Runtime                       │
├────────┬────────┬────────┬────────┬────────┬────────┤
│Backend │  Web   │ Mobile │Desktop │  Edge  │  QSR   │
│ Engine │   UI   │ Bridge │ Shell  │Runtime │ State  │
├────────┴────────┴────────┴────────┴────────┴────────┤
│                   Core Layer                         │
│  Engine │ Scheduler │ Sandbox │ System API │ Modules │
├─────────────────────────────────────────────────────┤
│               Build & Deployment                     │
│  Bundler │ Minifier │ Asset Pipeline │ Multi-target  │
├─────────────────────────────────────────────────────┤
│            Package Manager (LPM)                     │
│  Registry │ Resolver │ Lockfile │ SemVer │ Templates │
└─────────────────────────────────────────────────────┘
```

## Features

### Core Runtime
- **LunaEngine** – Lifecycle hooks, error boundaries, metrics, extensions
- **Scheduler** – Lock-free queues, priority scheduling (critical/high/normal/low/idle), worker pools
- **Sandbox** – Capability-based security (fs, net, env, process, ffi, gpu, camera, location)
- **System API** – Native OS access: filesystem, process, crypto, path

### Networking
- **HTTP Server** – Clustering, streaming, LunaRequest/LunaResponse abstractions
- **Router** – Radix-tree based, params, wildcards, route groups
- **Middleware** – CORS, body parser, compression, rate limiter, static files, helmet
- **WebSocket** – Rooms, broadcasting, heartbeat, binary frames
- **Streaming** – SSE, multiplexing, JSON lines, chunked encoding

### UI Rendering
- **Virtual DOM** – Custom VDOM with diffing, component lifecycle, JSX-like `h()` factory
- **Reactive State** – Signals, Computed, Effects, Stores with time-travel
- **SSR/SSG/ISR** – Server-side rendering, static generation, incremental static regeneration
- **Hydration** – Full, partial, progressive, lazy, island-based strategies

### Platform Layers
- **Mobile Bridge** – Native APIs (camera, GPS, notifications, biometrics, haptics), GPU acceleration
- **Desktop Shell** – Window management, menus, system tray, dialogs, shortcuts
- **Edge Runtime** – Regional deployment, distributed cache, KV store, geo-routing, state sync

### Three Unique Differentiators
1. **Quantum State Rendering (QSR)** – Unified live-state graph where UI, backend, and edge state exist in superposition with instant propagation
2. **Self-Evolving Runtime Optimizer** – Observes execution patterns, detects hot paths, auto-memoizes pure functions, adapts scheduling dynamically
3. **Universal Code Continuity (UCC)** – One execution fabric with platform-adaptive modules, context migration, and state portability

### Developer Tools
- **LPM** – Luna Package Manager with semver resolution, lockfiles, registry, templates
- **Build System** – Multi-target bundling, minification, source maps, asset pipeline, watch mode
- **CLI** – Full command-line interface for all operations

## Quick Start

```bash
# Install globally
npm link

# Create a new project
luna create my-app
cd my-app

# Start development
luna dev

# Build for production
luna build backend web

# Run tests
luna test
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `luna init` | Initialize a new LUNA project |
| `luna dev` | Start development server with HMR |
| `luna start` | Start production server |
| `luna build [targets]` | Build for backend, web, mobile, desktop, edge |
| `luna install [pkgs]` | Install dependencies |
| `luna update [pkgs]` | Update dependencies |
| `luna publish` | Publish to Luna registry |
| `luna create <name>` | Scaffold from template |
| `luna test` | Run test suite |
| `luna info` | Show runtime environment |

## Project Structure

```
luna/
├── bin/
│   └── luna.js              # CLI entry point
├── src/
│   ├── index.js             # Main runtime integrator
│   ├── core/
│   │   ├── engine.js        # Core engine with lifecycle
│   │   ├── scheduler.js     # Task scheduler
│   │   ├── sandbox.js       # Security sandbox
│   │   └── system-api.js    # OS-level APIs
│   ├── net/
│   │   ├── http-server.js   # HTTP server
│   │   ├── router.js        # Radix-tree router
│   │   ├── middleware.js     # Middleware pipeline
│   │   ├── websocket.js     # WebSocket server
│   │   └── streaming.js     # SSE & streaming
│   ├── ui/
│   │   ├── engine.js        # Virtual DOM & components
│   │   ├── reactive-state.js # Signals & stores
│   │   ├── ssr.js           # SSR/SSG/ISR
│   │   ├── hydration.js     # Hydration strategies
│   │   └── router.js        # Page router
│   ├── mobile/
│   │   └── bridge.js        # Native mobile bridge
│   ├── desktop/
│   │   └── shell.js         # Desktop window shell
│   ├── edge/
│   │   └── runtime.js       # Edge & distributed
│   ├── module/
│   │   └── resolver.js      # Module resolution
│   ├── lpm/
│   │   └── manager.js       # Package manager
│   ├── build/
│   │   └── builder.js       # Build system
│   ├── optimizer/
│   │   └── self-evolving.js # Runtime optimizer
│   ├── ucc/
│   │   └── continuity.js    # Universal Code Continuity
│   └── qsr/
│       └── quantum-state.js # Quantum State Rendering
├── tests/
│   └── index.test.js        # Test suite
├── luna.json                 # LUNA configuration
├── package.json              # npm package
└── README.md
```

## Programmatic Usage

```javascript
const { Luna, createApp } = require('@luna/runtime');

const app = createApp();

await app.init();

// HTTP routes
app.router.get('/api/users', async (req, res) => {
  res.json({ users: [] });
});

// WebSocket
app.wsServer.on('connection', (ws) => {
  ws.send({ type: 'hello' });
});

// Reactive state
const { Signal, Computed } = require('@luna/runtime/ui/reactive-state');
const count = new Signal(0);
const doubled = new Computed(() => count.value * 2);

// Quantum State (cross-platform sync)
app.qsr.set('user', { name: 'Luna' });
app.qsr.subscribe('user', (value) => console.log('User changed:', value));

// Self-evolving optimizer
const optimized = app.optimizer.observe('myFn', (x) => x * x);
optimized(42); // Profiled automatically

// Universal Code Continuity
app.ucc.module('storage')
  .define({ save: (data) => data })
  .platform('backend', { save: (data) => fs.writeFileSync('/tmp/data', data) })
  .platform('web', { save: (data) => localStorage.setItem('data', data) });

await app.listen(3000);
```

## Configuration (luna.json)

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "entry": "src/index.js",
  "platform": {
    "backend": true,
    "web": true,
    "mobile": { "android": true, "ios": true },
    "desktop": { "windows": true, "macos": true, "linux": true },
    "edge": true
  },
  "runtime": {
    "scheduler": { "workerThreads": 4, "ioThreads": 2 },
    "sandbox": { "enabled": true, "capabilities": ["fs", "net"] },
    "optimizer": { "selfEvolving": true, "hotPathThreshold": 100 }
  },
  "rendering": {
    "strategy": "server-first",
    "hydration": "incremental",
    "ssr": true
  }
}
```

## License

MIT
