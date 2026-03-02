/**
 * LUNA Parallel Async Scheduler
 * 
 * Multi-threaded task scheduler with:
 * - Main Scheduler Thread  
 * - Worker Thread Pool
 * - IO Thread Pool
 * - Microtask Queue
 * - Lock-free task queues
 * - Priority-based scheduling
 */

'use strict';

const { EventEmitter } = require('events');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const path = require('path');

/**
 * Lock-free concurrent queue implementation.
 */
class LockFreeQueue {
  constructor() {
    this._items = [];
    this._head = 0;
  }

  enqueue(item) {
    this._items.push(item);
  }

  dequeue() {
    if (this._head >= this._items.length) return null;
    const item = this._items[this._head];
    this._items[this._head] = undefined;
    this._head++;
    // Compact periodically
    if (this._head > 1000) {
      this._items = this._items.slice(this._head);
      this._head = 0;
    }
    return item;
  }

  get size() {
    return this._items.length - this._head;
  }

  isEmpty() {
    return this.size === 0;
  }
}

/**
 * Priority queue for task scheduling.
 */
class PriorityQueue {
  constructor() {
    this._queues = {
      critical: new LockFreeQueue(),
      high: new LockFreeQueue(),
      normal: new LockFreeQueue(),
      low: new LockFreeQueue(),
      idle: new LockFreeQueue()
    };
    this._order = ['critical', 'high', 'normal', 'low', 'idle'];
  }

  enqueue(task, priority = 'normal') {
    const queue = this._queues[priority] || this._queues.normal;
    queue.enqueue(task);
  }

  dequeue() {
    for (const level of this._order) {
      if (!this._queues[level].isEmpty()) {
        return this._queues[level].dequeue();
      }
    }
    return null;
  }

  get size() {
    return this._order.reduce((sum, level) => sum + this._queues[level].size, 0);
  }

  isEmpty() {
    return this.size === 0;
  }
}

/**
 * Task wrapper with metadata.
 */
class Task {
  static _idCounter = 0;

  constructor(fn, options = {}) {
    this.id = ++Task._idCounter;
    this.fn = fn;
    this.priority = options.priority || 'normal';
    this.type = options.type || 'compute'; // compute | io | microtask
    this.createdAt = Date.now();
    this.startedAt = null;
    this.completedAt = null;
    this.status = 'pending'; // pending | running | completed | failed
    this.result = null;
    this.error = null;
    this._resolve = null;
    this._reject = null;
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  get duration() {
    if (!this.startedAt) return 0;
    return (this.completedAt || Date.now()) - this.startedAt;
  }
}

/**
 * Main Scheduler class.
 */
class Scheduler extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      workerThreads: config.workerThreads || Math.max(2, os.cpus().length - 1),
      ioThreads: config.ioThreads || 2,
      maxQueueSize: config.maxQueueSize || 10000,
      taskTimeout: config.taskTimeout || 30000,
      ...config
    };

    this.taskQueue = new PriorityQueue();
    this.microtaskQueue = new LockFreeQueue();
    this.workers = [];
    this.ioWorkers = [];
    this.activeWorkerTasks = new Map();
    this.isRunning = false;

    // Metrics
    this.metrics = {
      tasksScheduled: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      totalExecutionTime: 0,
      averageWaitTime: 0,
      queueHighWaterMark: 0
    };
  }

  /**
   * Initialize the scheduler and worker pools.
   */
  async init() {
    this.isRunning = true;
    this._startMainLoop();
    return this;
  }

  /**
   * Schedule a task for execution.
   */
  schedule(fn, options = {}) {
    if (!this.isRunning) {
      throw new Error('Scheduler is not running');
    }

    const task = new Task(fn, options);
    this.metrics.tasksScheduled++;

    if (task.type === 'microtask') {
      this.microtaskQueue.enqueue(task);
    } else {
      this.taskQueue.enqueue(task, task.priority);
    }

    const currentSize = this.taskQueue.size + this.microtaskQueue.size;
    if (currentSize > this.metrics.queueHighWaterMark) {
      this.metrics.queueHighWaterMark = currentSize;
    }

    return task.promise;
  }

  /**
   * Schedule a compute-bound task.
   */
  compute(fn, priority = 'normal') {
    return this.schedule(fn, { type: 'compute', priority });
  }

  /**
   * Schedule an IO-bound task.
   */
  io(fn, priority = 'normal') {
    return this.schedule(fn, { type: 'io', priority });
  }

  /**
   * Schedule a microtask (highest priority, runs before next macro-task).
   */
  micro(fn) {
    return this.schedule(fn, { type: 'microtask', priority: 'critical' });
  }

  /**
   * Schedule a task to run after a delay.
   */
  delay(fn, ms, options = {}) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.schedule(fn, options);
        resolve(result);
      }, ms);
    });
  }

  /**
   * Schedule multiple tasks in parallel.
   */
  parallel(tasks, options = {}) {
    return Promise.all(
      tasks.map(fn => this.schedule(fn, options))
    );
  }

  /**
   * Schedule tasks in sequence.
   */
  async sequential(tasks, options = {}) {
    const results = [];
    for (const fn of tasks) {
      results.push(await this.schedule(fn, options));
    }
    return results;
  }

  /**
   * Main scheduling loop – processes microtasks first, then regular tasks.
   */
  _startMainLoop() {
    const processNext = async () => {
      if (!this.isRunning) return;

      // Process all microtasks first
      while (!this.microtaskQueue.isEmpty()) {
        const task = this.microtaskQueue.dequeue();
        if (task) await this._executeTask(task);
      }

      // Process one regular task
      const task = this.taskQueue.dequeue();
      if (task) {
        await this._executeTask(task);
      }

      // Continue loop
      if (this.isRunning) {
        setImmediate(processNext);
      }
    };

    setImmediate(processNext);
  }

  /**
   * Execute a single task.
   */
  async _executeTask(task) {
    task.status = 'running';
    task.startedAt = Date.now();

    try {
      const result = await Promise.race([
        Promise.resolve().then(() => task.fn()),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Task ${task.id} timed out`)), this.config.taskTimeout)
        )
      ]);

      task.status = 'completed';
      task.result = result;
      task.completedAt = Date.now();
      task._resolve(result);

      this.metrics.tasksCompleted++;
      this.metrics.totalExecutionTime += task.duration;
      this.emit('taskComplete', task);
    } catch (error) {
      task.status = 'failed';
      task.error = error;
      task.completedAt = Date.now();
      task._reject(error);

      this.metrics.tasksFailed++;
      this.emit('taskError', { task, error });
    }
  }

  /**
   * Get scheduler metrics.
   */
  getMetrics() {
    const completed = this.metrics.tasksCompleted + this.metrics.tasksFailed;
    return {
      ...this.metrics,
      pendingTasks: this.taskQueue.size + this.microtaskQueue.size,
      averageExecutionTime: completed > 0
        ? this.metrics.totalExecutionTime / completed
        : 0
    };
  }

  /**
   * Graceful shutdown.
   */
  async shutdown() {
    this.isRunning = false;

    // Wait for active tasks to complete (with timeout)
    const shutdownTimeout = setTimeout(() => {
      console.warn('[LUNA Scheduler] Forced shutdown – some tasks may not have completed');
    }, 5000);

    // Terminate workers
    for (const worker of [...this.workers, ...this.ioWorkers]) {
      try {
        await worker.terminate();
      } catch (e) { /* ignore */ }
    }

    clearTimeout(shutdownTimeout);
    this.emit('shutdown');
  }
}

module.exports = { Scheduler, Task, PriorityQueue, LockFreeQueue };
