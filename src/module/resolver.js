/**
 * LUNA Module System
 * 
 * Custom module resolution with:
 * - Luna-native import resolution
 * - Internal namespace system (luna:xxx)
 * - Module caching
 * - Circular dependency handling
 * - Version isolation
 * - Virtual modules
 * - Hot module replacement (HMR) support
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { EventEmitter } = require('events');

/**
 * Module cache entry.
 */
class CachedModule {
  constructor(id, filePath, exports) {
    this.id = id;
    this.filePath = filePath;
    this.exports = exports;
    this.loadedAt = Date.now();
    this.accessCount = 0;
    this.dependencies = new Set();
    this.dependents = new Set();
    this.version = '0.0.0';
  }
}

/**
 * Module Dependency Graph.
 */
class DependencyGraph {
  constructor() {
    this.nodes = new Map(); // moduleId -> Set<dependencyId>
    this.reverseNodes = new Map(); // moduleId -> Set<dependentId>
  }

  /**
   * Add a dependency relationship.
   */
  addEdge(moduleId, dependencyId) {
    if (!this.nodes.has(moduleId)) {
      this.nodes.set(moduleId, new Set());
    }
    this.nodes.get(moduleId).add(dependencyId);

    if (!this.reverseNodes.has(dependencyId)) {
      this.reverseNodes.set(dependencyId, new Set());
    }
    this.reverseNodes.get(dependencyId).add(moduleId);
  }

  /**
   * Get all dependencies of a module (deep).
   */
  getDependencies(moduleId, visited = new Set()) {
    if (visited.has(moduleId)) return visited; // Circular
    visited.add(moduleId);

    const deps = this.nodes.get(moduleId);
    if (deps) {
      for (const dep of deps) {
        this.getDependencies(dep, visited);
      }
    }
    return visited;
  }

  /**
   * Get all modules that depend on a given module (deep).
   */
  getDependents(moduleId, visited = new Set()) {
    if (visited.has(moduleId)) return visited;
    visited.add(moduleId);

    const deps = this.reverseNodes.get(moduleId);
    if (deps) {
      for (const dep of deps) {
        this.getDependents(dep, visited);
      }
    }
    return visited;
  }

  /**
   * Detect circular dependencies.
   */
  detectCircular() {
    const circles = [];
    const visited = new Set();
    const stack = new Set();

    const dfs = (nodeId, path = []) => {
      if (stack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        circles.push(path.slice(cycleStart).concat(nodeId));
        return;
      }
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      stack.add(nodeId);
      path.push(nodeId);

      const deps = this.nodes.get(nodeId);
      if (deps) {
        for (const dep of deps) {
          dfs(dep, [...path]);
        }
      }

      stack.delete(nodeId);
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    }

    return circles;
  }

  /**
   * Topological sort.
   */
  topologicalSort() {
    const sorted = [];
    const visited = new Set();
    const temp = new Set();

    const visit = (nodeId) => {
      if (temp.has(nodeId)) return; // Circular
      if (visited.has(nodeId)) return;

      temp.add(nodeId);
      const deps = this.nodes.get(nodeId);
      if (deps) {
        for (const dep of deps) {
          visit(dep);
        }
      }
      temp.delete(nodeId);
      visited.add(nodeId);
      sorted.push(nodeId);
    };

    for (const nodeId of this.nodes.keys()) {
      visit(nodeId);
    }

    return sorted;
  }

  /**
   * Get a visual representation of the graph.
   */
  toJSON() {
    const result = {};
    for (const [nodeId, deps] of this.nodes) {
      result[nodeId] = Array.from(deps);
    }
    return result;
  }
}

/**
 * Main Module Resolver.
 */
