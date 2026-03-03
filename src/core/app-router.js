/**
 * LUNA App Router – File-Based Routing (Next.js–style)
 * 
 * Scans the `app/` directory and automatically builds routes:
 * 
 *   app/page.js            → GET /
 *   app/about/page.js      → GET /about
 *   app/blog/[slug]/page.js→ GET /blog/:slug
 *   app/api/hello/route.js → API handler at /api/hello
 *   app/layout.js          → Root layout wrapping all pages
 *   app/loading.js         → Loading component
 *   app/not-found.js       → 404 component
 *   app/error.js           → Error boundary component
 *   app/globals.css        → Global stylesheet (auto-served at /__luna/globals.css)
 * 
 * Convention files:
 *   page.js     – Page component (exports default or exports page)
 *   layout.js   – Layout component (receives { children } )
 *   route.js    – API route (exports GET, POST, PUT, DELETE, PATCH handlers)
 *   loading.js  – Loading state component
 *   error.js    – Error boundary component
 *   not-found.js– 404 component
 *   middleware.js– Route-level middleware (exports middleware function)
 * 
 * Dynamic segments:
 *   [param]      → :param
 *   [...slug]    → * (catch-all)
 *   [[...slug]]  → optional catch-all
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// Convention file names
const CONVENTION_FILES = {
  PAGE: 'page.js',
  LAYOUT: 'layout.js',
  ROUTE: 'route.js',
  LOADING: 'loading.js',
  ERROR: 'error.js',
  NOT_FOUND: 'not-found.js',
  MIDDLEWARE: 'middleware.js',
  GLOBALS_CSS: 'globals.css'
};

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

/**
 * Discovered route entry.
 */
class RouteEntry {
  constructor(config) {
    this.type = config.type;        // 'page' | 'api'
    this.urlPath = config.urlPath;  // URL pattern: /blog/:slug
    this.filePath = config.filePath;// Absolute path to page.js or route.js
    this.layoutChain = config.layoutChain || []; // Array of layout file paths (outer→inner)
    this.loadingFile = config.loadingFile || null;
    this.errorFile = config.errorFile || null;
    this.middlewareFile = config.middlewareFile || null;
    this.segment = config.segment || '';
    this.isDynamic = config.isDynamic || false;
    this.isCatchAll = config.isCatchAll || false;
  }
}

/**
 * AppRouter – scans app/ directory and produces a route table.
 */
class AppRouter extends EventEmitter {
  constructor(config = {}) {
    super();
    this.appDir = config.appDir || path.join(process.cwd(), 'app');
    this.routes = [];          // RouteEntry[]
    this.layouts = new Map();  // urlPrefix → layout file path
    this.rootLayout = null;
    this.rootLoading = null;
    this.rootError = null;
    this.rootNotFound = null;
    this.globalsCss = null;
    this.middlewares = new Map(); // urlPrefix → middleware file path
    this._scanned = false;
  }

  /**
   * Scan the app/ directory and build the route table.
   */
  scan() {
    if (!fs.existsSync(this.appDir)) {
      throw new Error(`App directory not found: ${this.appDir}`);
    }

    this.routes = [];
    this.layouts.clear();
    this.middlewares.clear();

    // Check for root-level convention files
    this._checkRootConventionFiles();

    // Recursively scan directories
    this._scanDir(this.appDir, '/');

    // Sort routes — static before dynamic, shorter before longer
    this.routes.sort((a, b) => {
      if (a.isDynamic !== b.isDynamic) return a.isDynamic ? 1 : -1;
      if (a.isCatchAll !== b.isCatchAll) return a.isCatchAll ? 1 : -1;
      return a.urlPath.length - b.urlPath.length;
    });

    this._scanned = true;
    this.emit('scan', { routes: this.routes.length });
    return this;
  }

