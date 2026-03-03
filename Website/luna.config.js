/**
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
