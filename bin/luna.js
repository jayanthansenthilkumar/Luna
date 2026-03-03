#!/usr/bin/env node

/**
 * LUNA CLI – Command Line Interface
 * 
 * Usage:
 *   luna init [name]          Initialize a new LUNA project
 *   luna dev                  Start development server with HMR
 *   luna start                Start production server
 *   luna build [targets...]   Build for targets (backend, web, mobile, desktop, edge)
 *   luna fetch [pkgs...]      Fetch & install packages into luna_packages/
 *   luna remove <pkgs...>     Remove packages from luna_packages/
 *   luna search <query>       Search the package registry
 *   luna list                 List installed luna_packages
 *   luna install [pkgs...]    Alias for luna fetch
 *   luna update [pkgs...]     Update dependencies
 *   luna publish              Publish package to registry
 *   luna create <name>        Create new project from template
 *   luna test                 Run tests
 *   luna info                 Show runtime environment info
 *   luna --version            Show version
 *   luna --help               Show help
 */

'use strict';

const path = require('path');
const fs = require('fs');

// ANSI colors
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const LOGO = `
${c.cyan}${c.bold}  ██╗     ██╗   ██╗███╗   ██╗ █████╗ 
  ██║     ██║   ██║████╗  ██║██╔══██╗
  ██║     ██║   ██║██╔██╗ ██║███████║
  ██║     ██║   ██║██║╚██╗██║██╔══██║
  ███████╗╚██████╔╝██║ ╚████║██║  ██║
  ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝${c.reset}
${c.dim}  Universal JavaScript Operating Runtime${c.reset}
`;

function showHelp() {
  console.log(LOGO);
  console.log(`${c.bold}  Usage:${c.reset} luna <command> [options]\n`);
  console.log(`${c.bold}  Commands:${c.reset}`);
  console.log(`    ${c.cyan}init${c.reset} [name]           Initialize a new LUNA project`);
  console.log(`    ${c.cyan}dev${c.reset}                   Start development server with HMR`);
  console.log(`    ${c.cyan}start${c.reset}                 Start production server`);
  console.log(`    ${c.cyan}build${c.reset} [targets...]    Build for targets (backend, web, mobile, desktop, edge)`);
  console.log(`    ${c.cyan}fetch${c.reset} [pkgs...]       Fetch & install packages into luna_packages/`);
  console.log(`    ${c.cyan}remove${c.reset} <pkgs...>      Remove packages from luna_packages/`);
  console.log(`    ${c.cyan}search${c.reset} <query>        Search the package registry`);
  console.log(`    ${c.cyan}list${c.reset}                  List installed luna_packages`);
  console.log(`    ${c.cyan}install${c.reset} [pkgs...]     Alias for luna fetch`);
  console.log(`    ${c.cyan}update${c.reset} [pkgs...]      Update dependencies`);
  console.log(`    ${c.cyan}publish${c.reset}               Publish package to registry`);
  console.log(`    ${c.cyan}create${c.reset} <name>         Create new project from template`);
  console.log(`    ${c.cyan}test${c.reset}                  Run tests`);
  console.log(`    ${c.cyan}info${c.reset}                  Show runtime environment info`);
  console.log('');
  console.log(`${c.bold}  Options:${c.reset}`);
  console.log(`    ${c.yellow}--version${c.reset}             Show version`);
  console.log(`    ${c.yellow}--help${c.reset}                Show this help message`);
  console.log(`    ${c.yellow}--port${c.reset} <port>         Server port (default: 3000)`);
  console.log(`    ${c.yellow}--host${c.reset} <host>         Server host (default: localhost)`);
  console.log(`    ${c.yellow}--dev${c.reset}                 Fetch as devDependency`);
  console.log(`    ${c.yellow}--production${c.reset}          Production mode (skip devDependencies)`);
  console.log(`    ${c.yellow}--save${c.reset}                Save to luna.json (default for fetch)`);
  console.log('');
}

function getVersion() {
  const pkgPath = path.resolve(__dirname, '..', 'package.json');
  if (fs.existsSync(pkgPath)) {
    return JSON.parse(fs.readFileSync(pkgPath, 'utf-8')).version;
  }
  return '0.1.0';
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let command = null;
  const positional = [];
  const flags = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(args[i]);
    }
  }

  // First positional is the command
  command = positional.shift() || 'help';

  return { command, positional, flags };
}

