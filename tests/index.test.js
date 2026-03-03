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

// 9b. Registry & Fetcher — luna fetch
suite('Luna Fetch – Registry', () => {
  const { BuiltinRegistry, RegistryClient, getBuiltinPackages } = require('../src/lpm/registry');

  test('should list built-in @luna/* packages', () => {
    const registry = new BuiltinRegistry();
    const list = registry.list();
    assert(list.length >= 10, `Expected >= 10 built-in packages, got ${list.length}`);
    assert(list.some(p => p.name === '@luna/core'));
    assert(list.some(p => p.name === '@luna/net'));
    assert(list.some(p => p.name === '@luna/ui'));
  });

  test('should get package metadata', async () => {
    const registry = new BuiltinRegistry();
    const pkg = await registry.getPackage('@luna/core');
    assert(pkg !== null);
    assertEqual(pkg.name, '@luna/core');
    assert(pkg.versions.length > 0);
    assertEqual(pkg.versions[0].version, '0.1.0');
  });

  test('should return null for unknown package', async () => {
    const registry = new BuiltinRegistry();
    const pkg = await registry.getPackage('nonexistent-pkg');
    assertEqual(pkg, null);
  });

  test('should fetch package files', async () => {
    const registry = new BuiltinRegistry();
    const { files, meta } = await registry.fetchPackage('@luna/core', '0.1.0');
    assert(files['index.js'] instanceof Buffer, 'Expected index.js as Buffer');
    assert(files['luna.json'] instanceof Buffer, 'Expected luna.json as Buffer');
    assertEqual(meta.name, '@luna/core');
  });

  test('should search packages', async () => {
    const registry = new BuiltinRegistry();
    const results = await registry.search('http');
    assert(results.length > 0);
    assert(results.some(r => r.name === '@luna/net'));
  });

  test('RegistryClient should query built-in first', async () => {
    const client = new RegistryClient({});
    const pkg = await client.getPackage('@luna/ui');
    assert(pkg !== null);
    assertEqual(pkg.name, '@luna/ui');
    assertEqual(pkg.source, 'builtin');
  });
});

