/**
 * Platforms Docs  —  app/docs/platforms/page.js  →  /docs/platforms
 */
const { docsSidebar } = require('../page');

module.exports = function PlatformsDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Platform Targets'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LUNA targets six platforms from a single codebase. Each platform layer adapts to native capabilities automatically.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Backend'] },
                    {
                        tag: 'p', props: {}, children: [
                            'The default platform. LUNA\'s backend includes an HTTP server with clustering, radix-tree router, full middleware pipeline, WebSocket server, and streaming (SSE, JSON Lines). It\'s a complete Node.js alternative with zero dependencies.'
                        ]
                    },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: ['HTTP/1.1 server with chunked streaming'] },
                            { tag: 'li', props: {}, children: ['Radix-tree router — O(log n) route matching'] },
                            { tag: 'li', props: {}, children: ['Built-in middleware: CORS, body parser, compression, rate limiter, static files, helmet'] },
                            { tag: 'li', props: {}, children: ['WebSocket with rooms, broadcasting, heartbeat'] },
                            { tag: 'li', props: {}, children: ['SSE and multiplexed streaming'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Web'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Full UI rendering pipeline with Virtual DOM, reactive state (Signals/Computed/Effects), SSR/SSG/ISR, five hydration strategies, and a page router — all built in.'
                        ]
                    },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: ['Custom VDOM with efficient diffing'] },
                            { tag: 'li', props: {}, children: ['Reactive state management with Signals and Stores'] },
                            { tag: 'li', props: {}, children: ['Server-first rendering with streaming'] },
                            { tag: 'li', props: {}, children: ['Hydration: full, partial, progressive, lazy, islands'] },
                            { tag: 'li', props: {}, children: ['File-based page routing'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Mobile'] },
                    {
                        tag: 'p', props: {}, children: [
                            'The Mobile Bridge exposes native device APIs through a unified JavaScript interface. One API for both Android and iOS.'
                        ]
                    },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: ['Camera — photo capture, video recording, QR scanning'] },
                            { tag: 'li', props: {}, children: ['GPS — location tracking, geofencing'] },
                            { tag: 'li', props: {}, children: ['Biometrics — fingerprint, face ID'] },
                            { tag: 'li', props: {}, children: ['Notifications — push, local, scheduled'] },
                            { tag: 'li', props: {}, children: ['Haptics — vibration patterns, feedback types'] },
                            { tag: 'li', props: {}, children: ['GPU acceleration for graphics-intensive operations'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Desktop'] },
                    {
                        tag: 'p', props: {}, children: [
                            'The Desktop Shell provides native window management for Windows, macOS, and Linux — without Electron\'s resource overhead.'
                        ]
                    },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: ['Window management — create, resize, position, close'] },
                            { tag: 'li', props: {}, children: ['Native menus — menu bar, context menus'] },
                            { tag: 'li', props: {}, children: ['System tray integration'] },
                            { tag: 'li', props: {}, children: ['Native dialogs — file open/save, message boxes'] },
                            { tag: 'li', props: {}, children: ['Keyboard shortcuts — global and app-level'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Edge'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Deploy to edge locations worldwide. The Edge Runtime provides distributed computing primitives for low-latency applications.'
                        ]
                    },
                    {
                        tag: 'ul', props: {}, children: [
                            { tag: 'li', props: {}, children: ['Regional deployment — run closest to users'] },
                            { tag: 'li', props: {}, children: ['Distributed cache with TTL'] },
                            { tag: 'li', props: {}, children: ['KV store for key-value data'] },
                            { tag: 'li', props: {}, children: ['Geo-routing — route by geography'] },
                            { tag: 'li', props: {}, children: ['State sync across edge nodes'] }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Building for Platforms'] },
                    { tag: 'p', props: {}, children: ['Target specific platforms with the build command:'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['# Build for specific targets\nluna build backend web\nluna build mobile\nluna build desktop\nluna build edge\n\n# Build for all configured platforms\nluna build'] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
