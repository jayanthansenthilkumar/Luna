/**
 * LUNA WebSocket Server
 * 
 * Native WebSocket implementation with:
 * - Connection management
 * - Room/channel support
 * - Broadcasting
 * - Heartbeat/ping-pong
 * - Message routing
 * - Binary & text frames
 */

'use strict';

const { EventEmitter } = require('events');
const crypto = require('crypto');

const WS_GUID = '258EAFA5-E914-47DA-95CA-5AB5DC11650A';
const OPCODE = {
  CONTINUATION: 0x0,
  TEXT: 0x1,
  BINARY: 0x2,
  CLOSE: 0x8,
  PING: 0x9,
  PONG: 0xA
};

/**
 * A single WebSocket connection.
 */
class WebSocketConnection extends EventEmitter {
  constructor(socket, id) {
    super();
    this.socket = socket;
    this.id = id;
    this.readyState = 'open';
    this.rooms = new Set();
    this.metadata = {};
    this._buffer = Buffer.alloc(0);

    this.socket.on('data', (data) => this._onData(data));
    this.socket.on('close', () => this._onClose());
    this.socket.on('error', (err) => this.emit('error', err));
  }

  /**
   * Send a text message.
   */
  send(data) {
    if (this.readyState !== 'open') return;
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    this._sendFrame(Buffer.from(payload, 'utf-8'), OPCODE.TEXT);
  }

  /**
   * Send binary data.
   */
  sendBinary(data) {
    if (this.readyState !== 'open') return;
    this._sendFrame(Buffer.isBuffer(data) ? data : Buffer.from(data), OPCODE.BINARY);
  }

  /**
   * Send a ping.
   */
  ping(data = '') {
    this._sendFrame(Buffer.from(data), OPCODE.PING);
  }

  /**
   * Close the connection.
   */
  close(code = 1000, reason = '') {
    if (this.readyState !== 'open') return;
    this.readyState = 'closing';
    const buf = Buffer.alloc(2 + Buffer.byteLength(reason));
    buf.writeUInt16BE(code, 0);
    buf.write(reason, 2);
    this._sendFrame(buf, OPCODE.CLOSE);
    setTimeout(() => {
      if (this.socket && !this.socket.destroyed) {
        this.socket.destroy();
      }
    }, 3000);
  }

  /**
   * Join a room.
   */
  join(room) {
    this.rooms.add(room);
    return this;
  }

  /**
   * Leave a room.
   */
  leave(room) {
    this.rooms.delete(room);
    return this;
  }

  /**
   * Process incoming raw data.
   */
  _onData(data) {
    this._buffer = Buffer.concat([this._buffer, data]);
    this._processFrames();
  }

  /**
   * Process WebSocket frames from buffer.
   */
  _processFrames() {
    while (this._buffer.length >= 2) {
      const firstByte = this._buffer[0];
      const secondByte = this._buffer[1];
      const opcode = firstByte & 0x0F;
      const isMasked = (secondByte & 0x80) !== 0;
      let payloadLength = secondByte & 0x7F;
      let offset = 2;

      if (payloadLength === 126) {
        if (this._buffer.length < 4) return;
        payloadLength = this._buffer.readUInt16BE(2);
        offset = 4;
      } else if (payloadLength === 127) {
        if (this._buffer.length < 10) return;
        payloadLength = Number(this._buffer.readBigUInt64BE(2));
        offset = 10;
      }

      if (isMasked) {
        if (this._buffer.length < offset + 4 + payloadLength) return;
        const mask = this._buffer.slice(offset, offset + 4);
        offset += 4;
        const payload = this._buffer.slice(offset, offset + payloadLength);
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= mask[i % 4];
        }
        this._handleFrame(opcode, payload);
      } else {
        if (this._buffer.length < offset + payloadLength) return;
        const payload = this._buffer.slice(offset, offset + payloadLength);
        this._handleFrame(opcode, payload);
      }

      this._buffer = this._buffer.slice(offset + payloadLength);
    }
  }

  /**
   * Handle a decoded frame.
   */
  _handleFrame(opcode, payload) {
    switch (opcode) {
      case OPCODE.TEXT:
        const text = payload.toString('utf-8');
        try {
          const json = JSON.parse(text);
          this.emit('message', json, 'json');
        } catch {
          this.emit('message', text, 'text');
        }
        break;
      case OPCODE.BINARY:
        this.emit('message', payload, 'binary');
        break;
      case OPCODE.PING:
        this._sendFrame(payload, OPCODE.PONG);
        this.emit('ping', payload);
        break;
      case OPCODE.PONG:
        this.emit('pong', payload);
        break;
      case OPCODE.CLOSE:
        this._onClose();
        break;
    }
  }

  /**
   * Build and send a WebSocket frame.
   */
  _sendFrame(payload, opcode) {
    if (!this.socket || this.socket.destroyed) return;

    const length = payload.length;
    let header;

    if (length < 126) {
      header = Buffer.alloc(2);
      header[0] = 0x80 | opcode;
      header[1] = length;
    } else if (length < 65536) {
      header = Buffer.alloc(4);
      header[0] = 0x80 | opcode;
      header[1] = 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x80 | opcode;
      header[1] = 127;
      header.writeBigUInt64BE(BigInt(length), 2);
    }

    this.socket.write(Buffer.concat([header, payload]));
  }

  /**
   * Handle connection close.
   */
  _onClose() {
    if (this.readyState === 'closed') return;
    this.readyState = 'closed';
    this.rooms.clear();
    this.emit('close');
  }
}

