/**
 * Installation Docs  —  app/docs/installation/page.js  →  /docs/installation
 */
const { docsSidebar } = require('../page');

module.exports = function InstallationPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Installation'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'Install LUNA globally to access the CLI, or use it programmatically in your Node.js projects.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Prerequisites'] },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: ['Node.js 18.0.0 or higher'] },
                            { tag: 'li', props: {}, children: ['npm, yarn, or pnpm'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Global Installation'] },
                    { tag: 'p', props: {}, children: ['Install LUNA globally to use the CLI everywhere:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['npm install -g @luna/runtime'] }
                                ]
                            }
                        ]
                    },
                    { tag: 'p', props: {}, children: ['Verify the installation:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['luna --version\n# 0.1.0'] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Local Installation'] },
                    { tag: 'p', props: {}, children: ['For project-level usage:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['npm install @luna/runtime'] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['From Source'] },
                    { tag: 'p', props: {}, children: ['Clone and link for development:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['git clone https://github.com/jayanthansenthilkumar/Luna.git\ncd Luna\nnpm link'] }
                                ]
                            }
                        ]
                    },
                    { tag: 'p', props: {}, children: ['This makes the luna command available globally, pointing to your local source.'] },

                    { tag: 'h2', props: {}, children: ['Next Steps'] },
                    {
                        tag: 'p', props: {}, children: [
                            'After installation, create your first project with ',
                            { tag: 'span', props: { className: 'inline-code' }, children: ['luna create my-app'] },
                            '. See the ',
                            { tag: 'a', props: { href: '/docs/quickstart' }, children: ['Quick Start Guide'] },
                            ' for a complete walkthrough.'
                        ]
                    }
                ]
            }
        ]
    };
};
