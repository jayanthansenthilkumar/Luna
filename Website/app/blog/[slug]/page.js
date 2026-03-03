/**
 * Blog Post  —  app/blog/[slug]/page.js  →  /blog/:slug
 * 
 * Dynamic route — receives params.slug from the URL.
 */
const posts = {
  'getting-started': {
    title: 'Getting Started with LUNA',
    date: '2025-01-15',
    content: 'LUNA is a Universal JavaScript Operating Runtime that lets you write one codebase and run it everywhere — backend, web, mobile, desktop, and edge. To get started, run: luna create my-app && cd my-app && luna dev'
  },
  'file-routing': {
    title: 'File-Based Routing',
    date: '2025-01-20',
    content: 'LUNA uses a file-based routing convention inspired by Next.js. Place page.js files inside the app/ directory and they automatically become routes. Dynamic segments use [brackets], and API routes use route.js files.'
  },
  'server-rendering': {
    title: 'Server-Side Rendering',
    date: '2025-01-25',
    content: 'Every page is server-rendered by default. LUNA\'s SSR engine supports streaming, incremental static regeneration (ISR), and selective hydration for optimal performance.'
  }
};

module.exports = function BlogPostPage({ params }) {
  const post = posts[params.slug];

  if (!post) {
    return {
      tag: 'div',
      props: { className: 'page-section', style: 'text-align:center' },
      children: [
        { tag: 'h1', props: {}, children: ['Post Not Found'] },
        { tag: 'a', props: { href: '/blog', className: 'btn btn-secondary' }, children: ['← Back to Blog'] }
      ]
    };
  }

  return {
    tag: 'article',
    props: { className: 'page-section' },
    children: [
      { tag: 'a', props: { href: '/blog', style: 'display:inline-block;margin-bottom:2rem' }, children: ['← Back to Blog'] },
      { tag: 'h1', props: {}, children: [post.title] },
      { tag: 'p', props: { style: 'color:var(--text-muted);margin-bottom:2rem' }, children: [post.date] },
      { tag: 'p', props: { style: 'font-size:1.1rem;line-height:1.8' }, children: [post.content] }
    ]
  };
};
