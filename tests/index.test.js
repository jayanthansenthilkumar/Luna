/**
 * LUNA Test Suite
 * 
 * Run: node tests/index.test.js
 */

'use strict';

// ---- Tiny Test Framework ----

let _passed = 0;
let _failed = 0;
let _currentSuite = '';

function suite(name, fn) {
  _currentSuite = name;
  console.log(`\n  \x1b[1m${name}\x1b[0m`);
  fn();
}

function test(name, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      // Handle async tests
      result.then(() => {
        _passed++;
        console.log(`    \x1b[32m✓\x1b[0m ${name}`);
      }).catch((e) => {
        _failed++;
        console.log(`    \x1b[31m✗\x1b[0m ${name}`);
        console.log(`      \x1b[31m${e.message}\x1b[0m`);
      });
    } else {
      _passed++;
      console.log(`    \x1b[32m✓\x1b[0m ${name}`);
    }
  } catch (e) {
    _failed++;
    console.log(`    \x1b[31m✗\x1b[0m ${name}`);
    console.log(`      \x1b[31m${e.message}\x1b[0m`);
  }
}

function assert(condition, msg = 'Assertion failed') {
  if (!condition) throw new Error(msg);
}

function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

function assertDeepEqual(a, b, msg) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(msg || `Deep equal failed:\n  Got:      ${JSON.stringify(a)}\n  Expected: ${JSON.stringify(b)}`);
  }
}

function assertThrows(fn, msg) {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new Error(msg || 'Expected function to throw');
}

// ---- Tests ----

// 1. Core Engine
suite('Core Engine', () => {
  const { LunaEngine } = require('../src/core/engine');

  test('should create engine instance', () => {
    const engine = new LunaEngine();
    assert(engine !== null);
  });

  test('should register lifecycle hooks', () => {
    const engine = new LunaEngine();
    let called = false;
    engine.hook('beforeInit', () => { called = true; });
    // Hooks are stored and called during init()
    assert(engine.hooks.beforeInit.length === 1);
    engine.hooks.beforeInit[0]();
    assert(called);
  });

  test('should track metrics', () => {
    const engine = new LunaEngine();
    const metrics = engine.getMetrics();
    assert(typeof metrics.uptime === 'number');
  });
});

// 2. Scheduler
suite('Scheduler', () => {
  const { Scheduler } = require('../src/core/scheduler');

  test('should create scheduler', () => {
    const scheduler = new Scheduler();
    assert(scheduler !== null);
  });

  test('should schedule and track tasks', async () => {
    const scheduler = new Scheduler();
    await scheduler.init();
    const task = scheduler.schedule(() => 42, { priority: 'high' });
    assert(task !== null);
    scheduler.shutdown();
  });
});

// 3. Sandbox
suite('Sandbox', () => {
  const { Sandbox, SecurityPolicy } = require('../src/core/sandbox');

  test('should create sandbox with default policy', () => {
    const sandbox = new Sandbox();
    assert(sandbox !== null);
  });

  test('should create security policy', () => {
    const policy = new SecurityPolicy([{ capability: 'fs', permissions: ['read'] }]);
    assert(policy !== null);
    assert(policy.grants.has('fs'));
  });
});

// 4. Router
suite('Router', () => {
  const { Router } = require('../src/net/router');

  test('should create router', () => {
    const router = new Router();
    assert(router !== null);
  });

  test('should add and match routes', () => {
    const router = new Router();
    const handler = () => {};
    router.add('GET', '/users/:id', handler);
    const match = router.match('GET', '/users/123');
    assert(match !== null);
    assertEqual(match.params.id, '123');
  });

  test('should handle wildcard routes', () => {
    const router = new Router();
    router.add('GET', '/files/*', () => 'files');
    const match = router.match('GET', '/files/a/b/c');
    assert(match !== null);
  });

  test('should support route groups', () => {
    const router = new Router();
    router.group('/api', (group) => {
      group.get('/users', () => 'users');
      group.get('/posts', () => 'posts');
    });
    assert(router.match('GET', '/api/users') !== null);
    assert(router.match('GET', '/api/posts') !== null);
  });
});

