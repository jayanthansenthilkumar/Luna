/**
 * LPM (Luna Package Manager) Docs  —  app/docs/lpm/page.js  →  /docs/lpm
 */
const { docsSidebar } = require('../page');

module.exports = function LPMDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Luna Package Manager (LPM)'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LPM is LUNA\'s built-in package manager — no need for npm, yarn, or pnpm. It\'s fast, sandboxed, and deeply integrated with the runtime.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Core Commands'] },
                    {
                        tag: 'table',
                        props: { className: 'docs-table' },
                        children: [
                            {
                                tag: 'thead', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'th', props: {}, children: ['Command'] },
                                            { tag: 'th', props: {}, children: ['Description'] }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: 'tbody', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna install'] }] },
                                            { tag: 'td', props: {}, children: ['Install all dependencies from luna.json'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna fetch <pkg>'] }] },
                                            { tag: 'td', props: {}, children: ['Add a package and save to luna.json'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna remove <pkg>'] }] },
                                            { tag: 'td', props: {}, children: ['Remove a package'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna update'] }] },
                                            { tag: 'td', props: {}, children: ['Update all packages to latest compatible versions'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna search <query>'] }] },
                                            { tag: 'td', props: {}, children: ['Search the registry'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna publish'] }] },
                                            { tag: 'td', props: {}, children: ['Publish a package to the registry'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna list'] }] },
                                            { tag: 'td', props: {}, children: ['List installed packages'] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['luna.json Dependencies'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['{\n  "dependencies": {\n    "@luna/ui-kit": "^1.0.0",\n    "@luna/auth": "^2.1.0"\n  },\n  "devDependencies": {\n    "@luna/test": "^1.0.0"\n  }\n}'] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Registry'] },
                    {
                        tag: 'p', props: {}, children: [
                            'LPM uses the LUNA Package Registry by default. You can also configure private registries or use packages from GitHub repositories.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Security'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Every package installed via LPM runs in LUNA\'s sandbox. Packages must declare the capabilities they need (filesystem, network, etc.), and you approve them on install. This prevents supply-chain attacks.'
                        ]
                    }
                ]
            }
        ]
    };
};
