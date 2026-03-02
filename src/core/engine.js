/**
 * LUNA Core Engine
 * 
 * The foundational JavaScript engine layer that manages the execution context,
 * global environment setup, and core runtime lifecycle.
 */

'use strict';

const { EventEmitter } = require('events');

class LunaEngine extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.startTime = null;
    this.globals = new Map();
    this.extensions = new Map();
    this.hooks = {
      beforeInit: [],
      afterInit: [],
      beforeShutdown: [],
      afterShutdown: []
    };
    this.state = 'idle'; // idle | initializing | running | shutting-down | stopped
    this.metrics = {
      startupTime: 0,
      totalRequests: 0,
      totalErrors: 0,
      uptime: 0
    };
  }

  /**
   * Initialize the engine.
   */
  async init() {
    this.state = 'initializing';
    this.startTime = Date.now();

    // Run pre-init hooks
    for (const hook of this.hooks.beforeInit) {
      await hook(this);
    }

    // Setup global environment
    this._setupGlobals();

    // Setup error handling
    this._setupErrorHandling();

    // Setup performance monitoring
    this._setupPerformanceMonitoring();

    // Run post-init hooks
    for (const hook of this.hooks.afterInit) {
      await hook(this);
    }

    this.state = 'running';
    this.metrics.startupTime = Date.now() - this.startTime;
    this.emit('ready', { startupTime: this.metrics.startupTime });
  }

  /**
   * Register global values accessible throughout the runtime.
   */
  _setupGlobals() {
    this.globals.set('__LUNA_VERSION__', '0.1.0');
    this.globals.set('__LUNA_PLATFORM__', process.platform);
    this.globals.set('__LUNA_ENV__', process.env.LUNA_ENV || 'development');
    this.globals.set('__LUNA_START_TIME__', this.startTime);

    // Expose to global context for user code
    if (typeof globalThis !== 'undefined') {
      globalThis.__luna__ = {
        version: '0.1.0',
        env: process.env.LUNA_ENV || 'development',
        platform: process.platform,
        getGlobal: (key) => this.globals.get(key),
        setGlobal: (key, value) => this.globals.set(key, value)
      };
    }
  }

  /**
   * Setup centralized error handling.
   */
  _setupErrorHandling() {
    process.on('uncaughtException', (error) => {
      this.metrics.totalErrors++;
      this.emit('error', { type: 'uncaughtException', error });
      console.error('[LUNA] Uncaught Exception:', error.message);
      if (process.env.LUNA_ENV === 'production') {
        // In production, attempt graceful restart
        this.emit('fatal', error);
      }
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.metrics.totalErrors++;
      this.emit('error', { type: 'unhandledRejection', reason, promise });
      console.error('[LUNA] Unhandled Rejection:', reason);
    });
  }

  /**
   * Setup lightweight performance monitoring.
   */
  _setupPerformanceMonitoring() {
    this._uptimeInterval = setInterval(() => {
      this.metrics.uptime = Date.now() - this.startTime;
    }, 1000);

    // Prevent keeping the process alive
    if (this._uptimeInterval.unref) {
      this._uptimeInterval.unref();
    }
  }

  /**
   * Register a lifecycle hook.
   */
  hook(phase, fn) {
    if (this.hooks[phase]) {
      this.hooks[phase].push(fn);
    }
    return this;
  }

  /**
   * Register an engine extension.
   */
  extend(name, extension) {
    this.extensions.set(name, extension);
    if (typeof extension.init === 'function') {
      extension.init(this);
    }
    return this;
  }

  /**
   * Get engine metrics snapshot.
   */
  getMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Shutdown the engine.
   */
  async shutdown() {
    this.state = 'shutting-down';

    for (const hook of this.hooks.beforeShutdown) {
      await hook(this);
    }

    clearInterval(this._uptimeInterval);

    for (const hook of this.hooks.afterShutdown) {
      await hook(this);
    }

    this.state = 'stopped';
    this.emit('shutdown');
  }
}

module.exports = { LunaEngine };
