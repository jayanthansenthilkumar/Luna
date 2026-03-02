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
    this.cwd = process.cwd();
    this.registry = new Registry(config.registry);
    this.lockfile = new Lockfile(path.join(this.cwd, 'luna-lock.json'));
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
   */
  _getTemplate(template, name) {
    const templates = {
      default: {
        'luna.json': JSON.stringify({
          name,
          version: '0.1.0',
          description: `A LUNA application`,
          entry: 'src/index.js',
          platform: { backend: true, web: true },
          dependencies: {},
          scripts: {
            start: 'luna start',
            dev: 'luna dev',
            build: 'luna build'
          }
        }, null, 2),
        'src/index.js': `const { createApp } = require('@luna/runtime');

const app = createApp();

app.init().then(async () => {
  app.get('/', (req, res) => {
    res.html('<h1>Welcome to LUNA</h1>');
  });

  app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from LUNA!' });
  });

  await app.listen(3000);
});
`,
        'src/pages/home.js': `const { h, Component } = require('@luna/runtime/ui');

class HomePage extends Component {
  render() {
    return h('div', { className: 'page home' },
      h('h1', null, 'Welcome to LUNA'),
      h('p', null, 'One Language. One Runtime. Every Platform.')
    );
  }
}

module.exports = { HomePage };
`,
        'public/index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} – LUNA App</title>
</head>
<body>
    <div id="luna-app"></div>
</body>
</html>
`,
        '.gitignore': 'node_modules/\ndist/\n.luna-cache/\n*.log\n',
        'README.md': `# ${name}\n\nBuilt with LUNA – Universal JavaScript Operating Runtime.\n\n## Getting Started\n\n\`\`\`bash\nluna dev\n\`\`\`\n`
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
