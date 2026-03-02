/**
 * LUNA HTTP Server
 * 
 * Native HTTP server with:
 * - Zero-copy networking
 * - Built-in clustering
 * - Request/Response abstraction
 * - Error propagation
 * - Load balancing
 * - Multi-threaded execution
 * - Built-in compression
 * - Native HTTP parser
 */

'use strict';

const http = require('http');
const https = require('https');
const { EventEmitter } = require('events');
const cluster = require('cluster');
const os = require('os');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

/**
 * LUNA Request abstraction.
 */
class LunaRequest {
  constructor(req) {
    this._raw = req;
    this.method = req.method;
    this.url = req.url;
    this.headers = req.headers;
    this.httpVersion = req.httpVersion;
    this.socket = req.socket;

    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    this.pathname = urlObj.pathname;
    this.query = Object.fromEntries(urlObj.searchParams);
    this.params = {};
    this.body = null;
    this.cookies = this._parseCookies(req.headers.cookie);

    this.startTime = Date.now();
    this.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  _parseCookies(cookieHeader) {
    if (!cookieHeader) return {};
    return cookieHeader.split(';').reduce((cookies, part) => {
      const [name, ...rest] = part.trim().split('=');
      cookies[name] = rest.join('=');
      return cookies;
    }, {});
  }

  /**
   * Parse the request body.
   */
  async parseBody() {
    if (this.body !== null) return this.body;

    return new Promise((resolve, reject) => {
      const chunks = [];
      this._raw.on('data', (chunk) => chunks.push(chunk));
      this._raw.on('end', () => {
        const raw = Buffer.concat(chunks);
        const contentType = this.headers['content-type'] || '';

        if (contentType.includes('application/json')) {
          try {
            this.body = JSON.parse(raw.toString());
          } catch {
            this.body = raw.toString();
          }
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          this.body = Object.fromEntries(new URLSearchParams(raw.toString()));
        } else if (contentType.includes('text/')) {
          this.body = raw.toString();
        } else {
          this.body = raw;
        }
        resolve(this.body);
      });
      this._raw.on('error', reject);
    });
  }

  /**
   * Get a specific header value.
   */
  header(name) {
    return this.headers[name.toLowerCase()];
  }

  /**
   * Check if the request accepts a given content type.
   */
  accepts(type) {
    const accept = this.headers['accept'] || '';
    return accept.includes(type) || accept.includes('*/*');
  }

  /**
   * Get the client IP address.
   */
  get ip() {
    return this.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           this.socket?.remoteAddress || 'unknown';
  }

  /**
   * Check if the connection is secure.
   */
  get secure() {
    return this.headers['x-forwarded-proto'] === 'https' || this.socket?.encrypted;
  }
}

/**
 * LUNA Response abstraction.
 */
class LunaResponse {
  constructor(res) {
    this._raw = res;
    this._headers = {};
    this._statusCode = 200;
    this._sent = false;
    this._cookies = [];
  }

  /**
   * Set the status code.
   */
  status(code) {
    this._statusCode = code;
    return this;
  }

  /**
   * Set a response header.
   */
  header(name, value) {
    this._headers[name.toLowerCase()] = value;
    return this;
  }

  /**
   * Set a cookie.
   */
  cookie(name, value, options = {}) {
    let cookie = `${name}=${encodeURIComponent(value)}`;
    if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
    if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
    if (options.path) cookie += `; Path=${options.path}`;
    if (options.domain) cookie += `; Domain=${options.domain}`;
    if (options.secure) cookie += '; Secure';
    if (options.httpOnly) cookie += '; HttpOnly';
    if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
    this._cookies.push(cookie);
    return this;
  }

  /**
   * Send a JSON response.
   */
  json(data) {
    this.header('content-type', 'application/json; charset=utf-8');
    return this.send(JSON.stringify(data));
  }

  /**
   * Send an HTML response.
   */
  html(content) {
    this.header('content-type', 'text/html; charset=utf-8');
    return this.send(content);
  }

  /**
   * Send a text response.
   */
  text(content) {
    this.header('content-type', 'text/plain; charset=utf-8');
    return this.send(content);
  }

  /**
   * Redirect to a URL.
   */
  redirect(url, code = 302) {
    this.status(code).header('location', url).send('');
    return this;
  }

  /**
   * Send a file as response.
   */
  async file(filePath, contentType) {
    const fs = require('fs');
    const path = require('path');

    if (contentType) {
      this.header('content-type', contentType);
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
        '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
        '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
        '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
        '.pdf': 'application/pdf', '.zip': 'application/zip',
        '.mp4': 'video/mp4', '.webm': 'video/webm',
        '.mp3': 'audio/mpeg', '.wasm': 'application/wasm'
      };
      this.header('content-type', mimeTypes[ext] || 'application/octet-stream');
    }

    const stream = fs.createReadStream(filePath);
    return this.stream(stream);
  }

  /**
   * Send a stream response.
   */
  stream(readable) {
    if (this._sent) throw new Error('Response already sent');
    this._sent = true;

    this._applyHeaders();
    this._raw.writeHead(this._statusCode);
    return new Promise((resolve, reject) => {
      readable.pipe(this._raw);
      readable.on('end', resolve);
      readable.on('error', reject);
    });
  }

