/**
 * LUNA Secure Capability Sandbox
 * 
 * Provides a capability-based security model where code
 * must be explicitly granted access to system resources.
 * 
 * Capabilities: fs, net, env, process, ffi, gpu, camera, location
 */

'use strict';

const { EventEmitter } = require('events');
const vm = require('vm');

/**
 * Capability definitions with granular permissions.
 */
const CAPABILITIES = {
  fs: {
    name: 'File System',
    description: 'Access to read/write files and directories',
    permissions: ['read', 'write', 'delete', 'list', 'watch'],
    paths: [] // Allowed path patterns
  },
  net: {
    name: 'Network',
    description: 'Access to network connections',
    permissions: ['http', 'https', 'ws', 'tcp', 'udp', 'dns'],
    hosts: [] // Allowed host patterns
  },
  env: {
    name: 'Environment',
    description: 'Access to environment variables',
    permissions: ['read', 'write'],
    keys: [] // Allowed env variable keys
  },
  process: {
    name: 'Process',
    description: 'Access to process management',
    permissions: ['spawn', 'exec', 'signal', 'exit']
  },
  ffi: {
    name: 'Foreign Function Interface',
    description: 'Access to native code execution',
    permissions: ['load', 'call']
  },
  gpu: {
    name: 'GPU',
    description: 'Access to GPU compute and rendering',
    permissions: ['compute', 'render']
  },
  camera: {
    name: 'Camera',
    description: 'Access to camera hardware',
    permissions: ['capture', 'stream']
  },
  location: {
    name: 'Location',
    description: 'Access to geolocation',
    permissions: ['read', 'watch']
  }
};

/**
 * Security policy for a sandbox context.
 */
class SecurityPolicy {
  constructor(grants = []) {
    this.grants = new Map();
    this.denials = new Set();

    for (const grant of grants) {
      if (typeof grant === 'string') {
        this.grant(grant);
      } else if (typeof grant === 'object') {
        this.grant(grant.capability, grant);
      }
    }
  }

  /**
   * Grant a capability with optional restrictions.
   */
  grant(capability, options = {}) {
    if (!CAPABILITIES[capability]) {
      throw new Error(`Unknown capability: ${capability}`);
    }

    this.grants.set(capability, {
      permissions: options.permissions || CAPABILITIES[capability].permissions,
      paths: options.paths || CAPABILITIES[capability].paths || [],
      hosts: options.hosts || CAPABILITIES[capability].hosts || [],
      keys: options.keys || CAPABILITIES[capability].keys || [],
      readonly: options.readonly || false,
      rateLimit: options.rateLimit || null
    });

    return this;
  }

  /**
   * Deny a capability explicitly.
   */
  deny(capability) {
    this.denials.add(capability);
    this.grants.delete(capability);
    return this;
  }

  /**
   * Check if a capability is granted.
   */
  has(capability, permission = null) {
    if (this.denials.has(capability)) return false;
    const grant = this.grants.get(capability);
    if (!grant) return false;
    if (permission && !grant.permissions.includes(permission)) return false;
    return true;
  }

  /**
   * Check path-level access for fs capability.
   */
  hasPathAccess(filePath, permission = 'read') {
    if (!this.has('fs', permission)) return false;
    const grant = this.grants.get('fs');
    if (grant.paths.length === 0) return true; // No restriction = all paths
    return grant.paths.some(pattern => {
      if (pattern === '*') return true;
      return filePath.startsWith(pattern);
    });
  }

  /**
   * Check host-level access for net capability.
   */
  hasHostAccess(host, permission = 'http') {
    if (!this.has('net', permission)) return false;
    const grant = this.grants.get('net');
    if (grant.hosts.length === 0) return true;
    return grant.hosts.some(pattern => {
      if (pattern === '*') return true;
      return host === pattern || host.endsWith('.' + pattern);
    });
  }

  /**
   * Serialize the policy.
   */
  toJSON() {
    const obj = {};
    for (const [cap, grant] of this.grants) {
      obj[cap] = grant;
    }
    return obj;
  }
}

/**
 * Sandboxed execution context.
 */
