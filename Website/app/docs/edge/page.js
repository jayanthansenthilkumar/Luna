/**
 * Edge Runtime Docs  —  app/docs/edge/page.js  →  /docs/edge
 */
const { docsSidebar } = require('../page');

module.exports = function EdgeDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Edge Runtime'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'Deploy LUNA apps to edge networks — Cloudflare Workers, Vercel Edge, Deno Deploy, and custom V8 isolates.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Edge Functions'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["// app/api/edge-hello/route.js\nmodule.exports = {\n  runtime: 'edge',\n\n  GET(req) {\n    return new Response(JSON.stringify({\n      message: 'Hello from the edge!',\n      region: req.geo.region\n    }), {\n      headers: { 'Content-Type': 'application/json' }\n    });\n  }\n};"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Constraints'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Edge functions run in V8 isolates with limited APIs. LUNA\'s UCC layer handles the differences, but be aware of these constraints:'
                        ]
                    },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: ['No filesystem access (use KV or external storage)'] },
                            { tag: 'li', props: {}, children: ['Limited execution time (typically 30s max)'] },
                            { tag: 'li', props: {}, children: ['No native modules (pure JS only)'] },
                            { tag: 'li', props: {}, children: ['Small memory budget (128MB typical)'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['KV Storage'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const kv = app.edge.kv;\n\nawait kv.set('session:abc123', JSON.stringify(sessionData), { ttl: 3600 });\nconst data = await kv.get('session:abc123');"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Building for Edge'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['luna build --target edge'] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
