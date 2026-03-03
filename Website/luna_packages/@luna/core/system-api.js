/**
 * LUNA System API - Unified platform abstraction
 */
module.exports = {
  platform: {
    os: process.platform,
    arch: process.arch,
    target: 'backend'
  },
  env: process.env,
  fs: require('fs'),
  path: require('path'),
  crypto: require('crypto')
};
