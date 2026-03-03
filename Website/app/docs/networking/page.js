/**
 * Networking Docs  —  app/docs/networking/page.js  →  /docs/networking
 */
const { docsSidebar } = require('../page');

module.exports = function NetworkingDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['HTTP Server'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LUNA includes a full-featured HTTP server with clustering, streaming, and custom request/response abstractions.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Basic Server'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const { createApp } = require('@luna/runtime');\nconst app = createApp();\n\nawait app.init();\n\napp.router.get('/', (req, res) => {\n  res.html('<h1>Hello LUNA</h1>');\n});\n\nawait app.listen(3000);\n// Server running at http://localhost:3000"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['LunaRequest'] },
                    { tag: 'p', props: {}, children: ['Every request handler receives a LunaRequest object with:'] },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['req.method'] }, ' — HTTP method (GET, POST, etc.)'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['req.url'] }, ' — Full request URL'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['req.params'] }, ' — Route parameters (from dynamic segments)'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['req.query'] }, ' — Parsed query string'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['req.headers'] }, ' — Request headers'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['req.body()'] }, ' — Async body reader'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['req.cookies'] }, ' — Parsed cookies'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['LunaResponse'] },
                    { tag: 'p', props: {}, children: ['The LunaResponse object provides chainable methods:'] },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['res.status(code)'] }, ' — Set status code'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['res.header(key, value)'] }, ' — Set response header'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['res.json(data)'] }, ' — Send JSON response'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['res.html(str)'] }, ' — Send HTML response'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['res.send(data)'] }, ' — Send raw response'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['res.redirect(url)'] }, ' — HTTP redirect'] },
                            { tag: 'li', props: {}, children: [{ tag: 'code', props: {}, children: ['res.cookie(name, value, opts)'] }, ' — Set cookie'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Clustering'] },
                    {
                        tag: 'p', props: {}, children: [
                            'LUNA\'s HTTP server supports multi-process clustering. In production, the server forks worker processes based on available CPU cores for maximum throughput.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Streaming'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Responses can be streamed using chunked transfer encoding. The streaming engine supports Server-Sent Events (SSE), JSON Lines, multiplexed streams, and binary frames. See the ',
                            { tag: 'a', props: { href: '/docs/streaming' }, children: ['Streaming & SSE'] },
                            ' documentation for details.'
                        ]
                    }
                ]
            }
        ]
    };
};
