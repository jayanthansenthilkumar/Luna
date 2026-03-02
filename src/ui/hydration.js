/**
 * LUNA Hydration Engine
 * 
 * Manages the process of attaching client-side interactivity
 * to server-rendered HTML:
 * - Full hydration
 * - Partial/selective hydration
 * - Progressive hydration
 * - Lazy hydration (on interaction, on visible, on idle)
 * - Island architecture support
 */

'use strict';

const { EventEmitter } = require('events');

/**
 * Hydration strategies.
 */
const STRATEGY = {
  FULL: 'full',           // Hydrate everything immediately
  PARTIAL: 'partial',     // Hydrate only interactive components
  PROGRESSIVE: 'progressive', // Hydrate in priority order
  LAZY: 'lazy',           // Hydrate on demand
  ISLAND: 'island'        // Independent island components
};

/**
 * Hydration triggers for lazy hydration.
 */
const TRIGGER = {
  LOAD: 'load',           // On page load
  IDLE: 'idle',           // When browser is idle
  VISIBLE: 'visible',     // When element enters viewport
  INTERACTION: 'interaction', // On first user interaction
  MEDIA: 'media',         // When media query matches
  NEVER: 'never'          // Server-only, never hydrate
};

/**
 * Represents a hydration target (a component to be hydrated).
 */
class HydrationTarget {
  constructor(id, component, props = {}, options = {}) {
    this.id = id;
    this.component = component;
    this.props = props;
    this.strategy = options.strategy || STRATEGY.FULL;
    this.trigger = options.trigger || TRIGGER.LOAD;
    this.priority = options.priority || 5; // 1 = highest, 10 = lowest
    this.hydrated = false;
    this.hydratedAt = null;
    this.element = null; // DOM reference (client-side)
  }

  /**
   * Mark as hydrated.
   */
  markHydrated() {
    this.hydrated = true;
    this.hydratedAt = Date.now();
  }
}

/**
 * Main Hydration Engine.
 */
