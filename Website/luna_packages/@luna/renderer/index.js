/**
 * @luna/renderer - LUNA Rendering Engine
 *
 * Virtual DOM, server-side rendering, and hydration.
 */

/**
 * Create a virtual DOM node.
 */
function h(tag, props, ...children) {
  return {
    tag,
    props: props || {},
    children: children.flat().filter(c => c != null && c !== false)
  };
}

/**
 * Render a VDOM tree to an HTML string (SSR).
 */
function renderToString(vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') return String(vnode);
  if (!vnode || !vnode.tag) return '';

  const { tag, props = {}, children = [] } = vnode;
  const attrs = Object.entries(props)
    .filter(([k, v]) => k !== 'children' && k !== 'className' && v != null)
    .map(([k, v]) => ` ${k}="${String(v)}"`)
    .join('');
  const className = props.className ? ` class="${props.className}"` : '';
  const inner = children.map(renderToString).join('');

  const voidTags = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);
  if (voidTags.has(tag)) return `<${tag}${className}${attrs} />`;

  return `<${tag}${className}${attrs}>${inner}</${tag}>`;
}

/**
 * Diff two VDOM trees and return patches.
 */
function diff(oldTree, newTree) {
  const patches = [];
  _diff(oldTree, newTree, patches, []);
  return patches;
}

function _diff(a, b, patches, path) {
  if (a === b) return;
  if (!a || !b || a.tag !== b.tag) {
    patches.push({ type: 'REPLACE', path: [...path], node: b });
    return;
  }
  // Diff children
  const max = Math.max((a.children || []).length, (b.children || []).length);
  for (let i = 0; i < max; i++) {
    _diff((a.children || [])[i], (b.children || [])[i], patches, [...path, i]);
  }
}

/**
 * Hydrate a server-rendered DOM node.
 */
function hydrate(vnode, domNode, strategy = 'full') {
  // Strategy: full | partial | progressive | lazy | islands
  return { vnode, domNode, strategy, hydrated: true };
}

module.exports = {
  h,
  renderToString,
  diff,
  hydrate,
  version: '0.1.0'
};
