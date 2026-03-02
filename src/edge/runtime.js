/**
 * LUNA Edge & Distributed Runtime
 * 
 * Provides:
 * - Global deployment abstraction
 * - Automatic regional replication
 * - Intelligent request routing (geo-aware)
 * - Distributed memory synchronization
 * - Built-in caching layer
 * - Edge function execution
 * - Distributed key-value store
 */

'use strict';

const { EventEmitter } = require('events');
const crypto = require('crypto');

/**
 * Distributed cache with TTL support.
 */
class DistributedCache extends EventEmitter {
  constructor(options = {}) {
    super();
    this.store = new Map();
    this.maxSize = options.maxSize || 10000;
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };

    // Periodic cleanup
    this._cleanupInterval = setInterval(() => this._cleanup(), 60000);
    if (this._cleanupInterval.unref) this._cleanupInterval.unref();
  }

  /**
   * Get a cached value.
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }
    this.stats.hits++;
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    return entry.value;
  }

  /**
   * Set a cached value.
   */
  set(key, value, ttl = this.defaultTTL) {
    // Evict if at capacity
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      this._evictLRU();
    }

    this.store.set(key, {
      value,
      createdAt: Date.now(),
      expiresAt: ttl > 0 ? Date.now() + ttl : null,
      lastAccessed: Date.now(),
      accessCount: 0
    });
    this.stats.sets++;
    this.emit('set', { key, ttl });
  }

  /**
   * Delete a cached value.
   */
  delete(key) {
    const deleted = this.store.delete(key);
    if (deleted) this.stats.deletes++;
    return deleted;
  }

  /**
   * Check if a key exists and is not expired.
   */
  has(key) {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Clear all entries.
   */
  clear() {
    this.store.clear();
    this.emit('clear');
  }

  /**
   * Evict least recently used entry.
   */
  _evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.store) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Remove expired entries.
   */
  _cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get cache statistics.
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.store.size,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%'
    };
  }

  /**
   * Stop the cache.
   */
  stop() {
    clearInterval(this._cleanupInterval);
  }
}

/**
 * Distributed Key-Value Store.
 */
class DistributedKV extends EventEmitter {
  constructor(options = {}) {
    super();
    this.namespace = options.namespace || 'default';
    this.store = new Map();
    this.metadata = new Map();
  }

  /**
   * Get a value by key.
   */
  async get(key, options = {}) {
    const entry = this.store.get(`${this.namespace}:${key}`);
    if (!entry) return null;

    if (options.type === 'json') {
      try { return JSON.parse(entry); } catch { return entry; }
    }
    if (options.type === 'arrayBuffer') {
      return Buffer.from(entry);
    }
    return entry;
  }

  /**
   * Put a key-value pair.
   */
  async put(key, value, options = {}) {
    const fullKey = `${this.namespace}:${key}`;
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    this.store.set(fullKey, serialized);

    this.metadata.set(fullKey, {
      createdAt: Date.now(),
      expiresAt: options.expirationTtl
        ? Date.now() + options.expirationTtl * 1000
        : null,
      metadata: options.metadata || {}
    });

    this.emit('put', { key, namespace: this.namespace });
  }

  /**
   * Delete a key.
   */
  async delete(key) {
    const fullKey = `${this.namespace}:${key}`;
    this.store.delete(fullKey);
    this.metadata.delete(fullKey);
    this.emit('delete', { key, namespace: this.namespace });
  }

  /**
   * List keys in the namespace.
   */
  async list(options = {}) {
    const prefix = options.prefix
      ? `${this.namespace}:${options.prefix}`
      : `${this.namespace}:`;
    const limit = options.limit || 1000;

    const keys = [];
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        keys.push({
          name: key.slice(this.namespace.length + 1),
          metadata: this.metadata.get(key)?.metadata || {}
        });
        if (keys.length >= limit) break;
      }
    }

    return { keys, list_complete: keys.length < limit, cursor: null };
  }
}

