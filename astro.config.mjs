// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Custom apex domain on GitHub Pages: the site is served from the root path.
export default defineConfig({
  site: 'https://kalladhanush.in',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  integrations: [
    sitemap({ filter: (page) => !page.includes('/404') }),
  ],
  image: { responsiveStyles: false },
  vite: { build: { chunkSizeWarningLimit: 900 } },
});
