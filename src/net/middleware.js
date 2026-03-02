/**
 * LUNA Middleware Pipeline
 * 
 * Composable middleware system supporting:
 * - Global middleware
 * - Path-specific middleware
 * - Error middleware
 * - Async middleware
 * - Built-in common middleware (CORS, body parser, compression, logging, etc.)
 */

'use strict';

class MiddlewarePipeline {
  constructor() {
    this.stack = [];
    this.errorHandlers = [];
  }

  /**
   * Add middleware to the pipeline.
   * @param {string|Function} pathOrFn - Path prefix or middleware function
   * @param {Function} [fn] - Middleware function if path is specified
   */
  use(pathOrFn, fn) {
    if (typeof pathOrFn === 'function') {
      this.stack.push({ path: null, handler: pathOrFn, isError: pathOrFn.length === 4 });
    } else if (typeof pathOrFn === 'string' && typeof fn === 'function') {
      this.stack.push({ path: pathOrFn, handler: fn, isError: fn.length === 4 });
    }
    return this;
  }

  /**
   * Add error-handling middleware.
   */
  useError(handler) {
    this.errorHandlers.push(handler);
    return this;
  }

  /**
   * Execute the middleware pipeline.
   * Returns true if all middleware passed, false if response was sent.
   */
  async execute(req, res) {
    let index = 0;
    const stack = this.stack.filter(m => !m.isError);

    const next = async (error) => {
      if (error) {
        return this._handleError(error, req, res);
      }
      if (res.sent) return false;
      if (index >= stack.length) return true;

      const layer = stack[index++];

      // Check path match
      if (layer.path && !req.pathname.startsWith(layer.path)) {
        return next();
      }

      try {
        await layer.handler(req, res, next);
        return !res.sent;
      } catch (err) {
        return this._handleError(err, req, res);
      }
    };

    return next();
  }

  /**
   * Handle errors through error middleware.
   */
  async _handleError(error, req, res) {
    for (const handler of this.errorHandlers) {
      try {
        await handler(error, req, res);
        if (res.sent) return false;
      } catch (e) {
        error = e;
      }
    }

    // Default error handler
    if (!res.sent) {
      const isDev = process.env.LUNA_ENV !== 'production';
      res.status(error.statusCode || 500).json({
        error: error.name || 'Internal Server Error',
        message: isDev ? error.message : 'An internal error occurred',
        ...(isDev && { stack: error.stack })
      });
    }

    return false;
  }
}

// ─── Built-in Middleware Factory Functions ─────────────────────

/**
 * CORS middleware.
 */
function cors(options = {}) {
  const defaults = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    headers: 'Content-Type,Authorization,X-Requested-With',
    credentials: false,
    maxAge: 86400
  };
  const config = { ...defaults, ...options };

  return async (req, res, next) => {
    const origin = typeof config.origin === 'function'
      ? config.origin(req.headers.origin)
      : config.origin;

    res.header('access-control-allow-origin', origin);
    res.header('access-control-allow-methods', config.methods);
    res.header('access-control-allow-headers', config.headers);

    if (config.credentials) {
      res.header('access-control-allow-credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
      res.header('access-control-max-age', String(config.maxAge));
      res.status(204).send('');
      return;
    }

    await next();
  };
}

/**
 * Body parser middleware (automatically parses JSON and URL-encoded bodies).
 */
function bodyParser(options = {}) {
  const maxSize = options.maxSize || 1024 * 1024; // 1MB default

  return async (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      if (contentLength > maxSize) {
        res.status(413).json({ error: 'Payload Too Large' });
        return;
      }
      await req.parseBody();
    }
    await next();
  };
}

/**
 * Compression middleware.
 */
