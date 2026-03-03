/**
 * Hydration Docs  —  app/docs/hydration/page.js  →  /docs/hydration
 */
const { docsSidebar } = require('../page');

module.exports = function HydrationDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Hydration Strategies'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'Hydration is the process of making server-rendered HTML interactive on the client. LUNA supports five strategies.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Full Hydration'] },
                    { tag: 'p', props: {}, children: ['The entire page is hydrated at once. Simplest approach, suitable for highly interactive pages.'] },

                    { tag: 'h2', props: {}, children: ['Partial Hydration'] },
                    { tag: 'p', props: {}, children: ['Only interactive components are hydrated. Static content remains as plain HTML — reducing JavaScript sent to the client.'] },

                    { tag: 'h2', props: {}, children: ['Progressive Hydration'] },
                    { tag: 'p', props: {}, children: ['Above-the-fold content hydrates first, then below-the-fold content hydrates as it scrolls into view. Prioritizes visible content.'] },

                    { tag: 'h2', props: {}, children: ['Lazy Hydration'] },
                    { tag: 'p', props: {}, children: ['Components hydrate only when the user interacts with them — click, hover, or scroll. Minimizes initial JavaScript execution.'] },

                    { tag: 'h2', props: {}, children: ['Island-Based Hydration'] },
                    { tag: 'p', props: {}, children: ['Interactive "islands" in an otherwise static page. Each island hydrates independently. Ideal for content-heavy sites with isolated interactive widgets.'] },

                    { tag: 'h2', props: {}, children: ['Configuration'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["// luna.config.js\nmodule.exports = {\n  rendering: {\n    hydration: 'incremental'\n    // Options: 'full' | 'partial' | 'progressive' | 'lazy' | 'islands'\n  }\n};"] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
