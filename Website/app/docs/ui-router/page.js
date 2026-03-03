/**
 * UI Router Docs  —  app/docs/ui-router/page.js  →  /docs/ui-router
 */
const { docsSidebar } = require('../page');

module.exports = function UIRouterDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Page Router'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'The page router handles client-side navigation with file-based routing, layouts, and prefetching.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['File-Based Routing'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Pages map to routes based on their path in the app/ directory. Every page.js file defines a route.'
                        ]
                    },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["app/page.js           →  /\napp/about/page.js     →  /about\napp/blog/page.js      →  /blog\napp/blog/[slug]/page.js → /blog/:slug"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Layouts'] },
                    {
                        tag: 'p', props: {}, children: [
                            'layout.js files wrap their child pages. Layouts are nested — each segment can have its own layout, and they compose automatically.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Navigation'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["// Declarative\n{ tag: 'a', props: { href: '/about', 'data-luna-link': true }, children: ['About'] }\n\n// Programmatic\napp.router.navigate('/about');\napp.router.back();\napp.router.replace('/new-url');"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Route Prefetching'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Links with data-luna-link are automatically prefetched when they enter the viewport. This means navigation feels instant since the page code is already loaded.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Special Files'] },
                    {
                        tag: 'table',
                        props: { className: 'docs-table' },
                        children: [
                            {
                                tag: 'thead', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'th', props: {}, children: ['File'] },
                                            { tag: 'th', props: {}, children: ['Purpose'] }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: 'tbody', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['page.js'] },
                                            { tag: 'td', props: {}, children: ['Route component'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['layout.js'] },
                                            { tag: 'td', props: {}, children: ['Shared layout wrapper'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['loading.js'] },
                                            { tag: 'td', props: {}, children: ['Loading skeleton / spinner'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['error.js'] },
                                            { tag: 'td', props: {}, children: ['Error boundary'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['not-found.js'] },
                                            { tag: 'td', props: {}, children: ['404 page'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['route.js'] },
                                            { tag: 'td', props: {}, children: ['API route handler'] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
