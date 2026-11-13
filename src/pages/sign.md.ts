// Markdown copy of /sign, at /sign.md. See data/markdown.ts.
import type { APIRoute } from 'astro';
import { signPage, markdownResponse, renderMarkdown } from '../data/markdown';

export const GET: APIRoute = ({ site }) => markdownResponse(renderMarkdown(signPage(site), site));
