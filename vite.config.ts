import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * BASE_PATH is set by the GitHub Pages workflow from `actions/configure-pages`:
 *   - custom domain (kalladhanush.in)          → "/"
 *   - project page (dhanush7921.github.io/...) → "/kalladhanush.in/"
 * Locally it defaults to "/".
 */
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  assetsInclude: ['**/*.bin'],
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 650,
  },
});
