/**
 * LUNA UI Rendering Engine
 * 
 * Component-based architecture with:
 * - Virtual DOM
 * - Component lifecycle
 * - Template compilation
 * - Server-first rendering
 * - Client reactivity layer
 * - Hybrid execution model
 */

'use strict';

const { EventEmitter } = require('events');

/**
 * Virtual DOM Node.
 */
class VNode {
  constructor(tag, props, children) {
    this.tag = tag;
    this.props = props || {};
    this.children = children || [];
    this.key = this.props.key || null;
    this.ref = null;
    this.component = null;
  }

  /**
   * Render to HTML string (for SSR).
   */
  toHTML() {
    if (typeof this.tag === 'function') {
      // Component node
      const instance = new this.tag(this.props);
      const vnode = instance.render();
      return vnode ? vnode.toHTML() : '';
    }

    if (this.tag === 'TEXT') {
      return escapeHTML(String(this.children));
    }

    if (this.tag === 'RAW') {
      return String(this.children);
    }

    const attrs = this._renderAttrs();
    const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];

    if (selfClosing.includes(this.tag)) {
      return `<${this.tag}${attrs} />`;
    }

    const childrenHTML = this.children
      .map(child => {
        if (child instanceof VNode) return child.toHTML();
        if (child === null || child === undefined || child === false) return '';
        return escapeHTML(String(child));
      })
      .join('');

    return `<${this.tag}${attrs}>${childrenHTML}</${this.tag}>`;
  }

  _renderAttrs() {
    let result = '';
    for (const [key, value] of Object.entries(this.props)) {
      if (key === 'key' || key === 'ref' || key === 'children') continue;
      if (key.startsWith('on')) continue; // Event handlers not rendered in HTML
      if (value === true) {
        result += ` ${key}`;
      } else if (value !== false && value !== null && value !== undefined) {
        if (key === 'style' && typeof value === 'object') {
          const styleStr = Object.entries(value)
            .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
            .join('; ');
          result += ` style="${escapeAttr(styleStr)}"`;
        } else if (key === 'className') {
          result += ` class="${escapeAttr(String(value))}"`;
        } else {
          result += ` ${key}="${escapeAttr(String(value))}"`;
        }
      }
    }
    return result;
  }
}

/**
 * Create a VNode (JSX-like factory function).
 */
function h(tag, props, ...children) {
  const flatChildren = children
    .flat(Infinity)
    .map(child => {
      if (child instanceof VNode) return child;
      if (child === null || child === undefined || child === false) return null;
      return new VNode('TEXT', {}, String(child));
    })
    .filter(Boolean);

  return new VNode(tag, props || {}, flatChildren);
}

/**
 * Create a text VNode.
 */
function text(content) {
  return new VNode('TEXT', {}, content);
}

/**
 * Create a raw HTML VNode (no escaping).
 */
function raw(html) {
  return new VNode('RAW', {}, html);
}

/**
 * Base Component class.
 */
class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this._vnode = null;
    this._mounted = false;
    this._eventEmitter = new EventEmitter();
  }

  /**
   * Set component state and trigger re-render.
   */
  setState(updater) {
    const newState = typeof updater === 'function'
      ? updater(this.state)
      : updater;

    this.state = { ...this.state, ...newState };
    this._eventEmitter.emit('stateChange', this.state);

    if (this._mounted) {
      this._rerender();
    }
  }

  /**
   * Lifecycle: called before rendering.
   */
  beforeRender() {}

  /**
   * Lifecycle: called after mounting to DOM.
   */
  onMount() {}

  /**
   * Lifecycle: called when props or state change.
   */
  onUpdate(prevProps, prevState) {}

  /**
   * Lifecycle: called before unmounting.
   */
  onUnmount() {}

  /**
   * Lifecycle: error boundary.
   */
  onError(error) {
    console.error(`[LUNA Component Error] ${this.constructor.name}:`, error);
  }

  /**
   * Render the component – must return a VNode.
   */
  render() {
    throw new Error(`Component ${this.constructor.name} must implement render()`);
  }

  /**
   * Trigger a re-render.
   */
  _rerender() {
    try {
      this.beforeRender();
      this._vnode = this.render();
      this._eventEmitter.emit('render', this._vnode);
    } catch (error) {
      this.onError(error);
    }
  }
}

/**
 * Functional component wrapper.
 */
function defineComponent(renderFn, options = {}) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = options.state ? options.state() : {};
    }

    render() {
      return renderFn(this.props, this.state, {
        setState: (u) => this.setState(u),
        emit: (event, data) => this._eventEmitter.emit(event, data)
      });
    }
  };
}

/**
 * Virtual DOM differ.
 */
