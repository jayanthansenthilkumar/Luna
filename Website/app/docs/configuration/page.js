/**
 * Configuration Docs  —  app/docs/configuration/page.js  →  /docs/configuration
 */
const { docsSidebar } = require('../page');

module.exports = function ConfigDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Configuration'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'Configure LUNA via luna.json (project manifest) and luna.config.js (runtime settings).'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['luna.json'] },
                    {
                        tag: 'p', props: {}, children: [
                            'The project manifest defines metadata, platform targets, dependencies, and runtime behavior.'
                        ]
                    },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'div', props: { className: 'code-header' }, children: [
                                    { tag: 'span', props: { className: 'code-dot red' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot yellow' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot green' }, children: [] },
                                    { tag: 'span', props: { className: 'code-title' }, children: ['luna.json'] }
                                ]
                            },
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['{\n  "name": "my-app",\n  "version": "1.0.0",\n  "description": "My LUNA application",\n  "entry": "src/index.js",\n  "platform": {\n    "backend": true,\n    "web": true,\n    "mobile": { "android": true, "ios": true },\n    "desktop": { "windows": true, "macos": true, "linux": true },\n    "edge": true\n  },\n  "runtime": {\n    "scheduler": {\n      "workerThreads": 4,\n      "ioThreads": 2\n    },\n    "sandbox": {\n      "enabled": true,\n      "capabilities": ["fs", "net", "env"]\n    },\n    "optimizer": {\n      "selfEvolving": true,\n      "hotPathThreshold": 100\n    }\n  },\n  "rendering": {\n    "strategy": "server-first",\n    "hydration": "incremental",\n    "ssr": true,\n    "ssg": true,\n    "isr": true\n  },\n  "dependencies": {},\n  "devDependencies": {}\n}'] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['luna.config.js'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Runtime configuration for server, rendering, and build options.'
                        ]
                    },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'div', props: { className: 'code-header' }, children: [
                                    { tag: 'span', props: { className: 'code-dot red' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot yellow' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot green' }, children: [] },
                                    { tag: 'span', props: { className: 'code-title' }, children: ['luna.config.js'] }
                                ]
                            },
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["module.exports = {\n  server: {\n    port: 3000,\n    host: 'localhost'\n  },\n  rendering: {\n    strategy: 'server-first',\n    ssr: true,\n    hydration: 'incremental'\n  },\n  build: {\n    targets: ['backend', 'web'],\n    minify: true\n  }\n};"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Configuration Options'] },

                    { tag: 'h3', props: {}, children: ['Platform Options'] },
                    {
                        tag: 'table',
                        props: { className: 'docs-table' },
                        children: [
                            {
                                tag: 'thead', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'th', props: {}, children: ['Key'] },
                                            { tag: 'th', props: {}, children: ['Type'] },
                                            { tag: 'th', props: {}, children: ['Description'] }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: 'tbody', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['platform.backend'] }] },
                                            { tag: 'td', props: {}, children: ['boolean'] },
                                            { tag: 'td', props: {}, children: ['Enable backend target'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['platform.web'] }] },
                                            { tag: 'td', props: {}, children: ['boolean'] },
                                            { tag: 'td', props: {}, children: ['Enable web target'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['platform.mobile'] }] },
                                            { tag: 'td', props: {}, children: ['object'] },
                                            { tag: 'td', props: {}, children: ['{ android: bool, ios: bool }'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['platform.desktop'] }] },
                                            { tag: 'td', props: {}, children: ['object'] },
                                            { tag: 'td', props: {}, children: ['{ windows: bool, macos: bool, linux: bool }'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['platform.edge'] }] },
                                            { tag: 'td', props: {}, children: ['boolean'] },
                                            { tag: 'td', props: {}, children: ['Enable edge target'] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    { tag: 'h3', props: {}, children: ['Runtime Options'] },
                    {
                        tag: 'table',
                        props: { className: 'docs-table' },
                        children: [
                            {
                                tag: 'thead', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'th', props: {}, children: ['Key'] },
                                            { tag: 'th', props: {}, children: ['Default'] },
                                            { tag: 'th', props: {}, children: ['Description'] }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: 'tbody', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['runtime.scheduler.workerThreads'] }] },
                                            { tag: 'td', props: {}, children: ['4'] },
                                            { tag: 'td', props: {}, children: ['Number of worker threads'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['runtime.scheduler.ioThreads'] }] },
                                            { tag: 'td', props: {}, children: ['2'] },
                                            { tag: 'td', props: {}, children: ['Number of I/O threads'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['runtime.sandbox.enabled'] }] },
                                            { tag: 'td', props: {}, children: ['true'] },
                                            { tag: 'td', props: {}, children: ['Enable sandbox security'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['runtime.sandbox.capabilities'] }] },
                                            { tag: 'td', props: {}, children: ['["fs","net","env"]'] },
                                            { tag: 'td', props: {}, children: ['Allowed capabilities'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['runtime.optimizer.selfEvolving'] }] },
                                            { tag: 'td', props: {}, children: ['true'] },
                                            { tag: 'td', props: {}, children: ['Enable self-evolving optimizer'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['runtime.optimizer.hotPathThreshold'] }] },
                                            { tag: 'td', props: {}, children: ['100'] },
                                            { tag: 'td', props: {}, children: ['Calls before optimization kicks in'] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    { tag: 'h3', props: {}, children: ['Rendering Options'] },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['strategy'] }, ' — "server-first" | "client-first" | "static"'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['hydration'] }, ' — "full" | "partial" | "progressive" | "lazy" | "incremental" | "islands"'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['ssr'] }, ' — Enable server-side rendering (boolean)'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['ssg'] }, ' — Enable static site generation (boolean)'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['isr'] }, ' — Enable incremental static regeneration (boolean)'] }
                        ]
                    }
                ]
            }
        ]
    };
};
