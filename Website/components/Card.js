/**
 * Reusable Card Component
 */
module.exports = function Card({ title, children, className }) {
  return {
    tag: 'div',
    props: { className: 'feature-card ' + (className || '') },
    children: [
      title ? { tag: 'h3', props: {}, children: [title] } : null,
      ...(Array.isArray(children) ? children : [children || ''])
    ].filter(Boolean)
  };
};
