/**
 * LUNA Package Registry
 * 
 * Multi-source registry supporting:
 * - Built-in @luna/* packages (bundled with the runtime)
 * - Local file-based registry (~/.luna/registry/)
 * - Remote HTTP registries
 * - Package search & metadata
 * - Integrity verification
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const https = require('https');
const { EventEmitter } = require('events');

// ── Integrity Helpers ─────────────────────────────────

function computeIntegrity(buffer) {
  const hash = crypto.createHash('sha512').update(buffer).digest('base64');
  return `sha512-${hash}`;
}

function verifyIntegrity(buffer, expected) {
  if (!expected) return true;
  return computeIntegrity(buffer) === expected;
}

// ── Built-in Package Definitions ──────────────────────

/**
 * Maps @luna/* package names to their source modules within the runtime.
 * Each entry describes a package that ships with Luna itself.
 */
function getBuiltinPackages(lunaRoot) {
  const root = lunaRoot || path.resolve(__dirname, '..', '..');

  return {
    '@luna/core': {
      name: '@luna/core',
      version: '0.1.0',
      description: 'LUNA core engine – scheduler, sandbox, lifecycle hooks, system API',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'core'),
      files: ['engine.js'],
      dependencies: {},
      keywords: ['core', 'engine', 'scheduler', 'sandbox']
    },
    '@luna/net': {
      name: '@luna/net',
      version: '0.1.0',
      description: 'LUNA networking – HTTP server, router, middleware, WebSocket, streaming',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'net'),
      files: ['http-server.js', 'router.js', 'middleware.js', 'websocket.js', 'streaming.js'],
      dependencies: {},
      keywords: ['http', 'server', 'router', 'websocket', 'middleware']
    },
    '@luna/ui': {
      name: '@luna/ui',
      version: '0.1.0',
      description: 'LUNA UI engine – VDOM, components, signals, SSR/SSG/ISR, hydration',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'ui'),
      files: ['engine.js', 'reactive-state.js', 'ssr.js'],
      dependencies: {},
      keywords: ['ui', 'vdom', 'ssr', 'components', 'signals']
    },
    '@luna/state': {
      name: '@luna/state',
      version: '0.1.0',
      description: 'LUNA reactive state – signals, stores, computed values, effects',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'ui'),
      files: ['reactive-state.js'],
      dependencies: {},
      keywords: ['state', 'signals', 'reactive', 'store']
    },
    '@luna/qsr': {
      name: '@luna/qsr',
      version: '0.1.0',
      description: 'Quantum State Rendering – cross-platform live-state graph',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'qsr'),
      files: ['quantum-state.js'],
      dependencies: {},
      keywords: ['qsr', 'quantum', 'state', 'reactive']
    },
    '@luna/optimizer': {
      name: '@luna/optimizer',
      version: '0.1.0',
      description: 'Self-evolving optimizer – hot path detection, auto-memoization',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'optimizer'),
      files: ['self-evolving.js'],
      dependencies: {},
      keywords: ['optimizer', 'performance', 'memoization']
    },
    '@luna/ucc': {
      name: '@luna/ucc',
      version: '0.1.0',
      description: 'Universal Code Continuity – platform-adaptive modules, context migration',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'ucc'),
      files: ['continuity.js'],
      dependencies: {},
      keywords: ['ucc', 'continuity', 'platform', 'migration']
    },
    '@luna/mobile': {
      name: '@luna/mobile',
      version: '0.1.0',
      description: 'LUNA mobile bridge – camera, GPS, biometrics, haptics, notifications',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'mobile'),
      files: ['bridge.js'],
      dependencies: {},
      keywords: ['mobile', 'bridge', 'native', 'camera', 'gps']
    },
    '@luna/desktop': {
      name: '@luna/desktop',
      version: '0.1.0',
      description: 'LUNA desktop shell – window management, menus, tray, dialogs',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'desktop'),
      files: ['shell.js'],
      dependencies: {},
      keywords: ['desktop', 'window', 'shell', 'tray', 'menu']
    },
    '@luna/edge': {
      name: '@luna/edge',
      version: '0.1.0',
      description: 'LUNA edge runtime – geo-routing, KV store, distributed cache',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'edge'),
      files: ['runtime.js'],
      dependencies: {},
      keywords: ['edge', 'serverless', 'runtime', 'kv-store']
    },
    '@luna/build': {
      name: '@luna/build',
      version: '0.1.0',
      description: 'LUNA build system – bundler, minifier, multi-target deploy',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'build'),
      files: ['builder.js'],
      dependencies: {},
      keywords: ['build', 'bundle', 'deploy', 'minify']
    },
    '@luna/module': {
      name: '@luna/module',
      version: '0.1.0',
      description: 'LUNA module resolver – custom resolution, namespaces, HMR',
      entry: 'index.js',
      sourceDir: path.join(root, 'src', 'module'),
      files: ['resolver.js'],
      dependencies: {},
      keywords: ['module', 'resolver', 'import', 'hmr']
    }
  };
}

