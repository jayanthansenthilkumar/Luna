/**
 * LUNA – Universal JavaScript Operating Runtime
 * 
 * One Language. One Runtime. Every Platform.
 * 
 * Main entry point for the LUNA runtime system.
 */

'use strict';

const { LunaEngine } = require('./core/engine');
const { Scheduler } = require('./core/scheduler');
const { Sandbox } = require('./core/sandbox');
const { SystemAPI } = require('./core/system-api');
const { HttpServer } = require('./net/http-server');
const { Router } = require('./net/router');
const { MiddlewarePipeline } = require('./net/middleware');
const { WebSocketServer } = require('./net/websocket');
const { StreamEngine } = require('./net/streaming');
const { UIEngine } = require('./ui/engine');
const { ReactiveState } = require('./ui/reactive-state');
const { SSREngine } = require('./ui/ssr');
const { HydrationEngine } = require('./ui/hydration');
const { UIRouter } = require('./ui/router');
const { MobileBridge } = require('./mobile/bridge');
const { DesktopShell } = require('./desktop/shell');
const { EdgeRuntime } = require('./edge/runtime');
const { ModuleResolver } = require('./module/resolver');
const { PackageManager } = require('./lpm/manager');
const { BuildSystem } = require('./build/builder');
const { SelfEvolvingOptimizer: RuntimeOptimizer } = require('./optimizer/self-evolving');
const { UniversalCodeContinuity } = require('./ucc/continuity');
const { QuantumStateRenderer } = require('./qsr/quantum-state');

/**
 * The main LUNA runtime class.
 * Integrates all subsystems into a single cohesive architecture.
 */
class Luna {
  constructor(config = {}) {
    this.config = this._loadConfig(config);
    this.version = '0.1.0';
    this.platform = this._detectPlatform();

    // Core subsystems
    this.engine = null;
    this.scheduler = null;
    this.sandbox = null;
    this.systemAPI = null;

    // Network subsystems
    this.httpServer = null;
    this.router = null;
    this.middleware = null;
    this.wsServer = null;
    this.streamEngine = null;

    // UI subsystems
    this.uiEngine = null;
    this.reactiveState = null;
    this.ssrEngine = null;
    this.hydrationEngine = null;
    this.uiRouter = null;

    // Platform subsystems
    this.mobileBridge = null;
    this.desktopShell = null;
    this.edgeRuntime = null;

    // Infrastructure subsystems
    this.moduleResolver = null;
    this.packageManager = null;
    this.buildSystem = null;

    // Unique features
    this.optimizer = null;
    this.ucc = null;
    this.qsr = null;
  }

  /**
   * Load configuration from luna.json or provided config object.
   */
  _loadConfig(overrides) {
    const fs = require('fs');
    const path = require('path');
    let fileConfig = {};

    const configPath = path.resolve(process.cwd(), 'luna.json');
    if (fs.existsSync(configPath)) {
      try {
        fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      } catch (e) {
        // Silently fall back to defaults
      }
    }

    return {
      name: 'luna-app',
      version: '0.1.0',
      platform: {
        backend: true,
        web: true,
        mobile: { android: false, ios: false },
        desktop: { windows: false, macos: false, linux: false },
        edge: false
      },
      runtime: {
        scheduler: { workerThreads: 4, ioThreads: 2 },
        sandbox: { enabled: true, capabilities: ['fs', 'net', 'env'] },
        optimizer: { selfEvolving: true, hotPathThreshold: 100 }
      },
      rendering: {
        strategy: 'server-first',
        hydration: 'incremental',
        ssr: true,
        ssg: true,
        isr: true,
        edgeRendering: false
      },
      module: {
        resolution: 'luna',
        caching: true,
        circularHandling: 'lazy'
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        clustering: false,
        workers: 0
      },
      ...fileConfig,
      ...overrides
    };
  }

  /**
   * Detect the current execution platform.
   */
  _detectPlatform() {
    const os = require('os');
    const platform = os.platform();
    return {
      os: platform,
      arch: os.arch(),
      isNode: typeof process !== 'undefined' && process.versions?.node,
      isBrowser: typeof window !== 'undefined',
      isWorker: typeof importScripts === 'function',
      isEdge: typeof EdgeRuntime !== 'undefined',
      isMobile: false, // Detected via native bridge
      isDesktop: ['win32', 'darwin', 'linux'].includes(platform)
    };
  }

