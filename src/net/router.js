/**
 * LUNA Router
 * 
 * High-performance radix-tree based router supporting:
 * - Parameterized routes (:param)
 * - Wildcard routes (*)
 * - Route groups
 * - Method-based routing
 * - Route metadata
 */

'use strict';

/**
 * Radix tree node for efficient route matching.
 */
class RadixNode {
  constructor(segment = '', isParam = false, isWildcard = false) {
    this.segment = segment;
    this.isParam = isParam;
    this.isWildcard = isWildcard;
    this.paramName = isParam ? segment.slice(1) : null;
    this.children = new Map();
    this.handlers = new Map(); // method -> { handlers, meta }
  }
}

class Router {
  constructor() {
    this.root = new RadixNode();
    this.routes = [];
    this.groups = [];
    this.notFoundHandler = null;
    this.errorHandler = null;
  }

  /**
   * Add a route.
   */
  add(method, path, ...handlers) {
    const normalizedPath = this._normalizePath(path);
    const segments = normalizedPath.split('/').filter(Boolean);
    let node = this.root;

    for (const segment of segments) {
      const isParam = segment.startsWith(':');
      const isWildcard = segment === '*';
      const key = isParam ? ':param' : (isWildcard ? '*' : segment);

      if (!node.children.has(key)) {
        node.children.set(key, new RadixNode(segment, isParam, isWildcard));
      }
      node = node.children.get(key);
    }

    const upperMethod = method.toUpperCase();
    node.handlers.set(upperMethod, {
      handlers,
      meta: { method: upperMethod, path: normalizedPath }
    });

    this.routes.push({ method: upperMethod, path: normalizedPath, handlers });
    return this;
  }

  /**
   * Match a request method and path to a route.
   */
  match(method, path) {
    const normalizedPath = this._normalizePath(path);
    const segments = normalizedPath.split('/').filter(Boolean);
    const params = {};

    const result = this._matchNode(this.root, segments, 0, params);
    if (!result) return null;

    const handlerEntry = result.handlers.get(method.toUpperCase());
    if (!handlerEntry) {
      // Check if any methods are registered for this path (for 405)
      if (result.handlers.size > 0) {
        return {
          handlers: [(_req, res) => {
            res.status(405).json({
              error: 'Method Not Allowed',
              allowed: Array.from(result.handlers.keys())
            });
          }],
          params,
          meta: { method: method.toUpperCase(), path: normalizedPath }
        };
      }
      return null;
    }

    return {
      handlers: handlerEntry.handlers,
      params,
      meta: handlerEntry.meta
    };
  }

  /**
   * Recursive node matching.
   */
  _matchNode(node, segments, index, params) {
    if (index === segments.length) {
      return node.handlers.size > 0 ? node : null;
    }

    const segment = segments[index];

    // 1. Try exact match
    if (node.children.has(segment)) {
      const result = this._matchNode(node.children.get(segment), segments, index + 1, params);
      if (result) return result;
    }

    // 2. Try param match
    if (node.children.has(':param')) {
      const paramNode = node.children.get(':param');
      params[paramNode.paramName] = decodeURIComponent(segment);
      const result = this._matchNode(paramNode, segments, index + 1, params);
      if (result) return result;
      delete params[paramNode.paramName];
    }

    // 3. Try wildcard match
    if (node.children.has('*')) {
      const wildcardNode = node.children.get('*');
      params['*'] = segments.slice(index).map(decodeURIComponent).join('/');
      return wildcardNode.handlers.size > 0 ? wildcardNode : null;
    }

    return null;
  }

  /**
   * Create a route group with a shared prefix and optional middleware.
   */
  group(prefix, callback, ...middlewareHandlers) {
    const groupRouter = new RouterGroup(this, prefix, middlewareHandlers);
    callback(groupRouter);
    return this;
  }

  /**
   * Set a custom 404 handler.
   */
  onNotFound(handler) {
    this.notFoundHandler = handler;
    return this;
  }

  /**
   * Set a custom error handler.
   */
  onError(handler) {
    this.errorHandler = handler;
    return this;
  }

  /**
   * Get all registered routes.
   */
  getRoutes() {
    return this.routes.map(r => ({
      method: r.method,
      path: r.path,
      handlerCount: r.handlers.length
    }));
  }

  /**
   * Normalize a path.
   */
  _normalizePath(path) {
    return '/' + path.split('/').filter(Boolean).join('/');
  }

  // Shorthand methods
  get(path, ...handlers) { return this.add('GET', path, ...handlers); }
  post(path, ...handlers) { return this.add('POST', path, ...handlers); }
  put(path, ...handlers) { return this.add('PUT', path, ...handlers); }
  delete(path, ...handlers) { return this.add('DELETE', path, ...handlers); }
  patch(path, ...handlers) { return this.add('PATCH', path, ...handlers); }
  options(path, ...handlers) { return this.add('OPTIONS', path, ...handlers); }
  head(path, ...handlers) { return this.add('HEAD', path, ...handlers); }
  all(path, ...handlers) {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
    for (const method of methods) {
      this.add(method, path, ...handlers);
    }
    return this;
  }
}

/**
 * Router group for prefixed routes.
 */
class RouterGroup {
  constructor(router, prefix, middleware = []) {
    this.router = router;
    this.prefix = prefix;
    this.middleware = middleware;
  }

  add(method, path, ...handlers) {
    const fullPath = this.prefix + path;
    this.router.add(method, fullPath, ...this.middleware, ...handlers);
    return this;
  }

  get(path, ...h) { return this.add('GET', path, ...h); }
  post(path, ...h) { return this.add('POST', path, ...h); }
  put(path, ...h) { return this.add('PUT', path, ...h); }
  delete(path, ...h) { return this.add('DELETE', path, ...h); }
  patch(path, ...h) { return this.add('PATCH', path, ...h); }

  group(prefix, callback, ...middleware) {
    const nestedGroup = new RouterGroup(
      this.router,
      this.prefix + prefix,
      [...this.middleware, ...middleware]
    );
    callback(nestedGroup);
    return this;
  }
}

module.exports = { Router, RouterGroup };
