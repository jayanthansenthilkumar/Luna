/**
 * LUNA Package Manager (LPM)
 * 
 * Core commands:
 * - luna init
 * - luna install
 * - luna update
 * - luna publish
 * - luna create
 * 
 * Features:
 * - luna.json configuration
 * - Version resolution (semver)
 * - Lockfile mechanism (luna-lock.json)
 * - Registry server
 * - Dependency graph resolver
 * - Tarball packaging
 * - Workspace support
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');

/**
 * Semver version utilities.
 */
class SemVer {
  static parse(version) {
    const clean = version.replace(/^[^0-9]*/, '');
    const match = clean.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.]+))?(?:\+([a-zA-Z0-9.]+))?$/);
    if (!match) return null;
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3]),
      prerelease: match[4] || '',
      build: match[5] || '',
      raw: version
    };
  }

  static satisfies(version, range) {
    const v = SemVer.parse(version);
    if (!v) return false;

    // Exact match
    if (!range.match(/[~^><= ]/)) {
      const r = SemVer.parse(range);
      if (!r) return false;
      return v.major === r.major && v.minor === r.minor && v.patch === r.patch;
    }

    // Caret range (^): compatible with
    if (range.startsWith('^')) {
      const r = SemVer.parse(range);
      if (!r) return false;
      if (v.major !== r.major) return false;
      if (v.major === 0) {
        return v.minor === r.minor && v.patch >= r.patch;
      }
      return v.minor > r.minor || (v.minor === r.minor && v.patch >= r.patch);
    }

    // Tilde range (~): approximately equivalent
    if (range.startsWith('~')) {
      const r = SemVer.parse(range);
      if (!r) return false;
      return v.major === r.major && v.minor === r.minor && v.patch >= r.patch;
    }

    // >= range
    if (range.startsWith('>=')) {
      const r = SemVer.parse(range.slice(2).trim());
      if (!r) return false;
      return SemVer.compare(v, r) >= 0;
    }

    // > range
    if (range.startsWith('>')) {
      const r = SemVer.parse(range.slice(1).trim());
      if (!r) return false;
      return SemVer.compare(v, r) > 0;
    }

    // * or latest
    if (range === '*' || range === 'latest') return true;

    return false;
  }

  static compare(a, b) {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }

  static isValid(version) {
    return SemVer.parse(version) !== null;
  }

  static increment(version, type) {
    const v = SemVer.parse(version);
    if (!v) throw new Error(`Invalid version: ${version}`);

    switch (type) {
      case 'major': return `${v.major + 1}.0.0`;
      case 'minor': return `${v.major}.${v.minor + 1}.0`;
      case 'patch': return `${v.major}.${v.minor}.${v.patch + 1}`;
      default: throw new Error(`Invalid increment type: ${type}`);
    }
  }
}

/**
 * Lockfile manager.
 */
class Lockfile {
  constructor(lockfilePath) {
    this.path = lockfilePath;
    this.data = { lockfileVersion: 1, packages: {} };
  }

  /**
   * Load the lockfile from disk.
   */
  load() {
    if (fs.existsSync(this.path)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
      } catch {
        this.data = { lockfileVersion: 1, packages: {} };
      }
    }
    return this;
  }

  /**
   * Save the lockfile to disk.
   */
  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2) + '\n');
    return this;
  }

  /**
   * Lock a package version.
   */
  lock(name, version, integrity, dependencies = {}) {
    this.data.packages[name] = {
      version,
      integrity,
      dependencies,
      resolved: `${name}@${version}`,
      lockedAt: new Date().toISOString()
    };
    return this;
  }

  /**
   * Get locked version.
   */
  getLockedVersion(name) {
    return this.data.packages[name]?.version || null;
  }

  /**
   * Check if a package is locked.
   */
  isLocked(name) {
    return name in this.data.packages;
  }
}

/**
 * Package Resolver – resolves dependency trees.
 */
class PackageResolver {
  constructor(registry) {
    this.registry = registry;
    this.resolved = new Map();
    this.conflicts = [];
  }

  /**
   * Resolve a dependency tree from a set of dependencies.
   */
  async resolve(dependencies) {
    const tree = {};

    for (const [name, range] of Object.entries(dependencies)) {
      tree[name] = await this._resolvePackage(name, range);
    }

    return tree;
  }