/**
 * Command: init
 */
async function cmdInit(positional, flags) {
  const { PackageManager } = require('../src/lpm/manager');
  const pm = new PackageManager();

  const name = positional[0] || path.basename(process.cwd());
  console.log(`\n${c.cyan}  Initializing LUNA project: ${c.bold}${name}${c.reset}\n`);

  const config = await pm.init({ name });
  console.log(`  ${c.green}✓${c.reset} Created luna.json`);
  console.log(`  ${c.green}✓${c.reset} Created project structure`);
  console.log(`\n  ${c.dim}Run ${c.cyan}luna dev${c.reset}${c.dim} to start developing.${c.reset}\n`);
}

/**
 * Command: dev
 */
async function cmdDev(positional, flags) {
  const port = parseInt(flags.port) || 3000;
  const host = flags.host || 'localhost';

  console.log(LOGO);
  console.log(`  ${c.cyan}Starting development server...${c.reset}\n`);

  try {
    const { DevServer } = require('../src/core/dev-server');
    const devServer = new DevServer({ cwd: process.cwd(), mode: 'development' });

    // If an app/ directory exists, use the App Router (Next.js-style)
    if (devServer.hasAppDir()) {
      const Luna = require('../src/index');
      const app = typeof Luna.createApp === 'function' ? Luna.createApp() : new (Luna.Luna || Luna)();
      await app.init();

      const routes = devServer.mount(app);

      if (app.httpServer) {
        app.httpServer.listen(port, host);
      }

      console.log(`  ${c.green}✓${c.reset} Server running at ${c.cyan}http://${host}:${port}${c.reset}\n`);

      // Print route table
      const summary = devServer.getRouteSummary();
      if (summary.length > 0) {
        console.log(`  ${c.bold}Routes:${c.reset}`);
        for (const r of summary) {
          const typeLabel = r.type === 'api'
            ? `${c.yellow}[API]${c.reset}`
            : `${c.green}[PAGE]${c.reset}`;
          const dynamic = r.dynamic ? ` ${c.dim}(dynamic)${c.reset}` : '';
          console.log(`    ${typeLabel} ${c.cyan}${r.url}${c.reset}  ← ${c.dim}${r.file}${c.reset}${dynamic}`);
        }
        console.log('');
      }

      console.log(`  ${c.dim}Press Ctrl+C to stop${c.reset}\n`);
    } else {
      // Fallback: no app/ directory — legacy mode
      const Luna = require('../src/index');
      const app = typeof Luna.createApp === 'function' ? Luna.createApp() : new (Luna.Luna || Luna)();

      await app.init();

      if (app.httpServer) {
        app.httpServer.listen(port, host);
        console.log(`  ${c.green}✓${c.reset} Server running at ${c.cyan}http://${host}:${port}${c.reset}`);
        console.log(`  ${c.dim}Press Ctrl+C to stop${c.reset}\n`);
      } else {
        console.log(`  ${c.green}✓${c.reset} LUNA runtime initialized`);
        console.log(`  ${c.yellow}!${c.reset} No HTTP server configured`);
      }
    }
  } catch (e) {
    console.error(`  ${c.red}✗${c.reset} Failed to start: ${e.message}`);
    if (flags.verbose) console.error(e.stack);
    process.exit(1);
  }
}

/**
 * Command: start
 */
async function cmdStart(positional, flags) {
  const port = parseInt(flags.port) || 3000;
  const host = flags.host || '0.0.0.0';

  console.log(`\n  ${c.cyan}Starting LUNA production server...${c.reset}\n`);

  try {
    const { DevServer } = require('../src/core/dev-server');
    const devServer = new DevServer({ cwd: process.cwd(), mode: 'production' });

    const Luna = require('../src/index');
    const app = typeof Luna.createApp === 'function' ? Luna.createApp() : new (Luna.Luna || Luna)();
    await app.init();

    if (devServer.hasAppDir()) {
      devServer.mount(app);
    }

    if (app.httpServer) {
      app.httpServer.listen(port, host);
      console.log(`  ${c.green}✓${c.reset} Production server at ${c.cyan}http://${host}:${port}${c.reset}\n`);
    }
  } catch (e) {
    console.error(`  ${c.red}✗${c.reset} Failed to start: ${e.message}`);
    process.exit(1);
  }
}

