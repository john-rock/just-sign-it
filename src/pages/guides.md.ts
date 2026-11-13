// Markdown copy of /guides, at /guides.md. See data/markdown.ts.
import type { APIRoute } from 'astro';
import { guidesPage, markdownResponse, renderMarkdown } from '../data/markdown';

export const GET: APIRoute = ({ site }) => markdownResponse(renderMarkdown(guidesPage(site), site));