class HydrationEngine extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      strategy: config.hydration || STRATEGY.FULL,
      ...config
    };
    this.targets = new Map();
    this._hydrationQueue = [];
    this._metrics = {
      totalTargets: 0,
      hydratedCount: 0,
      totalHydrationTime: 0,
      averageHydrationTime: 0
    };
  }

  /**
   * Register a component for hydration.
   */
  register(id, component, props = {}, options = {}) {
    const target = new HydrationTarget(id, component, props, {
      strategy: options.strategy || this.config.strategy,
      ...options
    });
    this.targets.set(id, target);
    this._metrics.totalTargets++;
    return target;
  }

  /**
   * Generate hydration markers for SSR output.
   */
  generateMarkers() {
    const markers = [];
    for (const [id, target] of this.targets) {
      markers.push({
        id,
        strategy: target.strategy,
        trigger: target.trigger,
        priority: target.priority,
        propsHash: this._hashProps(target.props)
      });
    }
    return markers;
  }

  /**
   * Generate the client-side hydration script.
   */
  generateHydrationScript() {
    const targets = [];
    for (const [id, target] of this.targets) {
      targets.push({
        id,
        strategy: target.strategy,
        trigger: target.trigger,
        priority: target.priority,
        props: target.props
      });
    }

    return `
<script type="module">
(function() {
  'use strict';
  
  const targets = ${JSON.stringify(targets)};
  const hydrated = new Set();
  
  // Hydration executor
  function hydrate(target) {
    if (hydrated.has(target.id)) return;
    const el = document.querySelector('[data-luna-id="' + target.id + '"]');
    if (!el) return;
    
    hydrated.add(target.id);
    el.setAttribute('data-luna-hydrated', 'true');
    
    // Dispatch hydration event
    el.dispatchEvent(new CustomEvent('luna:hydrated', { detail: target }));
    window.dispatchEvent(new CustomEvent('luna:component-hydrated', { detail: target }));
  }
  
  // Strategy handlers
  function hydrateOnLoad(targets) {
    targets.forEach(t => hydrate(t));
  }
  
  function hydrateOnIdle(targets) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => targets.forEach(t => hydrate(t)));
    } else {
      setTimeout(() => targets.forEach(t => hydrate(t)), 200);
    }
  }
  
  function hydrateOnVisible(targets) {
    if (!('IntersectionObserver' in window)) {
      return hydrateOnLoad(targets);
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-luna-id');
          const target = targets.find(t => t.id === id);
          if (target) {
            hydrate(target);
            observer.unobserve(entry.target);
          }
        }
      });
    });
    targets.forEach(t => {
      const el = document.querySelector('[data-luna-id="' + t.id + '"]');
      if (el) observer.observe(el);
    });
  }
  
  function hydrateOnInteraction(targets) {
    const events = ['click', 'focus', 'touchstart', 'mouseover'];
    targets.forEach(t => {
      const el = document.querySelector('[data-luna-id="' + t.id + '"]');
      if (!el) return;
      const handler = () => {
        hydrate(t);
        events.forEach(evt => el.removeEventListener(evt, handler));
      };
      events.forEach(evt => el.addEventListener(evt, handler, { once: true, passive: true }));
    });
  }
  
  // Sort by priority and group by trigger
  targets.sort((a, b) => a.priority - b.priority);
  
  const grouped = {};
  targets.forEach(t => {
    if (!grouped[t.trigger]) grouped[t.trigger] = [];
    grouped[t.trigger].push(t);
  });
  
  // Execute hydration strategies
  if (grouped.load) hydrateOnLoad(grouped.load);
  if (grouped.idle) hydrateOnIdle(grouped.idle);
  if (grouped.visible) hydrateOnVisible(grouped.visible);
  if (grouped.interaction) hydrateOnInteraction(grouped.interaction);
  
  // Notify completion
  window.addEventListener('load', () => {
    window.dispatchEvent(new CustomEvent('luna:hydration-complete', {
      detail: { total: targets.length, hydrated: hydrated.size }
    }));
  });
})();
</script>`;
  }

  /**
   * Server-side: wrap component HTML with hydration markers.
   */
  wrapForHydration(id, html, options = {}) {
    const target = this.targets.get(id);
    const attrs = [
      `data-luna-id="${id}"`,
      `data-luna-strategy="${target?.strategy || 'full'}"`,
      `data-luna-trigger="${target?.trigger || 'load'}"`
    ];

    if (options.island) {
      attrs.push('data-luna-island="true"');
    }

    return `<div ${attrs.join(' ')}>${html}</div>`;
  }

  /**
   * Simulate hydration on server (for testing/metrics).
   */
  async simulateHydration(targetId) {
    const target = this.targets.get(targetId);
    if (!target || target.hydrated) return;

    const startTime = Date.now();
    target.markHydrated();
    const duration = Date.now() - startTime;

    this._metrics.hydratedCount++;
    this._metrics.totalHydrationTime += duration;
    this._metrics.averageHydrationTime =
      this._metrics.totalHydrationTime / this._metrics.hydratedCount;

    this.emit('hydrated', { id: targetId, duration });
  }

  /**
   * Get hydration metrics.
   */
  getMetrics() {
    return {
      ...this._metrics,
      pendingCount: this._metrics.totalTargets - this._metrics.hydratedCount
    };
  }

  /**
   * Hash props for comparison.
   */
  _hashProps(props) {
    const str = JSON.stringify(props);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString(36);
  }

  /**
   * Reset the hydration engine.
   */
  reset() {
    this.targets.clear();
    this._hydrationQueue = [];
    this._metrics = {
      totalTargets: 0,
      hydratedCount: 0,
      totalHydrationTime: 0,
      averageHydrationTime: 0
    };
  }
}

module.exports = {
  HydrationEngine,
  HydrationTarget,
  STRATEGY,
  TRIGGER
};