/**
 * Command: build
 */
async function cmdBuild(positional, flags) {
  const { BuildSystem } = require('../src/build/builder');
  const targets = positional.length > 0 ? positional : ['backend', 'web'];

  console.log(LOGO);

  const builder = new BuildSystem();
  await builder.build(targets, { minify: !flags.noMinify });
}

/**
 * Command: install (old alias)
 */
async function cmdInstall(positional, flags) {
  // Redirect to fetch
  return cmdFetch(positional, flags);
}

/**
 * Command: fetch
 */
async function cmdFetch(positional, flags) {
  const { PackageManager } = require('../src/lpm/manager');
  const pm = new PackageManager();

  const startLine = `\n  ${c.cyan}${c.bold}🌙 LUNA Fetch${c.reset}\n`;
  console.log(startLine);

  if (positional.length > 0) {
    // Fetch specific packages
    const result = await pm.fetch(positional, {
      dev: flags.dev || false,
      production: flags.production || false
    });

    console.log('');
    if (result.count > 0) {
      console.log(`  ${c.green}✓${c.reset} Fetched ${c.bold}${result.count}${c.reset} package(s) into ${c.cyan}luna_packages/${c.reset}`);
      if (result.addedTo) {
        console.log(`  ${c.dim}Saved to ${result.addedTo} in luna.json${c.reset}`);
      }
    } else {
      console.log(`  ${c.dim}Nothing to fetch — all packages up to date${c.reset}`);
    }
    console.log(`  ${c.dim}Done in ${result.time}ms${c.reset}\n`);
  } else {
    // Fetch all from luna.json
    const result = await pm.fetch([], {
      production: flags.production || false
    });

    console.log('');
    if (result.count > 0) {
      console.log(`  ${c.green}✓${c.reset} Fetched ${c.bold}${result.count}${c.reset} package(s) into ${c.cyan}luna_packages/${c.reset}`);
    } else {
      console.log(`  ${c.dim}Nothing to fetch — all packages up to date${c.reset}`);
    }
    console.log(`  ${c.dim}Done in ${result.time}ms${c.reset}\n`);
  }
}

/**
 * Command: remove
 */
async function cmdRemove(positional, flags) {
  const { PackageManager } = require('../src/lpm/manager');
  const pm = new PackageManager();

  if (positional.length === 0) {
    console.error(`\n  ${c.red}✗${c.reset} Please specify packages to remove: luna remove <pkg1> <pkg2>\n`);
    process.exit(1);
  }

  console.log(`\n  ${c.cyan}Removing packages...${c.reset}\n`);
  const result = await pm.remove(positional);

  if (result.count > 0) {
    console.log(`\n  ${c.green}✓${c.reset} Removed ${result.count} package(s)\n`);
  } else {
    console.log(`\n  ${c.yellow}!${c.reset} No packages matched\n`);
  }
}

/**
 * Command: search
 */
async function cmdSearch(positional, flags) {
  const { PackageManager } = require('../src/lpm/manager');
  const pm = new PackageManager();

  const query = positional.join(' ') || '';
  if (!query) {
    console.error(`\n  ${c.red}✗${c.reset} Please specify a search query: luna search <query>\n`);
    process.exit(1);
  }

  console.log(`\n  ${c.cyan}Searching for "${query}"...${c.reset}\n`);
  const results = await pm.search(query);

  if (results.length === 0) {
    console.log(`  ${c.dim}No packages found${c.reset}\n`);
  } else {
    for (const r of results) {
      console.log(`  ${c.bold}${r.name}${c.reset}${r.version ? ` ${c.dim}v${r.version}${c.reset}` : ''}`);
      if (r.description) console.log(`  ${c.dim}${r.description}${c.reset}`);
      console.log('');
    }
    console.log(`  ${c.dim}${results.length} package(s) found${c.reset}\n`);
  }
}