class ModuleResolver extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      resolution: config.resolution || 'luna',
      caching: config.caching !== false,
      circularHandling: config.circularHandling || 'lazy',
      extensions: config.extensions || ['.js', '.json', '.luna', '.mjs', '.cjs'],
      aliases: config.aliases || {},
      ...config
    };

    this.cache = new Map();
    this.graph = new DependencyGraph();
    this.virtualModules = new Map();
    this.namespaces = new Map();
    this._loadingStack = new Set(); // For circular detection

    // Register built-in namespaces
    this._registerBuiltinNamespaces();
  }

  /**
   * Register built-in luna: namespaces.
   */
  _registerBuiltinNamespaces() {
    const builtins = {
      'luna:core': () => require('./engine'),
      'luna:net': () => ({
        HttpServer: require('../net/http-server').HttpServer,
        Router: require('../net/router').Router,
        WebSocket: require('../net/websocket').WebSocketServer
      }),
      'luna:ui': () => ({
        UIEngine: require('../ui/engine').UIEngine,
        Component: require('../ui/engine').Component,
        h: require('../ui/engine').h
      }),
      'luna:state': () => require('../ui/reactive-state'),
      'luna:edge': () => require('../edge/runtime'),
      'luna:mobile': () => require('../mobile/bridge'),
      'luna:desktop': () => require('../desktop/shell'),
      'luna:stream': () => require('../net/streaming'),
      'luna:fs': () => require('fs'),
      'luna:path': () => require('path'),
      'luna:crypto': () => require('crypto')
    };

    for (const [name, loader] of Object.entries(builtins)) {
      this.namespaces.set(name, { loader, cached: null });
    }
  }

  /**
   * Resolve a module specifier to a file path.
   */
  resolve(specifier, fromPath = process.cwd()) {
    // 1. Check luna: namespace
    if (specifier.startsWith('luna:')) {
      return { type: 'namespace', id: specifier };
    }

    // 2. Check virtual modules
    if (this.virtualModules.has(specifier)) {
      return { type: 'virtual', id: specifier };
    }

    // 3. Check aliases
    for (const [alias, target] of Object.entries(this.config.aliases)) {
      if (specifier === alias || specifier.startsWith(alias + '/')) {
        specifier = specifier.replace(alias, target);
        break;
      }
    }

    // 4. Relative or absolute path
    if (specifier.startsWith('.') || specifier.startsWith('/') || path.isAbsolute(specifier)) {
      const resolved = path.resolve(path.dirname(fromPath), specifier);
      const filePath = this._resolveFile(resolved);
      if (filePath) return { type: 'file', id: filePath, path: filePath };
    }

    // 5. Node modules resolution
    const nodeResolved = this._resolveNodeModule(specifier, fromPath);
    if (nodeResolved) return { type: 'node', id: specifier, path: nodeResolved };

    throw new Error(`Cannot resolve module '${specifier}' from '${fromPath}'`);
  }

  /**
   * Load a module.
   */
  load(specifier, fromPath = process.cwd()) {
    const resolution = this.resolve(specifier, fromPath);

    // Check cache
    if (this.config.caching && this.cache.has(resolution.id)) {
      const cached = this.cache.get(resolution.id);
      cached.accessCount++;
      return cached.exports;
    }

    // Circular dependency check
    if (this._loadingStack.has(resolution.id)) {
      if (this.config.circularHandling === 'lazy') {
        // Return partial exports (whatever is available so far)
        const cached = this.cache.get(resolution.id);
        return cached ? cached.exports : {};
      } else if (this.config.circularHandling === 'error') {
        throw new Error(`Circular dependency detected: ${Array.from(this._loadingStack).join(' -> ')} -> ${resolution.id}`);
      }
    }

    this._loadingStack.add(resolution.id);

    try {
      let exports;

      switch (resolution.type) {
        case 'namespace':
          exports = this._loadNamespace(resolution.id);
          break;
        case 'virtual':
          exports = this.virtualModules.get(resolution.id);
          break;
        case 'file':
        case 'node':
          exports = this._loadFile(resolution.path);
          break;
        default:
          throw new Error(`Unknown resolution type: ${resolution.type}`);
      }

      // Cache the module
      const cached = new CachedModule(resolution.id, resolution.path || null, exports);
      this.cache.set(resolution.id, cached);

      // Track in dependency graph
      if (fromPath !== process.cwd()) {
        this.graph.addEdge(fromPath, resolution.id);
      }

      this.emit('load', { id: resolution.id, type: resolution.type });
      return exports;
    } finally {
      this._loadingStack.delete(resolution.id);
    }
  }

  /**
   * Load a luna: namespace module.
   */
  _loadNamespace(id) {
    const ns = this.namespaces.get(id);
    if (!ns) throw new Error(`Unknown namespace: ${id}`);
    if (!ns.cached) {
      ns.cached = ns.loader();
    }
    return ns.cached;
  }

  /**
   * Load a file module.
   */
  _loadFile(filePath) {
    const ext = path.extname(filePath);

    if (ext === '.json') {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // JavaScript file
    const code = fs.readFileSync(filePath, 'utf-8');
    const module = { exports: {} };
    const dirname = path.dirname(filePath);

    // Create a require function scoped to this module
    const moduleRequire = (spec) => this.load(spec, filePath);

    const wrapper = `(function(exports, require, module, __filename, __dirname) {\n${code}\n});`;
    const compiled = vm.runInThisContext(wrapper, { filename: filePath });
    compiled(module.exports, moduleRequire, module, filePath, dirname);

    return module.exports;
  }

  /**
   * Resolve a file path with extension resolution.
   */
  _resolveFile(filePath) {
    // Try exact path
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }

    // Try with extensions
    for (const ext of this.config.extensions) {
      const withExt = filePath + ext;
      if (fs.existsSync(withExt) && fs.statSync(withExt).isFile()) {
        return withExt;
      }
    }

    // Try as directory with index file
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      for (const ext of this.config.extensions) {
        const indexPath = path.join(filePath, `index${ext}`);
        if (fs.existsSync(indexPath)) {
          return indexPath;
        }
      }
    }

    return null;
  }

  /**
   * Resolve a node_modules package.
   */
  _resolveNodeModule(specifier, fromPath) {
    let dir = path.dirname(fromPath);

    while (true) {
      const nodeModulesPath = path.join(dir, 'node_modules', specifier);
      const resolved = this._resolveFile(nodeModulesPath);
      if (resolved) return resolved;

      // Check package.json main field
      const pkgPath = path.join(dir, 'node_modules', specifier, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const main = pkg.main || 'index.js';
        const mainPath = path.join(dir, 'node_modules', specifier, main);
        const mainResolved = this._resolveFile(mainPath);
        if (mainResolved) return mainResolved;
      }

      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }

    return null;
  }

  /**
   * Register a virtual module.
   */
  virtual(name, exports) {
    this.virtualModules.set(name, exports);
    return this;
  }

  /**
   * Register a custom namespace.
   */
  namespace(name, loader) {
    this.namespaces.set(name, { loader, cached: null });
    return this;
  }

  /**
   * Invalidate a module from cache (for HMR).
   */
  invalidate(moduleId) {
    this.cache.delete(moduleId);

    // Also invalidate dependents
    const dependents = this.graph.getDependents(moduleId);
    for (const dep of dependents) {
      this.cache.delete(dep);
    }

    this.emit('invalidate', { id: moduleId, affectedCount: dependents.size });
  }

  /**
   * Get the dependency graph.
   */
  getDependencyGraph() {
    return this.graph.toJSON();
  }

  /**
   * Get module cache stats.
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      modules: Array.from(this.cache.values()).map(m => ({
        id: m.id,
        filePath: m.filePath,
        loadedAt: m.loadedAt,
        accessCount: m.accessCount
      }))
    };
  }

  /**
   * Clear the module cache.
   */
  clearCache() {
    this.cache.clear();
    this.emit('cacheCleared');
  }
}

module.exports = { ModuleResolver, DependencyGraph, CachedModule };
