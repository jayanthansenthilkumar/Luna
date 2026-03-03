/**
 * SSR / SSG / ISR Docs  —  app/docs/ssr/page.js  →  /docs/ssr
 */
const { docsSidebar } = require('../page');

module.exports = function SSRDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['SSR / SSG / ISR'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LUNA supports three rendering strategies out of the box — Server-Side Rendering, Static Site Generation, and Incremental Static Regeneration.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Server-Side Rendering (SSR)'] },
                    {
                        tag: 'p', props: {}, children: [
                            'The default strategy. Pages are rendered on the server for every request, with full data access. HTML is streamed to the client using chunked transfer encoding for fast first-contentful paint.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Static Site Generation (SSG)'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Pages are pre-rendered at build time. Ideal for content that doesn\'t change often — documentation, marketing pages, blog posts. The output is plain HTML that can be served from any CDN.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Incremental Static Regeneration (ISR)'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Combines the best of SSR and SSG. Pages are statically generated but revalidate in the background at a configurable interval. Stale content is served instantly while fresh content is being generated.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Configuration'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["// luna.config.js\nmodule.exports = {\n  rendering: {\n    strategy: 'server-first', // 'server-first' | 'client-first' | 'static'\n    ssr: true,                // Enable SSR\n    ssg: true,                // Enable SSG at build time\n    isr: true                 // Enable ISR\n  }\n};"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Streaming'] },
                    {
                        tag: 'p', props: {}, children: [
                            'SSR in LUNA is streaming by default. The server sends the HTML shell and layout immediately, then streams in page content as it resolves. Suspense boundaries control what loads first.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Related'] },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/hydration' }, children: ['Hydration'] }, ' — How the client activates server-rendered HTML'] },
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/ui' }, children: ['Virtual DOM'] }, ' — The rendering engine'] }
                        ]
                    }
                ]
            }
        ]
    };
};
