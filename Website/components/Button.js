/**
 * Reusable Button Component
 * 
 * Usage:
 *   const Button = require('../components/Button');
 *   Button({ href: '/about', variant: 'primary', children: 'Click Me' })
 */
module.exports = function Button({ href, variant = 'primary', children, onClick }) {
  return {
    tag: href ? 'a' : 'button',
    props: {
      href: href || undefined,
      className: 'btn btn-' + variant,
      onClick: onClick || undefined
    },
    children: Array.isArray(children) ? children : [children || '']
  };
};
