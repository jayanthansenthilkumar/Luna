/**
 * LUNA Engine - Application lifecycle management
 */
class Engine {
  constructor(config = {}) {
    this.config = config;
    this.hooks = new Map();
    this.state = 'idle';
  }

  on(hook, fn) {
    if (!this.hooks.has(hook)) this.hooks.set(hook, []);
    this.hooks.get(hook).push(fn);
    return this;
  }

  async emit(hook, ...args) {
    const fns = this.hooks.get(hook) || [];
    for (const fn of fns) await fn(...args);
  }

  async start() {
    this.state = 'starting';
    await this.emit('beforeStart');
    this.state = 'running';
    await this.emit('afterStart');
    return this;
  }

  async stop() {
    this.state = 'stopping';
    await this.emit('beforeStop');
    this.state = 'stopped';
    await this.emit('afterStop');
    return this;
  }
}

module.exports = Engine;
