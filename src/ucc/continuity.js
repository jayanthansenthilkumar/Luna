/**
 * LUNA Universal Code Continuity (UCC)
 * 
 * One execution fabric: identical application logic runs seamlessly across
 * web, backend, mobile, desktop, and edge deployments.
 * 
 * Features:
 * - Platform-adaptive code execution
 * - Shared logic modules
 * - Platform-specific overrides
 * - State portability across platforms
 * - Code migration at runtime
 * - Execution context transfer
 * - Platform capability detection
 */

'use strict';

const { EventEmitter } = require('events');

/**
 * Platform types.
 */
const PLATFORMS = {
  BACKEND: 'backend',
  WEB: 'web',
  MOBILE: 'mobile',
  DESKTOP: 'desktop',
  EDGE: 'edge'
};

/**
 * Platform capability map.
 */
const PLATFORM_CAPABILITIES = {
  backend: ['fs', 'net', 'process', 'crypto', 'cluster', 'child_process', 'worker_threads'],
  web: ['dom', 'fetch', 'websocket', 'service_worker', 'web_worker', 'indexeddb', 'webgl'],
  mobile: ['camera', 'gps', 'accelerometer', 'notifications', 'biometrics', 'haptics', 'nfc'],
  desktop: ['window', 'menu', 'tray', 'dialog', 'shortcuts', 'clipboard', 'file_dialog'],
  edge: ['kv_store', 'cache', 'geo_routing', 'distributed_state', 'low_latency']
};

/**
 * Detect the current platform.
 */
function detectPlatform() {
  // Check for edge runtime markers
  if (typeof globalThis.__LUNA_EDGE__ !== 'undefined') return PLATFORMS.EDGE;

  // Check for mobile runtime markers
  if (typeof globalThis.__LUNA_MOBILE__ !== 'undefined') return PLATFORMS.MOBILE;

  // Check for desktop runtime markers
  if (typeof globalThis.__LUNA_DESKTOP__ !== 'undefined') return PLATFORMS.DESKTOP;

  // Check for browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') return PLATFORMS.WEB;

  // Default to backend (Node.js)
  return PLATFORMS.BACKEND;
}

/**
 * Platform-adaptive module wrapper.
 */
class AdaptiveModule {
  constructor(name) {
    this.name = name;
    this.shared = null;
    this.overrides = new Map();
  }

  /**
   * Define shared (cross-platform) logic.
   */
  define(implementation) {
    this.shared = implementation;
    return this;
  }

  /**
   * Define a platform-specific override.
   */
  platform(platformName, implementation) {
    this.overrides.set(platformName, implementation);
    return this;
  }

  /**
   * Resolve the correct implementation for the current platform.
   */
  resolve(platform) {
    if (this.overrides.has(platform)) {
      const override = this.overrides.get(platform);
      if (this.shared) {
        // Merge shared with platform-specific
        return { ...this.shared, ...override };
      }
      return override;
    }
    return this.shared;
  }
}

/**
 * Execution context that can be serialized and transferred.
 */
