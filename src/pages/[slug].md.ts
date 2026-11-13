// Markdown copy of each guide page, at /<slug>.md. See data/markdown.ts.
import type { APIRoute } from 'astro';
import { landingPages, type LandingPage } from '../data/landing-pages';
import { landingPage, markdownResponse, renderMarkdown } from '../data/markdown';

export function getStaticPaths() {
  return landingPages.map((page) => ({ params: { slug: page.slug }, props: { page } }));
}

export const GET: APIRoute = ({ props, site }) =>
  markdownResponse(renderMarkdown(landingPage(props.page as LandingPage, site), site));