// ── Built-in Registry ─────────────────────────────────

/**
 * Registry backed by Luna's own bundled source modules.
 * Provides @luna/* packages without network access.
 */
class BuiltinRegistry extends EventEmitter {
  constructor(lunaRoot) {
    super();
    this.type = 'builtin';
    this.packages = getBuiltinPackages(lunaRoot);
  }

  /**
   * Check if this registry serves a given package.
   */
  has(name) {
    return name in this.packages;
  }

  /**
   * Get package metadata.
   */
  async getPackage(name) {
    const def = this.packages[name];
    if (!def) return null;

    return {
      name: def.name,
      description: def.description,
      latest: def.version,
      versions: [{
        version: def.version,
        integrity: null,
        dependencies: def.dependencies,
        publishedAt: '2025-01-01T00:00:00.000Z',
        size: 0
      }],
      keywords: def.keywords
    };
  }

  /**
   * Fetch the package contents (creates a bundle buffer).
   * Returns { files: { relativePath: Buffer }, meta: {...} }
   */
  async fetchPackage(name, version) {
    const def = this.packages[name];
    if (!def) throw new Error(`Built-in package not found: ${name}`);

    const files = {};

    // Copy each source file
    for (const file of def.files) {
      const srcPath = path.join(def.sourceDir, file);
      if (fs.existsSync(srcPath)) {
        files[file] = fs.readFileSync(srcPath);
      }
    }

    // Generate an index.js that re-exports the module
    const indexContent = this._generateIndex(def);
    files['index.js'] = Buffer.from(indexContent, 'utf-8');

    // Generate a luna.json manifest for the package
    const manifest = {
      name: def.name,
      version: def.version,
      description: def.description,
      entry: 'index.js',
      dependencies: def.dependencies
    };
    files['luna.json'] = Buffer.from(JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

    return { files, meta: manifest };
  }

  /**
   * Generate an index.js barrel file for a built-in package.
   */
  _generateIndex(def) {
    const lines = [
      `'use strict';`,
      `/**`,
      ` * ${def.name} — Auto-generated barrel export`,
      ` * ${def.description}`,
      ` */`,
      ``
    ];

    for (const file of def.files) {
      const modName = path.basename(file, path.extname(file));
      lines.push(`const _${modName.replace(/[^a-zA-Z0-9]/g, '_')} = require('./${file}');`);
    }

    lines.push('');
    lines.push('module.exports = Object.assign(');
    lines.push('  {},');
    for (const file of def.files) {
      const modName = path.basename(file, path.extname(file));
      lines.push(`  _${modName.replace(/[^a-zA-Z0-9]/g, '_')},`);
    }
    lines.push(');');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Search built-in packages.
   */
  async search(query, options = {}) {
    const limit = options.limit || 20;
    const results = [];
    const q = query.toLowerCase();

    for (const [name, def] of Object.entries(this.packages)) {
      const matches = name.toLowerCase().includes(q) ||
        def.description.toLowerCase().includes(q) ||
        def.keywords.some(k => k.toLowerCase().includes(q));

      if (matches) {
        results.push({
          name: def.name,
          description: def.description,
          version: def.version,
          source: 'builtin'
        });
        if (results.length >= limit) break;
      }
    }

    return results;
  }

  /**
   * List all built-in packages.
   */
  list() {
    return Object.values(this.packages).map(def => ({
      name: def.name,
      version: def.version,
      description: def.description
    }));
  }
}

// ── Local File Registry ───────────────────────────────

/**
 * File-based registry stored at a local path.
 * Used for offline packages, private registries, and testing.
 * Structure:
 *   <registryDir>/
 *     <package-name>/
 *       <version>/
 *         luna.json
 *         *.js
 */
class LocalRegistry extends EventEmitter {
  constructor(registryDir) {
    super();
    this.type = 'local';
    this.dir = registryDir || path.join(
      process.env.LUNA_HOME || path.join(require('os').homedir(), '.luna'),
      'registry'
    );
    this._ensureDir(this.dir);
  }

  _ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Get the storage path for a package (handles scoped packages).
   */
  _packageDir(name, version) {
    // @scope/pkg → @scope/pkg
    const parts = version
      ? [this.dir, ...name.split('/'), version]
      : [this.dir, ...name.split('/')];
    return path.join(...parts);
  }

  has(name) {
    return fs.existsSync(this._packageDir(name));
  }

  async getPackage(name) {
    const pkgDir = this._packageDir(name);
    if (!fs.existsSync(pkgDir)) return null;

    const versions = fs.readdirSync(pkgDir)
      .filter(f => fs.statSync(path.join(pkgDir, f)).isDirectory());

    if (versions.length === 0) return null;

    const versionMeta = [];
    for (const ver of versions) {
      const manifestPath = path.join(pkgDir, ver, 'luna.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        versionMeta.push({
          version: manifest.version || ver,
          integrity: manifest.integrity || null,
          dependencies: manifest.dependencies || {},
          publishedAt: manifest.publishedAt || null,
          size: manifest.size || 0
        });
      }
    }

    return {
      name,
      description: versionMeta[0]?.description || '',
      latest: versions.sort().pop(),
      versions: versionMeta
    };
  }