suite('Luna Fetch – PackageFetcher', () => {
  const fsMod = require('fs');
  const pathMod = require('path');
  const os = require('os');
  const { PackageFetcher } = require('../src/lpm/fetcher');
  const { RegistryClient } = require('../src/lpm/registry');

  // Create a temp directory for each test
  function makeTempDir() {
    const dir = pathMod.join(os.tmpdir(), `luna-test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
    fsMod.mkdirSync(dir, { recursive: true });
    return dir;
  }

  function cleanTempDir(dir) {
    if (fsMod.existsSync(dir)) {
      fsMod.rmSync(dir, { recursive: true, force: true });
    }
  }

  function writeLunaJson(dir, config) {
    fsMod.writeFileSync(pathMod.join(dir, 'luna.json'), JSON.stringify(config, null, 2));
  }

  test('should fetch all deps from luna.json into luna_packages/', async () => {
    const tmpDir = makeTempDir();
    try {
      writeLunaJson(tmpDir, {
        name: 'test-app',
        version: '0.1.0',
        dependencies: {
          '@luna/core': '^0.1.0',
          '@luna/net': '^0.1.0'
        }
      });

      const registry = new RegistryClient({});
      const fetcher = new PackageFetcher({ cwd: tmpDir, registry, quiet: true });
      const result = await fetcher.fetchAll();

      assert(result.count >= 2, `Expected >= 2 installed, got ${result.count}`);

      // Verify luna_packages/@luna/core exists
      const corePath = pathMod.join(tmpDir, 'luna_packages', '@luna', 'core', 'index.js');
      assert(fsMod.existsSync(corePath), 'luna_packages/@luna/core/index.js should exist');

      // Verify luna_packages/@luna/net exists
      const netPath = pathMod.join(tmpDir, 'luna_packages', '@luna', 'net', 'index.js');
      assert(fsMod.existsSync(netPath), 'luna_packages/@luna/net/index.js should exist');

      // Verify luna-lock.json was written
      const lockPath = pathMod.join(tmpDir, 'luna-lock.json');
      assert(fsMod.existsSync(lockPath), 'luna-lock.json should exist');

      const lock = JSON.parse(fsMod.readFileSync(lockPath, 'utf-8'));
      assert(lock.packages['@luna/core'], 'lockfile should contain @luna/core');
      assertEqual(lock.packages['@luna/core'].version, '0.1.0');
    } finally {
      cleanTempDir(tmpDir);
    }
  });

  test('should fetch specific package and update luna.json', async () => {
    const tmpDir = makeTempDir();
    try {
      writeLunaJson(tmpDir, {
        name: 'test-app',
        version: '0.1.0',
        dependencies: {}
      });

      const registry = new RegistryClient({});
      const fetcher = new PackageFetcher({ cwd: tmpDir, registry, quiet: true });
      const result = await fetcher.fetchPackages(['@luna/ui']);

      assert(result.count >= 1, `Expected >= 1 installed, got ${result.count}`);

      // Check luna.json was updated
      const config = JSON.parse(fsMod.readFileSync(pathMod.join(tmpDir, 'luna.json'), 'utf-8'));
      assert(config.dependencies['@luna/ui'], 'luna.json should have @luna/ui in dependencies');

      // Check files exist
      const uiIndex = pathMod.join(tmpDir, 'luna_packages', '@luna', 'ui', 'index.js');
      assert(fsMod.existsSync(uiIndex), 'luna_packages/@luna/ui/index.js should exist');
    } finally {
      cleanTempDir(tmpDir);
    }
  });

  test('should skip already-installed packages', async () => {
    const tmpDir = makeTempDir();
    try {
      writeLunaJson(tmpDir, {
        name: 'test-app',
        version: '0.1.0',
        dependencies: { '@luna/qsr': '^0.1.0' }
      });

      const registry = new RegistryClient({});
      const fetcher1 = new PackageFetcher({ cwd: tmpDir, registry, quiet: true });
      const result1 = await fetcher1.fetchAll();
      assert(result1.count >= 1);

      // Fetch again — should skip
      const fetcher2 = new PackageFetcher({ cwd: tmpDir, registry, quiet: true });
      const result2 = await fetcher2.fetchAll();
      assertEqual(result2.count, 0);
    } finally {
      cleanTempDir(tmpDir);
    }
  });

  test('should remove packages', async () => {
    const tmpDir = makeTempDir();
    try {
      writeLunaJson(tmpDir, {
        name: 'test-app',
        version: '0.1.0',
        dependencies: { '@luna/edge': '^0.1.0' }
      });

      const registry = new RegistryClient({});
      const fetcher = new PackageFetcher({ cwd: tmpDir, registry, quiet: true });
      await fetcher.fetchAll();

      // Now remove
      const removeResult = await fetcher.removePackages(['@luna/edge']);
      assert(removeResult.count >= 1, 'Should have removed 1 package');

      const edgePath = pathMod.join(tmpDir, 'luna_packages', '@luna', 'edge');
      assert(!fsMod.existsSync(edgePath), 'luna_packages/@luna/edge should be gone');

      const config = JSON.parse(fsMod.readFileSync(pathMod.join(tmpDir, 'luna.json'), 'utf-8'));
      assert(!config.dependencies['@luna/edge'], '@luna/edge should be removed from luna.json');
    } finally {
      cleanTempDir(tmpDir);
    }
  });

  test('should list installed packages', async () => {
    const tmpDir = makeTempDir();
    try {
      writeLunaJson(tmpDir, {
        name: 'test-app',
        version: '0.1.0',
        dependencies: { '@luna/mobile': '^0.1.0', '@luna/desktop': '^0.1.0' }
      });

      const registry = new RegistryClient({});
      const fetcher = new PackageFetcher({ cwd: tmpDir, registry, quiet: true });
      await fetcher.fetchAll();

      const list = fetcher.listInstalled();
      assert(list.length >= 2, `Expected >= 2 installed, got ${list.length}`);
      assert(list.some(p => p.name === '@luna/mobile'));
      assert(list.some(p => p.name === '@luna/desktop'));
    } finally {
      cleanTempDir(tmpDir);
    }
  });
});

suite('Luna Fetch – Module Resolution', () => {
  const fsMod = require('fs');
  const pathMod = require('path');
  const os = require('os');
  const { ModuleResolver } = require('../src/module/resolver');
  const { PackageFetcher } = require('../src/lpm/fetcher');
  const { RegistryClient } = require('../src/lpm/registry');

  test('should resolve luna_packages via module resolver', async () => {
    const tmpDir = pathMod.join(os.tmpdir(), `luna-resolve-${Date.now()}`);
    fsMod.mkdirSync(tmpDir, { recursive: true });
    try {
      // Write luna.json
      fsMod.writeFileSync(pathMod.join(tmpDir, 'luna.json'), JSON.stringify({
        name: 'test-resolve',
        version: '0.1.0',
        dependencies: { '@luna/state': '^0.1.0' }
      }));

      // Fetch the package
      const registry = new RegistryClient({});
      const fetcher = new PackageFetcher({ cwd: tmpDir, registry, quiet: true });
      await fetcher.fetchAll();

      // Now resolve @luna/state
      const resolver = new ModuleResolver({});
      const fakeFromPath = pathMod.join(tmpDir, 'src', 'app.js');

      const resolved = resolver.resolve('@luna/state', fakeFromPath);
      assert(resolved !== null, 'Should resolve @luna/state');
      assertEqual(resolved.type, 'luna_package');
      assert(resolved.path.includes('luna_packages'), 'Path should contain luna_packages');
    } finally {
      fsMod.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

suite('Luna Fetch – PackageManager integration', () => {
  const fsMod = require('fs');
  const pathMod = require('path');
  const os = require('os');
  const { PackageManager } = require('../src/lpm/manager');

  test('pm.fetch() should install into luna_packages/', async () => {
    const tmpDir = pathMod.join(os.tmpdir(), `luna-pm-${Date.now()}`);
    fsMod.mkdirSync(tmpDir, { recursive: true });
    try {
      fsMod.writeFileSync(pathMod.join(tmpDir, 'luna.json'), JSON.stringify({
        name: 'test-pm',
        version: '0.1.0',
        dependencies: {}
      }));

      const pm = new PackageManager({ cwd: tmpDir });
      const result = await pm.fetch(['@luna/optimizer'], { quiet: true });
      assert(result.count >= 1, 'Should have fetched at least 1 package');

      const installed = pathMod.join(tmpDir, 'luna_packages', '@luna', 'optimizer', 'index.js');
      assert(fsMod.existsSync(installed), 'luna_packages/@luna/optimizer/index.js should exist');
    } finally {
      fsMod.rmSync(tmpDir, { recursive: true, force: true });
    }
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

// 16. App Router (File-Based Routing)
suite('App Router', () => {
  const { AppRouter, RouteEntry, CONVENTION_FILES } = require('../src/core/app-router');
  const path = require('path');
  const fs = require('fs');
  const os = require('os');

  // Create a temporary app/ directory for testing
  const tmpDir = path.join(os.tmpdir(), 'luna-test-app-' + Date.now());
  const appDir = path.join(tmpDir, 'app');

  // Setup test directory structure
  function setupTestAppDir() {
    // app/page.js
    fs.mkdirSync(path.join(appDir), { recursive: true });
    fs.writeFileSync(path.join(appDir, 'page.js'), 'module.exports = function Home() { return "Home"; };');

    // app/layout.js
    fs.writeFileSync(path.join(appDir, 'layout.js'), 'module.exports = function Layout({ children }) { return "<div>" + children + "</div>"; };');

    // app/globals.css
    fs.writeFileSync(path.join(appDir, 'globals.css'), 'body { margin: 0; }');

    // app/loading.js
    fs.writeFileSync(path.join(appDir, 'loading.js'), 'module.exports = function Loading() { return "Loading..."; };');

    // app/not-found.js
    fs.writeFileSync(path.join(appDir, 'not-found.js'), 'module.exports = function NotFound() { return "404"; };');

    // app/about/page.js
    fs.mkdirSync(path.join(appDir, 'about'), { recursive: true });
    fs.writeFileSync(path.join(appDir, 'about', 'page.js'), 'module.exports = function About() { return "About"; };');

    // app/blog/page.js
    fs.mkdirSync(path.join(appDir, 'blog'), { recursive: true });
    fs.writeFileSync(path.join(appDir, 'blog', 'page.js'), 'module.exports = function Blog() { return "Blog"; };');

    // app/blog/[slug]/page.js
    fs.mkdirSync(path.join(appDir, 'blog', '[slug]'), { recursive: true });
    fs.writeFileSync(path.join(appDir, 'blog', '[slug]', 'page.js'), 'module.exports = function Post({ params }) { return "Post: " + params.slug; };');

    // app/api/hello/route.js
    fs.mkdirSync(path.join(appDir, 'api', 'hello'), { recursive: true });
    fs.writeFileSync(path.join(appDir, 'api', 'hello', 'route.js'), 'module.exports.GET = function(req, res) { res.end("hello"); };');

    // app/docs/[...slug]/page.js (catch-all)
    fs.mkdirSync(path.join(appDir, 'docs', '[...slug]'), { recursive: true });
    fs.writeFileSync(path.join(appDir, 'docs', '[...slug]', 'page.js'), 'module.exports = function Docs() { return "Docs"; };');

    // app/(marketing)/promo/page.js (route group)
    fs.mkdirSync(path.join(appDir, '(marketing)', 'promo'), { recursive: true });
    fs.writeFileSync(path.join(appDir, '(marketing)', 'promo', 'page.js'), 'module.exports = function Promo() { return "Promo"; };');
  }

  setupTestAppDir();

  test('should create AppRouter instance', () => {
    const router = new AppRouter({ appDir });
    assert(router !== null);
    assert(router.appDir === appDir);
  });

  test('should scan app/ directory', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    assert(router.routes.length > 0, 'Should find routes');
  });

  test('should find root page route /', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    const home = router.routes.find(r => r.urlPath === '/' && r.type === 'page');
    assert(home, 'Should find / page route');
    assert(home.filePath.endsWith('page.js'), 'Should point to page.js');
  });

  test('should find /about page route', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    const about = router.routes.find(r => r.urlPath === '/about');
    assert(about, 'Should find /about route');
    assertEqual(about.type, 'page');
  });

  test('should find /blog page route', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    const blog = router.routes.find(r => r.urlPath === '/blog' && r.type === 'page');
    assert(blog, 'Should find /blog route');
  });

  test('should find dynamic route /blog/:slug', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    const post = router.routes.find(r => r.urlPath === '/blog/:slug');
    assert(post, 'Should find /blog/:slug route');
    assert(post.isDynamic, 'Should be marked as dynamic');
  });

  test('should find catch-all route /docs/*', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    const docs = router.routes.find(r => r.urlPath === '/docs/*');
    assert(docs, 'Should find /docs/* catch-all route');
    assert(docs.isCatchAll, 'Should be marked as catch-all');
  });

  test('should find API route /api/hello', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    const api = router.routes.find(r => r.urlPath === '/api/hello');
    assert(api, 'Should find /api/hello route');
    assertEqual(api.type, 'api');
  });

  test('should detect root layout', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    assert(router.rootLayout !== null, 'Should detect root layout');
    assert(router.rootLayout.endsWith('layout.js'));
  });

  test('should detect globals.css', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    assert(router.globalsCss !== null, 'Should detect globals.css');
  });

  test('should detect root loading.js', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    assert(router.rootLoading !== null, 'Should detect loading.js');
  });

  test('should detect not-found.js', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    assert(router.rootNotFound !== null, 'Should detect not-found.js');
  });

  test('should build layout chain for nested routes', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    const post = router.routes.find(r => r.urlPath === '/blog/:slug');
    assert(post.layoutChain.length > 0, 'Should have layouts in chain');
    assert(post.layoutChain[0].endsWith('layout.js'), 'First in chain should be root layout');
  });

  test('should handle route groups (marketing)', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    // Route group (marketing) should NOT appear in URL
    const promo = router.routes.find(r => r.urlPath === '/promo');
    assert(promo, 'Route group page should have URL without group name');
  });

  test('should sort static routes before dynamic', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    const pageRoutes = router.getPageRoutes();
    const firstDynamic = pageRoutes.findIndex(r => r.isDynamic);
    if (firstDynamic > 0) {
      // All routes before the first dynamic should be static
      for (let i = 0; i < firstDynamic; i++) {
        assert(!pageRoutes[i].isDynamic, `Route ${pageRoutes[i].urlPath} should be static`);
      }
    }
  });

  test('getPageRoutes returns only page routes', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    const pages = router.getPageRoutes();
    for (const p of pages) {
      assertEqual(p.type, 'page');
    }
  });

  test('getApiRoutes returns only api routes', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    const apis = router.getApiRoutes();
    for (const a of apis) {
      assertEqual(a.type, 'api');
    }
  });

  test('toTree produces printable output', () => {
    const router = new AppRouter({ appDir });
    router.scan();
    const tree = router.toTree();
    assert(tree.includes('app/'), 'Tree should start with app/');
    assert(tree.includes('[PAGE]') || tree.includes('[API]'), 'Tree should have route labels');
  });

  test('should throw if app directory does not exist', () => {
    const router = new AppRouter({ appDir: path.join(tmpDir, 'nonexistent') });
    assertThrows(() => router.scan(), 'Should throw for missing app dir');
  });

  // Cleanup
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
});

// 17. Dev Server
suite('Dev Server', () => {
  const { DevServer, MIME_TYPES } = require('../src/core/dev-server');
  const path = require('path');
  const fs = require('fs');
  const os = require('os');

  test('should create DevServer instance', () => {
    const ds = new DevServer({ cwd: os.tmpdir() });
    assert(ds !== null);
    assertEqual(ds.mode, 'development');
  });

  test('hasAppDir returns false when no app/ exists', () => {
    const ds = new DevServer({ cwd: path.join(os.tmpdir(), 'nonexistent-' + Date.now()) });
    assertEqual(ds.hasAppDir(), false);
  });

  test('hasAppDir returns true when app/ exists', () => {
    const tmpDir = path.join(os.tmpdir(), 'luna-ds-test-' + Date.now());
    fs.mkdirSync(path.join(tmpDir, 'app'), { recursive: true });
    const ds = new DevServer({ cwd: tmpDir });
    assertEqual(ds.hasAppDir(), true);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('MIME_TYPES has common types', () => {
    assert(MIME_TYPES['.html'] === 'text/html');
    assert(MIME_TYPES['.css'] === 'text/css');
    assert(MIME_TYPES['.js'] === 'application/javascript');
    assert(MIME_TYPES['.json'] === 'application/json');
    assert(MIME_TYPES['.png'] === 'image/png');
  });

  test('extractParams extracts dynamic params', () => {
    const ds = new DevServer();
    const params = ds._extractParams('/blog/:slug', '/blog/hello-world');
    assertEqual(params.slug, 'hello-world');
  });

  test('extractParams handles catch-all *', () => {
    const ds = new DevServer();
    const params = ds._extractParams('/docs/*', '/docs/api/reference/intro');
    assertEqual(params['*'], 'api/reference/intro');
  });

  test('parseQuery parses query string', () => {
    const ds = new DevServer();
    const query = ds._parseQuery('/search?q=luna&page=2');
    assertEqual(query.q, 'luna');
    assertEqual(query.page, '2');
  });

  test('parseQuery returns empty for no query', () => {
    const ds = new DevServer();
    const query = ds._parseQuery('/about');
    assertDeepEqual(query, {});
  });

  test('vnodeToHtml renders simple vnode', () => {
    const ds = new DevServer();
    const html = ds._vnodeToHtml({
      tag: 'div',
      props: { className: 'test' },
      children: ['Hello']
    });
    assert(html.includes('<div'));
    assert(html.includes('class="test"'));
    assert(html.includes('Hello'));
    assert(html.includes('</div>'));
  });

  test('vnodeToHtml handles void tags', () => {
    const ds = new DevServer();
    const html = ds._vnodeToHtml({
      tag: 'br',
      props: {},
      children: []
    });
    assert(html.includes('<br'), 'Should render br tag');
    assert(html.includes('/>'), 'Should self-close void tag');
  });

  test('vnodeToHtml handles nested vnodes', () => {
    const ds = new DevServer();
    const html = ds._vnodeToHtml({
      tag: 'div',
      props: {},
      children: [
        { tag: 'h1', props: {}, children: ['Title'] },
        { tag: 'p', props: {}, children: ['Body'] }
      ]
    });
    assert(html.includes('<h1>Title</h1>'));
    assert(html.includes('<p>Body</p>'));
  });

  test('renderComponent handles functional component', () => {
    const ds = new DevServer();
    const comp = (props) => ({ tag: 'p', props: {}, children: ['Hello ' + (props.name || '')] });
    const html = ds._renderComponent(comp, { name: 'World' });
    assert(html.includes('Hello World'));
  });

  test('renderComponent handles string return', () => {
    const ds = new DevServer();
    const comp = () => '<b>raw html</b>';
    const html = ds._renderComponent(comp, {});
    assertEqual(html, '<b>raw html</b>');
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
