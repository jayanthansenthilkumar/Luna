/**
 * LUNA Scheduler - Priority-based task scheduling
 */
const PRIORITIES = { critical: 0, high: 1, normal: 2, low: 3, idle: 4 };

class Scheduler {
  constructor(opts = {}) {
    this.queues = Object.keys(PRIORITIES).reduce((acc, p) => { acc[p] = []; return acc; }, {});
    this.running = false;
    this.concurrency = opts.concurrency || 4;
  }

  schedule(fn, { priority = 'normal' } = {}) {
    this.queues[priority].push(fn);
    if (!this.running) this._flush();
  }

  async _flush() {
    this.running = true;
    for (const p of Object.keys(PRIORITIES).sort((a, b) => PRIORITIES[a] - PRIORITIES[b])) {
      while (this.queues[p].length) {
        const batch = this.queues[p].splice(0, this.concurrency);
        await Promise.all(batch.map(fn => fn()));
      }
    }
    this.running = false;
  }
}

module.exports = Scheduler;