class ExecutionContext {
  constructor(data = {}) {
    this.id = data.id || `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.platform = data.platform || detectPlatform();
    this.state = data.state || {};
    this.callStack = data.callStack || [];
    this.variables = data.variables || {};
    this.createdAt = data.createdAt || Date.now();
    this.migratedFrom = data.migratedFrom || null;
    this.version = data.version || 1;
  }

  /**
   * Set a variable in the execution context.
   */
  set(key, value) {
    this.variables[key] = value;
    return this;
  }

  /**
   * Get a variable from the execution context.
   */
  get(key, defaultValue) {
    return key in this.variables ? this.variables[key] : defaultValue;
  }

  /**
   * Push onto the call stack.
   */
  pushCall(fnName, args) {
    this.callStack.push({
      fn: fnName,
      args: this._serializeArgs(args),
      timestamp: Date.now()
    });
    if (this.callStack.length > 100) {
      this.callStack.shift();
    }
  }

  /**
   * Serialize the context for transfer.
   */
  serialize() {
    return JSON.stringify({
      id: this.id,
      platform: this.platform,
      state: this.state,
      callStack: this.callStack,
      variables: this._serializeVariables(),
      createdAt: this.createdAt,
      migratedFrom: this.migratedFrom,
      version: this.version,
      serializedAt: Date.now()
    });
  }

  /**
   * Deserialize a context from string.
   */
  static deserialize(data) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return new ExecutionContext(parsed);
  }

  /**
   * Create a migration copy targeting a new platform.
   */
  migrate(targetPlatform) {
    return new ExecutionContext({
      id: this.id,
      platform: targetPlatform,
      state: { ...this.state },
      callStack: [...this.callStack],
      variables: { ...this.variables },
      createdAt: this.createdAt,
      migratedFrom: this.platform,
      version: this.version + 1
    });
  }

  _serializeArgs(args) {
    try {
      return JSON.parse(JSON.stringify(args));
    } catch {
      return [];
    }
  }

  _serializeVariables() {
    const result = {};
    for (const [key, value] of Object.entries(this.variables)) {
      try {
        JSON.stringify(value);
        result[key] = value;
      } catch {
        result[key] = '[non-serializable]';
      }
    }
    return result;
  }
}

/**
 * State portability layer – keeps state synchronized across platforms.
 */
class StatePortability extends EventEmitter {
  constructor() {
    super();
    this.state = {};
    this.snapshots = [];
    this.syncHandlers = new Map();
    this.maxSnapshots = 50;
  }

  /**
   * Set state value.
   */
  set(key, value) {
    const old = this.state[key];
    this.state[key] = value;
    this.emit('change', { key, value, old });
    this._notifySync(key, value);
    return this;
  }

  /**
   * Get state value.
   */
  get(key, defaultValue) {
    return key in this.state ? this.state[key] : defaultValue;
  }

  /**
   * Take a snapshot of current state.
   */
  snapshot() {
    const snap = {
      state: JSON.parse(JSON.stringify(this.state)),
      timestamp: Date.now()
    };
    this.snapshots.push(snap);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
    return snap;
  }

  /**
   * Restore state from a snapshot.
   */
  restore(snapshot) {
    this.state = JSON.parse(JSON.stringify(snapshot.state));
    this.emit('restore', snapshot);
    return this;
  }

  /**
   * Export state for cross-platform transfer.
   */
  exportState() {
    return JSON.stringify({
      state: this.state,
      exportedAt: Date.now(),
      platform: detectPlatform()
    });
  }

  /**
   * Import state from another platform.
   */
  importState(data) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    this.state = { ...this.state, ...parsed.state };
    this.emit('import', { from: parsed.platform, keys: Object.keys(parsed.state) });
    return this;
  }

  /**
   * Register a sync handler for a specific key.
   */
  onSync(key, handler) {
    if (!this.syncHandlers.has(key)) {
      this.syncHandlers.set(key, []);
    }
    this.syncHandlers.get(key).push(handler);
    return this;
  }

  _notifySync(key, value) {
    const handlers = this.syncHandlers.get(key) || [];
    for (const handler of handlers) {
      try {
        handler(value, key);
      } catch (e) {
        this.emit('error', e);
      }
    }
  }
}

/**
 * Main Universal Code Continuity controller.
 */
class UniversalCodeContinuity extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.platform = detectPlatform();
    this.modules = new Map();
    this.contexts = new Map();
    this.statePortability = new StatePortability();
    this.capabilities = PLATFORM_CAPABILITIES[this.platform] || [];
  }

  /**
   * Register an adaptive module.
   */
  module(name) {
    const mod = new AdaptiveModule(name);
    this.modules.set(name, mod);
    return mod;
  }

  /**
   * Get a module resolved for the current platform.
   */
  getModule(name, platform) {
    const mod = this.modules.get(name);
    if (!mod) throw new Error(`Module not found: ${name}`);
    return mod.resolve(platform || this.platform);
  }

  /**
   * Create a new execution context.
   */
  createContext(initialState = {}) {
    const ctx = new ExecutionContext({
      platform: this.platform,
      state: initialState
    });
    this.contexts.set(ctx.id, ctx);
    return ctx;
  }

  /**
   * Migrate an execution context to another platform.
   */
  migrateContext(contextId, targetPlatform) {
    const ctx = this.contexts.get(contextId);
    if (!ctx) throw new Error(`Context not found: ${contextId}`);

    const migrated = ctx.migrate(targetPlatform);
    this.contexts.set(migrated.id, migrated);

    this.emit('migrate', {
      contextId,
      from: ctx.platform,
      to: targetPlatform,
      version: migrated.version
    });

    return migrated;
  }

  /**
   * Export a context for cross-process/network transfer.
   */
  exportContext(contextId) {
    const ctx = this.contexts.get(contextId);
    if (!ctx) throw new Error(`Context not found: ${contextId}`);
    return ctx.serialize();
  }

  /**
   * Import a context from another platform/process.
   */
  importContext(data) {
    const ctx = ExecutionContext.deserialize(data);
    ctx.platform = this.platform; // Update to current platform
    this.contexts.set(ctx.id, ctx);
    this.emit('importContext', { id: ctx.id, migratedFrom: ctx.migratedFrom });
    return ctx;
  }

  /**
   * Check if a capability is available on the current platform.
   */
  hasCapability(capability) {
    return this.capabilities.includes(capability);
  }

  /**
   * Run code with platform adaptation.
   */
  adaptive(handlers) {
    const handler = handlers[this.platform] || handlers.default;
    if (!handler) {
      throw new Error(`No handler for platform ${this.platform} and no default provided`);
    }
    return handler();
  }

  /**
   * Get the state portability layer.
   */
  getState() {
    return this.statePortability;
  }

  /**
   * Get a report of the current execution environment.
   */
  getEnvironmentReport() {
    return {
      platform: this.platform,
      capabilities: this.capabilities,
      modules: Array.from(this.modules.keys()),
      activeContexts: this.contexts.size,
      state: {
        keys: Object.keys(this.statePortability.state),
        snapshots: this.statePortability.snapshots.length
      }
    };
  }
}

module.exports = {
  UniversalCodeContinuity,
  ExecutionContext,
  AdaptiveModule,
  StatePortability,
  PLATFORMS,
  PLATFORM_CAPABILITIES,
  detectPlatform
};