/**
 * Edge Region definition.
 */
class EdgeRegion {
  constructor(id, name, location, options = {}) {
    this.id = id;
    this.name = name;
    this.location = location; // { lat, lng }
    this.status = 'active'; // active | draining | inactive
    this.capacity = options.capacity || 1000;
    this.currentLoad = 0;
    this.functions = new Map();
    this.cache = new DistributedCache(options.cache || {});
    this.kv = new DistributedKV({ namespace: id });
  }

  /**
   * Calculate distance to a location (Haversine formula).
   */
  distanceTo(lat, lng) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat - this.location.lat) * Math.PI / 180;
    const dLng = (lng - this.location.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.location.lat * Math.PI / 180) *
              Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Deploy a function to this region.
   */
  deploy(name, handler) {
    this.functions.set(name, {
      handler,
      deployedAt: Date.now(),
      invocations: 0,
      errors: 0
    });
  }

  /**
   * Execute a function in this region.
   */
  async execute(name, request) {
    const fn = this.functions.get(name);
    if (!fn) throw new Error(`Function ${name} not found in region ${this.id}`);

    fn.invocations++;
    this.currentLoad++;
    try {
      const result = await fn.handler(request);
      return result;
    } catch (error) {
      fn.errors++;
      throw error;
    } finally {
      this.currentLoad--;
    }
  }
}

/**
 * Distributed State Synchronization.
 */
class StateSynchronizer extends EventEmitter {
  constructor() {
    super();
    this.nodes = new Map();
    this.syncLog = [];
    this._vectorClock = {};
  }

  /**
   * Register a node for synchronization.
   */
  addNode(nodeId) {
    this.nodes.set(nodeId, {
      state: {},
      lastSync: null,
      version: 0
    });
    this._vectorClock[nodeId] = 0;
  }

  /**
   * Update state on a node.
   */
  update(nodeId, key, value) {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    node.state[key] = value;
    node.version++;
    this._vectorClock[nodeId]++;

    this.syncLog.push({
      nodeId,
      key,
      value,
      version: node.version,
      timestamp: Date.now(),
      clock: { ...this._vectorClock }
    });

    // Propagate to other nodes
    this._propagate(nodeId, key, value);
  }

  /**
   * Propagate a state change to all other nodes.
   */
  _propagate(sourceId, key, value) {
    for (const [nodeId, node] of this.nodes) {
      if (nodeId === sourceId) continue;
      node.state[key] = value;
      node.lastSync = Date.now();
    }
    this.emit('sync', { source: sourceId, key, value });
  }

  /**
   * Get the merged state across all nodes.
   */
  getMergedState() {
    const merged = {};
    for (const [nodeId, node] of this.nodes) {
      for (const [key, value] of Object.entries(node.state)) {
        merged[key] = value; // Last-write-wins
      }
    }
    return merged;
  }

  /**
   * Get the vector clock.
   */
  getVectorClock() {
    return { ...this._vectorClock };
  }
}

/**
 * Main Edge Runtime.
 */
