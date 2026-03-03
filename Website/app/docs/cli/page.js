/**
 * CLI Reference Docs  —  app/docs/cli/page.js  →  /docs/cli
 */
const { docsSidebar } = require('../page');

module.exports = function CLIDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['CLI Reference'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'The LUNA CLI provides commands for every development workflow — from scaffolding to deployment.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Commands'] },
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
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna init [name]'] }] },
                                            { tag: 'td', props: {}, children: ['Initialize a new LUNA project in the current directory'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna create <name>'] }] },
                                            { tag: 'td', props: {}, children: ['Scaffold a new project from template in a new directory'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna dev'] }] },
                                            { tag: 'td', props: {}, children: ['Start development server with HMR on port 3000'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna start'] }] },
                                            { tag: 'td', props: {}, children: ['Start production server'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna build [targets...]'] }] },
                                            { tag: 'td', props: {}, children: ['Build for targets: backend, web, mobile, desktop, edge'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna fetch [pkgs...]'] }] },
                                            { tag: 'td', props: {}, children: ['Install packages into luna_packages/'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna remove <pkgs...>'] }] },
                                            { tag: 'td', props: {}, children: ['Remove installed packages'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna search <query>'] }] },
                                            { tag: 'td', props: {}, children: ['Search the LUNA package registry'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna list'] }] },
                                            { tag: 'td', props: {}, children: ['List installed packages'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna update [pkgs...]'] }] },
                                            { tag: 'td', props: {}, children: ['Update dependencies to latest compatible versions'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna publish'] }] },
                                            { tag: 'td', props: {}, children: ['Publish package to the LUNA registry'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna test'] }] },
                                            { tag: 'td', props: {}, children: ['Run the test suite'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['luna info'] }] },
                                            { tag: 'td', props: {}, children: ['Show runtime environment information'] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Flags'] },
                    {
                        tag: 'table',
                        props: { className: 'docs-table' },
                        children: [
                            {
                                tag: 'thead', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'th', props: {}, children: ['Flag'] },
                                            { tag: 'th', props: {}, children: ['Description'] }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: 'tbody', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['--version'] }] },
                                            { tag: 'td', props: {}, children: ['Print LUNA version'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['--help'] }] },
                                            { tag: 'td', props: {}, children: ['Show help message'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['--port <port>'] }] },
                                            { tag: 'td', props: {}, children: ['Set server port (default: 3000)'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['--host <host>'] }] },
                                            { tag: 'td', props: {}, children: ['Set server host (default: localhost)'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['--dev'] }] },
                                            { tag: 'td', props: {}, children: ['Install as devDependency'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['--production'] }] },
                                            { tag: 'td', props: {}, children: ['Production mode (skip devDependencies)'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['--save'] }] },
                                            { tag: 'td', props: {}, children: ['Save to luna.json (default for fetch)'] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Examples'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['# Start dev server on port 8080\nluna dev --port 8080\n\n# Build for web and mobile\nluna build web mobile\n\n# Install a package as dev dependency\nluna fetch testing-lib --dev\n\n# Create project from template\nluna create my-api --template api'] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