/**
 * Command: list
 */
async function cmdList(positional, flags) {
  const { PackageManager } = require('../src/lpm/manager');
  const pm = new PackageManager();

  const installed = pm.listFetched();

  console.log(`\n  ${c.cyan}${c.bold}Installed luna_packages${c.reset}\n`);

  if (installed.length === 0) {
    console.log(`  ${c.dim}No packages installed${c.reset}\n`);
  } else {
    for (const pkg of installed) {
      console.log(`  ${c.bold}${pkg.name}${c.reset} ${c.dim}v${pkg.version}${c.reset}`);
    }
    console.log(`\n  ${c.dim}${installed.length} package(s)${c.reset}\n`);
  }
}

/**
 * Command: update
 */
async function cmdUpdate(positional, flags) {
  const { PackageManager } = require('../src/lpm/manager');
  const pm = new PackageManager();

  console.log(`\n  ${c.cyan}Updating dependencies...${c.reset}\n`);
  await pm.update(positional);
  console.log(`\n  ${c.green}✓${c.reset} Dependencies updated\n`);
}

/**
 * Command: publish
 */
async function cmdPublish(positional, flags) {
  const { PackageManager } = require('../src/lpm/manager');
  const pm = new PackageManager();

  console.log(`\n  ${c.cyan}Publishing package...${c.reset}\n`);
  const result = await pm.publish();
  console.log(`  ${c.green}✓${c.reset} Published ${result.name}@${result.version}\n`);
}

/**
 * Command: create
 */
async function cmdCreate(positional, flags) {
  if (positional.length === 0) {
    console.error(`\n  ${c.red}✗${c.reset} Please provide a project name: luna create <name>\n`);
    process.exit(1);
  }

  const { PackageManager } = require('../src/lpm/manager');
  const pm = new PackageManager();

  const name = positional[0];
  const template = flags.template || 'default';

  console.log(LOGO);
  console.log(`  ${c.cyan}Creating project: ${c.bold}${name}${c.reset}\n`);
  const result = await pm.create(name, template);

  console.log(`  ${c.green}✓${c.reset} Project created at ${c.cyan}${result.path}${c.reset}\n`);

  // Show project tree
  console.log(`  ${c.bold}Project structure:${c.reset}\n`);
  console.log(`    ${c.cyan}${name}/${c.reset}`);
  console.log(`    ├── ${c.yellow}app/${c.reset}                    ${c.dim}# File-based routing${c.reset}`);
  console.log(`    │   ├── layout.js           ${c.dim}# Root layout${c.reset}`);
  console.log(`    │   ├── page.js             ${c.dim}# Home page → /${c.reset}`);
  console.log(`    │   ├── globals.css          ${c.dim}# Global styles${c.reset}`);
  console.log(`    │   ├── loading.js           ${c.dim}# Loading state${c.reset}`);
  console.log(`    │   ├── not-found.js         ${c.dim}# 404 page${c.reset}`);
  console.log(`    │   ├── error.js             ${c.dim}# Error boundary${c.reset}`);
  console.log(`    │   ├── ${c.yellow}about/${c.reset}page.js       ${c.dim}# /about${c.reset}`);
  console.log(`    │   ├── ${c.yellow}blog/${c.reset}page.js        ${c.dim}# /blog${c.reset}`);
  console.log(`    │   │   └── ${c.magenta}[slug]/${c.reset}page.js ${c.dim}# /blog/:slug${c.reset}`);
  console.log(`    │   └── ${c.yellow}api/${c.reset}`);
  console.log(`    │       ├── ${c.yellow}hello/${c.reset}route.js  ${c.dim}# GET/POST /api/hello${c.reset}`);
  console.log(`    │       └── ${c.yellow}health/${c.reset}route.js ${c.dim}# GET /api/health${c.reset}`);
  console.log(`    ├── ${c.yellow}components/${c.reset}            ${c.dim}# Reusable components${c.reset}`);
  console.log(`    ├── ${c.yellow}lib/${c.reset}                   ${c.dim}# Utilities${c.reset}`);
  console.log(`    ├── ${c.yellow}public/${c.reset}                ${c.dim}# Static files${c.reset}`);
  console.log(`    ├── luna.json               ${c.dim}# Manifest${c.reset}`);
  console.log(`    └── luna.config.js          ${c.dim}# Configuration${c.reset}`);
  console.log('');
  console.log(`  ${c.bold}Get started:${c.reset}\n`);
  console.log(`    ${c.cyan}cd ${name}${c.reset}`);
  console.log(`    ${c.cyan}luna dev${c.reset}\n`);
}

