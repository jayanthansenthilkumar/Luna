/**
 * @luna/qsr — Quantum State Reconciliation
 *
 * Distributed state management with probabilistic conflict resolution.
 */

class QuantumState {
  constructor(opts = {}) {
    this._state = opts.initialState || {};
    this._reconciliation = opts.reconciliation || 'last-write-wins';
    this._resolver = opts.resolver || null;
    this._subscribers = new Set();
    this._vectorClock = {};
    this._nodeId = opts.nodeId || `node-${Date.now()}`;
    this._vectorClock[this._nodeId] = 0;
  }

  observe() {
    return { ...this._state };
  }

  mutate(fn) {
    const oldState = this._state;
    this._state = fn({ ...this._state });
    this._vectorClock[this._nodeId]++;
    for (const sub of this._subscribers) sub(this._state, oldState);
  }

  subscribe(fn) {
    this._subscribers.add(fn);
    return () => this._subscribers.delete(fn);
  }

  reconcile(remoteState, remoteClock) {
    if (this._reconciliation === 'last-write-wins') {
      this._state = remoteState;
    } else if (this._reconciliation === 'merge') {
      this._state = { ...this._state, ...remoteState };
    } else if (this._reconciliation === 'custom' && this._resolver) {
      this._state = this._resolver(this._state, remoteState);
    }
  }
}

module.exports = { QuantumState, version: '0.1.0' };
