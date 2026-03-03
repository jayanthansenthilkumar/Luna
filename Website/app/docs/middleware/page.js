/**
 * Middleware Docs  —  app/docs/middleware/page.js  →  /docs/middleware
 */
const { docsSidebar } = require('../page');

module.exports = function MiddlewareDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Middleware'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LUNA includes a complete middleware pipeline with built-in middleware for common needs and support for custom middleware.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Built-in Middleware'] },
                    {
                        tag: 'table',
                        props: { className: 'docs-table' },
                        children: [
                            {
                                tag: 'thead', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'th', props: {}, children: ['Middleware'] },
                                            { tag: 'th', props: {}, children: ['Description'] }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: 'tbody', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['CORS'] },
                                            { tag: 'td', props: {}, children: ['Cross-Origin Resource Sharing headers'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Body Parser'] },
                                            { tag: 'td', props: {}, children: ['Parse JSON, URL-encoded, and raw request bodies'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Compression'] },
                                            { tag: 'td', props: {}, children: ['Gzip/deflate response compression'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Rate Limiter'] },
                                            { tag: 'td', props: {}, children: ['Token bucket rate limiting per IP'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Static Files'] },
                                            { tag: 'td', props: {}, children: ['Serve files from the public/ directory'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Helmet'] },
                                            { tag: 'td', props: {}, children: ['Security headers (CSP, HSTS, X-Frame-Options)'] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Custom Middleware'] },
                    { tag: 'p', props: {}, children: ['Middleware functions receive (req, res, next). Call next() to proceed:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["app.middleware.use((req, res, next) => {\n  const start = Date.now();\n  next();\n  const ms = Date.now() - start;\n  console.log(`${req.method} ${req.url} - ${ms}ms`);\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Path-Specific Middleware'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["// Only apply to /api/* routes\napp.middleware.use('/api', authMiddleware);"] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