  /**
   * Initialize the LUNA runtime – boots all configured subsystems.
   */
  async init() {
    console.log(`\n  🌙 LUNA Runtime v${this.version}`);
    console.log(`  Platform: ${this.platform.os} (${this.platform.arch})\n`);

    // 1. Core layer
    this.engine = new LunaEngine(this.config);
    await this.engine.init();

    this.scheduler = new Scheduler(this.config.runtime.scheduler);
    await this.scheduler.init();

    this.sandbox = new Sandbox(this.config.runtime.sandbox);
    this.systemAPI = new SystemAPI(this.sandbox);

    // 2. Module system
    this.moduleResolver = new ModuleResolver(this.config.module);

    // 3. Network layer
    this.router = new Router();
    this.middleware = new MiddlewarePipeline();
    this.streamEngine = new StreamEngine();
    this.httpServer = new HttpServer({
      ...this.config.server,
      router: this.router,
      middleware: this.middleware,
      scheduler: this.scheduler
    });
    this.wsServer = new WebSocketServer(this.httpServer);

    // 4. UI layer
    this.reactiveState = new ReactiveState();
    this.uiRouter = new UIRouter();
    this.ssrEngine = new SSREngine(this.config.rendering);
    this.hydrationEngine = new HydrationEngine(this.config.rendering);
    this.uiEngine = new UIEngine({
      state: this.reactiveState,
      router: this.uiRouter,
      ssr: this.ssrEngine,
      hydration: this.hydrationEngine,
      config: this.config.rendering
    });

    // 5. Unique features
    this.qsr = new QuantumStateRenderer(this.reactiveState);
    this.optimizer = new RuntimeOptimizer(this.config.runtime.optimizer, this.scheduler);
    this.ucc = new UniversalCodeContinuity(this);

    // 6. Platform-specific layers
    if (this.config.platform.mobile?.android || this.config.platform.mobile?.ios) {
      this.mobileBridge = new MobileBridge(this.config.platform.mobile);
    }
    if (this.config.platform.desktop?.windows || this.config.platform.desktop?.macos || this.config.platform.desktop?.linux) {
      this.desktopShell = new DesktopShell(this.config.platform.desktop);
    }
    if (this.config.platform.edge) {
      this.edgeRuntime = new EdgeRuntime(this.config);
    }

    // 7. Package manager & build
    this.packageManager = new PackageManager(this.config);
    this.buildSystem = new BuildSystem(this.config);

    // Start the runtime optimizer
    if (this.config.runtime.optimizer.selfEvolving) {
      this.optimizer.start();
    }

    return this;
  }

  /**
   * Start listening for HTTP requests.
   */
  async listen(port, host) {
    const p = port || this.config.server.port;
    const h = host || this.config.server.host;
    await this.httpServer.listen(p, h);
    console.log(`  🌙 LUNA server listening on http://${h}:${p}\n`);
    return this;
  }

  /**
   * Register a route (shorthand).
   */
  route(method, path, ...handlers) {
    this.router.add(method, path, ...handlers);
    return this;
  }

  get(path, ...handlers) { return this.route('GET', path, ...handlers); }
  post(path, ...handlers) { return this.route('POST', path, ...handlers); }
  put(path, ...handlers) { return this.route('PUT', path, ...handlers); }
  delete(path, ...handlers) { return this.route('DELETE', path, ...handlers); }
  patch(path, ...handlers) { return this.route('PATCH', path, ...handlers); }

  /**
   * Register middleware.
   */
  use(...args) {
    this.middleware.use(...args);
    return this;
  }

  /**
   * Register a UI component.
   */
  component(name, definition) {
    this.uiEngine.registerComponent(name, definition);
    return this;
  }

  /**
   * Define a UI page route.
   */
  page(path, component, options = {}) {
    this.uiRouter.add(path, component, options);
    return this;
  }

  /**
   * Graceful shutdown.
   */
  async shutdown() {
    console.log('\n  🌙 LUNA shutting down...');
    if (this.optimizer) this.optimizer.stop();
    if (this.httpServer) await this.httpServer.close();
    if (this.wsServer) await this.wsServer.close();
    if (this.scheduler) await this.scheduler.shutdown();
    if (this.edgeRuntime) await this.edgeRuntime.stop();
    console.log('  🌙 LUNA shutdown complete.\n');
  }
}

// Export the Luna class and a factory function
module.exports = { Luna };
module.exports.default = Luna;
module.exports.createApp = (config) => new Luna(config);
