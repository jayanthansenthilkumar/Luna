#!/usr/bin/env node

/**
 * LUNA CLI – Command Line Interface
 * 
 * Usage:
 *   luna init [name]          Initialize a new LUNA project
 *   luna dev                  Start development server with HMR
 *   luna start                Start production server
 *   luna build [targets...]   Build for targets (backend, web, mobile, desktop, edge)
 *   luna install [pkgs...]    Install dependencies
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
  console.log(`    ${c.cyan}install${c.reset} [pkgs...]     Install dependencies`);
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
  console.log(`    ${c.yellow}--dev${c.reset}                 Install as devDependency`);
  console.log(`    ${c.yellow}--production${c.reset}          Production mode`);
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
  const command = args[0] || 'help';
  const positional = [];
  const flags = {};

  for (let i = 1; i < args.length; i++) {
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
  } catch (e) {
    console.error(`  ${c.red}✗${c.reset} Failed to start: ${e.message}`);
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
    const Luna = require('../src/index');
    const app = typeof Luna.createApp === 'function' ? Luna.createApp() : new (Luna.Luna || Luna)();

    await app.init();

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
 * Command: install
 */
async function cmdInstall(positional, flags) {
  const { PackageManager } = require('../src/lpm/manager');
  const pm = new PackageManager();

  console.log(`\n  ${c.cyan}Installing dependencies...${c.reset}\n`);
  await pm.install(positional, { dev: flags.dev, production: flags.production });
  console.log(`\n  ${c.green}✓${c.reset} Dependencies installed\n`);
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

  console.log(`\n  ${c.cyan}Creating project: ${c.bold}${name}${c.reset}\n`);
  const result = await pm.create(name, template);
  console.log(`  ${c.green}✓${c.reset} Project created at ${c.cyan}${result.path}${c.reset}`);
  console.log(`\n  ${c.dim}cd ${name} && luna dev${c.reset}\n`);
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
      case 'install': return cmdInstall(positional, flags);
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
