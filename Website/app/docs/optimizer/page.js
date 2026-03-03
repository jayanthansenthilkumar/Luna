/**
 * Self-Evolving Optimizer Docs  —  app/docs/optimizer/page.js  →  /docs/optimizer
 */
const { docsSidebar } = require('../page');

module.exports = function OptimizerDocsPage() {
  return {
    tag: 'div',
    props: { className: 'docs-layout' },
    children: [
      docsSidebar(),
      {
        tag: 'div',
        props: { className: 'docs-content' },
        children: [
          { tag: 'h1', props: {}, children: ['Self-Evolving Optimizer'] },
          { tag: 'p', props: { className: 'docs-lead' }, children: [
            'LUNA\'s optimizer monitors your application at runtime and automatically applies optimizations — no manual tuning required.'
          ]},

          { tag: 'h2', props: {}, children: ['What It Optimizes'] },
          {
            tag: 'table',
            props: { className: 'docs-table' },
            children: [
              { tag: 'thead', props: {}, children: [
                { tag: 'tr', props: {}, children: [
                  { tag: 'th', props: {}, children: ['Area'] },
                  { tag: 'th', props: {}, children: ['Optimizations'] }
                ]}
              ]},
              { tag: 'tbody', props: {}, children: [
                { tag: 'tr', props: {}, children: [
                  { tag: 'td', props: {}, children: ['Bundle Size'] },
                  { tag: 'td', props: {}, children: ['Tree-shaking, code splitting, dead code elimination'] }
                ]},
                { tag: 'tr', props: {}, children: [
                  { tag: 'td', props: {}, children: ['Memory'] },
                  { tag: 'td', props: {}, children: ['Object pooling, cache eviction, GC scheduling'] }
                ]},
                { tag: 'tr', props: {}, children: [
                  { tag: 'td', props: {}, children: ['Network'] },
                  { tag: 'td', props: {}, children: ['Request coalescing, prefetching, compression tuning'] }
                ]},
                { tag: 'tr', props: {}, children: [
                  { tag: 'td', props: {}, children: ['Rendering'] },
                  { tag: 'td', props: {}, children: ['Virtual DOM batch updates, component memoization'] }
                ]},
                { tag: 'tr', props: {}, children: [
                  { tag: 'td', props: {}, children: ['Scheduling'] },
                  { tag: 'td', props: {}, children: ['Worker pool sizing, task priority rebalancing'] }
                ]}
              ]}
            ]
          },

          { tag: 'h2', props: {}, children: ['Profiling'] },
          { tag: 'p', props: {}, children: [
            'The optimizer collects metrics through lightweight instrumentation. It profiles hot paths, memory allocation patterns, and I/O latency without adding meaningful overhead.'
          ]},

          { tag: 'h2', props: {}, children: ['Configuration'] },
          {
            tag: 'div',
            props: { className: 'hero-code docs-code' },
            children: [
              { tag: 'pre', props: { className: 'code-block' }, children: [
                { tag: 'code', props: {}, children: ['// luna.json\n"runtime": {\n  "optimizer": {\n    "enabled": true,\n    "level": "aggressive",  // "conservative" | "balanced" | "aggressive"\n    "targets": ["bundle", "memory", "network"]\n  }\n}'] }
              ]}
            ]
          },

          { tag: 'h2', props: {}, children: ['Optimization Reports'] },
          { tag: 'p', props: {}, children: [
            'Run luna build --report to generate a detailed optimization report showing what was optimized, the before/after metrics, and recommendations for manual improvements.'
          ]}
        ]
      }
    ]
  };
};
