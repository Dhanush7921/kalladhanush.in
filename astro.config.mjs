// @ts-check
import { writeFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Deployment target — the one switch for moving between addresses.
 *
 *   false → https://dhanush7921.github.io/kalladhanush.in/  (temporary, while the
 *           kalladhanush.in registration awaits GoDaddy verification)
 *   true  → https://kalladhanush.in/  (root path; also writes dist/CNAME)
 *
 * When switching to true, also re-add `kalladhanush.in` under
 * GitHub → Settings → Pages → Custom domain (see README).
 */
const USE_CUSTOM_DOMAIN = false;

const customDomain = 'kalladhanush.in';

export default defineConfig({
  site: USE_CUSTOM_DOMAIN ? `https://${customDomain}` : 'https://dhanush7921.github.io',
  base: USE_CUSTOM_DOMAIN ? '/' : '/kalladhanush.in',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  integrations: [
    sitemap({ filter: (page) => !page.includes('/404') }),
    {
      name: 'custom-domain-cname',
      hooks: {
        'astro:build:done': ({ dir }) => {
          if (USE_CUSTOM_DOMAIN) writeFileSync(new URL('CNAME', dir), `${customDomain}\n`);
        },
      },
    },
  ],
  image: { responsiveStyles: false },
  vite: { build: { chunkSizeWarningLimit: 900 } },
});