  /**
   * Resolve a single package and its dependencies.
   */
  async _resolvePackage(name, range, depth = 0) {
    if (depth > 50) {
      throw new Error(`Maximum dependency depth exceeded for ${name}`);
    }

    const cacheKey = `${name}@${range}`;
    if (this.resolved.has(cacheKey)) {
      return this.resolved.get(cacheKey);
    }

    // Get package info from registry
    const pkgInfo = await this.registry.getPackage(name);
    if (!pkgInfo) {
      throw new Error(`Package not found: ${name}`);
    }

    // Find best matching version
    const version = this._findBestVersion(pkgInfo.versions || [], range);
    if (!version) {
      throw new Error(`No version of ${name} satisfies ${range}`);
    }

    const result = {
      name,
      version: version.version,
      dependencies: {}
    };

    // Resolve sub-dependencies
    if (version.dependencies) {
      for (const [depName, depRange] of Object.entries(version.dependencies)) {
        result.dependencies[depName] = await this._resolvePackage(depName, depRange, depth + 1);
      }
    }

    this.resolved.set(cacheKey, result);
    return result;
  }

  /**
   * Find the best matching version.
   */
  _findBestVersion(versions, range) {
    const matching = versions
      .filter(v => SemVer.satisfies(v.version, range))
      .sort((a, b) => {
        const va = SemVer.parse(a.version);
        const vb = SemVer.parse(b.version);
        return SemVer.compare(vb, va); // Descending
      });

    return matching[0] || null;
  }
}

/**
 * In-memory Registry (for development/testing).
 */
class Registry extends EventEmitter {
  constructor(url = 'https://registry.luna.dev') {
    super();
    this.url = url;
    this.packages = new Map();
    this.tokens = new Map();
  }

  /**
   * Get package metadata.
   */
  async getPackage(name) {
    return this.packages.get(name) || null;
  }

  /**
   * Publish a package.
   */
  async publish(name, version, tarball, metadata = {}) {
    if (!this.packages.has(name)) {
      this.packages.set(name, {
        name,
        description: metadata.description || '',
        versions: [],
        createdAt: new Date().toISOString()
      });
    }

    const pkg = this.packages.get(name);
    const existing = pkg.versions.find(v => v.version === version);
    if (existing) {
      throw new Error(`Version ${version} of ${name} already exists`);
    }

    const integrity = crypto.createHash('sha512').update(tarball).digest('base64');
    pkg.versions.push({
      version,
      integrity: `sha512-${integrity}`,
      dependencies: metadata.dependencies || {},
      publishedAt: new Date().toISOString(),
      size: tarball.length
    });

    pkg.latest = version;
    this.emit('publish', { name, version });
    return { ok: true, name, version, integrity };
  }

  /**
   * Search packages.
   */
  async search(query, options = {}) {
    const limit = options.limit || 20;
    const results = [];

    for (const [name, pkg] of this.packages) {
      if (name.includes(query) || (pkg.description && pkg.description.includes(query))) {
        results.push({
          name: pkg.name,
          description: pkg.description,
          version: pkg.latest,
          versions: pkg.versions.length
        });
        if (results.length >= limit) break;
      }
    }

    return results;
  }
}

/**
 * Main Package Manager.
 */
