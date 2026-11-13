// Markdown copy of /why, at /why.md. See data/markdown.ts.
import type { APIRoute } from 'astro';
import { whyPage, markdownResponse, renderMarkdown } from '../data/markdown';

export const GET: APIRoute = ({ site }) => markdownResponse(renderMarkdown(whyPage(site), site));
