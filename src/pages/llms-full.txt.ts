// /llms-full.txt: every page on the site as markdown, in one file, for agents that want it all at once.
import type { APIRoute } from 'astro';
import { allPages, renderMarkdown } from '../data/markdown';

export const GET: APIRoute = ({ site }) => {
  const text = allPages(site).map((page) => renderMarkdown(page, site)).join('\n');
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