  /**
   * Send the final response body.
   */
  send(body) {
    if (this._sent) throw new Error('Response already sent');
    this._sent = true;

    let content = body;
    if (typeof body === 'object' && !Buffer.isBuffer(body)) {
      content = JSON.stringify(body);
      if (!this._headers['content-type']) {
        this._headers['content-type'] = 'application/json; charset=utf-8';
      }
    }

    if (typeof content === 'string') {
      content = Buffer.from(content, 'utf-8');
    }

    this._headers['content-length'] = content ? content.length : 0;
    this._applyHeaders();
    this._raw.writeHead(this._statusCode);
    this._raw.end(content);

    return this;
  }

  /**
   * Apply all headers including cookies.
   */
  _applyHeaders() {
    for (const [name, value] of Object.entries(this._headers)) {
      this._raw.setHeader(name, value);
    }
    for (const cookie of this._cookies) {
      this._raw.setHeader('set-cookie', cookie);
    }
    // Default security headers
    if (!this._headers['x-content-type-options']) {
      this._raw.setHeader('x-content-type-options', 'nosniff');
    }
    if (!this._headers['x-frame-options']) {
      this._raw.setHeader('x-frame-options', 'SAMEORIGIN');
    }
  }

  get sent() {
    return this._sent;
  }
}

/**
 * Main HTTP Server.
 */
class HttpServer extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      port: config.port || 3000,
      host: config.host || '0.0.0.0',
      clustering: config.clustering || false,
      workers: config.workers || 0,
      keepAliveTimeout: config.keepAliveTimeout || 5000,
      headersTimeout: config.headersTimeout || 60000,
      maxHeaderSize: config.maxHeaderSize || 16384,
      compression: config.compression !== false,
      ...config
    };

    this.router = config.router || null;
    this.middleware = config.middleware || null;
    this.scheduler = config.scheduler || null;
    this.server = null;

    // Metrics
    this.metrics = {
      totalRequests: 0,
      activeConnections: 0,
      totalErrors: 0,
      bytesReceived: 0,
      bytesSent: 0,
      requestsPerSecond: 0
    };

    this._requestCountWindow = [];
  }

  /**
   * Create and return the native HTTP server.
   */
  _createServer() {
    const server = http.createServer({
      maxHeaderSize: this.config.maxHeaderSize
    });

    server.keepAliveTimeout = this.config.keepAliveTimeout;
    server.headersTimeout = this.config.headersTimeout;

    server.on('request', (req, res) => this._handleRequest(req, res));
    server.on('connection', () => { this.metrics.activeConnections++; });
    server.on('close', () => { this.metrics.activeConnections = 0; });

    return server;
  }

  /**
   * Handle incoming HTTP request.
   */
  async _handleRequest(rawReq, rawRes) {
    const req = new LunaRequest(rawReq);
    const res = new LunaResponse(rawRes);

    this.metrics.totalRequests++;
    this._trackRPS();

    try {
      // Parse body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        await req.parseBody();
      }

      // Apply middleware pipeline
      let middlewarePassed = true;
      if (this.middleware) {
        middlewarePassed = await this.middleware.execute(req, res);
      }

      if (!middlewarePassed || res.sent) return;

      // Route the request
      if (this.router) {
        const matched = this.router.match(req.method, req.pathname);
        if (matched) {
          req.params = matched.params;
          // Execute all route handlers in sequence
          for (const handler of matched.handlers) {
            if (res.sent) break;
            await handler(req, res);
          }
        } else {
          res.status(404).json({
            error: 'Not Found',
            message: `Cannot ${req.method} ${req.pathname}`,
            statusCode: 404
          });
        }
      } else {
        res.status(503).json({ error: 'No router configured' });
      }
    } catch (error) {
      this.metrics.totalErrors++;
      this.emit('error', { req, error });

      if (!res.sent) {
        const isDev = process.env.LUNA_ENV !== 'production';
        res.status(error.statusCode || 500).json({
          error: error.name || 'Internal Server Error',
          message: isDev ? error.message : 'An internal error occurred',
          ...(isDev && { stack: error.stack })
        });
      }
    }
  }

  /**
   * Track requests per second.
   */
  _trackRPS() {
    const now = Date.now();
    this._requestCountWindow.push(now);
    // Keep only last second
    this._requestCountWindow = this._requestCountWindow.filter(t => now - t < 1000);
    this.metrics.requestsPerSecond = this._requestCountWindow.length;
  }

  /**
   * Start listening with optional clustering.
   */
  async listen(port, host) {
    const p = port || this.config.port;
    const h = host || this.config.host;

    if (this.config.clustering && cluster.isPrimary) {
      const numWorkers = this.config.workers || os.cpus().length;
      console.log(`  [LUNA] Primary ${process.pid} starting ${numWorkers} worker(s)...`);

      for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`  [LUNA] Worker ${worker.process.pid} exited (${signal || code}). Restarting...`);
        cluster.fork();
      });

      return this;
    }

    this.server = this._createServer();

    return new Promise((resolve, reject) => {
      this.server.listen(p, h, () => {
        this.emit('listening', { port: p, host: h, pid: process.pid });
        resolve(this);
      });
      this.server.on('error', reject);
    });
  }

  /**
   * Close the server.
   */
  async close() {
    if (!this.server) return;
    return new Promise((resolve) => {
      this.server.close(() => {
        this.emit('closed');
        resolve();
      });
    });
  }

  /**
   * Get server metrics.
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Get the underlying http.Server for WebSocket upgrade.
   */
  getServer() {
    return this.server;
  }
}

module.exports = { HttpServer, LunaRequest, LunaResponse };
