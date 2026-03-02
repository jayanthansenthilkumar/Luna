/**
 * LUNA Native System APIs
 * 
 * Provides safe, capability-gated access to underlying OS resources
 * including file system, networking, process management, and hardware.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { EventEmitter } = require('events');
const crypto = require('crypto');

class SystemAPI extends EventEmitter {
  constructor(sandbox) {
    super();
    this.sandbox = sandbox;
  }

  // ─── File System API ──────────────────────────────────────────

  get fs() {
    return {
      readFile: async (filePath, options = 'utf-8') => {
        this.sandbox.check('fs', 'read');
        return fs.promises.readFile(path.resolve(filePath), options);
      },
      writeFile: async (filePath, content, options = 'utf-8') => {
        this.sandbox.check('fs', 'write');
        const dir = path.dirname(path.resolve(filePath));
        await fs.promises.mkdir(dir, { recursive: true });
        return fs.promises.writeFile(path.resolve(filePath), content, options);
      },
      readDir: async (dirPath) => {
        this.sandbox.check('fs', 'list');
        return fs.promises.readdir(path.resolve(dirPath), { withFileTypes: true });
      },
      mkdir: async (dirPath, options = { recursive: true }) => {
        this.sandbox.check('fs', 'write');
        return fs.promises.mkdir(path.resolve(dirPath), options);
      },
      remove: async (filePath) => {
        this.sandbox.check('fs', 'delete');
        return fs.promises.rm(path.resolve(filePath), { recursive: true, force: true });
      },
      exists: async (filePath) => {
        this.sandbox.check('fs', 'read');
        try {
          await fs.promises.access(path.resolve(filePath));
          return true;
        } catch {
          return false;
        }
      },
      stat: async (filePath) => {
        this.sandbox.check('fs', 'read');
        return fs.promises.stat(path.resolve(filePath));
      },
      copy: async (src, dest) => {
        this.sandbox.check('fs', 'read');
        this.sandbox.check('fs', 'write');
        return fs.promises.copyFile(path.resolve(src), path.resolve(dest));
      },
      watch: (dirPath, callback) => {
        this.sandbox.check('fs', 'watch');
        const watcher = fs.watch(path.resolve(dirPath), { recursive: true }, (eventType, filename) => {
          callback({ type: eventType, file: filename });
        });
        return {
          close: () => watcher.close()
        };
      },
      createReadStream: (filePath, options) => {
        this.sandbox.check('fs', 'read');
        return fs.createReadStream(path.resolve(filePath), options);
      },
      createWriteStream: (filePath, options) => {
        this.sandbox.check('fs', 'write');
        return fs.createWriteStream(path.resolve(filePath), options);
      }
    };
  }

  // ─── OS API ───────────────────────────────────────────────────

  get os() {
    return {
      platform: () => os.platform(),
      arch: () => os.arch(),
      cpus: () => os.cpus(),
      totalMemory: () => os.totalmem(),
      freeMemory: () => os.freemem(),
      uptime: () => os.uptime(),
      hostname: () => os.hostname(),
      homedir: () => os.homedir(),
      tmpdir: () => os.tmpdir(),
      networkInterfaces: () => {
        this.sandbox.check('net', 'tcp');
        return os.networkInterfaces();
      },
      loadavg: () => os.loadavg(),
      userInfo: () => {
        this.sandbox.check('env', 'read');
        return os.userInfo();
      }
    };
  }

  // ─── Process API ──────────────────────────────────────────────

  get process() {
    return {
      pid: () => process.pid,
      ppid: () => process.ppid,
      argv: () => [...process.argv],
      cwd: () => process.cwd(),
      env: (key) => {
        this.sandbox.check('env', 'read');
        return process.env[key];
      },
      memoryUsage: () => process.memoryUsage(),
      cpuUsage: () => process.cpuUsage(),
      uptime: () => process.uptime(),
      exit: (code = 0) => {
        this.sandbox.check('process', 'exit');
        process.exit(code);
      },
      spawn: (command, args = [], options = {}) => {
        this.sandbox.check('process', 'spawn');
        const { spawn } = require('child_process');
        return spawn(command, args, { stdio: 'pipe', ...options });
      },
      exec: (command, options = {}) => {
        this.sandbox.check('process', 'exec');
        const { exec } = require('child_process');
        return new Promise((resolve, reject) => {
          exec(command, options, (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve({ stdout, stderr });
          });
        });
      }
    };
  }

  // ─── Crypto API ───────────────────────────────────────────────

  get crypto() {
    return {
      randomBytes: (size) => crypto.randomBytes(size),
      randomUUID: () => crypto.randomUUID(),
      hash: (algorithm, data, encoding = 'hex') => {
        return crypto.createHash(algorithm).update(data).digest(encoding);
      },
      hmac: (algorithm, key, data, encoding = 'hex') => {
        return crypto.createHmac(algorithm, key).update(data).digest(encoding);
      },
      encrypt: (algorithm, key, iv, data) => {
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        return Buffer.concat([cipher.update(data), cipher.final()]);
      },
      decrypt: (algorithm, key, iv, data) => {
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        return Buffer.concat([decipher.update(data), decipher.final()]);
      }
    };
  }

  // ─── Path API ─────────────────────────────────────────────────

  get path() {
    return {
      resolve: (...args) => path.resolve(...args),
      join: (...args) => path.join(...args),
      dirname: (p) => path.dirname(p),
      basename: (p, ext) => path.basename(p, ext),
      extname: (p) => path.extname(p),
      parse: (p) => path.parse(p),
      format: (obj) => path.format(obj),
      isAbsolute: (p) => path.isAbsolute(p),
      relative: (from, to) => path.relative(from, to),
      normalize: (p) => path.normalize(p),
      sep: path.sep
    };
  }
}

module.exports = { SystemAPI };
