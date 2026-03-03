/**
 * LUNA Dev Server – Automatic App Router Integration
 * 
 * Reads the app/ directory, auto-registers all file-based routes, serves
 * static files from public/, injects globals.css, and provides error pages.
 * 
 * Used by `luna dev` and `luna start` when an app/ directory is detected.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { AppRouter, HTTP_METHODS } = require('./app-router');

/**
 * Content-type map for static files.
 */
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf'
};

/**
 * DevServer — mounts scanned app-router routes onto a Luna app.
 */
class DevServer {
  constructor(options = {}) {
    this.cwd = options.cwd || process.cwd();
    this.appDir = path.join(this.cwd, 'app');
    this.publicDir = path.join(this.cwd, 'public');
    this.appRouter = null;
    this.mode = options.mode || 'development';
  }

  /**
   * Detect whether the project uses the app/ directory convention.
   */
  hasAppDir() {
    return fs.existsSync(this.appDir);
  }

  /**
   * Scan and mount all routes onto a Luna app instance.
   * @param {object} app – Luna app (must have .get, .post, .route, etc.)
   */
  mount(app) {
    if (!this.hasAppDir()) {
      throw new Error('No app/ directory found. Create an app/ directory with page.js files.');
    }

    this.appRouter = new AppRouter({ appDir: this.appDir });
    this.appRouter.scan();

    const routes = this.appRouter.getRoutes();

    // 1. Serve globals.css if present
    if (this.appRouter.globalsCss) {
      const cssPath = this.appRouter.globalsCss;
      app.get('/__luna/globals.css', (req, res) => {
        const css = fs.readFileSync(cssPath, 'utf-8');
        res.header('content-type', 'text/css').send(css);
      });
    }

    // 2. Serve static files from public/
    if (fs.existsSync(this.publicDir)) {
      app.get('/__luna/static/*', (req, res) => {
        this._serveStatic(req, res);
      });
      // Also serve from root for favicon etc.
      this._mountPublicFiles(app);
    }

    // 3. Mount API routes (route.js handlers)
    for (const route of this.appRouter.getApiRoutes()) {
      this._mountApiRoute(app, route);
    }

    // 4. Mount page routes (page.js components)
    for (const route of this.appRouter.getPageRoutes()) {
      this._mountPageRoute(app, route);
    }

    // 5. Catch-all 404 page
    app.get('*', (req, res) => {
      this._render404(req, res);
    });

    return routes;
  }

  /**
   * Mount an API route (route.js exports GET, POST, etc.)
   * The handler receives Luna's (req, res) — res has .json(), .send(), .status(), .header()
   */
  _mountApiRoute(app, routeEntry) {
    const routeModule = this._loadModule(routeEntry.filePath);

    for (const method of HTTP_METHODS) {
      const handler = routeModule[method] || routeModule[method.toLowerCase()];
      if (typeof handler === 'function') {
        const m = method.toLowerCase();
        if (typeof app[m] === 'function') {
          app[m](routeEntry.urlPath, (req, res) => {
            try {
              // Populate params & query on the request
              req.params = this._extractParams(routeEntry.urlPath, req.url);
              req.query = this._parseQuery(req.url);
              return handler(req, res);
            } catch (e) {
              res.status(500).json({ error: e.message });
            }
          });
        }
      }
    }
  }

  /**
   * Mount a page route (page.js exports default component).
   * Uses Luna's res.html() to send the rendered page.
   */
  _mountPageRoute(app, routeEntry) {
    app.get(routeEntry.urlPath, (req, res) => {
      try {
        // Clear require cache in dev mode for HMR-like behavior
        if (this.mode === 'development') {
          this._clearModuleCache(routeEntry.filePath);
          for (const layout of routeEntry.layoutChain) {
            this._clearModuleCache(layout);
          }
        }

        const pageModule = this._loadModule(routeEntry.filePath);
        const pageComponent = pageModule.default || pageModule.page || pageModule;

        // Extract route params
        const params = this._extractParams(routeEntry.urlPath, req.url);
        const query = this._parseQuery(req.url);

        // Render the page component
        let pageHtml = this._renderComponent(pageComponent, { params, query });

        // Wrap in layout chain (outermost first)
        for (let i = routeEntry.layoutChain.length - 1; i >= 0; i--) {
          const layoutModule = this._loadModule(routeEntry.layoutChain[i]);
          const layoutComponent = layoutModule.default || layoutModule.layout || layoutModule;
          pageHtml = this._renderComponent(layoutComponent, { children: pageHtml, params, query });
        }

        // Wrap in HTML shell
        const html = this._wrapInHtmlShell(pageHtml, routeEntry);

        res.html(html);
      } catch (e) {
        this._renderError(res, e, routeEntry);
      }
    });
  }

