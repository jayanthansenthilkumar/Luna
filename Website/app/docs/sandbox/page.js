/**
 * Sandbox & Security Docs  —  app/docs/sandbox/page.js  →  /docs/sandbox
 */
const { docsSidebar } = require('../page');

module.exports = function SandboxDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Sandbox & Security'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LUNA uses a capability-based security model. Modules must declare their permissions, and the sandbox enforces access control.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Capabilities'] },
                    {
                        tag: 'table',
                        props: { className: 'docs-table' },
                        children: [
                            {
                                tag: 'thead', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'th', props: {}, children: ['Capability'] },
                                            { tag: 'th', props: {}, children: ['Grants Access To'] }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: 'tbody', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['fs'] }] },
                                            { tag: 'td', props: {}, children: ['Filesystem read/write'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['net'] }] },
                                            { tag: 'td', props: {}, children: ['Network access (HTTP, WebSocket, TCP)'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['env'] }] },
                                            { tag: 'td', props: {}, children: ['Environment variables'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['process'] }] },
                                            { tag: 'td', props: {}, children: ['Child process spawning'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['ffi'] }] },
                                            { tag: 'td', props: {}, children: ['Foreign function interface (native code)'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['gpu'] }] },
                                            { tag: 'td', props: {}, children: ['GPU compute access'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['camera'] }] },
                                            { tag: 'td', props: {}, children: ['Camera and media capture'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: [{ tag: 'code', props: {}, children: ['location'] }] },
                                            { tag: 'td', props: {}, children: ['GPS and geolocation'] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Configuration'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['// luna.json\n"runtime": {\n  "sandbox": {\n    "enabled": true,\n    "capabilities": ["fs", "net", "env"]\n  }\n}'] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['How It Works'] },
                    {
                        tag: 'p', props: {}, children: [
                            'When sandbox mode is enabled, LUNA intercepts all system calls. If a module attempts to access a resource it hasn\'t been granted permission for, the sandbox throws a SecurityError. This prevents untrusted packages from accessing the filesystem, network, or device APIs without explicit consent.'
                        ]
                    }
                ]
            }
        ]
    };
};
