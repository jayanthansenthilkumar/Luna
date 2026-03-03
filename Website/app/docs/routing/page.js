/**
 * Routing Docs  —  app/docs/routing/page.js  →  /docs/routing
 */
const { docsSidebar } = require('../page');

module.exports = function RoutingDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Router'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LUNA includes a high-performance radix-tree router with support for parameters, wildcards, and route groups.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Basic Routes'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["app.router.get('/hello', (req, res) => {\n  res.json({ message: 'Hello!' });\n});\n\napp.router.post('/users', (req, res) => {\n  res.status(201).json({ created: true });\n});\n\napp.router.put('/users/:id', (req, res) => {\n  res.json({ updated: req.params.id });\n});\n\napp.router.delete('/users/:id', (req, res) => {\n  res.json({ deleted: req.params.id });\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Route Parameters'] },
                    { tag: 'p', props: {}, children: ['Use :name for dynamic segments. Values are available on req.params:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["app.router.get('/users/:userId/posts/:postId', (req, res) => {\n  const { userId, postId } = req.params;\n  res.json({ userId, postId });\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Wildcards'] },
                    { tag: 'p', props: {}, children: ['Use * to match any remaining path:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["app.router.get('/files/*', (req, res) => {\n  // Matches /files/a/b/c.txt\n  res.send('Path: ' + req.params['*']);\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Route Groups'] },
                    { tag: 'p', props: {}, children: ['Group routes with shared prefixes and middleware:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["app.router.group('/api/v1', (group) => {\n  group.get('/users', listUsers);\n  group.post('/users', createUser);\n  group.get('/posts', listPosts);\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Performance'] },
                    {
                        tag: 'p', props: {}, children: [
                            'The router uses a radix tree (compressed trie) internally, providing O(log n) route matching regardless of how many routes are registered. This is significantly faster than linear matching used by many frameworks.'
                        ]
                    }
                ]
            }
        ]
    };
};
