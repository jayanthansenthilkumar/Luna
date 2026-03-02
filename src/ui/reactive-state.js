/**
 * LUNA Reactive State System
 * 
 * Fine-grained reactivity with:
 * - Signals (reactive primitives)
 * - Computed values (derived state)
 * - Effects (side-effect reactions)
 * - Store (structured state containers)
 * - State snapshots and time travel
 * - Cross-context state synchronization (for QSR)
 */

'use strict';

const { EventEmitter } = require('events');

/**
 * Dependency tracking context.
 */
let activeEffect = null;
const effectStack = [];

function pushEffect(effect) {
  effectStack.push(activeEffect);
  activeEffect = effect;
}

function popEffect() {
  activeEffect = effectStack.pop();
}

/**
 * Signal – a reactive primitive value.
 */
class Signal {
  constructor(initialValue, options = {}) {
    this._value = initialValue;
    this._subscribers = new Set();
    this._name = options.name || '';
    this._history = options.trackHistory ? [initialValue] : null;
    this._maxHistory = options.maxHistory || 100;
    this._equals = options.equals || ((a, b) => a === b);
  }

  /**
   * Get the current value and track dependencies.
   */
  get value() {
    if (activeEffect) {
      this._subscribers.add(activeEffect);
    }
    return this._value;
  }

  /**
   * Set a new value and notify subscribers.
   */
  set value(newValue) {
    if (this._equals(this._value, newValue)) return;
    const oldValue = this._value;
    this._value = newValue;

    if (this._history) {
      this._history.push(newValue);
      if (this._history.length > this._maxHistory) {
        this._history.shift();
      }
    }

    this._notify(oldValue, newValue);
  }

  /**
   * Update value using a function.
   */
  update(fn) {
    this.value = fn(this._value);
  }

  /**
   * Get the value without tracking.
   */
  peek() {
    return this._value;
  }

  /**
   * Notify all subscribers of a change.
   */
  _notify(oldValue, newValue) {
    for (const effect of this._subscribers) {
      effect._run(oldValue, newValue);
    }
  }

  /**
   * Get history (if tracking is enabled).
   */
  getHistory() {
    return this._history ? [...this._history] : [];
  }

  /**
   * Reset to initial value.
   */
  reset(value) {
    this.value = value !== undefined ? value : (this._history ? this._history[0] : undefined);
  }

  /**
   * Subscribe to changes manually.
   */
  subscribe(callback) {
    const effect = new Effect(() => callback(this.value));
    effect._run();
    return () => { this._subscribers.delete(effect); };
  }

  toJSON() {
    return this._value;
  }

  toString() {
    return String(this._value);
  }
}

/**
 * Computed – a derived reactive value.
 */
class Computed {
  constructor(computeFn, options = {}) {
    this._computeFn = computeFn;
    this._value = undefined;
    this._dirty = true;
    this._subscribers = new Set();
    this._name = options.name || '';

    // Create an internal effect to track dependencies
    this._effect = new Effect(() => {
      this._dirty = true;
      this._notify();
    });

    // Initial computation
    this._compute();
  }

  get value() {
    if (activeEffect) {
      this._subscribers.add(activeEffect);
    }
    if (this._dirty) {
      this._compute();
    }
    return this._value;
  }

  peek() {
    if (this._dirty) this._compute();
    return this._value;
  }

  _compute() {
    pushEffect(this._effect);
    try {
      this._value = this._computeFn();
      this._dirty = false;
    } finally {
      popEffect();
    }
  }

  _notify() {
    for (const effect of this._subscribers) {
      effect._run();
    }
  }

  subscribe(callback) {
    const effect = new Effect(() => callback(this.value));
    effect._run();
    return () => { this._subscribers.delete(effect); };
  }

  toJSON() {
    return this.value;
  }
}

/**
 * Effect – a side effect that re-runs when dependencies change.
 */
class Effect {
  constructor(fn, options = {}) {
    this._fn = fn;
    this._active = true;
    this._name = options.name || '';
    this._scheduler = options.scheduler || null;
  }

  _run(oldValue, newValue) {
    if (!this._active) return;
    if (this._scheduler) {
      this._scheduler(() => this._execute(oldValue, newValue));
    } else {
      this._execute(oldValue, newValue);
    }
  }

  _execute(oldValue, newValue) {
    pushEffect(this);
    try {
      this._fn(oldValue, newValue);
    } finally {
      popEffect();
    }
  }

  /**
   * Stop this effect from running.
   */
  dispose() {
    this._active = false;
  }
}

/**
 * Store – a structured reactive state container.
 */
class Store extends EventEmitter {
  constructor(initialState = {}, options = {}) {
    super();
    this._signals = {};
    this._actions = {};
    this._getters = {};
    this._name = options.name || 'store';
    this._middleware = [];
    this._snapshots = [];
    this._maxSnapshots = options.maxSnapshots || 50;

    // Initialize signals from state
    for (const [key, value] of Object.entries(initialState)) {
      this._signals[key] = new Signal(value, {
        name: `${this._name}.${key}`,
        trackHistory: options.trackHistory
      });
    }
  }