  /**
   * Check for root-level convention files in app/.
   */
  _checkRootConventionFiles() {
    const rootLayout = path.join(this.appDir, CONVENTION_FILES.LAYOUT);
    if (fs.existsSync(rootLayout)) {
      this.rootLayout = rootLayout;
      this.layouts.set('/', rootLayout);
    }

    const rootLoading = path.join(this.appDir, CONVENTION_FILES.LOADING);
    if (fs.existsSync(rootLoading)) this.rootLoading = rootLoading;

    const rootError = path.join(this.appDir, CONVENTION_FILES.ERROR);
    if (fs.existsSync(rootError)) this.rootError = rootError;

    const rootNotFound = path.join(this.appDir, CONVENTION_FILES.NOT_FOUND);
    if (fs.existsSync(rootNotFound)) this.rootNotFound = rootNotFound;

    const globalsCss = path.join(this.appDir, CONVENTION_FILES.GLOBALS_CSS);
    if (fs.existsSync(globalsCss)) this.globalsCss = globalsCss;

    const rootMiddleware = path.join(this.appDir, CONVENTION_FILES.MIDDLEWARE);
    if (fs.existsSync(rootMiddleware)) this.middlewares.set('/', rootMiddleware);
  }

  /**
   * Recursively scan a directory within app/.
   */
  _scanDir(dirPath, urlPrefix) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    // Check for convention files in this directory
    const hasPage = entries.some(e => e.isFile() && e.name === CONVENTION_FILES.PAGE);
    const hasRoute = entries.some(e => e.isFile() && e.name === CONVENTION_FILES.ROUTE);
    const hasLayout = entries.some(e => e.isFile() && e.name === CONVENTION_FILES.LAYOUT);
    const hasLoading = entries.some(e => e.isFile() && e.name === CONVENTION_FILES.LOADING);
    const hasError = entries.some(e => e.isFile() && e.name === CONVENTION_FILES.ERROR);
    const hasMiddleware = entries.some(e => e.isFile() && e.name === CONVENTION_FILES.MIDDLEWARE);

    // Register layout for this segment
    if (hasLayout && urlPrefix !== '/') {
      this.layouts.set(urlPrefix, path.join(dirPath, CONVENTION_FILES.LAYOUT));
    }

    // Register middleware for this segment
    if (hasMiddleware) {
      this.middlewares.set(urlPrefix, path.join(dirPath, CONVENTION_FILES.MIDDLEWARE));
    }

    // Build layout chain for this URL prefix
    const layoutChain = this._buildLayoutChain(urlPrefix);

    // Loading & error inherit from nearest ancestor
    const loadingFile = hasLoading
      ? path.join(dirPath, CONVENTION_FILES.LOADING)
      : this._findNearestConvention(urlPrefix, 'loading');
    const errorFile = hasError
      ? path.join(dirPath, CONVENTION_FILES.ERROR)
      : this._findNearestConvention(urlPrefix, 'error');

    // Register page route
    if (hasPage) {
      const normalizedUrl = urlPrefix === '/' ? '/' : urlPrefix;
      this.routes.push(new RouteEntry({
        type: 'page',
        urlPath: normalizedUrl,
        filePath: path.join(dirPath, CONVENTION_FILES.PAGE),
        layoutChain,
        loadingFile,
        errorFile,
        middlewareFile: this._findMiddlewareChain(urlPrefix),
        segment: path.basename(dirPath),
        isDynamic: this._isDynamicSegment(path.basename(dirPath)),
        isCatchAll: this._isCatchAllSegment(path.basename(dirPath))
      }));
    }

    // Register API route
    if (hasRoute) {
      this.routes.push(new RouteEntry({
        type: 'api',
        urlPath: urlPrefix,
        filePath: path.join(dirPath, CONVENTION_FILES.ROUTE),
        segment: path.basename(dirPath),
        isDynamic: this._isDynamicSegment(path.basename(dirPath)),
        isCatchAll: this._isCatchAllSegment(path.basename(dirPath))
      }));
    }

    // Recurse into subdirectories (skip special dirs)
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;