/**
 * Main WebSocket Server.
 */
class WebSocketServer extends EventEmitter {
  constructor(httpServer, options = {}) {
    super();
    this.connections = new Map();
    this.rooms = new Map();
    this.routes = new Map();
    this.options = {
      path: options.path || null,
      heartbeatInterval: options.heartbeatInterval || 30000,
      maxConnections: options.maxConnections || 10000,
      ...options
    };

    this._idCounter = 0;
    this._heartbeatTimer = null;

    if (httpServer && httpServer.getServer) {
      this._attachToServer(httpServer.getServer());
    } else if (httpServer && httpServer.on) {
      this._attachToServer(httpServer);
    }
  }

  /**
   * Attach to an HTTP server for upgrade handling.
   */
  _attachToServer(server) {
    if (!server) return;
    server.on('upgrade', (req, socket, head) => {
      if (this.options.path && !req.url.startsWith(this.options.path)) {
        socket.destroy();
        return;
      }
      this._handleUpgrade(req, socket, head);
    });

    this._startHeartbeat();
  }

  /**
   * Handle the WebSocket upgrade handshake.
   */
  _handleUpgrade(req, socket, head) {
    const key = req.headers['sec-websocket-key'];
    if (!key) {
      socket.destroy();
      return;
    }

    const acceptKey = crypto
      .createHash('sha1')
      .update(key + WS_GUID)
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptKey}`,
      '', ''
    ].join('\r\n');

    socket.write(headers);

    const id = `ws_${++this._idCounter}`;
    const connection = new WebSocketConnection(socket, id);

    if (this.connections.size >= this.options.maxConnections) {
      connection.close(1013, 'Max connections reached');
      return;
    }

    this.connections.set(id, connection);
    connection.on('close', () => {
      this.connections.delete(id);
      this._removeFromAllRooms(connection);
      this.emit('disconnect', connection);
    });

    this.emit('connection', connection, req);
  }

  /**
   * Register a message handler for a route pattern.
   */
  on_message(route, handler) {
    this.routes.set(route, handler);
    return this;
  }

  /**
   * Broadcast a message to all connected clients.
   */
  broadcast(data, exclude = null) {
    for (const [id, conn] of this.connections) {
      if (exclude && exclude.id === id) continue;
      conn.send(data);
    }
  }

  /**
   * Broadcast to a specific room.
   */
  broadcastToRoom(room, data, exclude = null) {
    const members = this.rooms.get(room);
    if (!members) return;

    for (const conn of members) {
      if (exclude && exclude.id === conn.id) continue;
      conn.send(data);
    }
  }

  /**
   * Add a connection to a room.
   */
  joinRoom(connection, room) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    this.rooms.get(room).add(connection);
    connection.join(room);
    this.emit('roomJoin', { connection, room });
  }

  /**
   * Remove a connection from a room.
   */
  leaveRoom(connection, room) {
    const members = this.rooms.get(room);
    if (members) {
      members.delete(connection);
      if (members.size === 0) {
        this.rooms.delete(room);
      }
    }
    connection.leave(room);
    this.emit('roomLeave', { connection, room });
  }

  /**
   * Remove a connection from all rooms.
   */
  _removeFromAllRooms(connection) {
    for (const room of connection.rooms) {
      this.leaveRoom(connection, room);
    }
  }

  /**
   * Start heartbeat pings.
   */
  _startHeartbeat() {
    this._heartbeatTimer = setInterval(() => {
      for (const [id, conn] of this.connections) {
        if (conn.readyState === 'open') {
          conn.ping();
        }
      }
    }, this.options.heartbeatInterval);

    if (this._heartbeatTimer.unref) {
      this._heartbeatTimer.unref();
    }
  }

  /**
   * Get connection count.
   */
  get connectionCount() {
    return this.connections.size;
  }

  /**
   * Close all connections and stop the server.
   */
  async close() {
    clearInterval(this._heartbeatTimer);
    for (const [id, conn] of this.connections) {
      conn.close(1001, 'Server shutting down');
    }
    this.connections.clear();
    this.rooms.clear();
  }
}

module.exports = { WebSocketServer, WebSocketConnection };
