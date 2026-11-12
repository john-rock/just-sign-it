// robots.txt, built from the `site` setting so the sitemap URL is always right.
// AI crawlers are listed by name so it's explicit that answer engines may read and cite the site.
import type { APIRoute } from 'astro';

const aiCrawlers = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'CCBot',
];

export const GET: APIRoute = ({ site }) => {
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    ...aiCrawlers.flatMap((bot) => [`User-agent: ${bot}`, 'Allow: /', '']),
    `Sitemap: ${new URL('/sitemap-index.xml', site)}`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
