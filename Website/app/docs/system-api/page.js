/**
 * System API Docs  —  app/docs/system-api/page.js  →  /docs/system-api
 */
const { docsSidebar } = require('../page');

module.exports = function SystemAPIDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['System API'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LUNA provides a unified System API that abstracts platform-specific operations behind a consistent interface.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Filesystem'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const fs = app.system.fs;\n\n// Read & write\nconst data = await fs.read('/path/to/file.txt');\nawait fs.write('/path/to/output.txt', data);\n\n// Watch for changes\nfs.watch('/src', (event, path) => {\n  console.log(`${event}: ${path}`);\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Process'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const proc = app.system.process;\n\nconsole.log(proc.pid);\nconsole.log(proc.env.NODE_ENV);\nconsole.log(proc.memoryUsage());\n\nproc.on('signal', (sig) => {\n  console.log('Received:', sig);\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Crypto'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const crypto = app.system.crypto;\n\nconst hash = crypto.hash('sha256', 'hello');\nconst uuid = crypto.uuid();\nconst random = crypto.randomBytes(32);"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Platform Detection'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const platform = app.system.platform;\n\nconsole.log(platform.os);     // 'linux' | 'darwin' | 'win32'\nconsole.log(platform.arch);   // 'x64' | 'arm64'\nconsole.log(platform.target); // 'backend' | 'web' | 'mobile' | 'desktop' | 'edge'"] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