      const childUrl = this._buildChildUrl(urlPrefix, entry.name);
      this._scanDir(path.join(dirPath, entry.name), childUrl);
    }
  }

  /**
   * Convert a directory name to a URL segment.
   * [param] → :param
   * [...slug] → *
   * [[...slug]] → *?
   * (group) → (invisible, no URL segment)
   */
  _buildChildUrl(parentUrl, dirName) {
    // Route groups: (name) → no URL segment
    if (dirName.startsWith('(') && dirName.endsWith(')')) {
      return parentUrl;
    }

    let segment = dirName;

    // Dynamic: [param] → :param
    if (dirName.startsWith('[') && dirName.endsWith(']')) {
      const inner = dirName.slice(1, -1);

      // Optional catch-all: [[...slug]]
      if (inner.startsWith('[') && inner.endsWith(']')) {
        segment = '*';
      }
      // Catch-all: [...slug]
      else if (inner.startsWith('...')) {
        segment = '*';
      }
      // Dynamic param: [id]
      else {
        segment = `:${inner}`;
      }
    }

    const base = parentUrl.endsWith('/') ? parentUrl : parentUrl + '/';
    return base + segment;
  }

  _isDynamicSegment(name) {
    return name.startsWith('[') && name.endsWith(']');
  }

  _isCatchAllSegment(name) {
    return name.startsWith('[...') || name.startsWith('[[...');
  }

  /**
   * Build the layout chain from root to the given URL prefix.
   * Returns an array of layout file paths [outermost, ..., innermost].
   */
  _buildLayoutChain(urlPrefix) {
    const chain = [];
    const segments = urlPrefix.split('/').filter(Boolean);

    // Root layout always first
    if (this.rootLayout) chain.push(this.rootLayout);

    // Walk down the path to find intermediate layouts
    let current = '/';
    for (const seg of segments) {
      current = current === '/' ? `/${seg}` : `${current}/${seg}`;
      const layout = this.layouts.get(current);
      if (layout && layout !== this.rootLayout) {
        chain.push(layout);
      }
    }

    return chain;
  }

  /**
   * Find the nearest ancestor convention file (loading, error).
   */
  _findNearestConvention(urlPrefix, type) {
    if (type === 'loading' && this.rootLoading) return this.rootLoading;
    if (type === 'error' && this.rootError) return this.rootError;
    return null;
  }

  /**
   * Find the middleware chain for a URL prefix.
   */
  _findMiddlewareChain(urlPrefix) {
    const chain = [];
    const segments = urlPrefix.split('/').filter(Boolean);

    // Root middleware
    const rootMw = this.middlewares.get('/');
    if (rootMw) chain.push(rootMw);

    let current = '/';
    for (const seg of segments) {
      current = current === '/' ? `/${seg}` : `${current}/${seg}`;
      const mw = this.middlewares.get(current);
      if (mw && !chain.includes(mw)) chain.push(mw);
    }

    return chain.length > 0 ? chain : null;
  }

  /**
   * Get all discovered routes.
   */
  getRoutes() {
    if (!this._scanned) this.scan();
    return this.routes;
  }

  /**
   * Get page routes only.
   */
  getPageRoutes() {
    return this.getRoutes().filter(r => r.type === 'page');
  }

  /**
   * Get API routes only.
   */
  getApiRoutes() {
    return this.getRoutes().filter(r => r.type === 'api');
  }

  /**
   * Convert the route table to a printable tree.
   */
  toTree() {
    const lines = ['app/'];

    for (const route of this.getRoutes()) {
      const rel = path.relative(this.appDir, route.filePath).replace(/\\/g, '/');
      const type = route.type === 'api' ? '[API]' : '[PAGE]';
      const dynamic = route.isDynamic ? ' (dynamic)' : '';
      lines.push(`  ${rel} → ${route.urlPath} ${type}${dynamic}`);
    }

    return lines.join('\n');
  }
}

module.exports = { AppRouter, RouteEntry, CONVENTION_FILES, HTTP_METHODS };
