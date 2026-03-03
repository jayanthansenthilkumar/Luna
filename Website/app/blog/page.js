/**
 * Blog Index  —  app/blog/page.js  →  /blog
 */
const posts = [
  { slug: 'getting-started', title: 'Getting Started with LUNA', date: 'Jan 15, 2026', excerpt: 'Install LUNA, scaffold your first project, and launch a dev server in under 60 seconds.' },
  { slug: 'file-routing', title: 'File-Based Routing in Depth', date: 'Jan 20, 2026', excerpt: 'How the app/ directory maps to URL routes — pages, layouts, API routes, and dynamic segments.' },
  { slug: 'server-rendering', title: 'Server-Side Rendering & Hydration', date: 'Jan 25, 2026', excerpt: 'Streaming SSR, incremental static regeneration, and five hydration strategies explained.' },
  { slug: 'quantum-state', title: 'Quantum State Rendering Explained', date: 'Feb 1, 2026', excerpt: 'How QSR unifies UI, backend, and edge state into a single live-state graph with instant propagation.' },
  { slug: 'universal-code-continuity', title: 'Universal Code Continuity', date: 'Feb 10, 2026', excerpt: 'Write once, adapt everywhere — platform-adaptive modules with context migration and state portability.' },
  { slug: 'self-evolving-optimizer', title: 'The Self-Evolving Runtime Optimizer', date: 'Feb 18, 2026', excerpt: 'How LUNA observes execution patterns, detects hot paths, and auto-memoizes pure functions at runtime.' }
];

module.exports = function BlogPage() {
  return {
    tag: 'div',
    props: { className: 'page-section' },
    children: [
      { tag: 'h1', props: {}, children: ['Blog'] },
      { tag: 'p', props: {}, children: ['Tutorials, deep dives, and announcements from the LUNA team.'] },
      {
        tag: 'ul',
        props: { className: 'blog-list' },
        children: posts.map(post => ({
          tag: 'li',
          props: { className: 'blog-item' },
          children: [
            { tag: 'div', props: { className: 'blog-date' }, children: [post.date] },
            {
              tag: 'a', props: { href: '/blog/' + post.slug }, children: [
                { tag: 'h3', props: {}, children: [post.title] }
              ]
            },
            { tag: 'p', props: {}, children: [post.excerpt] }
          ]
        }))
      }
    ]
  };
};