class EdgeRuntime extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.regions = new Map();
    this.globalCache = new DistributedCache(config.cache || {});
    this.stateSynchronizer = new StateSynchronizer();
    this.functions = new Map();
    this.isRunning = false;

    // Metrics
    this.metrics = {
      totalInvocations: 0,
      totalErrors: 0,
      regionCount: 0,
      averageLatency: 0
    };

    // Setup default regions
    this._setupDefaultRegions();
  }

  /**
   * Setup default edge regions.
   */
  _setupDefaultRegions() {
    const defaultRegions = [
      { id: 'us-east', name: 'US East', location: { lat: 39.0438, lng: -77.4874 } },
      { id: 'us-west', name: 'US West', location: { lat: 37.3861, lng: -122.0839 } },
      { id: 'eu-west', name: 'EU West', location: { lat: 53.3498, lng: -6.2603 } },
      { id: 'eu-central', name: 'EU Central', location: { lat: 50.1109, lng: 8.6821 } },
      { id: 'ap-east', name: 'Asia Pacific East', location: { lat: 35.6762, lng: 139.6503 } },
      { id: 'ap-south', name: 'Asia Pacific South', location: { lat: 1.3521, lng: 103.8198 } }
    ];

    for (const r of defaultRegions) {
      this.addRegion(r.id, r.name, r.location);
    }
  }

  /**
   * Add an edge region.
   */
  addRegion(id, name, location, options = {}) {
    const region = new EdgeRegion(id, name, location, options);
    this.regions.set(id, region);
    this.stateSynchronizer.addNode(id);
    this.metrics.regionCount = this.regions.size;
    return region;
  }

  /**
   * Deploy a function globally (to all regions).
   */
  deploy(name, handler, options = {}) {
    this.functions.set(name, { handler, options });

    const targetRegions = options.regions || Array.from(this.regions.keys());
    for (const regionId of targetRegions) {
      const region = this.regions.get(regionId);
      if (region) region.deploy(name, handler);
    }

    this.emit('deploy', { name, regions: targetRegions });
    return this;
  }

  /**
   * Route a request to the nearest region.
   */
  route(request) {
    const lat = request.geo?.lat || 0;
    const lng = request.geo?.lng || 0;

    let nearest = null;
    let minDistance = Infinity;

    for (const region of this.regions.values()) {
      if (region.status !== 'active') continue;
      if (region.currentLoad >= region.capacity) continue;

      const distance = region.distanceTo(lat, lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = region;
      }
    }

    return nearest;
  }

  /**
   * Execute a function with intelligent routing.
   */
  async execute(name, request) {
    const startTime = Date.now();
    this.metrics.totalInvocations++;

    // Find the best region
    const region = this.route(request);
    if (!region) {
      this.metrics.totalErrors++;
      throw new Error('No available edge region');
    }

    try {
      // Check cache first
      const cacheKey = `${name}:${this._hashRequest(request)}`;
      const cached = this.globalCache.get(cacheKey);
      if (cached) return cached;

      // Execute
      const result = await region.execute(name, request);

      // Cache the result if cacheable
      if (request.cacheTTL) {
        this.globalCache.set(cacheKey, result, request.cacheTTL);
      }

      const latency = Date.now() - startTime;
      this._updateAverageLatency(latency);

      return result;
    } catch (error) {
      this.metrics.totalErrors++;
      throw error;
    }
  }

  /**
   * Get a distributed KV namespace.
   */
  kv(namespace) {
    return new DistributedKV({ namespace });
  }

  /**
   * Start the edge runtime.
   */
  async start() {
    this.isRunning = true;
    this.emit('start');
    return this;
  }

  /**
   * Stop the edge runtime.
   */
  async stop() {
    this.isRunning = false;
    this.globalCache.stop();
    for (const region of this.regions.values()) {
      region.cache.stop();
    }
    this.emit('stop');
  }

  /**
   * Get runtime metrics.
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheStats: this.globalCache.getStats(),
      regions: Array.from(this.regions.values()).map(r => ({
        id: r.id,
        name: r.name,
        status: r.status,
        load: r.currentLoad,
        functions: r.functions.size
      }))
    };
  }

  /**
   * Hash a request for cache keying.
   */
  _hashRequest(request) {
    const str = JSON.stringify({
      url: request.url,
      method: request.method,
      params: request.params,
      query: request.query
    });
    return crypto.createHash('md5').update(str).digest('hex').slice(0, 12);
  }

  /**
   * Update average latency tracking.
   */
  _updateAverageLatency(latency) {
    const n = this.metrics.totalInvocations;
    this.metrics.averageLatency =
      ((this.metrics.averageLatency * (n - 1)) + latency) / n;
  }
}

module.exports = {
  EdgeRuntime,
  EdgeRegion,
  DistributedCache,
  DistributedKV,
  StateSynchronizer
};
