/**
 * Quick Start Docs  —  app/docs/quickstart/page.js  →  /docs/quickstart
 */
const { docsSidebar } = require('../page');

module.exports = function QuickStartPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Quick Start'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'Build a full-stack LUNA application from scratch in under 5 minutes.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['1. Create a Project'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['luna create my-app\ncd my-app'] }
                                ]
                            }
                        ]
                    },
                    { tag: 'p', props: {}, children: ['This scaffolds a project with file-based routing, a config file, and example pages.'] },

                    { tag: 'h2', props: {}, children: ['2. Start Development Server'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['luna dev'] }
                                ]
                            }
                        ]
                    },
                    { tag: 'p', props: {}, children: ['The dev server starts on http://localhost:3000 with Hot Module Replacement (HMR) enabled. Changes are reflected instantly.'] },

                    { tag: 'h2', props: {}, children: ['3. Add a Page'] },
                    { tag: 'p', props: {}, children: ['Create app/hello/page.js:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'div', props: { className: 'code-header' }, children: [
                                    { tag: 'span', props: { className: 'code-dot red' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot yellow' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot green' }, children: [] },
                                    { tag: 'span', props: { className: 'code-title' }, children: ['app/hello/page.js'] }
                                ]
                            },
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["module.exports = function HelloPage() {\n  return {\n    tag: 'div',\n    props: { className: 'page-section' },\n    children: [\n      { tag: 'h1', props: {}, children: ['Hello, LUNA!'] },\n      { tag: 'p', props: {}, children: ['This page is auto-routed.'] }\n    ]\n  };\n};"] }
                                ]
                            }
                        ]
                    },
                    { tag: 'p', props: {}, children: ['Visit http://localhost:3000/hello — it just works.'] },

                    { tag: 'h2', props: {}, children: ['4. Add an API Route'] },
                    { tag: 'p', props: {}, children: ['Create app/api/greet/route.js:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'div', props: { className: 'code-header' }, children: [
                                    { tag: 'span', props: { className: 'code-dot red' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot yellow' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot green' }, children: [] },
                                    { tag: 'span', props: { className: 'code-title' }, children: ['app/api/greet/route.js'] }
                                ]
                            },
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["module.exports.GET = function(req, res) {\n  res.json({\n    message: 'Hello from LUNA API!',\n    timestamp: new Date().toISOString()\n  });\n};\n\nmodule.exports.POST = async function(req, res) {\n  const body = await req.body();\n  res.status(201).json({ received: JSON.parse(body) });\n};"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['5. Build for Production'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['# Build for backend and web\nluna build backend web\n\n# Start production server\nluna start'] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Next Steps'] },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/project-structure' }, children: ['Project Structure'] }, ' — Understand the file conventions'] },
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/routing' }, children: ['Routing'] }, ' — Deep dive into the router'] },
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/core' }, children: ['Core Runtime'] }, ' — Learn about the engine'] },
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/cli' }, children: ['CLI Reference'] }, ' — All available commands'] }
                        ]
                    }
                ]
            }
        ]
    };
};
