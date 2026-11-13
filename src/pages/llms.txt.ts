// /llms.txt (https://llmstxt.org): a short map of the site for AI agents, linking to the markdown copy of each page.
// Built from the same data as the pages, so new guides show up here automatically.
import type { APIRoute } from 'astro';
import { pagesByGroup } from '../data/landing-pages';
import { guidesPage, homePage, markdownPath, signPage, siteName, siteSummary, whyPage } from '../data/markdown';

export const GET: APIRoute = ({ site }) => {
  const url = (path: string) => new URL(markdownPath(path), site).href;
  const item = (name: string, path: string, description: string) => `- [${name}](${url(path)}): ${description}`;
  const home = homePage(site);
  const sign = signPage(site);
  const guides = guidesPage(site);
  const why = whyPage(site);

  const lines = [
    `# ${siteName}`,
    '',
    `> ${siteSummary}`,
    '',
    'Just Sign It is an interactive web app, not an API. People use it at ' +
      `${new URL('/sign', site).href} in a browser. It places an image of a signature on the PDF; it does not create certificate-based digital signatures. ` +
      'Every page below is also available as markdown: add ".md" to its URL, or request the page with "Accept: text/markdown".',
    '',
    '## Start here',
    '',
    item('Home', home.path, home.description),
    item('Sign a PDF (the app)', sign.path, sign.description),
    item('Guides', guides.path, guides.description),
    '',
    ...pagesByGroup().flatMap((group) => [
      `## ${group.label}`,
      '',
      ...group.pages.map((p) => item(p.headline, `/${p.slug}`, p.description)),
      '',
    ]),
    '## Optional',
    '',
    item('Why I built this', why.path, why.description),
    `- [Source code on GitHub](https://github.com/john-rock/just-sign-it): The app is open source.`,
    `- [Full site as one file](${new URL('/llms-full.txt', site).href}): Every page above, in markdown.`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
