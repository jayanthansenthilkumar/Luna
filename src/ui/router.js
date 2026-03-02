/**
 * LUNA UI Router
 * 
 * Client-side and universal router for page-based navigation:
 * - Page routes with components
 * - Nested routes
 * - Route guards (before/after)
 * - Dynamic imports
 * - Route transitions
 * - History management
 */

'use strict';

const { EventEmitter } = require('events');

/**
 * Route definition.
 */
class Route {
  constructor(path, component, options = {}) {
    this.path = path;
    this.component = component;
    this.name = options.name || null;
    this.meta = options.meta || {};
    this.guards = options.guards || [];
    this.children = [];
    this.layout = options.layout || null;
    this.redirect = options.redirect || null;
    this.ssr = options.ssr !== false;
    this.ssg = options.ssg || false;
    this.isr = options.isr || null;
    this.loader = options.loader || null; // Data loader function
    this.errorComponent = options.errorComponent || null;
    this.loadingComponent = options.loadingComponent || null;
    this.transition = options.transition || null;

    // Parse path segments
    this._segments = path.split('/').filter(Boolean);
    this._paramNames = this._segments
      .filter(s => s.startsWith(':'))
      .map(s => s.slice(1));
    this._regex = this._buildRegex();
  }

  /**
   * Build a regex for matching.
   */
  _buildRegex() {
    const pattern = this._segments.map(seg => {
      if (seg.startsWith(':')) return '([^/]+)';
      if (seg === '*') return '(.*)';
      return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('/');
    return new RegExp(`^/?${pattern}/?$`);
  }

  /**
   * Test if a path matches this route.
   */
  match(path) {
    const match = path.match(this._regex);
    if (!match) return null;

    const params = {};
    this._paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(match[i + 1]);
    });

    return { route: this, params };
  }

  /**
   * Add a child route.
   */
  addChild(path, component, options = {}) {
    const childRoute = new Route(this.path + path, component, options);
    this.children.push(childRoute);
    return childRoute;
  }
}

/**
 * Navigation context.
 */
class NavigationContext {
  constructor(from, to, params = {}, query = {}) {
    this.from = from;
    this.to = to;
    this.params = params;
    this.query = query;
    this.redirectTo = null;
    this._aborted = false;
  }

  abort() {
    this._aborted = true;
  }

  redirect(path) {
    this.redirectTo = path;
    this._aborted = true;
  }

  get aborted() {
    return this._aborted;
  }
}

/**
 * Main UI Router.
 */
class UIRouter extends EventEmitter {
  constructor(options = {}) {
    super();
    this.routes = [];
    this.currentRoute = null;
    this.currentParams = {};
    this.currentQuery = {};
    this.history = [];
    this.maxHistory = options.maxHistory || 100;

    // Guards
    this.globalBeforeGuards = [];
    this.globalAfterGuards = [];

    // 404 handler
    this.notFoundComponent = options.notFoundComponent || null;
    this.errorComponent = options.errorComponent || null;
  }

  /**
   * Add a route.
   */
  add(path, component, options = {}) {
    const route = new Route(path, component, options);
    this.routes.push(route);
    return route;
  }

  /**
   * Add multiple routes.
   */
  addRoutes(routeDefinitions) {
    for (const def of routeDefinitions) {
      this.add(def.path, def.component, def);
    }
    return this;
  }

  /**
   * Match a path to a route.
   */
  match(path) {
    const [pathname, queryString] = path.split('?');
    const query = queryString
      ? Object.fromEntries(new URLSearchParams(queryString))
      : {};

    for (const route of this.routes) {
      const result = route.match(pathname);
      if (result) {
        return { ...result, query };
      }

      // Check children
      for (const child of route.children) {
        const childResult = child.match(pathname);
        if (childResult) {
          return { ...childResult, query, parent: route };
        }
      }
    }

    return null;
  }

  /**
   * Navigate to a path.
   */
  async navigate(path, options = {}) {
    const matched = this.match(path);
    const from = this.currentRoute;
    const to = matched?.route || null;

    // Create navigation context
    const context = new NavigationContext(
      from,
      to,
      matched?.params || {},
      matched?.query || {}
    );

    // Run global before guards
    for (const guard of this.globalBeforeGuards) {
      await guard(context);
      if (context.aborted) {
        if (context.redirectTo) {
          return this.navigate(context.redirectTo);
        }
        this.emit('navigation:aborted', context);
        return null;
      }
    }

    // Run route-specific guards
    if (to) {
      for (const guard of to.guards) {
        await guard(context);
        if (context.aborted) {
          if (context.redirectTo) {
            return this.navigate(context.redirectTo);
          }
          this.emit('navigation:aborted', context);
          return null;
        }
      }
    }

    // Handle redirect routes
    if (to && to.redirect) {
      return this.navigate(to.redirect);
    }

    // Load data if loader exists
    let loaderData = null;
    if (to && to.loader) {
      try {
        loaderData = await to.loader(context.params, context.query);
      } catch (error) {
        this.emit('navigation:error', { error, context });
        return { route: to, params: context.params, query: context.query, error };
      }
    }

    // Update current state
    const previousRoute = this.currentRoute;
    this.currentRoute = to;
    this.currentParams = context.params;
    this.currentQuery = context.query;

    // Add to history
    this.history.push({
      path,
      route: to,
      params: context.params,
      query: context.query,
      timestamp: Date.now()
    });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Run global after guards
    for (const guard of this.globalAfterGuards) {
      await guard(context);
    }

    const result = {
      route: to,
      params: context.params,
      query: context.query,
      data: loaderData,
      from: previousRoute
    };

    this.emit('navigation:complete', result);
    return result;
  }

  /**
   * Add a global before navigation guard.
   */
  beforeEach(guard) {
    this.globalBeforeGuards.push(guard);
    return this;
  }

  /**
   * Add a global after navigation guard.
   */
  afterEach(guard) {
    this.globalAfterGuards.push(guard);
    return this;
  }

  /**
   * Go back in history.
   */
  back() {
    if (this.history.length > 1) {
      this.history.pop(); // Remove current
      const prev = this.history[this.history.length - 1];
      return this.navigate(prev.path);
    }
    return null;
  }

  /**
   * Generate a URL from a named route.
   */
  resolve(name, params = {}, query = {}) {
    const route = this.routes.find(r => r.name === name);
    if (!route) return null;

    let path = route.path;
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }

    const queryString = Object.entries(query)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    return queryString ? `${path}?${queryString}` : path;
  }

  /**
   * Get all registered routes.
   */
  getRoutes() {
    const result = [];
    for (const route of this.routes) {
      result.push({
        path: route.path,
        name: route.name,
        meta: route.meta,
        ssr: route.ssr,
        ssg: route.ssg
      });
      for (const child of route.children) {
        result.push({
          path: child.path,
          name: child.name,
          meta: child.meta,
          parent: route.path
        });
      }
    }
    return result;
  }
}

module.exports = { UIRouter, Route, NavigationContext };