  async fetchPackage(name, version) {
    const versionDir = this._packageDir(name, version);
    if (!fs.existsSync(versionDir)) {
      throw new Error(`Package ${name}@${version} not found in local registry`);
    }

    const files = {};
    const entries = fs.readdirSync(versionDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        files[entry.name] = fs.readFileSync(path.join(versionDir, entry.name));
      }
    }

    const manifestPath = path.join(versionDir, 'luna.json');
    const meta = fs.existsSync(manifestPath)
      ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      : { name, version };

    return { files, meta };
  }

  /**
   * Publish a package to the local registry.
   */
  async publish(name, version, files, meta = {}) {
    const versionDir = this._packageDir(name, version);
    this._ensureDir(versionDir);

    for (const [fileName, content] of Object.entries(files)) {
      const filePath = path.join(versionDir, fileName);
      this._ensureDir(path.dirname(filePath));
      fs.writeFileSync(filePath, content);
    }

    // Ensure luna.json exists
    const manifestPath = path.join(versionDir, 'luna.json');
    if (!fs.existsSync(manifestPath)) {
      fs.writeFileSync(manifestPath, JSON.stringify({
        name,
        version,
        ...meta,
        publishedAt: new Date().toISOString()
      }, null, 2) + '\n');
    }

    this.emit('publish', { name, version });
    return { ok: true, name, version };
  }

  async search(query, options = {}) {
    const limit = options.limit || 20;
    const results = [];
    const q = query.toLowerCase();

    if (!fs.existsSync(this.dir)) return results;

    const scanDir = (dir, prefix = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (results.length >= limit) return;
        if (!entry.isDirectory()) continue;

        const fullName = prefix ? `${prefix}/${entry.name}` : entry.name;

        // Scoped package: @scope/
        if (entry.name.startsWith('@')) {
          scanDir(path.join(dir, entry.name), entry.name);
          continue;
        }

        if (fullName.toLowerCase().includes(q)) {
          results.push({ name: fullName, source: 'local' });
        }
      }
    };

    scanDir(this.dir);
    return results;
  }
}

// ── Remote Registry ───────────────────────────────────

