/**
 * LUNA Server-Side Rendering Engine
 * 
 * Provides:
 * - Full SSR (Server-Side Rendering)
 * - SSG (Static Site Generation)
 * - ISR (Incremental Static Regeneration)
 * - Streaming SSR
 * - Edge rendering
 */

'use strict';

const { EventEmitter } = require('events');
const { Readable } = require('stream');

class SSREngine extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      strategy: config.strategy || 'server-first',
      ssr: config.ssr !== false,
      ssg: config.ssg !== false,
      isr: config.isr !== false,
      edgeRendering: config.edgeRendering || false,
      streamingThreshold: config.streamingThreshold || 1024,
      ...config
    };

    this._cache = new Map();
    this._ssgPages = new Map();
    this._isrTimers = new Map();
  }

  /**
   * Render a component to a complete HTML string (traditional SSR).
   */
  async render(component, props = {}, options = {}) {
    const cacheKey = options.cacheKey || null;

    // Check cache
    if (cacheKey && this._cache.has(cacheKey)) {
      const cached = this._cache.get(cacheKey);
      if (!cached.expired) {
        return cached.html;
      }
    }

    const renderContext = new SSRContext(props, options);

    let html;
    if (typeof component === 'function') {
      if (component.prototype && component.prototype.render) {
        const instance = new component(props);
        if (instance.beforeRender) await instance.beforeRender();
        const vnode = instance.render();
        html = vnode ? vnode.toHTML() : '';
      } else {
        const vnode = component(props);
        html = vnode ? vnode.toHTML() : '';
      }
    } else if (component && typeof component.toHTML === 'function') {
      html = component.toHTML();
    } else {
      html = String(component || '');
    }

    // Add hydration markers
    if (options.hydrate !== false) {
      html = this._addHydrationMarkers(html, props, renderContext);
    }

    // Cache the result
    if (cacheKey) {
      this._cache.set(cacheKey, {
        html,
        timestamp: Date.now(),
        ttl: options.cacheTTL || 0,
        get expired() {
          return this.ttl > 0 && (Date.now() - this.timestamp) > this.ttl;
        }
      });
    }

    return html;
  }

  /**
   * Render as a stream (Streaming SSR).
   */
  renderStream(component, props = {}, options = {}) {
    const self = this;

    return new Readable({
      async read() {
        try {
          // Shell (opening HTML)
          this.push(self._renderShellStart(options));

          // Main content
          const html = await self.render(component, props, { ...options, hydrate: true });
          this.push(html);

          // Closing HTML + hydration script
          this.push(self._renderShellEnd(props, options));
          this.push(null); // End stream
        } catch (error) {
          this.destroy(error);
        }
      }
    });
  }

  /**
   * Generate a static page (SSG).
   */
  async generateStatic(path, component, props = {}, options = {}) {
    const html = await this.render(component, props, options);
    const fullPage = this._wrapInDocument(html, props, options);

    this._ssgPages.set(path, {
      html: fullPage,
      generatedAt: Date.now(),
      props,
      options
    });

    return fullPage;
  }

  /**
   * Generate static pages for multiple paths.
   */
  async generateStaticBatch(pages) {
    const results = {};
    for (const { path, component, props, options } of pages) {
      results[path] = await this.generateStatic(path, component, props, options);
    }
    return results;
  }

  /**
   * Setup ISR (Incremental Static Regeneration) for a path.
   */
  setupISR(path, component, getProps, options = {}) {
    const revalidateSeconds = options.revalidate || 60;

    // Initial generation
    const generate = async () => {
      const props = typeof getProps === 'function' ? await getProps() : getProps;
      await this.generateStatic(path, component, props, options);
      this.emit('isr:revalidated', { path, timestamp: Date.now() });
    };

    generate();

    // Setup revalidation timer
    const timer = setInterval(generate, revalidateSeconds * 1000);
    if (timer.unref) timer.unref();
    this._isrTimers.set(path, timer);

    return {
      revalidate: () => generate(),
      stop: () => {
        clearInterval(this._isrTimers.get(path));
        this._isrTimers.delete(path);
      }
    };
  }

  /**
   * Get a pre-generated static page.
   */
  getStaticPage(path) {
    return this._ssgPages.get(path)?.html || null;
  }

  /**
   * Add hydration markers for client-side rehydration.
   */
  _addHydrationMarkers(html, props, context) {
    const stateScript = `<script type="application/luna-state">${JSON.stringify(props)}</script>`;
    return `<!--luna-ssr-start-->${html}<!--luna-ssr-end-->${stateScript}`;
  }

  /**
   * Render the start of the HTML shell (for streaming).
   */
  _renderShellStart(options = {}) {
    const title = options.title || 'LUNA App';
    const styles = (options.styles || []).map(s => `<link rel="stylesheet" href="${s}">`).join('\n');
    const head = options.head || '';

    return `<!DOCTYPE html>
<html lang="${options.lang || 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${styles}
    ${head}
</head>
<body>
    <div id="luna-app">`;
  }

  /**
   * Render the end of the HTML shell (for streaming).
   */
  _renderShellEnd(props = {}, options = {}) {
    const scripts = (options.scripts || []).map(s => `<script src="${s}" defer></script>`).join('\n');

    return `</div>
    <script>window.__LUNA_STATE__ = ${JSON.stringify(props)};</script>
    <script>window.__LUNA_HYDRATE__ = true;</script>
    ${scripts}
</body>
</html>`;
  }

  /**
   * Wrap HTML in a full document.
   */
  _wrapInDocument(html, props = {}, options = {}) {
    return this._renderShellStart(options) + html + this._renderShellEnd(props, options);
  }

  /**
   * Clear the SSR cache.
   */
  clearCache(pattern = null) {
    if (!pattern) {
      this._cache.clear();
    } else {
      for (const key of this._cache.keys()) {
        if (key.includes(pattern)) {
          this._cache.delete(key);
        }
      }
    }
  }

  /**
   * Stop all ISR timers.
   */
  stopAllISR() {
    for (const timer of this._isrTimers.values()) {
      clearInterval(timer);
    }
    this._isrTimers.clear();
  }

  /**
   * Get render metrics.
   */
  getMetrics() {
    return {
      cachedPages: this._cache.size,
      staticPages: this._ssgPages.size,
      isrPaths: this._isrTimers.size
    };
  }
}

/**
 * SSR render context – holds metadata during rendering.
 */
class SSRContext {
  constructor(props = {}, options = {}) {
    this.props = props;
    this.options = options;
    this.headTags = [];
    this.scripts = [];
    this.styles = [];
    this.meta = {};
  }

  addHeadTag(tag) {
    this.headTags.push(tag);
  }

  addScript(src, attrs = {}) {
    this.scripts.push({ src, ...attrs });
  }

  addStyle(href) {
    this.styles.push(href);
  }

  setMeta(name, content) {
    this.meta[name] = content;
  }
}

module.exports = { SSREngine, SSRContext };
