/**
 * Reactive State Docs  —  app/docs/reactive-state/page.js  →  /docs/reactive-state
 */
const { docsSidebar } = require('../page');

module.exports = function ReactiveStateDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Reactive State'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LUNA\'s reactive state system is built on Signals, Computed values, and Effects — with Stores for complex state and time-travel debugging.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Signals'] },
                    { tag: 'p', props: {}, children: ['Signals are reactive values that notify dependents when they change:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const { Signal } = require('@luna/runtime/ui/reactive-state');\n\nconst count = new Signal(0);\nconsole.log(count.value); // 0\n\ncount.value = 5;\nconsole.log(count.value); // 5"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Computed'] },
                    { tag: 'p', props: {}, children: ['Computed values derive from signals and update automatically:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const { Signal, Computed } = require('@luna/runtime/ui/reactive-state');\n\nconst count = new Signal(3);\nconst doubled = new Computed(() => count.value * 2);\n\nconsole.log(doubled.value); // 6\ncount.value = 10;\nconsole.log(doubled.value); // 20"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Effects'] },
                    { tag: 'p', props: {}, children: ['Effects run side effects when dependencies change:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const { Signal, Effect } = require('@luna/runtime/ui/reactive-state');\n\nconst name = new Signal('World');\n\nnew Effect(() => {\n  console.log('Hello, ' + name.value + '!');\n});\n// Logs: \"Hello, World!\"\n\nname.value = 'LUNA';\n// Logs: \"Hello, LUNA!\""] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Stores'] },
                    { tag: 'p', props: {}, children: ['Stores manage complex state with reducer-like patterns and time-travel:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const { Store } = require('@luna/runtime/ui/reactive-state');\n\nconst store = new Store({\n  count: 0,\n  items: []\n});\n\nstore.update(state => ({ ...state, count: state.count + 1 }));\n\n// Time-travel\nstore.undo();\nstore.redo();\nstore.getHistory();"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Integration with UI'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Signals and Computed values integrate with LUNA\'s Virtual DOM. When a signal used in a component changes, only that component re-renders — no manual subscriptions needed.'
                        ]
                    }
                ]
            }
        ]
    };
};
