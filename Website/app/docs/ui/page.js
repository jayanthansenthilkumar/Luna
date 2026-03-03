/**
 * UI & Rendering Docs  —  app/docs/ui/page.js  →  /docs/ui
 */
const { docsSidebar } = require('../page');

module.exports = function UIDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Virtual DOM & Components'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LUNA includes a custom Virtual DOM engine with component lifecycle, diffing, and a JSX-like h() factory function.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Component Model'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Components in LUNA are plain JavaScript functions that return VDOM nodes. Each node has a tag, props, and children array:'
                        ]
                    },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["function Greeting({ name }) {\n  return {\n    tag: 'div',\n    props: { className: 'greeting' },\n    children: [\n      { tag: 'h1', props: {}, children: ['Hello, ' + name + '!'] },\n      { tag: 'p', props: {}, children: ['Welcome to LUNA.'] }\n    ]\n  };\n}"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['The h() Factory'] },
                    { tag: 'p', props: {}, children: ['For convenience, use the h() helper for terser syntax:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const { h } = require('@luna/runtime/ui/engine');\n\nfunction Greeting({ name }) {\n  return h('div', { className: 'greeting' },\n    h('h1', null, 'Hello, ' + name + '!'),\n    h('p', null, 'Welcome to LUNA.')\n  );\n}"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Diffing & Patching'] },
                    {
                        tag: 'p', props: {}, children: [
                            'The VDOM engine performs efficient tree diffing when state changes. Only the minimal set of DOM operations are applied — no full re-renders. The diffing algorithm handles:'
                        ]
                    },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: ['Element type changes (replace)'] },
                            { tag: 'li', props: {}, children: ['Prop updates (add, remove, change)'] },
                            { tag: 'li', props: {}, children: ['Children reconciliation with key-based reuse'] },
                            { tag: 'li', props: {}, children: ['Text node updates'] },
                            { tag: 'li', props: {}, children: ['Component mount/unmount lifecycle'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Component Lifecycle'] },
                    {
                        tag: 'table',
                        props: { className: 'docs-table' },
                        children: [
                            {
                                tag: 'thead', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'th', props: {}, children: ['Phase'] },
                                            { tag: 'th', props: {}, children: ['Description'] }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: 'tbody', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Mount'] },
                                            { tag: 'td', props: {}, children: ['Component renders for the first time'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Update'] },
                                            { tag: 'td', props: {}, children: ['Props or state change triggers re-render'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Unmount'] },
                                            { tag: 'td', props: {}, children: ['Component removed from tree, cleanup runs'] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Related'] },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/reactive-state' }, children: ['Reactive State'] }, ' — Signals, Computed, Effects'] },
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/ssr' }, children: ['SSR / SSG / ISR'] }, ' — Server rendering strategies'] },
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/hydration' }, children: ['Hydration'] }, ' — Client-side activation strategies'] }
                        ]
                    }
                ]
            }
        ]
    };
};
