import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Canonical URLs, og:image, the sitemap and robots.txt all build from this.
  site: 'https://www.justsignit.dev',
  // No trailing slashes, so canonical tags, the sitemap and Vercel's cleanUrls all agree on one URL per page.
  trailingSlash: 'never',
  integrations: [sitemap()],
  build: {
    // Keep all CSS in external files so the strict CSP (style-src 'self') keeps working.
    inlineStylesheets: 'never',
  },
});
