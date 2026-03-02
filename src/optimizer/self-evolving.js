/**
 * LUNA Self-Evolving Runtime Optimizer
 * 
 * A runtime that continuously observes its own execution behavior and adapts:
 * - Hot path detection & JIT-style optimization hints
 * - Dynamic task scheduling rebalancing
 * - Memory pressure adaptation
 * - Execution graph optimization
 * - Auto-caching of pure function results
 * - Predictive pre-computation
 * - Runtime telemetry & profiling
 */

'use strict';

const { EventEmitter } = require('events');

/**
 * Execution profile entry.
 */
class ExecutionProfile {
  constructor(id, type) {
    this.id = id;
    this.type = type;
    this.callCount = 0;
    this.totalTime = 0;
    this.avgTime = 0;
    this.minTime = Infinity;
    this.maxTime = 0;
    this.lastCallTime = 0;
    this.hotPath = false;
    this.optimized = false;
    this.memoized = false;
    this.callHistory = []; // Recent timings
    this.argsCache = new Map(); // Memoization cache
  }

  /**
   * Record a call.
   */
  record(duration) {
    this.callCount++;
    this.totalTime += duration;
    this.avgTime = this.totalTime / this.callCount;
    this.minTime = Math.min(this.minTime, duration);
    this.maxTime = Math.max(this.maxTime, duration);
    this.lastCallTime = Date.now();

    // Keep last 100 timings
    this.callHistory.push(duration);
    if (this.callHistory.length > 100) {
      this.callHistory.shift();
    }
  }

  /**
   * Get variance of call times (for stability analysis).
   */
  getVariance() {
    if (this.callHistory.length < 2) return 0;
    const mean = this.avgTime;
    const squaredDiffs = this.callHistory.map(t => Math.pow(t - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
  }

  /**
   * Get the trend (is it getting faster or slower).
   */
  getTrend() {
    if (this.callHistory.length < 10) return 'insufficient_data';
    const recent = this.callHistory.slice(-10);
    const older = this.callHistory.slice(-20, -10);
    if (older.length === 0) return 'insufficient_data';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const diff = (recentAvg - olderAvg) / olderAvg;
    if (diff < -0.1) return 'improving';
    if (diff > 0.1) return 'degrading';
    return 'stable';
  }
}

/**
 * Memory pressure monitor.
 */
class MemoryMonitor {
  constructor(options = {}) {
    this.threshold = options.threshold || 0.85; // 85% heap usage triggers pressure
    this.checkInterval = options.checkInterval || 5000;
    this.history = [];
    this._timer = null;
    this.onPressure = null;
  }

  start() {
    this._timer = setInterval(() => this._check(), this.checkInterval);
    this._check();
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _check() {
    const usage = process.memoryUsage();
    const heapRatio = usage.heapUsed / usage.heapTotal;

    const snapshot = {
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      rss: usage.rss,
      external: usage.external,
      ratio: heapRatio,
      pressure: heapRatio > this.threshold
    };

    this.history.push(snapshot);
    if (this.history.length > 100) this.history.shift();

    if (snapshot.pressure && this.onPressure) {
      this.onPressure(snapshot);
    }

    return snapshot;
  }

  getStats() {
    if (this.history.length === 0) return null;
    const latest = this.history[this.history.length - 1];
    return {
      current: latest,
      trend: this._getTrend(),
      avgRatio: this.history.reduce((a, b) => a + b.ratio, 0) / this.history.length
    };
  }

  _getTrend() {
    if (this.history.length < 5) return 'unknown';
    const recent = this.history.slice(-5).map(h => h.ratio);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const first = recent[0];
    if (avg > first * 1.1) return 'increasing';
    if (avg < first * 0.9) return 'decreasing';
    return 'stable';
  }
}

/**
 * Execution graph node.
 */
class ExecutionGraphNode {
  constructor(id, fn, dependencies = []) {
    this.id = id;
    this.fn = fn;
    this.dependencies = dependencies;
    this.priority = 0;
    this.criticalPath = false;
    this.estimatedTime = 0;
    this.result = undefined;
    this.executed = false;
  }
}

/**
 * Execution graph optimizer.
 */
class ExecutionGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }

  /**
   * Add a node (task) to the execution graph.
   */
  addNode(id, fn, dependencies = []) {
    const node = new ExecutionGraphNode(id, fn, dependencies);
    this.nodes.set(id, node);
    this.edges.set(id, new Set(dependencies));
    return node;
  }

  /**
   * Optimize execution order based on profiling data.
   */
  optimize(profiles) {
    // Assign estimated times from profiles
    for (const [id, node] of this.nodes) {
      const profile = profiles.get(id);
      if (profile) {
        node.estimatedTime = profile.avgTime;
      }
    }

    // Find critical path (longest dependency chain)
    const criticalPath = this._findCriticalPath();
    for (const nodeId of criticalPath) {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.criticalPath = true;
        node.priority = 10; // Higher priority for critical path
      }
    }

    return this._getExecutionOrder();
  }

