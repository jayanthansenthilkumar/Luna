/**
 * Home Page  —  app/page.js  →  /
 */
module.exports = function HomePage() {
  return {
    tag: 'div',
    props: { className: 'page home' },
    children: [
      {
        tag: 'section',
        props: { className: 'hero' },
        children: [
          { tag: 'h1', props: {}, children: ['Welcome to luna_site'] },
          { tag: 'p', props: { className: 'subtitle' }, children: ['One Language. One Runtime. Every Platform.'] },
          {
            tag: 'div',
            props: { className: 'hero-actions' },
            children: [
              { tag: 'a', props: { href: '/about', className: 'btn btn-primary' }, children: ['Get Started'] },
              { tag: 'a', props: { href: '/blog', className: 'btn btn-secondary' }, children: ['Read Blog'] }
            ]
          }
        ]
      },
      {
        tag: 'section',
        props: { className: 'features' },
        children: [
          {
            tag: 'div',
            props: { className: 'feature-card' },
            children: [
              { tag: 'h3', props: {}, children: ['⚡ Fast'] },
              { tag: 'p', props: {}, children: ['Zero-dependency runtime with file-based routing.'] }
            ]
          },
          {
            tag: 'div',
            props: { className: 'feature-card' },
            children: [
              { tag: 'h3', props: {}, children: ['🌍 Universal'] },
              { tag: 'p', props: {}, children: ['One codebase for backend, web, mobile, desktop, and edge.'] }
            ]
          },
          {
            tag: 'div',
            props: { className: 'feature-card' },
            children: [
              { tag: 'h3', props: {}, children: ['🔒 Secure'] },
              { tag: 'p', props: {}, children: ['Sandboxed execution with granular permissions.'] }
            ]
          }
        ]
      }
    ]
  };
};
