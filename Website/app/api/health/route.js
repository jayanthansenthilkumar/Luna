/**
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
