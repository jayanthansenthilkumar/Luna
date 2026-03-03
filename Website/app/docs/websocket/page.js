/**
 * WebSocket Docs  —  app/docs/websocket/page.js  →  /docs/websocket
 */
const { docsSidebar } = require('../page');

module.exports = function WebSocketDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['WebSocket'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'Built-in WebSocket server and client with rooms/channels, binary support, and automatic reconnection.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Server'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const ws = app.websocket;\n\nws.on('connection', (socket) => {\n  console.log('Client connected:', socket.id);\n\n  socket.on('message', (data) => {\n    socket.send(JSON.stringify({ echo: data }));\n  });\n\n  socket.on('close', () => {\n    console.log('Client disconnected');\n  });\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Rooms & Channels'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["ws.on('connection', (socket) => {\n  socket.join('chat-room');\n\n  socket.on('message', (data) => {\n    // Broadcast to room (excluding sender)\n    ws.to('chat-room').broadcast(data, socket);\n  });\n\n  socket.on('close', () => {\n    socket.leave('chat-room');\n  });\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Binary Data'] },
                    {
                        tag: 'p', props: {}, children: [
                            'WebSocket supports ArrayBuffer and Buffer payloads natively. Use socket.sendBinary() for optimized binary transfer.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Auto-Reconnection (Client)'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const client = ws.connect('ws://localhost:3000', {\n  reconnect: true,\n  maxRetries: 5,\n  backoff: 'exponential'\n});"] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