  /**
   * Render a component (function or class) to HTML string.
   */
  _renderComponent(component, props) {
    if (typeof component === 'function') {
      // If it's a class with render()
      if (component.prototype && typeof component.prototype.render === 'function') {
        const instance = new component(props);
        const vnode = instance.render();
        return this._vnodeToHtml(vnode);
      }
      // Functional component
      const result = component(props);
      if (typeof result === 'string') return result;
      return this._vnodeToHtml(result);
    }

    if (typeof component === 'string') return component;
    if (component && component.tag) return this._vnodeToHtml(component);

    return String(component || '');
  }

  /**
   * Convert a VNode (or html string) to HTML string.
   */
  _vnodeToHtml(vnode) {
    if (!vnode) return '';
    if (typeof vnode === 'string') return vnode;
    if (typeof vnode === 'number') return String(vnode);
    if (Array.isArray(vnode)) return vnode.map(v => this._vnodeToHtml(v)).join('');

    const { tag, props = {}, children = [] } = vnode;
    if (!tag) return '';

    // Void elements
    const voidTags = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);

    let attrs = '';
    for (const [key, val] of Object.entries(props || {})) {
      if (key === 'children' || key === 'key' || key === 'ref') continue;
      if (typeof val === 'function') continue;
      if (val === true) { attrs += ` ${key}`; continue; }
      if (val === false || val == null) continue;
      const attrName = key === 'className' ? 'class' : key === 'htmlFor' ? 'for' : key;
      attrs += ` ${attrName}="${String(val).replace(/"/g, '&quot;')}"`;
    }

    if (voidTags.has(tag)) {
      return `<${tag}${attrs} />`;
    }

