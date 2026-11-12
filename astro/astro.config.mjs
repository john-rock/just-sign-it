import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://justsignit.example', // TODO: set the real domain (used for canonical URLs)
  build: {
    // Keep all CSS in external files so the strict CSP (style-src 'self') keeps working.
    inlineStylesheets: 'never',
  },
});
