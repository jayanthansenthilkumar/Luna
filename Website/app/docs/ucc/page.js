/**
 * UCC Docs  —  app/docs/ucc/page.js  →  /docs/ucc
 */
const { docsSidebar } = require('../page');

module.exports = function UCCDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Universal Code Continuity'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'UCC lets you write code once and run it across server, client, mobile, desktop, and edge — with automatic platform adaptation.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['How It Works'] },
                    {
                        tag: 'p', props: {}, children: [
                            'LUNA analyzes your code at build time and generates platform-specific variants. The same function might use Node.js fs on the server, IndexedDB in the browser, and SQLite on mobile — but you write it once with the LUNA System API.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Example'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["// This code runs everywhere\nconst { store } = require('@luna/runtime/ucc/continuity');\n\nasync function saveUserPrefs(prefs) {\n  await store.set('user-prefs', prefs);\n}\n\nasync function loadUserPrefs() {\n  return await store.get('user-prefs');\n}\n\n// On server  → writes to filesystem / database\n// On web     → writes to IndexedDB / localStorage\n// On mobile  → writes to SQLite\n// On desktop → writes to app data directory\n// On edge    → writes to KV store"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['State Transfer'] },
                    {
                        tag: 'p', props: {}, children: [
                            'UCC can serialize and transfer application state between platforms. Start a task on mobile, continue on desktop — the state follows the user.'
                        ]
                    },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const { continuity } = require('@luna/runtime/ucc/continuity');\n\n// Capture state\nconst snapshot = await continuity.capture();\n\n// Transfer to another device / platform\nawait continuity.transfer(snapshot, 'desktop-client-id');\n\n// Restore on the other side\nawait continuity.restore(snapshot);"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Platform-Specific Overrides'] },
                    {
                        tag: 'p', props: {}, children: [
                            'When you need platform-specific behavior, use conditional blocks:'
                        ]
                    },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const { platform } = require('@luna/runtime/core/system-api');\n\nif (platform.target === 'mobile') {\n  // Mobile-specific haptic feedback\n  app.bridge.haptic('impact');\n} else if (platform.target === 'desktop') {\n  // Desktop-specific notification\n  app.shell.notify('Task saved');\n}"] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
