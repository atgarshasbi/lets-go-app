const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  css: {
    // Prevent Vite from searching parent directories and finding the
    // frontend's postcss.config.js (which needs tailwindcss, not installed
    // here) — this is a plain Node API with no CSS to process.
    postcss: {},
  },
  test: {
    environment: 'node',
  },
});