class PackageManager extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.cwd = config.cwd || process.cwd();
    this.registry = new Registry(config.registry);
    this.lockfile = new Lockfile(path.join(this.cwd, 'luna-lock.json'));
  }

  /**
   * Fetch (install) packages into luna_packages/.
   * Like `npm install` — reads luna.json, resolves deps, writes to luna_packages/.
   * @param {string[]} packages - Specific packages to fetch (empty = all from luna.json)
   * @param {object} options - { dev, production, save, quiet }
   */
  async fetch(packages = [], options = {}) {
    const { PackageFetcher } = require('./fetcher');
    const { RegistryClient } = require('./registry');

    const registryClient = new RegistryClient({
      lunaRoot: this.config.lunaRoot || path.resolve(__dirname, '..', '..'),
      localRegistryDir: this.config.localRegistryDir,
      registries: this.config.remoteRegistries || []
    });

    const fetcher = new PackageFetcher({
      cwd: this.cwd,
      registry: registryClient,
      lunaRoot: this.config.lunaRoot,
      quiet: options.quiet || false
    });

    if (packages.length === 0) {
      return fetcher.fetchAll({ production: options.production });
    } else {
      return fetcher.fetchPackages(packages, { dev: options.dev });
    }
  }

  /**
   * Remove packages from luna_packages/ and luna.json.
   */
  async remove(packages) {
    const { PackageFetcher } = require('./fetcher');
    const { RegistryClient } = require('./registry');

    const registryClient = new RegistryClient({
      lunaRoot: this.config.lunaRoot || path.resolve(__dirname, '..', '..'),
    });

    const fetcher = new PackageFetcher({
      cwd: this.cwd,
      registry: registryClient,
      quiet: false
    });

    return fetcher.removePackages(packages);
  }

  /**
   * List installed luna_packages.
   */
  listFetched() {
    const { PackageFetcher } = require('./fetcher');
    const { RegistryClient } = require('./registry');

    const registryClient = new RegistryClient({
      lunaRoot: this.config.lunaRoot || path.resolve(__dirname, '..', '..'),
    });

    const fetcher = new PackageFetcher({
      cwd: this.cwd,
      registry: registryClient,
      quiet: true
    });

    return fetcher.listInstalled();
  }

  /**
   * Search the registry.
   */
  async search(query) {
    const { RegistryClient } = require('./registry');
    const registryClient = new RegistryClient({
      lunaRoot: this.config.lunaRoot || path.resolve(__dirname, '..', '..'),
    });
    return registryClient.search(query);
  }

  /**
   * Initialize a new LUNA project.
   */
  async init(options = {}) {
    const lunaJson = {
      name: options.name || path.basename(this.cwd),
      version: options.version || '0.1.0',
      description: options.description || '',
      entry: options.entry || 'src/index.js',
      platform: {
        backend: true,
        web: true,
        mobile: { android: false, ios: false },
        desktop: { windows: false, macos: false, linux: false },
        edge: false
      },
      runtime: {
        scheduler: { workerThreads: 4, ioThreads: 2 },
        sandbox: { enabled: true, capabilities: ['fs', 'net', 'env'] },
        optimizer: { selfEvolving: true, hotPathThreshold: 100 }
      },
      rendering: {
        strategy: 'server-first',
        hydration: 'incremental',
        ssr: true,
        ssg: true,
        isr: true
      },
      dependencies: {},
      devDependencies: {},
      scripts: {
        start: 'luna start',
        build: 'luna build',
        test: 'luna test',
        dev: 'luna dev'
      }
    };

    const configPath = path.join(this.cwd, 'luna.json');
    fs.writeFileSync(configPath, JSON.stringify(lunaJson, null, 2) + '\n');

    // Create directory structure
    const dirs = ['src', 'src/pages', 'src/components', 'src/api', 'public', 'tests'];
    for (const dir of dirs) {
      const dirPath = path.join(this.cwd, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }

    this.emit('init', { path: this.cwd, config: lunaJson });
    return lunaJson;
  }

  /**
   * Install dependencies.
   */
  async install(packages = [], options = {}) {
    // Load luna.json
    const configPath = path.join(this.cwd, 'luna.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('luna.json not found. Run `luna init` first.');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const deps = config.dependencies || {};
    const devDeps = config.devDependencies || {};

    // Load lockfile
    this.lockfile.load();

    if (packages.length > 0) {
      // Install specific packages
      for (const pkg of packages) {
        const [name, version] = this._parsePackageSpec(pkg);
        if (options.dev) {
          devDeps[name] = version || 'latest';
        } else {
          deps[name] = version || 'latest';
        }
      }

      // Update luna.json
      config.dependencies = deps;
      config.devDependencies = devDeps;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
    }

    // Resolve all dependencies
    const resolver = new PackageResolver(this.registry);
    const allDeps = { ...deps, ...(options.production ? {} : devDeps) };

    const resolved = {};
    for (const [name, range] of Object.entries(allDeps)) {
      try {
        resolved[name] = await resolver.resolve({ [name]: range });
      } catch (e) {
        console.warn(`  Warning: Could not resolve ${name}@${range}: ${e.message}`);
      }
    }

    // Update lockfile
    for (const [name, tree] of Object.entries(resolved)) {
      if (tree[name]) {
        this.lockfile.lock(name, tree[name].version, '', tree[name].dependencies);
      }
    }
    this.lockfile.save();

    this.emit('install', { packages: Object.keys(allDeps), resolved });
    return resolved;
  }

  /**
   * Update packages.
   */
  async update(packages = []) {
    // Clear lockfile entries for specified packages (or all)
    if (packages.length === 0) {
      this.lockfile.data.packages = {};
    } else {
      for (const pkg of packages) {
        delete this.lockfile.data.packages[pkg];
      }
    }
    this.lockfile.save();

    return this.install();
  }

  /**
   * Publish a package.
   */
  async publish(options = {}) {
    const configPath = path.join(this.cwd, 'luna.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('luna.json not found');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    if (!config.name || !config.version) {
      throw new Error('luna.json must have name and version fields');
    }

    // Create tarball (simplified)
    const tarball = this._createTarball(this.cwd, config);

    // Publish to registry
    const result = await this.registry.publish(config.name, config.version, tarball, {
      description: config.description,
      dependencies: config.dependencies
    });

    this.emit('publish', result);
    return result;
  }

  /**
   * Create a new project from a template.
   */
  async create(projectName, template = 'default') {
    const projectPath = path.join(this.cwd, projectName);

    if (fs.existsSync(projectPath)) {
      throw new Error(`Directory ${projectName} already exists`);
    }

    fs.mkdirSync(projectPath, { recursive: true });

    // Generate template files
    const templates = this._getTemplate(template, projectName);
    for (const [filePath, content] of Object.entries(templates)) {
      const fullPath = path.join(projectPath, filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content);
    }

    this.emit('create', { name: projectName, template, path: projectPath });
    return { name: projectName, path: projectPath, template };
  }

  /**
   * Parse a package specifier (name@version).
   */
  _parsePackageSpec(spec) {
    const atIndex = spec.lastIndexOf('@');
    if (atIndex > 0) {
      return [spec.slice(0, atIndex), spec.slice(atIndex + 1)];
    }
    return [spec, null];
  }

  /**
   * Create a tarball buffer from a directory.
   */
  _createTarball(dir, config) {
    // Simplified tarball creation (just serialized package info)
    const data = {
      name: config.name,
      version: config.version,
      files: [],
      createdAt: new Date().toISOString()
    };

    return Buffer.from(JSON.stringify(data));
  }

  /**
   * Get template files.
   * 
   * The default template follows Next.js App Router conventions:
   *   app/          – File-based routing (page.js, layout.js, route.js)
   *   components/   – Reusable UI components
   *   lib/          – Utility functions and helpers
   *   public/       – Static assets (served at root)
   *   luna.json     – Project manifest
   *   luna.config.js– Runtime configuration
   */
  _getTemplate(template, name) {
    const templates = {
      default: {
        // ─── Project manifest ───────────────────────────────────────
        'luna.json': JSON.stringify({
          name,
          version: '0.1.0',
          description: 'A LUNA application',
          platform: { backend: true, web: true },
          dependencies: {},
          devDependencies: {},
          scripts: {
            dev: 'luna dev',
            start: 'luna start',
            build: 'luna build',
            test: 'luna test'
          }
        }, null, 2) + '\n',

        // ─── Runtime config ─────────────────────────────────────────
        'luna.config.js': `/**
 * LUNA Configuration
 * @see https://github.com/jayanthansenthilkumar/Luna
 */
module.exports = {
  // Server options
  server: {
    port: 3000,
    host: 'localhost'
  },

  // Rendering strategy
  rendering: {
    strategy: 'server-first', // 'server-first' | 'client-first' | 'static'
    ssr: true,
    hydration: 'incremental'
  },

  // Build targets
  build: {
    targets: ['backend', 'web'],
    minify: true
  }
};
`,

        // ─── Root layout ──────────────────────────────────────────
        'app/layout.js': `/**
 * Root Layout
 * 
 * This layout wraps every page in your application.
 * Use it for shared UI like headers, footers, and navigation.
 */
module.exports = function RootLayout({ children }) {
  return {
    tag: 'html',
    props: { lang: 'en' },
    children: [
      {
        tag: 'head',
        props: {},
        children: [
          { tag: 'meta', props: { charset: 'UTF-8' }, children: [] },
          { tag: 'meta', props: { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }, children: [] },
          { tag: 'title', props: {}, children: ['${name}'] },
          { tag: 'link', props: { rel: 'stylesheet', href: '/__luna/globals.css' }, children: [] }
        ]
      },
      {
        tag: 'body',
        props: {},
        children: [
          {
            tag: 'nav',
            props: { className: 'navbar' },
            children: [
              {
                tag: 'div',
                props: { className: 'nav-brand' },
                children: [
                  { tag: 'a', props: { href: '/' }, children: ['🌙 ${name}'] }
                ]
              },
              {
                tag: 'div',
                props: { className: 'nav-links' },
                children: [
                  { tag: 'a', props: { href: '/' }, children: ['Home'] },
                  { tag: 'a', props: { href: '/about' }, children: ['About'] },
                  { tag: 'a', props: { href: '/blog' }, children: ['Blog'] }
                ]
              }
            ]
          },
          {
            tag: 'main',
            props: { className: 'main-content' },
            children: [typeof children === 'string' ? children : children]
          },
          {
            tag: 'footer',
            props: { className: 'footer' },
            children: [
              { tag: 'p', props: {}, children: ['Built with 🌙 LUNA'] }
            ]
          }
        ]
      }
    ]
  };
};
`,

        // ─── Home page ────────────────────────────────────────────
        'app/page.js': `/**
 * Home Page  —  app/page.js  →  /
 */
module.exports = function HomePage() {
  return {
    tag: 'div',
    props: { className: 'page home' },
    children: [
      {
        tag: 'section',
        props: { className: 'hero' },
        children: [
          { tag: 'h1', props: {}, children: ['Welcome to ${name}'] },
          { tag: 'p', props: { className: 'subtitle' }, children: ['One Language. One Runtime. Every Platform.'] },
          {
            tag: 'div',
            props: { className: 'hero-actions' },
            children: [
              { tag: 'a', props: { href: '/about', className: 'btn btn-primary' }, children: ['Get Started'] },
              { tag: 'a', props: { href: '/blog', className: 'btn btn-secondary' }, children: ['Read Blog'] }
            ]
          }
        ]
      },
      {
        tag: 'section',
        props: { className: 'features' },
        children: [
          {
            tag: 'div',
            props: { className: 'feature-card' },
            children: [
              { tag: 'h3', props: {}, children: ['⚡ Fast'] },
              { tag: 'p', props: {}, children: ['Zero-dependency runtime with file-based routing.'] }
            ]
          },
          {
            tag: 'div',
            props: { className: 'feature-card' },
            children: [
              { tag: 'h3', props: {}, children: ['🌍 Universal'] },
              { tag: 'p', props: {}, children: ['One codebase for backend, web, mobile, desktop, and edge.'] }
            ]
          },
          {
            tag: 'div',
            props: { className: 'feature-card' },
            children: [
              { tag: 'h3', props: {}, children: ['🔒 Secure'] },
              { tag: 'p', props: {}, children: ['Sandboxed execution with granular permissions.'] }
            ]
          }
        ]
      }
    ]
  };
};
`,

        // ─── Global styles ────────────────────────────────────────
        'app/globals.css': `/* ─── Luna Global Styles ──────────────────────────────── */

:root {
  --primary:    #6c5ce7;
  --secondary:  #a29bfe;
  --accent:     #00cec9;
  --bg:         #0f0f23;
  --bg-card:    #1a1a3e;
  --text:       #e2e8f0;
  --text-muted: #94a3b8;
  --border:     #2d2d5e;
  --radius:     0.75rem;
}

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

a {
  color: var(--accent);
  text-decoration: none;
  transition: color 0.2s;
}
a:hover { color: var(--secondary); }

/* ─── Navbar ─────────────────────────────────────────── */

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
  background: rgba(15, 15, 35, 0.9);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand a {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--text-muted);
  font-weight: 500;
}
.nav-links a:hover { color: var(--accent); }

/* ─── Hero ───────────────────────────────────────────── */

.hero {
  text-align: center;
  padding: 6rem 2rem 4rem;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* ─── Buttons ────────────────────────────────────────── */

.btn {
  display: inline-block;
  padding: 0.75rem 1.75rem;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
}
.btn-primary:hover {
  background: var(--secondary);
  color: #fff;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: var(--accent);
  border: 1px solid var(--accent);
}
.btn-secondary:hover {
  background: var(--accent);
  color: var(--bg);
  transform: translateY(-2px);
}

/* ─── Features ───────────────────────────────────────── */

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
  transition: transform 0.2s, border-color 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
}

.feature-card h3 {
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.feature-card p {
  color: var(--text-muted);
}

/* ─── Main content ───────────────────────────────────── */

.main-content {
  min-height: calc(100vh - 160px);
}

/* ─── Footer ─────────────────────────────────────────── */

.footer {
  text-align: center;
  padding: 2rem;
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* ─── Page layouts ───────────────────────────────────── */

.page-section {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.page-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.page-section h2 {
  font-size: 1.75rem;
  margin: 2rem 0 1rem;
  color: var(--secondary);
}

.page-section p {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

/* ─── Blog ───────────────────────────────────────────── */

.blog-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.blog-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: border-color 0.2s;
}
.blog-item:hover { border-color: var(--primary); }

.blog-item h3 { margin-bottom: 0.5rem; }
.blog-item p { color: var(--text-muted); font-size: 0.9rem; }

/* ─── Loading ────────────────────────────────────────── */

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Responsive ─────────────────────────────────────── */

@media (max-width: 768px) {
  .hero h1 { font-size: 2.25rem; }
  .navbar { flex-direction: column; gap: 0.75rem; }
  .hero-actions { flex-direction: column; align-items: center; }
}
`,

        // ─── Loading state ────────────────────────────────────────
        'app/loading.js': `/**
 * Loading State
 * 
 * Shown while the page is loading / streaming.
 */
module.exports = function Loading() {
  return {
    tag: 'div',
    props: { className: 'loading' },
    children: [
      { tag: 'div', props: { className: 'loading-spinner' }, children: [] }
    ]
  };
};
`,

        // ─── 404 page ─────────────────────────────────────────────
        'app/not-found.js': `/**
 * Not Found Page (404)
 * 
 * Rendered when no route matches the URL.
 */
module.exports = function NotFound() {
  return {
    tag: 'div',
    props: { className: 'page-section', style: 'text-align:center;padding:6rem 2rem' },
    children: [
      { tag: 'h1', props: { style: 'font-size:6rem;margin-bottom:0.5rem' }, children: ['404'] },
      { tag: 'p', props: { style: 'font-size:1.25rem;color:var(--text-muted)' }, children: ['This page could not be found.'] },
      { tag: 'a', props: { href: '/', className: 'btn btn-primary', style: 'margin-top:2rem;display:inline-block' }, children: ['Go Home'] }
    ]
  };
};
`,

        // ─── Error boundary ───────────────────────────────────────
        'app/error.js': `/**
 * Error Boundary
 * 
 * Rendered when an error occurs in a page or layout.
 */
module.exports = function ErrorPage({ error }) {
  return {
    tag: 'div',
    props: { className: 'page-section', style: 'text-align:center;padding:6rem 2rem' },
    children: [
      { tag: 'h1', props: {}, children: ['Something went wrong'] },
      { tag: 'p', props: { style: 'color:var(--text-muted)' }, children: [
        error ? error.message : 'An unexpected error occurred.'
      ]},
      { tag: 'a', props: { href: '/', className: 'btn btn-primary', style: 'margin-top:2rem;display:inline-block' }, children: ['Go Home'] }
    ]
  };
};
`,

        // ─── About page ──────────────────────────────────────────
        'app/about/page.js': `/**
 * About Page  —  app/about/page.js  →  /about
 */
module.exports = function AboutPage() {
  return {
    tag: 'div',
    props: { className: 'page-section' },
    children: [
      { tag: 'h1', props: {}, children: ['About'] },
      { tag: 'p', props: {}, children: [
        'This application is built with LUNA — the Universal JavaScript Operating Runtime.'
      ]},
      { tag: 'h2', props: {}, children: ['Why LUNA?'] },
      { tag: 'p', props: {}, children: [
        'LUNA runs one codebase across backend, web, mobile, desktop, and edge platforms with zero external dependencies.'
      ]},
      { tag: 'h2', props: {}, children: ['Features'] },
      {
        tag: 'ul',
        props: { style: 'list-style:none;display:flex;flex-direction:column;gap:0.5rem' },
        children: [
          { tag: 'li', props: {}, children: ['⚡ File-based routing (Next.js-style app/ directory)'] },
          { tag: 'li', props: {}, children: ['🌊 Server-side rendering with streaming'] },
          { tag: 'li', props: {}, children: ['📦 Built-in package manager (luna fetch)'] },
          { tag: 'li', props: {}, children: ['🔒 Sandboxed execution engine'] },
          { tag: 'li', props: {}, children: ['🌍 Universal Code Continuity across platforms'] }
        ]
      }
    ]
  };
};
`,

        // ─── Blog page ───────────────────────────────────────────
        'app/blog/page.js': `/**
 * Blog Index  —  app/blog/page.js  →  /blog
 */
const posts = [
  { slug: 'getting-started', title: 'Getting Started with LUNA', excerpt: 'Learn how to build your first LUNA application.' },
  { slug: 'file-routing', title: 'File-Based Routing', excerpt: 'How the app/ directory maps to URL routes.' },
  { slug: 'server-rendering', title: 'Server-Side Rendering', excerpt: 'Render pages on the server for blazing fast loads.' }
];

module.exports = function BlogPage() {
  return {
    tag: 'div',
    props: { className: 'page-section' },
    children: [
      { tag: 'h1', props: {}, children: ['Blog'] },
      { tag: 'p', props: {}, children: ['Latest posts and tutorials.'] },
      {
        tag: 'ul',
        props: { className: 'blog-list' },
        children: posts.map(post => ({
          tag: 'li',
          props: { className: 'blog-item' },
          children: [
            { tag: 'a', props: { href: '/blog/' + post.slug }, children: [
              { tag: 'h3', props: {}, children: [post.title] }
            ]},
            { tag: 'p', props: {}, children: [post.excerpt] }
          ]
        }))
      }
    ]
  };
};
`,

        // ─── Dynamic blog post [slug] ────────────────────────────
        'app/blog/[slug]/page.js': `/**
 * Blog Post  —  app/blog/[slug]/page.js  →  /blog/:slug
 * 
 * Dynamic route — receives params.slug from the URL.
 */
const posts = {
  'getting-started': {
    title: 'Getting Started with LUNA',
    date: '2025-01-15',
    content: 'LUNA is a Universal JavaScript Operating Runtime that lets you write one codebase and run it everywhere — backend, web, mobile, desktop, and edge. To get started, run: luna create my-app && cd my-app && luna dev'
  },
  'file-routing': {
    title: 'File-Based Routing',
    date: '2025-01-20',
    content: 'LUNA uses a file-based routing convention inspired by Next.js. Place page.js files inside the app/ directory and they automatically become routes. Dynamic segments use [brackets], and API routes use route.js files.'
  },
  'server-rendering': {
    title: 'Server-Side Rendering',
    date: '2025-01-25',
    content: 'Every page is server-rendered by default. LUNA\\'s SSR engine supports streaming, incremental static regeneration (ISR), and selective hydration for optimal performance.'
  }
};

module.exports = function BlogPostPage({ params }) {
  const post = posts[params.slug];

  if (!post) {
    return {
      tag: 'div',
      props: { className: 'page-section', style: 'text-align:center' },
      children: [
        { tag: 'h1', props: {}, children: ['Post Not Found'] },
        { tag: 'a', props: { href: '/blog', className: 'btn btn-secondary' }, children: ['← Back to Blog'] }
      ]
    };
  }

  return {
    tag: 'article',
    props: { className: 'page-section' },
    children: [
      { tag: 'a', props: { href: '/blog', style: 'display:inline-block;margin-bottom:2rem' }, children: ['← Back to Blog'] },
      { tag: 'h1', props: {}, children: [post.title] },
      { tag: 'p', props: { style: 'color:var(--text-muted);margin-bottom:2rem' }, children: [post.date] },
      { tag: 'p', props: { style: 'font-size:1.1rem;line-height:1.8' }, children: [post.content] }
    ]
  };
};
`,

        // ─── API route ───────────────────────────────────────────
        'app/api/hello/route.js': `/**
 * API Route  —  app/api/hello/route.js  →  /api/hello
 * 
 * Export named functions for each HTTP method: GET, POST, PUT, DELETE, PATCH
 * The res object provides: .json(), .send(), .html(), .status(), .header()
 */

module.exports.GET = function (req, res) {
  res.json({
    message: 'Hello from LUNA!',
    timestamp: new Date().toISOString()
  });
};

module.exports.POST = async function (req, res) {
  const body = await req.body();
  res.status(201).json({
    received: true,
    data: body ? JSON.parse(body) : null
  });
};
`,

        // ─── API health route ────────────────────────────────────
        'app/api/health/route.js': `/**
 * Health Check  —  app/api/health/route.js  →  /api/health
 */

module.exports.GET = function (req, res) {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage().rss,
    version: '0.1.0'
  });
};
`,

        // ─── Components ──────────────────────────────────────────
        'components/Button.js': `/**
 * Reusable Button Component
 * 
 * Usage:
 *   const Button = require('../components/Button');
 *   Button({ href: '/about', variant: 'primary', children: 'Click Me' })
 */
module.exports = function Button({ href, variant = 'primary', children, onClick }) {
  return {
    tag: href ? 'a' : 'button',
    props: {
      href: href || undefined,
      className: 'btn btn-' + variant,
      onClick: onClick || undefined
    },
    children: Array.isArray(children) ? children : [children || '']
  };
};
`,

        'components/Card.js': `/**
 * Reusable Card Component
 */
module.exports = function Card({ title, children, className }) {
  return {
    tag: 'div',
    props: { className: 'feature-card ' + (className || '') },
    children: [
      title ? { tag: 'h3', props: {}, children: [title] } : null,
      ...(Array.isArray(children) ? children : [children || ''])
    ].filter(Boolean)
  };
};
`,

        // ─── Lib utilities ───────────────────────────────────────
        'lib/utils.js': `/**
 * Utility Functions
 */

/**
 * Format a date string.
 */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Truncate text to a maximum length.
 */
function truncate(str, maxLen = 100) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '...';
}

/**
 * Simple className merger.
 */
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

module.exports = { formatDate, truncate, cn };
`,

        // ─── Public static assets ────────────────────────────────
        'public/favicon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🌙</text></svg>`,

        // ─── Git ignore ──────────────────────────────────────────
        '.gitignore': `# Dependencies
node_modules/
luna_packages/

# Build output
dist/
.luna-cache/

# Environment
.env
.env.local

# Logs
*.log

# OS
.DS_Store
Thumbs.db
`,

        // ─── README ──────────────────────────────────────────────
        'README.md': `# ${name}

Built with [LUNA](https://github.com/jayanthansenthilkumar/Luna) — Universal JavaScript Operating Runtime.

## Getting Started

\`\`\`bash
cd ${name}
luna dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
${name}/
├── app/                    # File-based routing
│   ├── layout.js           # Root layout (wraps all pages)
│   ├── page.js             # Home page  →  /
│   ├── globals.css          # Global stylesheet
│   ├── loading.js           # Loading state
│   ├── not-found.js         # 404 page
│   ├── error.js             # Error boundary
│   ├── about/
│   │   └── page.js          # About page  →  /about
│   ├── blog/
│   │   ├── page.js          # Blog index  →  /blog
│   │   └── [slug]/
│   │       └── page.js      # Blog post   →  /blog/:slug
│   └── api/
│       ├── hello/
│       │   └── route.js     # API route   →  GET/POST /api/hello
│       └── health/
│           └── route.js     # Health check →  GET /api/health
├── components/             # Reusable components
│   ├── Button.js
│   └── Card.js
├── lib/                    # Utility functions
│   └── utils.js
├── public/                 # Static files (served at root)
│   └── favicon.svg
├── luna.json               # Project manifest
└── luna.config.js          # Runtime configuration
\`\`\`

## Routing Conventions

| File | Route |
|------|-------|
| \`app/page.js\` | \`/\` |
| \`app/about/page.js\` | \`/about\` |
| \`app/blog/[slug]/page.js\` | \`/blog/:slug\` |
| \`app/api/hello/route.js\` | \`/api/hello\` |

## Commands

| Command | Description |
|---------|-------------|
| \`luna dev\` | Start development server |
| \`luna start\` | Start production server |
| \`luna build\` | Build for deployment |
| \`luna fetch <pkg>\` | Install a package |
| \`luna test\` | Run tests |

## Learn More

- [LUNA Documentation](https://github.com/jayanthansenthilkumar/Luna)
`
      }
    };

    return templates[template] || templates.default;
  }

  /**
   * Get list of installed packages.
   */
  getInstalledPackages() {
    this.lockfile.load();
    return { ...this.lockfile.data.packages };
  }
}

module.exports = { PackageManager, Registry, PackageResolver, SemVer, Lockfile };

// Re-export new subsystems so consumers can access them
try {
  const registry = require('./registry');
  const fetcher = require('./fetcher');
  Object.assign(module.exports, registry, fetcher);
} catch { /* Optional — only available after full install */ }
