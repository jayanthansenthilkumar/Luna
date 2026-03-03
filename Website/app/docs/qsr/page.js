/**
 * QSR Docs  —  app/docs/qsr/page.js  →  /docs/qsr
 */
const { docsSidebar } = require('../page');

module.exports = function QSRDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Quantum State Reconciliation'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'QSR is LUNA\'s approach to distributed state management. It maintains state across multiple devices and servers using probabilistic reconciliation — like eventual consistency, but smarter.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['How It Works'] },
                    {
                        tag: 'p', props: {}, children: [
                            'State is represented as a quantum-inspired superposition of possible values. When conflicts occur across nodes, QSR collapses the state to the most probable correct value using vector clocks, CRDTs, and application-defined resolution functions.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Creating Quantum State'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const { QuantumState } = require('@luna/runtime/qsr/quantum-state');\n\nconst state = new QuantumState({\n  initialState: { count: 0, items: [] },\n  reconciliation: 'last-write-wins', // or 'merge' | 'custom'\n  replication: {\n    nodes: ['node-1', 'node-2', 'node-3'],\n    consistency: 'eventual'\n  }\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['State Operations'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["// Read\nconst current = state.observe();\n\n// Write\nstate.mutate(s => ({ ...s, count: s.count + 1 }));\n\n// Subscribe to changes\nstate.subscribe((newState, oldState) => {\n  console.log('State changed:', newState);\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Custom Reconciliation'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const state = new QuantumState({\n  initialState: { items: [] },\n  reconciliation: 'custom',\n  resolver: (local, remote) => {\n    // Merge arrays, deduplicate by id\n    const merged = [...local.items, ...remote.items];\n    const unique = [...new Map(merged.map(i => [i.id, i])).values()];\n    return { items: unique };\n  }\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Use Cases'] },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: ['Real-time collaboration (documents, whiteboards)'] },
                            { tag: 'li', props: {}, children: ['Offline-first apps that sync when reconnected'] },
                            { tag: 'li', props: {}, children: ['Multi-device state (phone ↔ desktop ↔ server)'] },
                            { tag: 'li', props: {}, children: ['Distributed caching with automatic invalidation'] }
                        ]
                    }
                ]
            }
        ]
    };
};
