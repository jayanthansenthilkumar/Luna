/**
 * Scheduler Docs  —  app/docs/scheduler/page.js  →  /docs/scheduler
 */
const { docsSidebar } = require('../page');

module.exports = function SchedulerDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Scheduler'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LUNA\'s scheduler manages task execution with lock-free queues, priority levels, and configurable worker pools.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Priority Levels'] },
                    {
                        tag: 'table',
                        props: { className: 'docs-table' },
                        children: [
                            {
                                tag: 'thead', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'th', props: {}, children: ['Priority'] },
                                            { tag: 'th', props: {}, children: ['Use Case'] }
                                        ]
                                    }
                                ]
                            },
                            {
                                tag: 'tbody', props: {}, children: [
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Critical'] },
                                            { tag: 'td', props: {}, children: ['Security, error handling — runs immediately'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['High'] },
                                            { tag: 'td', props: {}, children: ['User interactions, API responses'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Normal'] },
                                            { tag: 'td', props: {}, children: ['Default priority for most tasks'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Low'] },
                                            { tag: 'td', props: {}, children: ['Background processing, analytics'] }
                                        ]
                                    },
                                    {
                                        tag: 'tr', props: {}, children: [
                                            { tag: 'td', props: {}, children: ['Idle'] },
                                            { tag: 'td', props: {}, children: ['Cleanup, prefetching — runs when idle'] }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Scheduling Tasks'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["app.scheduler.schedule(async () => {\n  await sendEmail(user);\n}, { priority: 'high' });\n\napp.scheduler.schedule(() => {\n  cleanupTempFiles();\n}, { priority: 'idle' });"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Worker Pools'] },
                    {
                        tag: 'p', props: {}, children: [
                            'Configure the number of worker and I/O threads in luna.json. Worker threads handle CPU-bound tasks, while I/O threads handle file and network operations.'
                        ]
                    },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ['// luna.json\n"runtime": {\n  "scheduler": {\n    "workerThreads": 4,\n    "ioThreads": 2\n  }\n}'] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