class SandboxContext {
  constructor(name, policy, options = {}) {
    this.name = name;
    this.policy = policy;
    this.id = `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.createdAt = Date.now();
    this.accessLog = [];
    this.violations = [];
    this.options = options;
  }

  /**
   * Check a capability request and log the access.
   */
  check(capability, permission = null, details = {}) {
    const allowed = this.policy.has(capability, permission);

    const entry = {
      timestamp: Date.now(),
      capability,
      permission,
      details,
      allowed
    };

    this.accessLog.push(entry);

    if (!allowed) {
      this.violations.push(entry);
      throw new SecurityError(
        `[LUNA Sandbox] Access denied: ${capability}${permission ? '.' + permission : ''} in context "${this.name}"`,
        capability,
        permission
      );
    }

    return true;
  }

  /**
   * Get access audit log.
   */
  getAuditLog() {
    return {
      context: this.name,
      id: this.id,
      createdAt: this.createdAt,
      accessCount: this.accessLog.length,
      violationCount: this.violations.length,
      entries: this.accessLog
    };
  }
}

/**
 * Custom security error.
 */
class SecurityError extends Error {
  constructor(message, capability, permission) {
    super(message);
    this.name = 'SecurityError';
    this.capability = capability;
    this.permission = permission;
  }
}

/**
 * Main Sandbox class.
 */
class Sandbox extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.enabled = config.enabled !== false;
    this.defaultCapabilities = config.capabilities || [];
    this.contexts = new Map();
    this.globalPolicy = new SecurityPolicy(this.defaultCapabilities);
  }

  /**
   * Create a new sandboxed execution context.
   */
  createContext(name, capabilities = []) {
    const policy = new SecurityPolicy(
      capabilities.length > 0 ? capabilities : this.defaultCapabilities
    );
    const context = new SandboxContext(name, policy);
    this.contexts.set(context.id, context);
    this.emit('contextCreated', context);
    return context;
  }

  /**
   * Execute code within a sandboxed context.
   */
  async execute(code, contextOrName = 'default', globals = {}) {
    if (!this.enabled) {
      // If sandbox is disabled, run directly
      const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', code);
      const mod = { exports: {} };
      fn(mod.exports, require, mod, '', '');
      return mod.exports;
    }

    let context;
    if (typeof contextOrName === 'string') {
      context = this.createContext(contextOrName);
    } else {
      context = contextOrName;
    }

    // Build sandbox globals
    const sandbox = {
      console: this._createSafeConsole(context),
      setTimeout: this._wrapTimer(setTimeout, context),
      setInterval: this._wrapTimer(setInterval, context),
      clearTimeout,
      clearInterval,
      Promise,
      Buffer: context.policy.has('fs') ? Buffer : undefined,
      ...globals,
      __luna_context__: context
    };

    // Add capability-gated APIs
    if (context.policy.has('fs')) {
      sandbox.fs = this._createSafeFS(context);
    }
    if (context.policy.has('net')) {
      sandbox.net = this._createSafeNet(context);
    }
    if (context.policy.has('env')) {
      sandbox.env = this._createSafeEnv(context);
    }

    const vmContext = vm.createContext(sandbox);
    try {
      const result = vm.runInContext(code, vmContext, {
        timeout: 30000,
        displayErrors: true,
        filename: `luna-sandbox://${context.name}`
      });
      return result;
    } catch (error) {
      this.emit('executionError', { context, error });
      throw error;
    }
  }

  /**
   * Check capability in the global policy.
   */
  check(capability, permission = null) {
    if (!this.enabled) return true;
    return this.globalPolicy.has(capability, permission);
  }

  /**
   * Create a safe console that logs through the sandbox.
   */
  _createSafeConsole(context) {
    return {
      log: (...args) => console.log(`[${context.name}]`, ...args),
      warn: (...args) => console.warn(`[${context.name}]`, ...args),
      error: (...args) => console.error(`[${context.name}]`, ...args),
      info: (...args) => console.info(`[${context.name}]`, ...args)
    };
  }

  /**
   * Wrap timers to track them within the sandbox.
   */
  _wrapTimer(timerFn, context) {
    return (callback, delay, ...args) => {
      return timerFn(() => {
        try {
          callback(...args);
        } catch (error) {
          this.emit('executionError', { context, error });
        }
      }, delay);
    };
  }

  /**
   * Create sandboxed fs API.
   */
  _createSafeFS(context) {
    const fs = require('fs');
    return {
      readFile: (path, opts) => {
        context.check('fs', 'read', { path });
        return fs.promises.readFile(path, opts);
      },
      writeFile: (path, data, opts) => {
        context.check('fs', 'write', { path });
        return fs.promises.writeFile(path, data, opts);
      },
      readdir: (path, opts) => {
        context.check('fs', 'list', { path });
        return fs.promises.readdir(path, opts);
      },
      stat: (path) => {
        context.check('fs', 'read', { path });
        return fs.promises.stat(path);
      },
      unlink: (path) => {
        context.check('fs', 'delete', { path });
        return fs.promises.unlink(path);
      }
    };
  }

  /**
   * Create sandboxed net API.
   */
  _createSafeNet(context) {
    const http = require('http');
    const https = require('https');
    return {
      fetch: async (url, options = {}) => {
        const urlObj = new URL(url);
        context.check('net', urlObj.protocol.replace(':', ''), { host: urlObj.host });
        // Simple fetch implementation
        return new Promise((resolve, reject) => {
          const mod = urlObj.protocol === 'https:' ? https : http;
          const req = mod.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({
              status: res.statusCode,
              headers: res.headers,
              body,
              json: () => JSON.parse(body),
              text: () => body
            }));
          });
          req.on('error', reject);
          if (options.body) req.write(options.body);
          req.end();
        });
      }
    };
  }

  /**
   * Create sandboxed env API.
   */
  _createSafeEnv(context) {
    return {
      get: (key) => {
        context.check('env', 'read', { key });
        return process.env[key];
      },
      set: (key, value) => {
        context.check('env', 'write', { key });
        process.env[key] = value;
      },
      has: (key) => {
        context.check('env', 'read', { key });
        return key in process.env;
      }
    };
  }

  /**
   * Get all sandbox contexts for auditing.
   */
  getAuditReport() {
    const report = [];
    for (const [id, context] of this.contexts) {
      report.push(context.getAuditLog());
    }
    return report;
  }
}

module.exports = { Sandbox, SecurityPolicy, SandboxContext, SecurityError, CAPABILITIES };
