/**
 * LUNA Quantum State Rendering (QSR)
 * 
 * A unified live-state graph where UI, backend, and edge state exist in
 * superposition. Any change to state is instantly reflected everywhere.
 * 
 * Features:
 * - Unified state graph spanning all platforms
 * - Reactive propagation across all subscribers
 * - Conflict resolution (last-write-wins / CRDT-like merge)
 * - State subscriptions with selectors
 * - Time-travel debugging
 * - State persistence & hydration
 * - Platform-aware rendering triggers
 */

'use strict';

const { EventEmitter } = require('events');

/**
 * State node in the quantum graph.
 */
class StateNode {
  constructor(key, value, metadata = {}) {
    this.key = key;
    this.value = value;
    this.version = 0;
    this.timestamp = Date.now();
    this.origin = metadata.origin || 'local';
    this.subscribers = new Set();
    this.history = [];
    this.maxHistory = metadata.maxHistory || 50;
    this.dirty = false;
    this.computed = null; // If this is a derived node
  }

  /**
   * Update the value.
   */
  update(value, origin = 'local') {
    // Save to history
    this.history.push({
      value: this.value,
      version: this.version,
      timestamp: this.timestamp,
      origin: this.origin
    });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    this.value = value;
    this.version++;
    this.timestamp = Date.now();
    this.origin = origin;
    this.dirty = true;
  }

  /**
   * Notify all subscribers.
   */
  notify() {
    for (const subscriber of this.subscribers) {
      try {
        subscriber(this.value, this.key, this);
      } catch (e) {
        // Subscriber error should not break propagation
      }
    }
    this.dirty = false;
  }
}

/**
 * Conflict resolver for distributed state.
 */
class ConflictResolver {
  constructor(strategy = 'last-write-wins') {
    this.strategy = strategy;
    this.customResolvers = new Map();
  }

  /**
   * Resolve a conflict between two state values.
   */
  resolve(key, local, remote) {
    // Check custom resolver
    if (this.customResolvers.has(key)) {
      return this.customResolvers.get(key)(local, remote);
    }

    switch (this.strategy) {
      case 'last-write-wins':
        return remote.timestamp > local.timestamp ? remote.value : local.value;

      case 'first-write-wins':
        return remote.timestamp < local.timestamp ? remote.value : local.value;

      case 'merge':
        return this._deepMerge(local.value, remote.value);

      case 'highest-version':
        return remote.version > local.version ? remote.value : local.value;

      default:
        return remote.value;
    }
  }

  /**
   * Register a custom resolver for a key.
   */
  custom(key, resolver) {
    this.customResolvers.set(key, resolver);
    return this;
  }

  _deepMerge(a, b) {
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
      return b;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      const merged = [...a];
      for (const item of b) {
        const existing = merged.findIndex(m => JSON.stringify(m) === JSON.stringify(item));
        if (existing === -1) merged.push(item);
      }
      return merged;
    }

    const result = { ...a };
    for (const [key, value] of Object.entries(b)) {
      result[key] = this._deepMerge(a[key], value);
    }
    return result;
  }
}

/**
 * Subscription selector.
 */
class Selector {
  constructor(selectFn, compareFn) {
    this.select = selectFn;
    this.compare = compareFn || ((a, b) => a === b);
    this.lastValue = undefined;
  }

  /**
   * Check if selected value has changed.
   */
  hasChanged(state) {
    const newValue = this.select(state);
    if (!this.compare(this.lastValue, newValue)) {
      this.lastValue = newValue;
      return true;
    }
    return false;
  }

  getValue() {
    return this.lastValue;
  }
}

/**
 * Main Quantum State Renderer.
 */