  /**
   * Execute the graph optimally.
   */
  async execute() {
    const order = this._getExecutionOrder();
    const results = new Map();

    for (const level of order) {
      // Execute independent nodes in parallel
      await Promise.all(level.map(async (nodeId) => {
        const node = this.nodes.get(nodeId);
        if (node && node.fn) {
          const depResults = node.dependencies.map(d => results.get(d));
          node.result = await node.fn(...depResults);
          results.set(nodeId, node.result);
          node.executed = true;
        }
      }));
    }

    return results;
  }

  /**
   * Get parallel execution order (topological sort with levels).
   */
  _getExecutionOrder() {
    const inDegree = new Map();
    const levels = [];

    // Calculate in-degrees
    for (const [id] of this.nodes) {
      inDegree.set(id, 0);
    }
    for (const [, deps] of this.edges) {
      for (const dep of deps) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }

    // BFS level-by-level
    let queue = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) queue.push(id);
    }

    while (queue.length > 0) {
      levels.push([...queue]);
      const nextQueue = [];

      for (const nodeId of queue) {
        const deps = this.edges.get(nodeId) || new Set();
        for (const dep of deps) {
          const newDegree = inDegree.get(dep) - 1;
          inDegree.set(dep, newDegree);
          if (newDegree === 0) {
            nextQueue.push(dep);
          }
        }
      }

      queue = nextQueue;
    }

    return levels;
  }

  /**
   * Find the critical path.
   */
  _findCriticalPath() {
    const distances = new Map();
    const prev = new Map();

    for (const [id] of this.nodes) {
      distances.set(id, 0);
    }

    // Forward pass
    const order = this._getExecutionOrder().flat();
    for (const nodeId of order) {
      const node = this.nodes.get(nodeId);
      if (!node) continue;

      for (const dep of node.dependencies) {
        const depNode = this.nodes.get(dep);
        if (!depNode) continue;
        const newDist = distances.get(nodeId) + depNode.estimatedTime;
        if (newDist > (distances.get(dep) || 0)) {
          distances.set(dep, newDist);
          prev.set(dep, nodeId);
        }
      }
    }

    // Find the longest path
    let maxDist = 0;
    let endNode = null;
    for (const [id, dist] of distances) {
      if (dist > maxDist) {
        maxDist = dist;
        endNode = id;
      }
    }

    // Trace back the critical path
    const criticalPath = [];
    let current = endNode;
    while (current) {
      criticalPath.unshift(current);
      current = prev.get(current);
    }

    return criticalPath;
  }
}

/**
 * Main Self-Evolving Runtime Optimizer.
 */
