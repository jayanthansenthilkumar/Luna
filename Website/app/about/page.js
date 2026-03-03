/**
 * About Page  —  app/about/page.js  →  /about
 */
module.exports = function AboutPage() {
  return {
    tag: 'div',
    props: { className: 'page-section' },
    children: [
      { tag: 'h1', props: {}, children: ['About'] },
      { tag: 'p', props: {}, children: [
        'This application is built with LUNA — the Universal JavaScript Operating Runtime.'
      ]},
      { tag: 'h2', props: {}, children: ['Why LUNA?'] },
      { tag: 'p', props: {}, children: [
        'LUNA runs one codebase across backend, web, mobile, desktop, and edge platforms with zero external dependencies.'
      ]},
      { tag: 'h2', props: {}, children: ['Features'] },
      {
        tag: 'ul',
        props: { style: 'list-style:none;display:flex;flex-direction:column;gap:0.5rem' },
        children: [
          { tag: 'li', props: {}, children: ['⚡ File-based routing (Next.js-style app/ directory)'] },
          { tag: 'li', props: {}, children: ['🌊 Server-side rendering with streaming'] },
          { tag: 'li', props: {}, children: ['📦 Built-in package manager (luna fetch)'] },
          { tag: 'li', props: {}, children: ['🔒 Sandboxed execution engine'] },
          { tag: 'li', props: {}, children: ['🌍 Universal Code Continuity across platforms'] }
        ]
      }
    ]
  };
};