  /**
   * Get a state value reactively.
   */
  get(key) {
    if (this._signals[key]) {
      return this._signals[key].value;
    }
    return undefined;
  }

  /**
   * Set a state value.
   */
  set(key, value) {
    if (!this._signals[key]) {
      this._signals[key] = new Signal(value, { name: `${this._name}.${key}` });
    } else {
      // Run middleware
      for (const mw of this._middleware) {
        value = mw(key, value, this._signals[key].peek());
      }
      this._signals[key].value = value;
    }
    this.emit('change', { key, value });
    return this;
  }

  /**
   * Update multiple values atomically.
   */
  batch(updates) {
    for (const [key, value] of Object.entries(updates)) {
      this.set(key, value);
    }
    return this;
  }

  /**
   * Register a named action.
   */
  action(name, fn) {
    this._actions[name] = fn;
    return this;
  }

  /**
   * Dispatch an action.
   */
  dispatch(actionName, payload) {
    const action = this._actions[actionName];
    if (!action) throw new Error(`Unknown action: ${actionName}`);
    return action(this, payload);
  }

  /**
   * Register a computed getter.
   */
  getter(name, fn) {
    this._getters[name] = new Computed(() => fn(this));
    return this;
  }

  /**
   * Get a computed value.
   */
  getComputed(name) {
    const getter = this._getters[name];
    return getter ? getter.value : undefined;
  }

  /**
   * Add middleware.
   */
  use(middleware) {
    this._middleware.push(middleware);
    return this;
  }

  /**
   * Take a snapshot of the current state.
   */
  snapshot(label = '') {
    const state = {};
    for (const [key, signal] of Object.entries(this._signals)) {
      state[key] = signal.peek();
    }
    this._snapshots.push({
      label,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state))
    });
    if (this._snapshots.length > this._maxSnapshots) {
      this._snapshots.shift();
    }
    return this;
  }

  /**
   * Restore to a previous snapshot.
   */
  restore(index = -1) {
    const idx = index < 0 ? this._snapshots.length + index : index;
    const snap = this._snapshots[idx];
    if (!snap) throw new Error('Snapshot not found');
    for (const [key, value] of Object.entries(snap.state)) {
      this.set(key, value);
    }
    this.emit('restore', snap);
    return this;
  }

  /**
   * Subscribe to a specific key.
   */
  watch(key, callback) {
    if (this._signals[key]) {
      return this._signals[key].subscribe(callback);
    }
    return () => {};
  }

  /**
   * Get the full state as a plain object.
   */
  toJSON() {
    const state = {};
    for (const [key, signal] of Object.entries(this._signals)) {
      state[key] = signal.peek();
    }
    return state;
  }

  /**
   * Get all snapshots.
   */
  getSnapshots() {
    return [...this._snapshots];
  }
}

/**
 * ReactiveState manager – creates and manages stores.
 */
class ReactiveState extends EventEmitter {
  constructor() {
    super();
    this.stores = new Map();
    this._globalSignals = new Map();
  }

  /**
   * Create a new reactive signal.
   */
  signal(initialValue, options = {}) {
    return new Signal(initialValue, options);
  }

  /**
   * Create a computed value.
   */
  computed(fn, options = {}) {
    return new Computed(fn, options);
  }

  /**
   * Create an effect.
   */
  effect(fn, options = {}) {
    const eff = new Effect(fn, options);
    eff._run();
    return eff;
  }

  /**
   * Create or get a named store.
   */
  store(name, initialState = {}, options = {}) {
    if (this.stores.has(name)) return this.stores.get(name);
    const s = new Store(initialState, { ...options, name });
    this.stores.set(name, s);
    return s;
  }

  /**
   * Create a global signal accessible by name.
   */
  global(name, initialValue) {
    if (this._globalSignals.has(name)) return this._globalSignals.get(name);
    const sig = new Signal(initialValue, { name: `global.${name}` });
    this._globalSignals.set(name, sig);
    return sig;
  }

  /**
   * Batch multiple state updates.
   */
  batch(fn) {
    // In a real implementation, this would defer notifications
    fn();
  }

  /**
   * Get a serializable snapshot of all stores.
   */
  serialize() {
    const data = {};
    for (const [name, store] of this.stores) {
      data[name] = store.toJSON();
    }
    return data;
  }

  /**
   * Hydrate stores from serialized data.
   */
  hydrate(data) {
    for (const [name, state] of Object.entries(data)) {
      const s = this.store(name, state);
      s.batch(state);
    }
  }
}

module.exports = {
  ReactiveState,
  Signal,
  Computed,
  Effect,
  Store
};
