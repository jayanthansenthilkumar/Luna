/**
 * @luna/net - LUNA Networking Module
 *
 * HTTP server, middleware pipeline, WebSocket, and streaming support.
 */

class HttpServer {
  constructor(opts = {}) {
    this.port = opts.port || 3000;
    this.host = opts.host || 'localhost';
    this.handlers = [];
  }

  use(pathOrFn, fn) {
    if (typeof pathOrFn === 'function') {
      this.handlers.push({ path: '*', handler: pathOrFn });
    } else {
      this.handlers.push({ path: pathOrFn, handler: fn });
    }
    return this;
  }

  listen(port, cb) {
    this.port = port || this.port;
    if (cb) cb();
    return this;
  }
}

class Middleware {
  constructor() {
    this.stack = [];
  }

  use(pathOrFn, fn) {
    if (typeof pathOrFn === 'function') {
      this.stack.push({ path: '/', handler: pathOrFn });
    } else {
      this.stack.push({ path: pathOrFn, handler: fn });
    }
    return this;
  }

  async run(req, res) {
    let idx = 0;
    const next = async () => {
      if (idx < this.stack.length) {
        const layer = this.stack[idx++];
        await layer.handler(req, res, next);
      }
    };
    await next();
  }
}

class WebSocket {
  constructor() {
    this.rooms = new Map();
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(handler);
    return this;
  }

  to(room) {
    return {
      broadcast: (data, exclude) => {
        const members = this.rooms.get(room) || [];
        members.filter(s => s !== exclude).forEach(s => s.send(data));
      }
    };
  }
}

module.exports = {
  HttpServer,
  Middleware,
  WebSocket,
  version: '0.1.0'
};