function compression(options = {}) {
  const zlib = require('zlib');
  const threshold = options.threshold || 1024; // Only compress > 1KB

  return async (req, res, next) => {
    const originalSend = res.send.bind(res);
    const acceptEncoding = req.headers['accept-encoding'] || '';

    res.send = (body) => {
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        const content = typeof body === 'string' ? Buffer.from(body) : body;

        if (content.length >= threshold) {
          if (acceptEncoding.includes('br')) {
            res.header('content-encoding', 'br');
            const compressed = zlib.brotliCompressSync(content);
            return originalSend.call(res, compressed);
          } else if (acceptEncoding.includes('gzip')) {
            res.header('content-encoding', 'gzip');
            const compressed = zlib.gzipSync(content);
            return originalSend.call(res, compressed);
          } else if (acceptEncoding.includes('deflate')) {
            res.header('content-encoding', 'deflate');
            const compressed = zlib.deflateSync(content);
            return originalSend.call(res, compressed);
          }
        }
      }

      return originalSend(body);
    };

    await next();
  };
}

/**
 * Request logging middleware.
 */
function logger(options = {}) {
  const format = options.format || 'short';

  return async (req, res, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;

    if (format === 'short') {
      console.log(`  ${req.method} ${req.pathname} ${res._statusCode} ${duration}ms`);
    } else if (format === 'full') {
      console.log(
        `  ${new Date().toISOString()} ${req.method} ${req.pathname} ` +
        `${res._statusCode} ${duration}ms ${req.ip} "${req.headers['user-agent'] || ''}"`
      );
    }
  };
}

/**
 * Rate limiting middleware.
 */
function rateLimit(options = {}) {
  const windowMs = options.windowMs || 60000; // 1 minute
  const max = options.max || 100;
  const store = new Map();

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now - entry.resetAt > windowMs) {
        store.delete(key);
      }
    }
  }, windowMs).unref();

  return async (req, res, next) => {
    const key = options.keyGenerator ? options.keyGenerator(req) : req.ip;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    res.header('x-ratelimit-limit', String(max));
    res.header('x-ratelimit-remaining', String(Math.max(0, max - entry.count)));
    res.header('x-ratelimit-reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: Math.ceil((entry.resetAt - now) / 1000)
      });
      return;
    }

    await next();
  };
}

/**
 * Static file serving middleware.
 */
function serveStatic(root, options = {}) {
  const fs = require('fs');
  const path = require('path');
  const index = options.index || 'index.html';
  const maxAge = options.maxAge || 0;

  return async (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    const filePath = path.join(root, decodeURIComponent(req.pathname));

    // Prevent directory traversal
    if (!filePath.startsWith(path.resolve(root))) {
      return next();
    }

    try {
      let stat = await fs.promises.stat(filePath);
      let targetPath = filePath;

      if (stat.isDirectory()) {
        targetPath = path.join(filePath, index);
        stat = await fs.promises.stat(targetPath);
      }

      if (stat.isFile()) {
        if (maxAge > 0) {
          res.header('cache-control', `public, max-age=${maxAge}`);
        }
        res.header('last-modified', stat.mtime.toUTCString());
        res.header('etag', `W/"${stat.size}-${stat.mtime.getTime()}"`);

        // Check if not modified
        const ifNoneMatch = req.header('if-none-match');
        const etag = `W/"${stat.size}-${stat.mtime.getTime()}"`;
        if (ifNoneMatch === etag) {
          res.status(304).send('');
          return;
        }

        await res.file(targetPath);
        return;
      }
    } catch {
      // File not found, continue to next middleware
    }

    await next();
  };
}

/**
 * Security headers middleware.
 */
function helmet(options = {}) {
  return async (req, res, next) => {
    res.header('x-content-type-options', 'nosniff');
    res.header('x-frame-options', options.frameOptions || 'SAMEORIGIN');
    res.header('x-xss-protection', '1; mode=block');
    res.header('referrer-policy', options.referrerPolicy || 'strict-origin-when-cross-origin');
    res.header('permissions-policy', options.permissionsPolicy || 'camera=(), microphone=(), geolocation=()');

    if (options.hsts !== false) {
      res.header('strict-transport-security', `max-age=${options.hstsMaxAge || 31536000}; includeSubDomains`);
    }

    if (options.csp) {
      res.header('content-security-policy', options.csp);
    }

    await next();
  };
}

module.exports = {
  MiddlewarePipeline,
  cors,
  bodyParser,
  compression,
  logger,
  rateLimit,
  serveStatic,
  helmet
};