    const childHtml = children.map(c => this._vnodeToHtml(c)).join('');
    return `<${tag}${attrs}>${childHtml}</${tag}>`;
  }

  /**
   * Wrap rendered page HTML in a full HTML document shell.
   */
  _wrapInHtmlShell(bodyHtml, routeEntry) {
    const cssLink = this.appRouter.globalsCss
      ? '    <link rel="stylesheet" href="/__luna/globals.css">'
      : '';

    const configPath = path.join(this.cwd, 'luna.json');
    let appName = 'LUNA App';
    try {
      if (fs.existsSync(configPath)) {
        appName = JSON.parse(fs.readFileSync(configPath, 'utf-8')).name || appName;
      }
    } catch {}

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
${cssLink}
</head>
<body>
  <div id="luna-root">${bodyHtml}</div>
  <script>
    // LUNA hydration marker
    window.__LUNA_DATA__ = ${JSON.stringify({
      route: routeEntry.urlPath,
      mode: this.mode
    })};
  </script>
</body>
</html>`;
  }

  /**
   * Render a 404 page.
   */
  _render404(req, res) {
    let html = '<div class="luna-404"><h1>404</h1><p>Page not found</p></div>';

    if (this.appRouter && this.appRouter.rootNotFound) {
      try {
        const mod = this._loadModule(this.appRouter.rootNotFound);
        const comp = mod.default || mod.notFound || mod;
        html = this._renderComponent(comp, { url: req.url });
      } catch {}
    }

    const shell = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 – Not Found</title>
    ${this.appRouter?.globalsCss ? '<link rel="stylesheet" href="/__luna/globals.css">' : ''}
    <style>
      .luna-404 { text-align: center; padding: 4rem 1rem; font-family: system-ui, sans-serif; }
      .luna-404 h1 { font-size: 6rem; margin: 0; color: #333; }
      .luna-404 p { color: #666; font-size: 1.25rem; }
    </style>
</head>
<body>${html}</body>
</html>`;

    res.status(404).html(shell);
  }

  /**
   * Render a 500 error page.
   */
  _renderError(res, error, routeEntry) {
    let html;

    if (this.mode === 'development') {
      html = `<!DOCTYPE html>
<html><head><title>Error</title>
<style>
  body { font-family: monospace; background: #1a1a2e; color: #e94560; padding: 2rem; }
  h1 { color: #e94560; }  
  pre { background: #16213e; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; color: #a8dadc; }
  .route { color: #e94560; font-size: 0.9rem; }
</style>
</head><body>
  <h1>Server Error</h1>
  <p class="route">Route: ${routeEntry?.urlPath || 'unknown'}</p>
  <p>${error.message}</p>
  <pre>${error.stack || ''}</pre>
</body></html>`;
    } else {
      html = `<!DOCTYPE html>
<html><head><title>500 – Server Error</title></head>
<body style="text-align:center;padding:4rem;font-family:system-ui">
  <h1>500</h1><p>Internal Server Error</p>
</body></html>`;
    }

    res.status(500).html(html);
  }

  /**
   * Serve static files from the public/ directory.
   */
  _serveStatic(req, res) {
    const urlPath = req.url.replace('/__luna/static', '');
    const filePath = path.join(this.publicDir, urlPath);
    this._sendFile(res, filePath);
  }

  /**
   * Mount root-level public files (e.g., /favicon.ico).
   */
  _mountPublicFiles(app) {
    try {
      const entries = fs.readdirSync(this.publicDir);
      for (const entry of entries) {
        const fullPath = path.join(this.publicDir, entry);
        if (fs.statSync(fullPath).isFile()) {
          app.get(`/${entry}`, (req, res) => {
            this._sendFile(res, fullPath);
          });
        }
      }
    } catch {}
  }

  /**
   * Send a file response using Luna's response API.
   */
  _sendFile(res, filePath) {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.status(404).send('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const data = fs.readFileSync(filePath);

    res.header('content-type', contentType);
    res.header('content-length', String(data.length));
    if (this.mode === 'development') {
      res.header('cache-control', 'no-cache');
    } else {
      res.header('cache-control', 'public, max-age=31536000');
    }
    res.send(data);
  }

  /**
   * Load a module with require().
   */
  _loadModule(filePath) {
    return require(filePath);
  }

  /**
   * Clear the require cache for HMR-like dev reloading.
   */
  _clearModuleCache(filePath) {
    try {
      const resolved = require.resolve(filePath);
      delete require.cache[resolved];
    } catch {}
  }

  /**
   * Extract route params from a URL path.
   * Pattern: /blog/:slug → URL: /blog/hello → { slug: 'hello' }
   */
  _extractParams(pattern, url) {
    const params = {};
    const urlPath = url.split('?')[0];
    const patternParts = pattern.split('/');
    const urlParts = urlPath.split('/');

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const name = patternParts[i].slice(1);
        params[name] = decodeURIComponent(urlParts[i] || '');
      } else if (patternParts[i] === '*') {
        params['*'] = urlParts.slice(i).map(decodeURIComponent).join('/');
        break;
      }
    }

    return params;
  }

  /**
   * Parse query string from URL.
   */
  _parseQuery(url) {
    const query = {};
    const idx = url.indexOf('?');
    if (idx < 0) return query;

    const qs = url.slice(idx + 1);
    for (const pair of qs.split('&')) {
      const [key, val] = pair.split('=');
      if (key) query[decodeURIComponent(key)] = decodeURIComponent(val || '');
    }
    return query;
  }

  /**
   * Get the discovered route summary for CLI output.
   */
  getRouteSummary() {
    if (!this.appRouter) return [];

    return this.appRouter.getRoutes().map(r => ({
      type: r.type,
      url: r.urlPath,
      file: path.relative(this.cwd, r.filePath).replace(/\\/g, '/'),
      dynamic: r.isDynamic
    }));
  }
}

module.exports = { DevServer, MIME_TYPES };
