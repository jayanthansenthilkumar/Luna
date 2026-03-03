/**
 * @luna/router — File-based routing for LUNA
 *
 * Provides radix-tree route matching, file-based page routing,
 * layout nesting, dynamic segments, and API route handling.
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.middleware = [];
  }

  get(path, handler) { return this._add('GET', path, handler); }
  post(path, handler) { return this._add('POST', path, handler); }
  put(path, handler) { return this._add('PUT', path, handler); }
  delete(path, handler) { return this._add('DELETE', path, handler); }
  patch(path, handler) { return this._add('PATCH', path, handler); }

  _add(method, path, handler) {
    const key = `${method}:${path}`;
    this.routes.set(key, { method, path, handler });
    return this;
  }

  group(prefix, fn) {
    const sub = new Router();
    fn(sub);
    for (const [, route] of sub.routes) {
      this._add(route.method, prefix + route.path, route.handler);
    }
    return this;
  }

  match(method, url) {
    const key = `${method}:${url}`;
    if (this.routes.has(key)) return this.routes.get(key);

    // Dynamic segment matching
    for (const [, route] of this.routes) {
      if (route.method !== method) continue;
      const params = this._matchDynamic(route.path, url);
      if (params) return { ...route, params };
    }
    return null;
  }

  _matchDynamic(pattern, url) {
    const patternParts = pattern.split('/');
    const urlParts = url.split('/');
    if (patternParts.length !== urlParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = urlParts[i];
      } else if (patternParts[i] !== urlParts[i]) {
        return null;
      }
    }
    return params;
  }

  navigate(path) { /* client-side navigation */ }
  back() { /* history.back() */ }
  replace(path) { /* history.replaceState */ }
}

module.exports = Router;
module.exports.Router = Router;