/**
 * HTTP-based remote registry client.
 */
class RemoteRegistry extends EventEmitter {
  constructor(url = 'https://registry.luna.dev') {
    super();
    this.type = 'remote';
    this.url = url.replace(/\/$/, '');
    this._cache = new Map();
  }

  has() {
    // Remote registries always return false for .has() — must check via network
    return false;
  }

  async getPackage(name) {
    if (this._cache.has(name)) return this._cache.get(name);

    try {
      const data = await this._httpGet(`${this.url}/packages/${encodeURIComponent(name)}`);
      const pkg = JSON.parse(data);
      this._cache.set(name, pkg);
      return pkg;
    } catch {
      return null;
    }
  }

  async fetchPackage(name, version) {
    const tarball = await this._httpGetBuffer(
      `${this.url}/packages/${encodeURIComponent(name)}/${version}/tarball`
    );
    // In a full implementation this would unpack the tarball.
    // For now, return the raw buffer.
    return { tarballBuffer: tarball, meta: { name, version } };
  }

  async search(query) {
    try {
      const data = await this._httpGet(`${this.url}/search?q=${encodeURIComponent(query)}`);
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * HTTP GET helper (text).
   */
  _httpGet(url) {
    return new Promise((resolve, reject) => {
      const mod = url.startsWith('https') ? https : http;
      mod.get(url, { timeout: 10000 }, (res) => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          res.resume();
          return;
        }
        let body = '';
        res.setEncoding('utf-8');
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      }).on('error', reject);
    });
  }

  /**
   * HTTP GET helper (buffer).
   */
  _httpGetBuffer(url) {
    return new Promise((resolve, reject) => {
      const mod = url.startsWith('https') ? https : http;
      mod.get(url, { timeout: 30000 }, (res) => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          res.resume();
          return;
        }
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }).on('error', reject);
    });
  }
}

// ── Composite Registry ────────────────────────────────

/**
 * RegistryClient — queries multiple registries in order:
 *   1. Built-in registry (@luna/* packages)
 *   2. Local file registry (~/.luna/registry/)
 *   3. Remote HTTP registries
 */
class RegistryClient extends EventEmitter {
  constructor(config = {}) {
    super();
    this.builtinRegistry = new BuiltinRegistry(config.lunaRoot);
    this.localRegistry = new LocalRegistry(config.localRegistryDir);
    this.remoteRegistries = (config.registries || []).map(url => new RemoteRegistry(url));

    // Ordered list of registries to query
    this.registries = [
      this.builtinRegistry,
      this.localRegistry,
      ...this.remoteRegistries
    ];
  }

  /**
   * Get package metadata from the first registry that has it.
   */
  async getPackage(name) {
    for (const registry of this.registries) {
      const pkg = await registry.getPackage(name);
      if (pkg) {
        pkg.source = registry.type;
        return pkg;
      }
    }
    return null;
  }

  /**
   * Fetch package files from the appropriate registry.
   */
  async fetchPackage(name, version) {
    for (const registry of this.registries) {
      try {
        const pkg = await registry.getPackage(name);
        if (pkg) {
          return await registry.fetchPackage(name, version);
        }
      } catch {
        continue;
      }
    }
    throw new Error(`Package not found in any registry: ${name}@${version}`);
  }

  /**
   * Search across all registries.
   */
  async search(query, options = {}) {
    const allResults = [];
    const seen = new Set();

    for (const registry of this.registries) {
      const results = await registry.search(query, options);
      for (const r of results) {
        if (!seen.has(r.name)) {
          seen.add(r.name);
          allResults.push(r);
        }
      }
    }

    return allResults;
  }

  /**
   * Publish to the local registry.
   */
  async publish(name, version, files, meta) {
    return this.localRegistry.publish(name, version, files, meta);
  }

  /**
   * List all built-in packages.
   */
  listBuiltins() {
    return this.builtinRegistry.list();
  }
}

module.exports = {
  BuiltinRegistry,
  LocalRegistry,
  RemoteRegistry,
  RegistryClient,
  computeIntegrity,
  verifyIntegrity,
  getBuiltinPackages
};
