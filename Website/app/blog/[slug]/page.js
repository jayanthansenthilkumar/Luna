/**
 * Blog Post  —  app/blog/[slug]/page.js  →  /blog/:slug
 * 
 * Dynamic route — receives params.slug from the URL.
 */
const posts = {
  'getting-started': {
    title: 'Getting Started with LUNA',
    date: 'January 15, 2026',
    content: [
      'LUNA is a Universal JavaScript Operating Runtime that lets you write one codebase and run it everywhere — backend, web, mobile, desktop, and edge.',
      'Getting started is straightforward. First, install LUNA globally:',
      '  npm i -g @luna/runtime',
      'Then scaffold a new project:',
      '  luna create my-app\n  cd my-app\n  luna dev',
      'This creates a project with file-based routing (an app/ directory), a development server with HMR, and everything configured out of the box. No additional packages to install — LUNA has zero dependencies.',
      'Your project structure follows a convention-over-configuration approach. Place page.js files inside app/ and they become routes. Add route.js for API endpoints. Use [brackets] for dynamic segments. It\'s intuitive and powerful.',
      'From here, explore the documentation to learn about LUNA\'s routing system, SSR capabilities, reactive state management, and multi-platform deployment.'
    ]
  },
  'file-routing': {
    title: 'File-Based Routing in Depth',
    date: 'January 20, 2026',
    content: [
      'LUNA uses a file-based routing convention inspired by Next.js. The app/ directory is the root of your route tree, and file placement directly determines URL structure.',
      'Key conventions:',
      '• page.js — Defines a page route (e.g., app/about/page.js → /about)',
      '• route.js — Defines an API route (e.g., app/api/hello/route.js → /api/hello)',
      '• layout.js — Wraps child routes in shared UI (navbar, footer)',
      '• loading.js — Loading state while content streams in',
      '• error.js — Error boundary for the route segment',
      '• not-found.js — Custom 404 page',
      'Dynamic segments use bracket syntax: app/blog/[slug]/page.js matches /blog/anything and passes params.slug to the component.',
      'API routes export named functions for HTTP methods: module.exports.GET, module.exports.POST, etc. Each receives (req, res) with full access to LUNA\'s request/response abstractions.',
      'Layouts cascade — a root layout.js wraps every page, while nested layouts only wrap their children. This gives you shared UI (like navigation) without repetition.',
      'The router uses a radix-tree implementation internally for O(log n) matching performance, supporting params, wildcards, and route groups.'
    ]
  },
  'server-rendering': {
    title: 'Server-Side Rendering & Hydration',
    date: 'January 25, 2026',
    content: [
      'Every page in LUNA is server-rendered by default. The SSR engine supports multiple strategies that you can configure per-route or globally.',
      'Rendering strategies:',
      '• SSR (Server-Side Rendering) — Pages rendered on each request with full data',
      '• SSG (Static Site Generation) — Pages pre-rendered at build time',
      '• ISR (Incremental Static Regeneration) — Static pages that revalidate in the background',
      'LUNA\'s SSR engine streams HTML to the client using chunked transfer encoding, meaning users see content before the entire page has finished rendering.',
      'For hydration, LUNA offers five strategies:',
      '• Full — Hydrate the entire page at once',
      '• Partial — Only hydrate interactive components',
      '• Progressive — Hydrate above-the-fold first, then the rest',
      '• Lazy — Hydrate on user interaction (click, scroll, hover)',
      '• Islands — Independent interactive islands in a static page',
      'The default configuration uses server-first rendering with incremental hydration — giving you the best balance of performance and interactivity. You can override this per-page in luna.config.js.'
    ]
  },
  'quantum-state': {
    title: 'Quantum State Rendering Explained',
    date: 'February 1, 2026',
    content: [
      'Quantum State Rendering (QSR) is one of LUNA\'s most innovative features. It creates a unified live-state graph where UI state, backend state, and edge state exist in a shared "superposition."',
      'In traditional architectures, you manage state separately for each platform — React state for the frontend, database models for the backend, cache entries for the edge. QSR collapses all three into a single state node.',
      'When you update state via app.qsr.set("user", { name: "Luna" }), that change propagates instantly to every connected client and platform. No manual WebSocket wiring, no polling, no eventual consistency — it\'s immediate.',
      'Under the hood, QSR uses a CRDT (Conflict-free Replicated Data Type) approach for multi-writer scenarios. When two clients update the same state simultaneously, QSR resolves conflicts automatically using last-writer-wins with vector clocks.',
      'Subscriptions are lightweight: app.qsr.subscribe("user", callback) registers a listener that fires whenever the "user" state changes, regardless of where the change originated.',
      'QSR integrates naturally with LUNA\'s reactive state system (Signals and Computed), so UI components re-render automatically when quantum state changes.'
    ]
  },
  'universal-code-continuity': {
    title: 'Universal Code Continuity',
    date: 'February 10, 2026',
    content: [
      'Universal Code Continuity (UCC) is LUNA\'s approach to the "write once, run everywhere" problem. Instead of lowest-common-denominator abstractions, UCC lets you define platform-adaptive modules that automatically use the right implementation.',
      'Here\'s the core concept: you define a universal interface, then provide platform-specific implementations:',
      '  app.ucc.module("storage")\n    .define({ save: (data) => data })\n    .platform("backend", { save: (data) => fs.writeFileSync(path, data) })\n    .platform("web", { save: (data) => localStorage.setItem(key, data) })\n    .platform("mobile", { save: (data) => AsyncStorage.setItem(key, data) })',
      'When your code calls storage.save(data), UCC automatically dispatches to the correct platform implementation. On the server it writes to the filesystem; in the browser it uses localStorage; on mobile it uses AsyncStorage.',
      'Context migration is another powerful UCC feature. When a user transitions from one platform to another (say, from mobile to desktop), UCC can migrate execution context and state automatically.',
      'State portability means serializable state travels with the user. A shopping cart started on mobile seamlessly appears on desktop — same data, same position in the workflow, zero additional code.'
    ]
  },
  'self-evolving-optimizer': {
    title: 'The Self-Evolving Runtime Optimizer',
    date: 'February 18, 2026',
    content: [
      'LUNA\'s Self-Evolving Optimizer is a runtime system that makes your application faster the longer it runs. It observes execution patterns and automatically applies optimizations.',
      'The optimizer tracks several metrics for each observed function:',
      '• Call frequency — How often the function is called',
      '• Execution time — Average, p50, p95, p99 latencies',
      '• Input patterns — Whether inputs tend to repeat',
      '• Purity — Whether the function has side effects',
      'When a function crosses the hot-path threshold (configurable, default 100 calls), the optimizer kicks in:',
      '• Pure functions with repeating inputs get auto-memoized',
      '• Hot functions get promoted to higher scheduler priority',
      '• Execution patterns inform the scheduler\'s thread allocation',
      'To observe a function: const optimized = app.optimizer.observe("myFn", (x) => x * x);',
      'The optimizer also provides insights via app.optimizer.getMetrics("myFn") — useful for debugging performance issues and understanding your application\'s runtime behavior.',
      'All optimizations are non-invasive. If a memoized function starts receiving new unique inputs, the cache adapts. If execution patterns change, the scheduler rebalances. The system is self-correcting.'
    ]
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
        { tag: 'p', props: { style: 'color:var(--text-muted);margin-bottom:2rem' }, children: ['This blog post doesn\'t exist or has been moved.'] },
        { tag: 'a', props: { href: '/blog', className: 'btn btn-secondary' }, children: ['← Back to Blog'] }
      ]
    };
  }

  return {
    tag: 'article',
    props: { className: 'page-section' },
    children: [
      { tag: 'a', props: { href: '/blog', style: 'display:inline-block;margin-bottom:2rem;color:var(--text-muted)' }, children: ['← Back to Blog'] },
      { tag: 'h1', props: {}, children: [post.title] },
      { tag: 'p', props: { style: 'color:var(--text-dim);margin-bottom:2.5rem;font-size:0.9rem' }, children: [post.date] },
      ...post.content.map(paragraph => {
        // Detect code-like lines (starting with spaces/indent)
        if (paragraph.startsWith('  ')) {
          return {
            tag: 'div',
            props: { className: 'hero-code docs-code', style: 'max-width:100%' },
            children: [
              {
                tag: 'pre', props: { className: 'code-block' }, children: [
                  { tag: 'code', props: {}, children: [paragraph.trim()] }
                ]
              }
            ]
          };
        }
        // Detect bullet points
        if (paragraph.startsWith('•')) {
          return { tag: 'p', props: { style: 'color:var(--text-muted);padding-left:1rem;margin-bottom:0.5rem;line-height:1.7' }, children: [paragraph] };
        }
        return { tag: 'p', props: { style: 'font-size:1.05rem;line-height:1.85;color:var(--text-muted);margin-bottom:1.25rem' }, children: [paragraph] };
      })
    ]
  };
};
