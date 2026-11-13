// Markdown copy of the homepage, at /index.md. See data/markdown.ts.
import type { APIRoute } from 'astro';
import { homePage, markdownResponse, renderMarkdown } from '../data/markdown';

export const GET: APIRoute = ({ site }) => markdownResponse(renderMarkdown(homePage(site), site));
