// Vercel Routing Middleware: content negotiation for AI agents.
// A request for a page that sends `Accept: text/markdown` gets the page's markdown copy
// (/why → /why.md, / → /index.md) at the same URL. Everyone else gets the normal HTML page.
// The .md files are built by src/pages/*.md.ts; see src/data/markdown.ts.
import { next, rewrite } from '@vercel/functions';

export const config = {
  runtime: 'nodejs',
  // Page URLs only: skip anything with a dot (assets, .md, .txt, .xml) and the asset folders.
  matcher: ['/((?!_astro/|vendor/|fonts/|.*\\.).*)'],
};

export default function middleware(request: Request) {
  const accept = request.headers.get('accept') ?? '';
  if (!/\btext\/markdown\b/i.test(accept)) return next();

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');
  url.pathname = path === '' ? '/index.md' : `${path}.md`;
  return rewrite(url);
}
