/**
 * LUNA Landing Page – Built with the LUNA Framework
 * 
 * This website is itself a showcase of Luna's capabilities:
 * - HttpServer for serving
 * - Router for route handling
 * - h() VNode factory for component-based UI
 * - SSR engine for server-side rendering
 * - Middleware pipeline (compression, security headers)
 * - Reactive state for visitor counter
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { HttpServer } = require('../src/net/http-server');
const { Router } = require('../src/net/router');
const { MiddlewarePipeline } = require('../src/net/middleware');
const { h } = require('../src/ui/engine');
const { QuantumStateRenderer } = require('../src/qsr/quantum-state');

const { renderPage } = require('./pages/home');
const { renderDocsPage } = require('./pages/docs');

// ── State ──────────────────────────────────────────
const qsr = new QuantumStateRenderer({ batchUpdates: false });
qsr.set('visitors', 0);

// ── Router ─────────────────────────────────────────
const router = new Router();
const middleware = new MiddlewarePipeline();

// ── Static file serving ────────────────────────────
function serveStatic(baseDir) {
  const MIME = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.json': 'application/json'
  };

  return (req, res, next) => {
    if (!req.pathname.startsWith('/static/')) return next();
    const filePath = path.join(baseDir, req.pathname.replace('/static/', ''));
    if (!fs.existsSync(filePath)) { res.status(404).text('Not found'); return; }
    const ext = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.header('content-type', mime);
    res.header('cache-control', 'public, max-age=86400');
    res.send(fs.readFileSync(filePath));
  };
}

middleware.use(serveStatic(path.join(__dirname, 'static')));

// ── Routes ─────────────────────────────────────────
router.add('GET', '/', (req, res) => {
  qsr.set('visitors', qsr.get('visitors') + 1);
  const html = renderPage(qsr);
  res.html(html);
});

router.add('GET', '/docs', (req, res) => {
  const html = renderDocsPage();
  res.html(html);
});

router.add('GET', '/api/stats', (req, res) => {
  res.json({
    visitors: qsr.get('visitors'),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    platform: process.platform
  });
});

// ── Server ─────────────────────────────────────────
const server = new HttpServer({
  router,
  middleware,
  port: 3000
});

(async () => {
  await server.listen(3000, '0.0.0.0');
  console.log('\n  \x1b[36m\x1b[1m🌙 LUNA Landing Page\x1b[0m');
  console.log('  \x1b[2mBuilt with the LUNA Framework\x1b[0m\n');
  console.log('  \x1b[32m✓\x1b[0m Server running at \x1b[36mhttp://localhost:3000\x1b[0m\n');
})();