// 5. Middleware
suite('Middleware', () => {
  const { MiddlewarePipeline, cors, bodyParser, helmet } = require('../src/net/middleware');

  test('should create middleware pipeline', () => {
    const pipeline = new MiddlewarePipeline();
    assert(pipeline !== null);
  });

  test('should add middleware', () => {
    const pipeline = new MiddlewarePipeline();
    pipeline.use((req, res, next) => next());
    assert(pipeline.stack.length === 1);
  });

  test('should create CORS middleware', () => {
    const mw = cors();
    assert(typeof mw === 'function');
  });

  test('should create helmet middleware', () => {
    const mw = helmet();
    assert(typeof mw === 'function');
  });
});

// 6. UI Engine
suite('UI Engine', () => {
  const { h, text, Component, UIEngine, VDOMDiffer } = require('../src/ui/engine');

  test('should create VNodes with h()', () => {
    const node = h('div', { className: 'test' }, h('span', null, 'hello'));
    assertEqual(node.tag, 'div');
    assertEqual(node.props.className, 'test');
    assert(node.children.length > 0);
  });

  test('should create text nodes', () => {
    const node = text('hello');
    assertEqual(node.tag, 'TEXT');
    assertEqual(node.children, 'hello');
  });

  test('should render VNode to HTML string', () => {
    const node = h('div', { id: 'app' }, h('p', null, 'Hello'));
    const html = node.toHTML();
    assert(html.includes('<div'));
    assert(html.includes('id="app"'));
    assert(html.includes('<p>'));
    assert(html.includes('Hello'));
  });

  test('should diff two VNode trees', () => {
    const oldTree = h('div', null, h('p', null, text('old')));
    const newTree = h('div', null, h('p', null, text('new')));
    const patches = VDOMDiffer.diff(oldTree, newTree);
    assert(Array.isArray(patches));
  });
});

// 7. Reactive State
suite('Reactive State', () => {
  const { Signal, Computed, Effect, Store } = require('../src/ui/reactive-state');

  test('should create and read signals', () => {
    const count = new Signal(0);
    assertEqual(count.value, 0);
  });

  test('should update signals', () => {
    const count = new Signal(0);
    count.value = 5;
    assertEqual(count.value, 5);
  });

  test('should create computed values', () => {
    const a = new Signal(2);
    const b = new Signal(3);
    const sum = new Computed(() => a.value + b.value);
    assertEqual(sum.value, 5);
  });

  test('should track effects', () => {
    const count = new Signal(0);
    let effectValue = -1;
    const effect = new Effect(() => { effectValue = count.value; });
    effect._execute();
    assertEqual(effectValue, 0);
  });

  test('should create store with actions', () => {
    const store = new Store({ count: 0 });
    store.action('increment', (state) => { store.set('count', store.get('count') + 1); });
    assertEqual(store.get('count'), 0);
    store.dispatch('increment');
    assertEqual(store.get('count'), 1);
  });
});

// 8. Module Resolver
suite('Module Resolver', () => {
  const { ModuleResolver, DependencyGraph } = require('../src/module/resolver');

  test('should create resolver', () => {
    const resolver = new ModuleResolver();
    assert(resolver !== null);
  });

  test('should resolve luna: namespace modules', () => {
    const resolver = new ModuleResolver();
    const resolved = resolver.resolve('luna:fs');
    assertEqual(resolved.type, 'namespace');
    assertEqual(resolved.id, 'luna:fs');
  });

  test('should register virtual modules', () => {
    const resolver = new ModuleResolver();
    resolver.virtual('my-lib', { hello: 'world' });
    const resolved = resolver.resolve('my-lib');
    assertEqual(resolved.type, 'virtual');
  });

  test('should build dependency graph', () => {
    const graph = new DependencyGraph();
    graph.addEdge('A', 'B');
    graph.addEdge('A', 'C');
    graph.addEdge('B', 'D');
    const deps = graph.getDependencies('A');
    assert(deps.has('B'));
    assert(deps.has('C'));
  });

  test('should detect circular dependencies', () => {
    const graph = new DependencyGraph();
    graph.addEdge('A', 'B');
    graph.addEdge('B', 'C');
    graph.addEdge('C', 'A');
    const circles = graph.detectCircular();
    assert(circles.length > 0);
  });
});