/**
 * Command: test
 */
async function cmdTest(positional, flags) {
  console.log(`\n  ${c.cyan}Running LUNA tests...${c.reset}\n`);

  const testDir = path.resolve(process.cwd(), 'tests');
  if (!fs.existsSync(testDir)) {
    console.log(`  ${c.yellow}!${c.reset} No tests directory found\n`);
    return;
  }

  const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.test.js'));
  if (testFiles.length === 0) {
    console.log(`  ${c.yellow}!${c.reset} No test files found\n`);
    return;
  }

  let passed = 0;
  let failed = 0;

  for (const file of testFiles) {
    try {
      const testModule = require(path.join(testDir, file));
      if (typeof testModule.run === 'function') {
        const results = await testModule.run();
        passed += results.passed || 0;
        failed += results.failed || 0;
      }
    } catch (e) {
      console.error(`  ${c.red}✗${c.reset} ${file}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n  Results: ${c.green}${passed} passed${c.reset}, ${failed > 0 ? c.red : c.dim}${failed} failed${c.reset}\n`);
  if (failed > 0) process.exit(1);
}

/**
 * Command: info
 */
function cmdInfo() {
  const { detectPlatform, PLATFORM_CAPABILITIES } = require('../src/ucc/continuity');

  console.log(LOGO);
  console.log(`${c.bold}  Version:${c.reset}      ${getVersion()}`);
  console.log(`${c.bold}  Platform:${c.reset}     ${detectPlatform()}`);
  console.log(`${c.bold}  Node.js:${c.reset}      ${process.version}`);
  console.log(`${c.bold}  V8:${c.reset}           ${process.versions.v8}`);
  console.log(`${c.bold}  OS:${c.reset}           ${process.platform} ${process.arch}`);
  console.log(`${c.bold}  CPUs:${c.reset}         ${require('os').cpus().length}`);
  console.log(`${c.bold}  Memory:${c.reset}       ${(require('os').totalmem() / (1024 ** 3)).toFixed(1)} GB`);

  const platform = detectPlatform();
  const caps = PLATFORM_CAPABILITIES[platform] || [];
  console.log(`${c.bold}  Capabilities:${c.reset} ${caps.join(', ')}`);
  console.log('');
}

// --- Main ---

async function main() {
  const { command, positional, flags } = parseArgs(process.argv);

  if (flags.version) {
    console.log(getVersion());
    return;
  }

  if (flags.help || command === 'help') {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case 'init':    return cmdInit(positional, flags);
      case 'dev':     return cmdDev(positional, flags);
      case 'start':   return cmdStart(positional, flags);
      case 'build':   return cmdBuild(positional, flags);
      case 'fetch':   return cmdFetch(positional, flags);
      case 'install': return cmdInstall(positional, flags);
      case 'remove':  return cmdRemove(positional, flags);
      case 'uninstall': return cmdRemove(positional, flags);
      case 'search':  return cmdSearch(positional, flags);
      case 'list':    return cmdList(positional, flags);
      case 'ls':      return cmdList(positional, flags);
      case 'update':  return cmdUpdate(positional, flags);
      case 'publish': return cmdPublish(positional, flags);
      case 'create':  return cmdCreate(positional, flags);
      case 'test':    return cmdTest(positional, flags);
      case 'info':    return cmdInfo();
      default:
        console.error(`\n  ${c.red}✗${c.reset} Unknown command: ${command}`);
        console.error(`  ${c.dim}Run ${c.cyan}luna --help${c.dim} for available commands${c.reset}\n`);
        process.exit(1);
    }
  } catch (e) {
    console.error(`\n  ${c.red}Error:${c.reset} ${e.message}\n`);
    if (flags.verbose) console.error(e.stack);
    process.exit(1);
  }
}

main();
