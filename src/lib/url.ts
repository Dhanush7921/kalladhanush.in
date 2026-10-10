/**
 * Base-path aware URLs. Every internal link and asset path goes through `url()`,
 * so moving between the GitHub project URL (/kalladhanush.in) and the custom
 * domain (/) is a single switch in astro.config.mjs.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

export const url = (path: string) =>
  path.startsWith('/') && !path.startsWith('//') ? `${BASE}${path}` : path;
