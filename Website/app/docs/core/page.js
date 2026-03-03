/**
 * Core Runtime Docs  —  app/docs/core/page.js  →  /docs/core
 */
const { docsSidebar } = require('../page');

module.exports = function CoreDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Engine & Lifecycle'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LunaEngine is the heart of the runtime — managing lifecycle hooks, error boundaries, metrics, and extensions.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Overview'] },
                    {
                        tag: 'p', props: {}, children: [
                            'The LunaEngine coordinates all subsystems. It handles initialization, manages the event loop integration, tracks performance metrics, and provides lifecycle hooks for extensions.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Lifecycle Hooks'] },
                    { tag: 'p', props: {}, children: ['LUNA provides lifecycle hooks at every stage:'] },
                    {
                        tag: 'table',
                        props: { className: 'docs-table' },
                        children: [
                            {
                                tag: 'thead', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'th', props: {}, children: ['Hook'] },
                                            { tag: 'th', props: {}, children: ['When'] }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: 'tbody', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['beforeInit'] }] },
                                            { tag: 'td', props: {}, children: ['Before subsystems initialize'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['afterInit'] }] },
                                            { tag: 'td', props: {}, children: ['After all subsystems are ready'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['beforeRequest'] }] },
                                            { tag: 'td', props: {}, children: ['Before each HTTP request'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['afterRequest'] }] },
                                            { tag: 'td', props: {}, children: ['After request completes'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['onError'] }] },
                                            { tag: 'td', props: {}, children: ['When an error boundary catches'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['beforeShutdown'] }] },
                                            { tag: 'td', props: {}, children: ['Graceful shutdown signal'] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Usage'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'div', props: { className: 'code-header' }, children: [
                                    { tag: 'span', props: { className: 'code-dot red' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot yellow' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot green' }, children: [] },
                                    { tag: 'span', props: { className: 'code-title' }, children: ['server.js'] }
                                ]
                            },
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const { Luna, createApp } = require('@luna/runtime');\n\nconst app = createApp();\n\n// Register lifecycle hooks\napp.engine.on('beforeInit', () => {\n  console.log('Initializing...');\n});\n\napp.engine.on('afterInit', () => {\n  console.log('Ready!');\n});\n\n// Initialize all subsystems\nawait app.init();\n\n// Access metrics\nconsole.log(app.engine.getMetrics());"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Error Boundaries'] },
                    {
                        tag: 'p', props: {}, children: [
                            'The engine wraps all request handlers in error boundaries. Uncaught errors are caught, logged, and a 500 response is sent. Custom error handlers can be registered:'
                        ]
                    },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["app.engine.on('onError', (error, req, res) => {\n  console.error('Error:', error.message);\n  res.status(500).json({ error: 'Internal server error' });\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Extensions'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Extend the engine with plugins that hook into the lifecycle. Extensions receive the engine instance and can register hooks, add middleware, or modify behavior.'
                        ]
                    }
                ]
            }
        ]
    };
};