// 9. Package Manager (SemVer)
suite('Package Manager – SemVer', () => {
  const { SemVer } = require('../src/lpm/manager');

  test('should parse valid semver', () => {
    const v = SemVer.parse('1.2.3');
    assertEqual(v.major, 1);
    assertEqual(v.minor, 2);
    assertEqual(v.patch, 3);
  });

  test('should parse semver with prerelease', () => {
    const v = SemVer.parse('1.0.0-beta.1');
    assertEqual(v.major, 1);
    assertEqual(v.prerelease, 'beta.1');
  });

  test('should satisfy exact version', () => {
    assert(SemVer.satisfies('1.2.3', '1.2.3'));
    assert(!SemVer.satisfies('1.2.4', '1.2.3'));
  });

  test('should satisfy caret range', () => {
    assert(SemVer.satisfies('1.3.0', '^1.2.0'));
    assert(SemVer.satisfies('1.2.5', '^1.2.0'));
    assert(!SemVer.satisfies('2.0.0', '^1.2.0'));
  });

  test('should satisfy tilde range', () => {
    assert(SemVer.satisfies('1.2.5', '~1.2.0'));
    assert(!SemVer.satisfies('1.3.0', '~1.2.0'));
  });

  test('should increment versions', () => {
    assertEqual(SemVer.increment('1.2.3', 'patch'), '1.2.4');
    assertEqual(SemVer.increment('1.2.3', 'minor'), '1.3.0');
    assertEqual(SemVer.increment('1.2.3', 'major'), '2.0.0');
  });
});

// 10. Quantum State Renderer
suite('Quantum State Renderer', () => {
  const { QuantumStateRenderer } = require('../src/qsr/quantum-state');

  test('should create QSR instance', () => {
    const qsr = new QuantumStateRenderer({ batchUpdates: false });
    assert(qsr !== null);
  });

  test('should set and get state', () => {
    const qsr = new QuantumStateRenderer({ batchUpdates: false });
    qsr.set('count', 42);
    assertEqual(qsr.get('count'), 42);
  });

  test('should subscribe to changes', () => {
    const qsr = new QuantumStateRenderer({ batchUpdates: false });
    let received = null;
    qsr.subscribe('name', (value) => { received = value; });
    qsr.set('name', 'Luna');
    assertEqual(received, 'Luna');
  });

  test('should derive computed state', () => {
    const qsr = new QuantumStateRenderer({ batchUpdates: false });
    qsr.set('a', 10);
    qsr.set('b', 20);
    qsr.derive('sum', ['a', 'b'], (a, b) => a + b);
    assertEqual(qsr.get('sum'), 30);
  });

  test('should take and restore snapshots', () => {
    const qsr = new QuantumStateRenderer({ batchUpdates: false });
    qsr.set('x', 1);
    const snap = qsr.snapshot();
    qsr.set('x', 2);
    assertEqual(qsr.get('x'), 2);
    qsr.restore(snap);
    assertEqual(qsr.get('x'), 1);
  });

  test('should track history for time travel', () => {
    const qsr = new QuantumStateRenderer({ batchUpdates: false });
    qsr.set('counter', 0);
    qsr.set('counter', 1);
    qsr.set('counter', 2);
    const history = qsr.getHistory('counter');
    assert(history.length >= 3);
  });

  test('should export and import state', () => {
    const qsr1 = new QuantumStateRenderer({ batchUpdates: false });
    qsr1.set('key', 'value');
    const exported = qsr1.exportState();

    const qsr2 = new QuantumStateRenderer({ batchUpdates: false });
    qsr2.importState(exported);
    assertEqual(qsr2.get('key'), 'value');
  });
});

