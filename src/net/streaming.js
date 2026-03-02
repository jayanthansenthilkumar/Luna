/**
 * LUNA Streaming Engine
 * 
 * Provides streaming capabilities:
 * - Server-Sent Events (SSE)
 * - Readable/Writable/Transform streams
 * - Stream composition
 * - Backpressure handling
 * - Stream multiplexing
 */

'use strict';

const { EventEmitter } = require('events');
const { Readable, Writable, Transform, pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

/**
 * Server-Sent Events (SSE) handler.
 */
class SSEConnection {
  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.id = 0;
    this.isOpen = true;

    // Set SSE headers
    res.header('content-type', 'text/event-stream');
    res.header('cache-control', 'no-cache');
    res.header('connection', 'keep-alive');
    res._raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Handle client disconnect
    req._raw.on('close', () => {
      this.isOpen = false;
    });
  }

  /**
   * Send an event.
   */
  send(data, event = null) {
    if (!this.isOpen) return;

    this.id++;
    let message = `id: ${this.id}\n`;
    if (event) message += `event: ${event}\n`;

    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    message += `data: ${payload}\n\n`;

    this.res._raw.write(message);
  }

  /**
   * Send a comment (keep-alive).
   */
  comment(text) {
    if (!this.isOpen) return;
    this.res._raw.write(`: ${text}\n\n`);
  }

  /**
   * Set the retry interval.
   */
  retry(ms) {
    if (!this.isOpen) return;
    this.res._raw.write(`retry: ${ms}\n\n`);
  }

  /**
   * Close the SSE connection.
   */
  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.res._raw.end();
  }
}

/**
 * Stream multiplexer – interleaves multiple readable streams.
 */
class StreamMultiplexer extends Readable {
  constructor(options = {}) {
    super(options);
    this.sources = [];
    this.activeCount = 0;
  }

  /**
   * Add a source stream with an optional tag.
   */
  addSource(stream, tag = null) {
    this.activeCount++;
    this.sources.push({ stream, tag });

    stream.on('data', (chunk) => {
      const data = tag
        ? Buffer.from(JSON.stringify({ tag, data: chunk.toString() }) + '\n')
        : chunk;
      if (!this.push(data)) {
        stream.pause();
      }
    });

    stream.on('end', () => {
      this.activeCount--;
      if (this.activeCount === 0) {
        this.push(null);
      }
    });

    stream.on('error', (err) => {
      this.destroy(err);
    });

    return this;
  }

  _read() {
    for (const { stream } of this.sources) {
      stream.resume();
    }
  }
}

/**
 * JSON Lines transform stream.
 */
class JSONLinesTransform extends Transform {
  constructor(options = {}) {
    super({ ...options, objectMode: true });
    this._buffer = '';
  }

  _transform(chunk, encoding, callback) {
    this._buffer += chunk.toString();
    const lines = this._buffer.split('\n');
    this._buffer = lines.pop(); // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim()) {
        try {
          this.push(JSON.parse(line));
        } catch (e) {
          this.push({ raw: line, error: e.message });
        }
      }
    }
    callback();
  }

  _flush(callback) {
    if (this._buffer.trim()) {
      try {
        this.push(JSON.parse(this._buffer));
      } catch (e) {
        this.push({ raw: this._buffer, error: e.message });
      }
    }
    callback();
  }
}

/**
 * Stream size limiter.
 */
class SizeLimitTransform extends Transform {
  constructor(maxBytes) {
    super();
    this.maxBytes = maxBytes;
    this.bytesRead = 0;
  }

  _transform(chunk, encoding, callback) {
    this.bytesRead += chunk.length;
    if (this.bytesRead > this.maxBytes) {
      callback(new Error(`Stream exceeded maximum size of ${this.maxBytes} bytes`));
    } else {
      this.push(chunk);
      callback();
    }
  }
}

/**
 * Chunked encoder transform.
 */
class ChunkedEncoder extends Transform {
  constructor(chunkSize = 16384) {
    super();
    this.chunkSize = chunkSize;
    this._buffer = Buffer.alloc(0);
  }

  _transform(chunk, encoding, callback) {
    this._buffer = Buffer.concat([this._buffer, chunk]);
    while (this._buffer.length >= this.chunkSize) {
      this.push(this._buffer.slice(0, this.chunkSize));
      this._buffer = this._buffer.slice(this.chunkSize);
    }
    callback();
  }

  _flush(callback) {
    if (this._buffer.length > 0) {
      this.push(this._buffer);
    }
    callback();
  }
}

/**
 * Main Stream Engine.
 */
class StreamEngine extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * Create an SSE connection from a request/response pair.
   */
  createSSE(req, res) {
    return new SSEConnection(req, res);
  }

  /**
   * Create a multiplexer.
   */
  multiplex() {
    return new StreamMultiplexer();
  }

  /**
   * Create a JSON Lines parser.
   */
  jsonLines() {
    return new JSONLinesTransform();
  }

  /**
   * Create a size limiter.
   */
  sizeLimit(maxBytes) {
    return new SizeLimitTransform(maxBytes);
  }

  /**
   * Create a chunked encoder.
   */
  chunked(chunkSize) {
    return new ChunkedEncoder(chunkSize);
  }

  /**
   * Compose streams into a pipeline.
   */
  async pipe(...streams) {
    return pipelineAsync(...streams);
  }

  /**
   * Create a readable stream from an iterable.
   */
  fromIterable(iterable) {
    return Readable.from(iterable);
  }

  /**
   * Create a readable stream from a string or buffer.
   */
  fromBuffer(data) {
    const readable = new Readable();
    readable.push(typeof data === 'string' ? Buffer.from(data) : data);
    readable.push(null);
    return readable;
  }

  /**
   * Collect a readable stream into a buffer.
   */
  async toBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
  }

  /**
   * Collect a readable stream into a string.
   */
  async toString(stream) {
    const buffer = await this.toBuffer(stream);
    return buffer.toString('utf-8');
  }
}

module.exports = {
  StreamEngine,
  SSEConnection,
  StreamMultiplexer,
  JSONLinesTransform,
  SizeLimitTransform,
  ChunkedEncoder
};
