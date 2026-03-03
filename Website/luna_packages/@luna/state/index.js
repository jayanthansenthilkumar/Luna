/**
 * @luna/state — Reactive State Management
 *
 * Signals, Computed values, Effects, and Stores with time-travel debugging.
 */

let currentEffect = null;

class Signal {
  constructor(value) {
    this._value = value;
    this._subscribers = new Set();
  }

  get value() {
    if (currentEffect) this._subscribers.add(currentEffect);
    return this._value;
  }

  set value(newVal) {
    if (newVal === this._value) return;
    this._value = newVal;
    for (const sub of this._subscribers) sub();
  }
}

class Computed {
  constructor(fn) {
    this._fn = fn;
    this._value = undefined;
    this._dirty = true;
    const effect = () => { this._dirty = true; };
    currentEffect = effect;
    this._value = fn();
    currentEffect = null;
  }

  get value() {
    if (this._dirty) {
      currentEffect = () => { this._dirty = true; };
      this._value = this._fn();
      currentEffect = null;
      this._dirty = false;
    }
    return this._value;
  }
}

class Effect {
  constructor(fn) {
    this._fn = fn;
    this.run();
  }

  run() {
    currentEffect = () => this.run();
    this._fn();
    currentEffect = null;
  }
}

class Store {
  constructor(initialState = {}) {
    this._state = { ...initialState };
    this._history = [{ ...initialState }];
    this._cursor = 0;
    this._subscribers = new Set();
  }

  get state() { return this._state; }

  update(fn) {
    this._state = fn(this._state);
    this._history = this._history.slice(0, this._cursor + 1);
    this._history.push({ ...this._state });
    this._cursor++;
    this._notify();
  }

  undo() {
    if (this._cursor > 0) {
      this._cursor--;
      this._state = { ...this._history[this._cursor] };
      this._notify();
    }
  }

  redo() {
    if (this._cursor < this._history.length - 1) {
      this._cursor++;
      this._state = { ...this._history[this._cursor] };
      this._notify();
    }
  }

  getHistory() { return this._history; }

  subscribe(fn) {
    this._subscribers.add(fn);
    return () => this._subscribers.delete(fn);
  }

  _notify() {
    for (const fn of this._subscribers) fn(this._state);
  }
}

module.exports = { Signal, Computed, Effect, Store, version: '0.1.0' };
