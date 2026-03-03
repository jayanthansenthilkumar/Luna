/**
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