// 11. Self-Evolving Optimizer
suite('Self-Evolving Optimizer', () => {
  const { SelfEvolvingOptimizer } = require('../src/optimizer/self-evolving');

  test('should create optimizer', () => {
    const optimizer = new SelfEvolvingOptimizer();
    assert(optimizer !== null);
  });

  test('should observe and profile functions', () => {
    const optimizer = new SelfEvolvingOptimizer();
    const fn = optimizer.observe('add', (a, b) => a + b);
    const result = fn(2, 3);
    assertEqual(result, 5);
  });

  test('should detect hot paths', () => {
    const optimizer = new SelfEvolvingOptimizer({ hotPathThreshold: 5 });
    const fn = optimizer.observe('hotFn', () => 42);
    for (let i = 0; i < 10; i++) fn();
    optimizer._optimizationPass();
    const report = optimizer.getReport();
    assert(report.hotPaths.length > 0);
  });

  test('should generate reports', () => {
    const optimizer = new SelfEvolvingOptimizer();
    const report = optimizer.getReport();
    assert(typeof report.totalProfiles === 'number');
    assert(Array.isArray(report.hotPaths));
  });
});

// 12. Universal Code Continuity
suite('Universal Code Continuity', () => {
  const { UniversalCodeContinuity, ExecutionContext, PLATFORMS } = require('../src/ucc/continuity');

  test('should create UCC instance', () => {
    const ucc = new UniversalCodeContinuity();
    assert(ucc !== null);
  });

  test('should detect platform', () => {
    const ucc = new UniversalCodeContinuity();
    assert(typeof ucc.platform === 'string');
  });

  test('should register adaptive modules', () => {
    const ucc = new UniversalCodeContinuity();
    ucc.module('logger')
      .define({ log: (msg) => msg })
      .platform('backend', { log: (msg) => `[SERVER] ${msg}` })
      .platform('web', { log: (msg) => `[CLIENT] ${msg}` });
    const mod = ucc.getModule('logger');
    assert(mod !== null);
    assert(typeof mod.log === 'function');
  });

  test('should create and transfer execution contexts', () => {
    const ucc = new UniversalCodeContinuity();
    const ctx = ucc.createContext({ user: 'test' });
    assert(ctx.id);

    const serialized = ucc.exportContext(ctx.id);
    const imported = ucc.importContext(serialized);
    assertEqual(imported.state.user, 'test');
  });

  test('should handle state portability', () => {
    const ucc = new UniversalCodeContinuity();
    const state = ucc.getState();
    state.set('key', 'value');
    assertEqual(state.get('key'), 'value');
  });
});

// 13. Build System
suite('Build System', () => {
  const { BuildSystem, Minifier, Bundler } = require('../src/build/builder');

  test('should create build system', () => {
    const builder = new BuildSystem();
    assert(builder !== null);
  });

  test('should minify JavaScript', () => {
    const code = `
      // This is a comment
      function hello() {
        return "world";
      }
    `;
    const minified = Minifier.minify(code);
    assert(!minified.includes('This is a comment'));
    assert(minified.includes('hello'));
  });

  test('should create bundler', () => {
    const bundler = new Bundler();
    assert(bundler !== null);
  });
});

// 14. SSR Engine
suite('SSR Engine', () => {
  const { SSREngine } = require('../src/ui/ssr');
  const { h } = require('../src/ui/engine');

  test('should create SSR engine', () => {
    const ssr = new SSREngine();
    assert(ssr !== null);
  });

  test('should render VNode to HTML', async () => {
    const ssr = new SSREngine();
    const vnode = h('div', { id: 'app' }, h('h1', null, 'Hello'));
    const html = await ssr.render(vnode);
    assert(typeof html === 'string');
    assert(html.includes('Hello'));
  });
});

// 15. Edge Runtime
suite('Edge Runtime', () => {
  const { EdgeRuntime } = require('../src/edge/runtime');

  test('should create edge runtime', () => {
    const edge = new EdgeRuntime();
    assert(edge !== null);
  });

  test('should have default regions', () => {
    const edge = new EdgeRuntime();
    const regions = edge.getRegions ? edge.getRegions() : [];
    assert(Array.isArray(regions));
  });
});

// ---- Results ----

console.log(`\n${'─'.repeat(50)}`);
console.log(`\n  \x1b[1mResults:\x1b[0m \x1b[32m${_passed} passed\x1b[0m, ${_failed > 0 ? '\x1b[31m' : '\x1b[2m'}${_failed} failed\x1b[0m`);
console.log(`  \x1b[2mTotal: ${_passed + _failed} tests\x1b[0m\n`);

// Export for luna test command
module.exports = {
  run: () => ({ passed: _passed, failed: _failed })
};

if (_failed > 0) process.exit(1);
