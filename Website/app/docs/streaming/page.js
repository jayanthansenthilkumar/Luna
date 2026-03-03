/**
 * Streaming & SSE Docs  —  app/docs/streaming/page.js  →  /docs/streaming
 */
const { docsSidebar } = require('../page');

module.exports = function StreamingDocsPage() {
    return {
        tag: 'div',
        props: { className: 'docs-layout' },
        children: [
            docsSidebar(),
            {
                tag: 'div',
                props: { className: 'docs-content' },
                children: [
                    { tag: 'h1', props: {}, children: ['Streaming & SSE'] },
                    {
                        tag: 'p', props: { className: 'docs-lead' }, children: [
                            'LUNA\'s streaming module supports Server-Sent Events, HTTP streaming, and chunked transfer encoding with built-in backpressure handling.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Server-Sent Events'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["app.router.get('/events', (req, res) => {\n  res.sse();\n\n  const interval = setInterval(() => {\n    res.sendEvent({\n      event: 'tick',\n      data: { time: Date.now() }\n    });\n  }, 1000);\n\n  req.on('close', () => clearInterval(interval));\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['HTTP Streaming'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["app.router.get('/download', async (req, res) => {\n  const stream = app.system.fs.createReadStream('/large-file.zip');\n  res.stream(stream, {\n    contentType: 'application/zip',\n    filename: 'archive.zip'\n  });\n});"] }
                                ]
                            }
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Backpressure'] },
                    {
                        tag: 'p', props: {}, children: [
                            'LUNA\'s streams implement automatic backpressure. When the client cannot consume data fast enough, the stream pauses until the client is ready — preventing memory from growing unbounded.'
                        ]
                    },

                    { tag: 'h2', props: {}, children: ['Pipelines'] },
                    {
                        tag: 'div',
                        props: { className: 'hero-code docs-code' },
                        children: [
                            {
                                tag: 'pre', props: { className: 'code-block' }, children: [
                                    { tag: 'code', props: {}, children: ["const { pipeline } = require('@luna/runtime/net/streaming');\n\nawait pipeline(\n  fs.createReadStream('input.txt'),\n  transformStream,\n  compressStream,\n  fs.createWriteStream('output.gz')\n);"] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
};
