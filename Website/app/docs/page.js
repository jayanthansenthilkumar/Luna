/**
 * Documentation Index  —  app/docs/page.js  →  /docs
 * 
 * Main documentation landing page with sidebar navigation.
 */

function docsSidebar() {
    return {
        tag: 'nav',
        props: { className: 'docs-sidebar' },
        children: [
            { tag: 'h4', props: {}, children: ['Getting Started'] },
            { tag: 'a', props: { href: '/docs', className: 'active' }, children: ['Introduction'] },
            { tag: 'a', props: { href: '/docs/installation' }, children: ['Installation'] },
            { tag: 'a', props: { href: '/docs/quickstart' }, children: ['Quick Start'] },
            { tag: 'a', props: { href: '/docs/project-structure' }, children: ['Project Structure'] },

            { tag: 'h4', props: {}, children: ['Core Runtime'] },
            { tag: 'a', props: { href: '/docs/core' }, children: ['Engine & Lifecycle'] },
            { tag: 'a', props: { href: '/docs/scheduler' }, children: ['Scheduler'] },
            { tag: 'a', props: { href: '/docs/sandbox' }, children: ['Sandbox & Security'] },
            { tag: 'a', props: { href: '/docs/system-api' }, children: ['System API'] },

            { tag: 'h4', props: {}, children: ['Networking'] },
            { tag: 'a', props: { href: '/docs/networking' }, children: ['HTTP Server'] },
            { tag: 'a', props: { href: '/docs/routing' }, children: ['Router'] },
            { tag: 'a', props: { href: '/docs/middleware' }, children: ['Middleware'] },
            { tag: 'a', props: { href: '/docs/websocket' }, children: ['WebSocket'] },
            { tag: 'a', props: { href: '/docs/streaming' }, children: ['Streaming & SSE'] },

            { tag: 'h4', props: {}, children: ['UI & Rendering'] },
            { tag: 'a', props: { href: '/docs/ui' }, children: ['Virtual DOM'] },
            { tag: 'a', props: { href: '/docs/reactive-state' }, children: ['Reactive State'] },
            { tag: 'a', props: { href: '/docs/ssr' }, children: ['SSR / SSG / ISR'] },
            { tag: 'a', props: { href: '/docs/hydration' }, children: ['Hydration'] },
            { tag: 'a', props: { href: '/docs/ui-router' }, children: ['Page Router'] },

            { tag: 'h4', props: {}, children: ['Platforms'] },
            { tag: 'a', props: { href: '/docs/platforms' }, children: ['Overview'] },
            { tag: 'a', props: { href: '/docs/mobile' }, children: ['Mobile Bridge'] },
            { tag: 'a', props: { href: '/docs/desktop' }, children: ['Desktop Shell'] },
            { tag: 'a', props: { href: '/docs/edge' }, children: ['Edge Runtime'] },

            { tag: 'h4', props: {}, children: ['Advanced'] },
            { tag: 'a', props: { href: '/docs/qsr' }, children: ['Quantum State (QSR)'] },
            { tag: 'a', props: { href: '/docs/optimizer' }, children: ['Self-Evolving Optimizer'] },
            { tag: 'a', props: { href: '/docs/ucc' }, children: ['Code Continuity (UCC)'] },

            { tag: 'h4', props: {}, children: ['Tools'] },
            { tag: 'a', props: { href: '/docs/cli' }, children: ['CLI Reference'] },
            { tag: 'a', props: { href: '/docs/lpm' }, children: ['Package Manager'] },
            { tag: 'a', props: { href: '/docs/build' }, children: ['Build System'] },
            { tag: 'a', props: { href: '/docs/configuration' }, children: ['Configuration'] }
        ]
    };
}

module.exports = function DocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['LUNA Documentation'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'Welcome to the LUNA documentation. LUNA is a Universal JavaScript Operating Runtime — a single platform for backend, web, mobile, desktop, and edge development.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['What is LUNA?'] },
                    {
                        tag: 'p', props: {}, children: [
                            'LUNA is a unified JavaScript runtime that eliminates the fragmentation of modern development. Instead of juggling Node.js for the backend, React for the web, React Native for mobile, Electron for desktop, and Cloudflare Workers for edge — LUNA provides a single cohesive runtime for all platforms.'
                        ]
                    },
                    {
                        tag: 'p', props: {}, children: [
                            'Key characteristics:'
                        ]
                    },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['Zero dependencies'] }, ' — The entire runtime is self-contained'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['Convention over configuration'] }, ' — File-based routing, sensible defaults'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['Six platform targets'] }, ' — Backend, web, mobile, desktop, edge, QSR'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['Built-in everything'] }, ' — HTTP server, router, SSR, state management, package manager'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Quick Start'] },
                    { tag: 'p', props: {}, children: ['Get up and running in under 60 seconds:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'div', props: { className: 'code-header' }, children: [
                                    { tag: 'span', props: { className: 'code-dot red' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot yellow' }, children: [] },
                                    { tag: 'span', props: { className: 'code-dot green' }, children: [] },
                                    { tag: 'span', props: { className: 'code-title' }, children: ['Terminal'] }
                                ]
                            },
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    {
                                        tag: 'code', props: {}, children: [
                                            '# Install globally\nnpm i -g @luna/runtime\n\n# Scaffold a new project\nluna create my-app\n\n# Enter the project and start dev server\ncd my-app\nluna dev'
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Architecture Overview'] },
                    {
                        tag: 'p', props: {}, children: [
                            'LUNA is organized into layered subsystems, each independently usable:'
                        ]
                    },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['Core Layer'] }, ' — Engine, Scheduler, Sandbox, System API, Module Resolver'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['Network Layer'] }, ' — HTTP Server, Router, Middleware, WebSocket, Streaming'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['UI Layer'] }, ' — Virtual DOM, Reactive State, SSR/SSG/ISR, Hydration, Page Router'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['Platform Layer'] }, ' — Mobile Bridge, Desktop Shell, Edge Runtime'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['Advanced'] }, ' — Quantum State Rendering, Self-Evolving Optimizer, Universal Code Continuity'] },
                            { tag: 'li', props: {}, children: [{ tag: 'strong', props: {}, children: ['Tools'] }, ' — CLI, Package Manager (LPM), Build System'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Next Steps'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Explore the documentation sections in the sidebar to learn about each subsystem in detail. We recommend starting with:'
                        ]
                    },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/installation' }, children: ['Installation'] }, ' — Detailed setup instructions'] },
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/quickstart' }, children: ['Quick Start Guide'] }, ' — Build your first LUNA app'] },
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/core' }, children: ['Core Runtime'] }, ' — Understanding the engine'] },
                            { tag: 'li', props: {}, children: [{ tag: 'a', props: { href: '/docs/cli' }, children: ['CLI Reference'] }, ' — All available commands'] }
                        ]
                    }
                ]
            }
        ]
    };
};

module.exports.docsSidebar = docsSidebar;