class SelfEvolvingOptimizer extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      hotPathThreshold: config.hotPathThreshold || 100, // calls before considered hot
      memoizeThreshold: config.memoizeThreshold || 50,  // calls before auto-memoize
      optimizationInterval: config.optimizationInterval || 10000, // 10s
      maxCacheEntries: config.maxCacheEntries || 1000,
      ...config
    };

    this.profiles = new Map();
    this.executionGraph = new ExecutionGraph();
    this.memoryMonitor = new MemoryMonitor();
    this.optimizations = [];
    this.isRunning = false;
    this._optimizeTimer = null;
  }

  /**
   * Start the optimizer.
   */
  start() {
    this.isRunning = true;
    this.memoryMonitor.start();

    // Set up periodic optimization pass
    this._optimizeTimer = setInterval(() => {
      this._optimizationPass();
    }, this.config.optimizationInterval);

    // Handle memory pressure
    this.memoryMonitor.onPressure = (snapshot) => {
      this._handleMemoryPressure(snapshot);
    };

    this.emit('start');
  }

  /**
   * Stop the optimizer.
   */
  stop() {
    this.isRunning = false;
    this.memoryMonitor.stop();
    if (this._optimizeTimer) {
      clearInterval(this._optimizeTimer);
      this._optimizeTimer = null;
    }
    this.emit('stop');
  }

  /**
   * Wrap a function with profiling and auto-optimization.
   */
  observe(id, fn) {
    if (!this.profiles.has(id)) {
      this.profiles.set(id, new ExecutionProfile(id, typeof fn));
    }

    const profile = this.profiles.get(id);
    const optimizer = this;

    return function optimizedWrapper(...args) {
      // Check memoization cache
      if (profile.memoized) {
        const cacheKey = JSON.stringify(args);
        if (profile.argsCache.has(cacheKey)) {
          return profile.argsCache.get(cacheKey);
        }
      }

      const start = performance.now();
      let result;

      try {
        result = fn.apply(this, args);
      } finally {
        const duration = performance.now() - start;
        profile.record(duration);

        // Auto-memoize if function is pure and called often
        if (profile.memoized && result !== undefined) {
          const cacheKey = JSON.stringify(args);
          profile.argsCache.set(cacheKey, result);

          // Evict old entries if cache is too large
          if (profile.argsCache.size > optimizer.config.maxCacheEntries) {
            const firstKey = profile.argsCache.keys().next().value;
            profile.argsCache.delete(firstKey);
          }
        }
      }

      // Handle promises
      if (result && typeof result.then === 'function') {
        return result.then(resolved => {
          if (profile.memoized) {
            const cacheKey = JSON.stringify(args);
            profile.argsCache.set(cacheKey, resolved);
          }
          return resolved;
        });
      }

      return result;
    };
  }

  /**
   * Periodic optimization pass.
   */
  _optimizationPass() {
    let optimizationsApplied = 0;

    for (const [id, profile] of this.profiles) {
      // Detect hot paths
      if (!profile.hotPath && profile.callCount >= this.config.hotPathThreshold) {
        profile.hotPath = true;
        this.emit('hotPath', { id, callCount: profile.callCount, avgTime: profile.avgTime });
        optimizationsApplied++;
      }

      // Auto-memoize stable pure functions
      if (!profile.memoized && profile.callCount >= this.config.memoizeThreshold) {
        const variance = profile.getVariance();
        // Low variance suggests deterministic behavior (potentially pure)
        if (variance < 1) {
          profile.memoized = true;
          this.emit('memoize', { id, variance, callCount: profile.callCount });
          optimizationsApplied++;
        }
      }

      // Detect degradation
      const trend = profile.getTrend();
      if (trend === 'degrading') {
        this.emit('degradation', { id, avgTime: profile.avgTime, trend });
      }
    }

    if (optimizationsApplied > 0) {
      this.optimizations.push({
        timestamp: Date.now(),
        count: optimizationsApplied
      });
      this.emit('optimize', { optimizations: optimizationsApplied });
    }
  }

  /**
   * Handle memory pressure by evicting caches.
   */
  _handleMemoryPressure(snapshot) {
    let freed = 0;

    // Clear memoization caches, starting with least-used functions
    const sortedProfiles = Array.from(this.profiles.values())
      .filter(p => p.memoized && p.argsCache.size > 0)
      .sort((a, b) => a.callCount - b.callCount);

    for (const profile of sortedProfiles) {
      freed += profile.argsCache.size;
      profile.argsCache.clear();

      if (snapshot.ratio < this.memoryMonitor.threshold) break;
    }

    this.emit('memoryPressure', { snapshot, freedEntries: freed });
  }

  /**
   * Get optimization report.
   */
  getReport() {
    const hotPaths = [];
    const memoized = [];
    const degrading = [];

    for (const [id, profile] of this.profiles) {
      const entry = {
        id,
        callCount: profile.callCount,
        avgTime: profile.avgTime.toFixed(2) + 'ms',
        totalTime: profile.totalTime.toFixed(2) + 'ms',
        trend: profile.getTrend()
      };

      if (profile.hotPath) hotPaths.push(entry);
      if (profile.memoized) memoized.push({ ...entry, cacheSize: profile.argsCache.size });
      if (profile.getTrend() === 'degrading') degrading.push(entry);
    }

    return {
      totalProfiles: this.profiles.size,
      hotPaths,
      memoized,
      degrading,
      memory: this.memoryMonitor.getStats(),
      optimizations: this.optimizations.length
    };
  }

  /**
   * Schedule a task in the execution graph.
   */
  scheduleTask(id, fn, dependencies = []) {
    return this.executionGraph.addNode(id, fn, dependencies);
  }

  /**
   * Run all scheduled tasks optimally.
   */
  async runScheduledTasks() {
    this.executionGraph.optimize(this.profiles);
    return this.executionGraph.execute();
  }
}

module.exports = { SelfEvolvingOptimizer, ExecutionGraph, ExecutionProfile, MemoryMonitor };
