/**
 * Blog Index  —  app/blog/page.js  →  /blog
 */
const posts = [
  { slug: 'getting-started', title: 'Getting Started with LUNA', excerpt: 'Learn how to build your first LUNA application.' },
  { slug: 'file-routing', title: 'File-Based Routing', excerpt: 'How the app/ directory maps to URL routes.' },
  { slug: 'server-rendering', title: 'Server-Side Rendering', excerpt: 'Render pages on the server for blazing fast loads.' }
];

module.exports = function BlogPage() {
  return {
    tag: 'div',
    props: { className: 'page-section' },
    children: [
      { tag: 'h1', props: {}, children: ['Blog'] },
      { tag: 'p', props: {}, children: ['Latest posts and tutorials.'] },
      {
        tag: 'ul',
        props: { className: 'blog-list' },
        children: posts.map(post => ({
          tag: 'li',
          props: { className: 'blog-item' },
          children: [
            { tag: 'a', props: { href: '/blog/' + post.slug }, children: [
              { tag: 'h3', props: {}, children: [post.title] }
            ]},
            { tag: 'p', props: {}, children: [post.excerpt] }
          ]
        }))
      }
    ]
  };
};
