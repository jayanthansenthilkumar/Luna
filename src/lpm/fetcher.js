/**
 * LUNA Package Fetcher
 * 
 * Handles the full fetch/install pipeline:
 * - Reads luna.json for dependencies
 * - Resolves version ranges via SemVer
 * - Downloads packages from the registry chain
 * - Writes files to luna_packages/ (flat layout, like node_modules)
 * - Generates & updates luna-lock.json
 * - Verifies integrity
 * - Supports add/remove/update of individual packages
 * 
 * Directory layout:
 *   project/
 *     luna.json
 *     luna-lock.json
 *     luna_packages/
 *       @luna/
 *         core/
 *           luna.json
 *           index.js
 *           engine.js
 *       some-pkg/
 *         luna.json
 *         index.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');
const { SemVer, Lockfile } = require('./manager');
const { RegistryClient, computeIntegrity, verifyIntegrity } = require('./registry');

// ── Constants ─────────────────────────────────────────

const LUNA_PACKAGES_DIR = 'luna_packages';
const LUNA_CONFIG_FILE = 'luna.json';
const LUNA_LOCK_FILE = 'luna-lock.json';

// ── Fetcher ───────────────────────────────────────────

class PackageFetcher extends EventEmitter {
  constructor(config = {}) {
    super();
    this.cwd = config.cwd || process.cwd();
    this.registry = config.registry || new RegistryClient({ lunaRoot: config.lunaRoot });
    this.lockfile = new Lockfile(path.join(this.cwd, LUNA_LOCK_FILE));
    this.packagesDir = path.join(this.cwd, LUNA_PACKAGES_DIR);
    this.installed = new Map(); // name -> version (tracks what's been installed this run)
    this.log = config.log || console.log;
    this._quiet = config.quiet || false;
  }

  // ── Public API ────────────────────────────────────

  /**
   * Fetch all dependencies listed in luna.json.
   * Equivalent to `npm install` with no arguments.
   */
  async fetchAll(options = {}) {
    const config = this._readConfig();
    const deps = { ...(config.dependencies || {}) };

    if (!options.production) {
      Object.assign(deps, config.devDependencies || {});
    }

    if (Object.keys(deps).length === 0) {
      this._info('No dependencies to fetch.');
      return { installed: [], count: 0, time: 0 };
    }

    const startTime = Date.now();
    this.lockfile.load();

    this._info(`Resolving ${Object.keys(deps).length} package(s)...\n`);

    const resolved = await this._resolveAll(deps);
    const installPlan = this._buildInstallPlan(resolved);
    const results = await this._executeInstallPlan(installPlan);

    this.lockfile.save();

    const elapsed = Date.now() - startTime;
    return {
      installed: results,
      count: results.length,
      time: elapsed
    };
  }

  /**
   * Fetch specific packages and add them to luna.json.
   * Equivalent to `npm install <pkg1> <pkg2>`.
   */
  async fetchPackages(packages, options = {}) {
    const config = this._readConfig();
    const depsKey = options.dev ? 'devDependencies' : 'dependencies';

    if (!config[depsKey]) config[depsKey] = {};

    const startTime = Date.now();
    this.lockfile.load();

    const toResolve = {};
    for (const spec of packages) {
      const { name, range } = this._parseSpec(spec);
      toResolve[name] = range;
      // Add to config
      config[depsKey][name] = range;
    }

    this._info(`Fetching ${packages.length} package(s)...\n`);

    const resolved = await this._resolveAll(toResolve);
    const installPlan = this._buildInstallPlan(resolved);
    const results = await this._executeInstallPlan(installPlan);

    // Save updated luna.json
    this._writeConfig(config);
    this.lockfile.save();

    const elapsed = Date.now() - startTime;
    return {
      installed: results,
      count: results.length,
      time: elapsed,
      addedTo: depsKey
    };
  }

  /**
   * Remove packages from luna_packages and luna.json.
   */
  async removePackages(packages) {
    const config = this._readConfig();
    const removed = [];

    for (const name of packages) {
      // Remove from luna.json
      let found = false;
      if (config.dependencies && config.dependencies[name]) {
        delete config.dependencies[name];
        found = true;
      }
      if (config.devDependencies && config.devDependencies[name]) {
        delete config.devDependencies[name];
        found = true;
      }

      // Remove from luna_packages/
      const pkgDir = this._packageInstallDir(name);
      if (fs.existsSync(pkgDir)) {
        this._rmdir(pkgDir);
        // Clean empty scoped dirs
        const parentDir = path.dirname(pkgDir);
        if (parentDir !== this.packagesDir && fs.existsSync(parentDir)) {
          const remaining = fs.readdirSync(parentDir);
          if (remaining.length === 0) this._rmdir(parentDir);
        }
        found = true;
      }

      // Remove from lockfile
      this.lockfile.load();
      if (this.lockfile.data.packages[name]) {
        delete this.lockfile.data.packages[name];
      }

      if (found) {
        removed.push(name);
        this._info(`  Removed ${name}`);
      }
    }

    this._writeConfig(config);
    this.lockfile.save();

    return { removed, count: removed.length };
  }

  /**
   * List installed packages in luna_packages/.
   */
  listInstalled() {
    const results = [];

    if (!fs.existsSync(this.packagesDir)) return results;

    const scanDir = (dir, prefix = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const fullName = prefix ? `${prefix}/${entry.name}` : entry.name;

        if (entry.name.startsWith('@')) {
          scanDir(path.join(dir, entry.name), entry.name);
          continue;
        }

        const manifestPath = path.join(dir, entry.name, 'luna.json');
        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          results.push({
            name: fullName,
            version: manifest.version || 'unknown',
            description: manifest.description || ''
          });
        }
      }
    };

    scanDir(this.packagesDir);
    return results;
  }

  // ── Resolution ────────────────────────────────────

  /**
   * Resolve all dependencies to exact versions.
   */
  async _resolveAll(deps) {
    const resolved = {};

    for (const [name, range] of Object.entries(deps)) {
      resolved[name] = await this._resolveSingle(name, range);
    }

    return resolved;
  }

  /**
   * Resolve a single package to an exact version.
   */
  async _resolveSingle(name, range) {
    // Check lockfile first
    const locked = this.lockfile.getLockedVersion(name);
    if (locked && SemVer.satisfies(locked, range)) {
      return { name, version: locked, locked: true, dependencies: {} };
    }

    // Query registry
    const pkgInfo = await this.registry.getPackage(name);
    if (!pkgInfo) {
      throw new Error(`Package not found: ${name}`);
    }

    // Find best version
    const matching = (pkgInfo.versions || [])
      .filter(v => SemVer.satisfies(v.version, range))
      .sort((a, b) => {
        const va = SemVer.parse(a.version);
        const vb = SemVer.parse(b.version);
        return SemVer.compare(vb, va);
      });

    if (matching.length === 0) {
      // If range is 'latest' or '*', use the latest version
      if (range === 'latest' || range === '*') {
        const latest = pkgInfo.versions.sort((a, b) => {
          const va = SemVer.parse(a.version);
          const vb = SemVer.parse(b.version);
          return SemVer.compare(vb, va);
        })[0];
        if (latest) {
          return {
            name,
            version: latest.version,
            locked: false,
            dependencies: latest.dependencies || {},
            integrity: latest.integrity
          };
        }
      }
      throw new Error(`No version of ${name} satisfies range '${range}'`);
    }

    const best = matching[0];
    return {
      name,
      version: best.version,
      locked: false,
      dependencies: best.dependencies || {},
      integrity: best.integrity
    };
  }

  // ── Install Plan ──────────────────────────────────

  /**
   * Build a flat install plan from resolved packages.
   */
  _buildInstallPlan(resolved) {
    const plan = [];

    for (const [name, info] of Object.entries(resolved)) {
      // Check if already installed at this version
      const installedManifest = this._readInstalledManifest(name);
      if (installedManifest && installedManifest.version === info.version) {
        this._info(`  ${name}@${info.version} — already installed`);
        continue;
      }

      plan.push({
        name,
        version: info.version,
        integrity: info.integrity || null,
        dependencies: info.dependencies || {},
        isUpdate: !!installedManifest
      });

      // Also plan sub-dependencies (flat layout)
      for (const [depName, depRange] of Object.entries(info.dependencies || {})) {
        if (!resolved[depName]) {
          plan.push({ name: depName, range: depRange, fromParent: name });
        }
      }
    }

    return plan;
  }

  /**
   * Execute the install plan — fetch and write each package.
   */
  async _executeInstallPlan(plan) {
    const results = [];

    for (const entry of plan) {
      if (this.installed.has(entry.name)) continue;

      try {
        // If it's a sub-dependency that still needs resolution
        if (entry.range && !entry.version) {
          const info = await this._resolveSingle(entry.name, entry.range);
          entry.version = info.version;
          entry.integrity = info.integrity;
        }

        await this._installPackage(entry);

        this.installed.set(entry.name, entry.version);
        results.push({ name: entry.name, version: entry.version, action: entry.isUpdate ? 'updated' : 'added' });

        const action = entry.isUpdate ? 'updated' : 'added';
        this._info(`  ${entry.name}@${entry.version} — ${action}`);
      } catch (err) {
        this._warn(`  Failed to fetch ${entry.name}: ${err.message}`);
      }
    }

    return results;
  }

  // ── Package Installation ──────────────────────────

  /**
   * Install a single package to luna_packages/.
   */
  async _installPackage(entry) {
    const { name, version, integrity } = entry;

    // Fetch from registry
    const { files, meta } = await this.registry.fetchPackage(name, version);

    // Verify integrity if available
    if (integrity) {
      const allContent = Object.values(files).reduce(
        (buf, f) => Buffer.concat([buf, f]),
        Buffer.alloc(0)
      );
      if (!verifyIntegrity(allContent, integrity)) {
        throw new Error(`Integrity check failed for ${name}@${version}`);
      }
    }

    // Write files to luna_packages/<name>/
    const installDir = this._packageInstallDir(name);
    this._ensureDir(installDir);

    for (const [fileName, content] of Object.entries(files)) {
      const filePath = path.join(installDir, fileName);
      this._ensureDir(path.dirname(filePath));
      fs.writeFileSync(filePath, content);
    }

    // Compute integrity of installed package
    const allContent = Object.values(files).reduce(
      (buf, f) => Buffer.concat([buf, f]),
      Buffer.alloc(0)
    );
    const computedIntegrity = computeIntegrity(allContent);

    // Update lockfile
    this.lockfile.lock(name, version, computedIntegrity, entry.dependencies || {});

    this.emit('install', { name, version, dir: installDir });
  }

  // ── Helpers ───────────────────────────────────────

  /**
   * Get the install directory for a package inside luna_packages/.
   */
  _packageInstallDir(name) {
    // Scoped packages: @scope/pkg → luna_packages/@scope/pkg
    return path.join(this.packagesDir, ...name.split('/'));
  }

  /**
   * Read the manifest of an already-installed package.
   */
  _readInstalledManifest(name) {
    const manifestPath = path.join(this._packageInstallDir(name), 'luna.json');
    if (!fs.existsSync(manifestPath)) return null;
    try {
      return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Read the project's luna.json.
   */
  _readConfig() {
    const configPath = path.join(this.cwd, LUNA_CONFIG_FILE);
    if (!fs.existsSync(configPath)) {
      throw new Error(`${LUNA_CONFIG_FILE} not found. Run 'luna init' first.`);
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  /**
   * Write the project's luna.json.
   */
  _writeConfig(config) {
    const configPath = path.join(this.cwd, LUNA_CONFIG_FILE);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  }

  /**
   * Parse a package specifier: "name", "name@version", "@scope/name@^1.0.0"
   */
  _parseSpec(spec) {
    const atIdx = spec.lastIndexOf('@');
    // Handle @scoped packages
    if (atIdx > 0) {
      return {
        name: spec.slice(0, atIdx),
        range: spec.slice(atIdx + 1)
      };
    }
    return { name: spec, range: '*' };
  }

  /**
   * Ensure directory exists.
   */
  _ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Recursively remove a directory.
   */
  _rmdir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        this._rmdir(fullPath);
      } else {
        fs.unlinkSync(fullPath);
      }
    }
    fs.rmdirSync(dir);
  }

  _info(msg) {
    if (!this._quiet) this.log(msg);
  }

  _warn(msg) {
    if (!this._quiet) this.log(`  ⚠ ${msg}`);
  }
}

module.exports = { PackageFetcher, LUNA_PACKAGES_DIR, LUNA_CONFIG_FILE, LUNA_LOCK_FILE };