class VDOMDiffer {
  /**
   * Compute the diff between two VNode trees.
   */
  static diff(oldNode, newNode) {
    const patches = [];
    VDOMDiffer._diffNode(oldNode, newNode, [], patches);
    return patches;
  }

  static _diffNode(oldNode, newNode, path, patches) {
    if (!oldNode && !newNode) return;

    if (!oldNode) {
      patches.push({ type: 'INSERT', path: [...path], node: newNode });
      return;
    }

    if (!newNode) {
      patches.push({ type: 'REMOVE', path: [...path] });
      return;
    }

    if (oldNode.tag !== newNode.tag) {
      patches.push({ type: 'REPLACE', path: [...path], node: newNode });
      return;
    }

    // Compare props
    const propPatches = VDOMDiffer._diffProps(oldNode.props, newNode.props);
    if (propPatches.length > 0) {
      patches.push({ type: 'PROPS', path: [...path], changes: propPatches });
    }

    // Compare children
    const oldChildren = Array.isArray(oldNode.children) ? oldNode.children : [];
    const newChildren = Array.isArray(newNode.children) ? newNode.children : [];

    // Handle text content change
    if (!Array.isArray(oldNode.children) || !Array.isArray(newNode.children)) {
      if (oldNode.children !== newNode.children) {
        patches.push({ type: 'REPLACE', path: [...path], node: newNode });
      }
      return;
    }

    const maxLen = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < maxLen; i++) {
      VDOMDiffer._diffNode(
        oldChildren[i],
        newChildren[i],
        [...path, i],
        patches
      );
    }
  }

  static _diffProps(oldProps, newProps) {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldProps || {}), ...Object.keys(newProps || {})]);

    for (const key of allKeys) {
      if (key === 'key' || key === 'children') continue;
      const oldVal = (oldProps || {})[key];
      const newVal = (newProps || {})[key];
      if (oldVal !== newVal) {
        changes.push({ key, oldValue: oldVal, newValue: newVal });
      }
    }

    return changes;
  }
}

/**
 * Component Registry.
 */
class ComponentRegistry {
  constructor() {
    this.components = new Map();
  }

  register(name, component) {
    this.components.set(name, component);
    return this;
  }

  get(name) {
    return this.components.get(name);
  }

  has(name) {
    return this.components.has(name);
  }

  getAll() {
    return Object.fromEntries(this.components);
  }
}

/**
 * Main UI Engine.
 */
class UIEngine extends EventEmitter {
  constructor(config = {}) {
    super();
    this.state = config.state || null;
    this.router = config.router || null;
    this.ssr = config.ssr || null;
    this.hydration = config.hydration || null;
    this.renderConfig = config.config || {};
    this.registry = new ComponentRegistry();
    this.layout = null;
  }

  /**
   * Register a component.
   */
  registerComponent(name, component) {
    this.registry.register(name, component);
    return this;
  }

  /**
   * Set the application layout wrapper.
   */
  setLayout(layoutComponent) {
    this.layout = layoutComponent;
    return this;
  }

  /**
   * Render a component to HTML string.
   */
  renderToString(component, props = {}) {
    let vnode;
    if (typeof component === 'function') {
      if (component.prototype instanceof Component) {
        const instance = new component(props);
        vnode = instance.render();
      } else {
        vnode = component(props);
      }
    } else if (component instanceof VNode) {
      vnode = component;
    } else {
      throw new Error('Invalid component');
    }

    return vnode ? vnode.toHTML() : '';
  }

  /**
   * Render a full page with layout.
   */
  renderPage(pageComponent, props = {}, options = {}) {
    const pageHTML = this.renderToString(pageComponent, props);
    const title = options.title || 'LUNA App';
    const head = options.head || '';
    const scripts = options.scripts || [];
    const styles = options.styles || [];

    const styleLinks = styles.map(s => `<link rel="stylesheet" href="${s}">`).join('\n    ');
    const scriptTags = scripts.map(s => `<script src="${s}" defer></script>`).join('\n    ');

    return `<!DOCTYPE html>
<html lang="${options.lang || 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(title)}</title>
    ${styleLinks}
    ${head}
</head>
<body>
    <div id="luna-app">${pageHTML}</div>
    <script>window.__LUNA_STATE__ = ${JSON.stringify(props)};</script>
    ${scriptTags}
</body>
</html>`;
  }
}

// ─── Utility Functions ──────────────────────────────────────────

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function camelToKebab(str) {
  return str.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
}

module.exports = {
  UIEngine,
  Component,
  VNode,
  VDOMDiffer,
  ComponentRegistry,
  defineComponent,
  h,
  text,
  raw,
  escapeHTML
};