class QuantumStateRenderer extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      conflictStrategy: config.conflictStrategy || 'last-write-wins',
      batchUpdates: config.batchUpdates !== false,
      batchDelay: config.batchDelay || 0,
      maxHistory: config.maxHistory || 50,
      ...config
    };

    this.graph = new Map(); // key -> StateNode
    this.resolver = new ConflictResolver(this.config.conflictStrategy);
    this.selectors = new Map(); // selectorId -> { selector, callback }
    this.derivations = new Map(); // key -> { deps, compute }
    this.batching = false;
    this.pendingNotifications = new Set();
    this._batchTimer = null;
    this._nextSelectorId = 0;
  }

  /**
   * Set a value in the state graph.
   */
  set(key, value, origin = 'local') {
    let node = this.graph.get(key);

    if (!node) {
      node = new StateNode(key, value, {
        origin,
        maxHistory: this.config.maxHistory
      });
      this.graph.set(key, node);
    } else {
      node.update(value, origin);
    }

    // Re-compute derivations
    this._updateDerivations(key);

    if (this.config.batchUpdates) {
      this.pendingNotifications.add(key);
      this._scheduleBatch();
    } else {
      node.notify();
      this._checkSelectors();
    }

    this.emit('set', { key, value, origin, version: node.version });
    return this;
  }

  /**
   * Get a value from the state graph.
   */
  get(key, defaultValue) {
    const node = this.graph.get(key);
    return node ? node.value : defaultValue;
  }

  /**
   * Get a state node (with metadata).
   */
  getNode(key) {
    return this.graph.get(key) || null;
  }

  /**
   * Subscribe to changes on a specific key.
   */
  subscribe(key, callback) {
    let node = this.graph.get(key);
    if (!node) {
      node = new StateNode(key, undefined, { maxHistory: this.config.maxHistory });
      this.graph.set(key, node);
    }
    node.subscribers.add(callback);

    return () => {
      node.subscribers.delete(callback);
    };
  }

  /**
   * Subscribe with a selector (only notified when selected value changes).
   */
  select(selectFn, callback, compareFn) {
    const id = this._nextSelectorId++;
    const selector = new Selector(selectFn, compareFn);
    this.selectors.set(id, { selector, callback });

    // Run initial check
    const allState = this._getAllState();
    if (selector.hasChanged(allState)) {
      callback(selector.getValue());
    }

    return () => {
      this.selectors.delete(id);
    };
  }

  /**
   * Define a derived (computed) state node.
   */
  derive(key, dependencies, computeFn) {
    this.derivations.set(key, { deps: dependencies, compute: computeFn });

    // Compute initial value
    const depValues = dependencies.map(d => this.get(d));
    const value = computeFn(...depValues);
    this.set(key, value, 'derived');

    return this;
  }

  /**
   * Apply a remote state update (from another platform/node).
   */
  applyRemote(key, value, metadata = {}) {
    const node = this.graph.get(key);

    if (node) {
      // Resolve conflict
      const resolved = this.resolver.resolve(key,
        { value: node.value, timestamp: node.timestamp, version: node.version },
        { value, timestamp: metadata.timestamp || Date.now(), version: metadata.version || 0 }
      );
      this.set(key, resolved, metadata.origin || 'remote');
    } else {
      this.set(key, value, metadata.origin || 'remote');
    }

    return this;
  }

  /**
   * Batch multiple updates.
   */
  batch(updateFn) {
    this.batching = true;
    try {
      updateFn(this);
    } finally {
      this.batching = false;
      this._flushBatch();
    }
    return this;
  }

  /**
   * Take a snapshot of the entire state graph.
   */
  snapshot() {
    const snapshot = {
      id: `snap_${Date.now()}`,
      timestamp: Date.now(),
      state: {}
    };

    for (const [key, node] of this.graph) {
      snapshot.state[key] = {
        value: JSON.parse(JSON.stringify(node.value !== undefined ? node.value : null)),
        version: node.version,
        origin: node.origin
      };
    }

    return snapshot;
  }

  /**
   * Restore state from a snapshot.
   */
  restore(snapshot) {
    for (const [key, entry] of Object.entries(snapshot.state)) {
      this.set(key, entry.value, 'restore');
    }
    this.emit('restore', { snapshotId: snapshot.id, keys: Object.keys(snapshot.state) });
    return this;
  }

  /**
   * Time travel to a specific version of a key.
   */
  timeTravel(key, version) {
    const node = this.graph.get(key);
    if (!node) throw new Error(`State key not found: ${key}`);

    const entry = node.history.find(h => h.version === version);
    if (!entry) throw new Error(`Version ${version} not found for key ${key}`);

    this.set(key, entry.value, 'timeTravel');
    return entry.value;
  }

  /**
   * Get history of a state key.
   */
  getHistory(key) {
    const node = this.graph.get(key);
    if (!node) return [];

    return [
      ...node.history,
      { value: node.value, version: node.version, timestamp: node.timestamp, origin: node.origin }
    ];
  }

  /**
   * Export the full state for persistence/transfer.
   */
  exportState() {
    const exported = {};
    for (const [key, node] of this.graph) {
      exported[key] = {
        value: node.value,
        version: node.version,
        timestamp: node.timestamp,
        origin: node.origin
      };
    }
    return JSON.stringify(exported);
  }

  /**
   * Import state from string.
   */
  importState(data) {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    for (const [key, entry] of Object.entries(parsed)) {
      this.set(key, entry.value, entry.origin || 'import');
    }
    return this;
  }

  /**
   * Get all state keys.
   */
  keys() {
    return Array.from(this.graph.keys());
  }

  /**
   * Get the full state as a plain object.
   */
  toJSON() {
    const result = {};
    for (const [key, node] of this.graph) {
      result[key] = node.value;
    }
    return result;
  }

  /**
   * Clear all state.
   */
  clear() {
    this.graph.clear();
    this.derivations.clear();
    this.selectors.clear();
    this.pendingNotifications.clear();
    this.emit('clear');
    return this;
  }

  /**
   * Get stats about the state graph.
   */
  getStats() {
    let totalSubscribers = 0;
    let totalHistory = 0;

    for (const [, node] of this.graph) {
      totalSubscribers += node.subscribers.size;
      totalHistory += node.history.length;
    }

    return {
      keys: this.graph.size,
      derivations: this.derivations.size,
      selectors: this.selectors.size,
      totalSubscribers,
      totalHistory
    };
  }

  // --- Private methods ---

  _updateDerivations(changedKey) {
    for (const [derivedKey, { deps, compute }] of this.derivations) {
      if (deps.includes(changedKey)) {
        const depValues = deps.map(d => this.get(d));
        const newValue = compute(...depValues);
        const node = this.graph.get(derivedKey);
        if (node) {
          node.update(newValue, 'derived');
          if (!this.config.batchUpdates) {
            node.notify();
          } else {
            this.pendingNotifications.add(derivedKey);
          }
        }
      }
    }
  }

  _scheduleBatch() {
    if (this._batchTimer) return;
    this._batchTimer = setTimeout(() => {
      this._flushBatch();
    }, this.config.batchDelay);
  }

  _flushBatch() {
    if (this._batchTimer) {
      clearTimeout(this._batchTimer);
      this._batchTimer = null;
    }

    for (const key of this.pendingNotifications) {
      const node = this.graph.get(key);
      if (node) node.notify();
    }
    this.pendingNotifications.clear();

    this._checkSelectors();
  }

  _checkSelectors() {
    const allState = this._getAllState();
    for (const [, { selector, callback }] of this.selectors) {
      if (selector.hasChanged(allState)) {
        callback(selector.getValue());
      }
    }
  }

  _getAllState() {
    const state = {};
    for (const [key, node] of this.graph) {
      state[key] = node.value;
    }
    return state;
  }
}

module.exports = { QuantumStateRenderer, StateNode, ConflictResolver, Selector };
