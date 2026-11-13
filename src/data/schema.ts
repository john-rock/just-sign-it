// JSON-LD builders shared by the pages. Pass the result to <Site schema={...}> or <Base schema={...}>.
// Nodes that appear on more than one page (the organization, the website, the app) carry a stable @id,
// so search and answer engines can tell they're the same thing everywhere.
import type { LandingPage } from './landing-pages';

const ctx = 'https://schema.org';
const abs = (site: URL | undefined, path: string) => new URL(path, site).href;
const ids = (site: URL | undefined) => ({
  organization: abs(site, '/#organization'),
  website: abs(site, '/#website'),
  app: abs(site, '/sign#app'),
});
const githubUrl = 'https://github.com/john-rock/just-sign-it';

/** Who publishes the site. Referenced by @id from every other node. */
export function organizationSchema(site: URL | undefined) {
  return {
    '@context': ctx,
    '@type': 'Organization',
    '@id': ids(site).organization,
    name: 'Just Sign It',
    url: abs(site, '/'),
    image: abs(site, '/og.png'),
    sameAs: [githubUrl],
  };
}

/** The site as a whole. Goes on the homepage. */
export function websiteSchema(site: URL | undefined) {
  return {
    '@context': ctx,
    '@type': 'WebSite',
    '@id': ids(site).website,
    name: 'Just Sign It',
    url: abs(site, '/'),
    description: 'Sign PDFs in your browser. Free, no account, and your file is never uploaded.',
    inLanguage: 'en',
    publisher: { '@id': ids(site).organization },
  };
}

/** The signer app, which lives at /sign. Goes on the homepage and on /sign. */
export function appSchema(site: URL | undefined) {
  return {
    '@context': ctx,
    '@type': 'WebApplication',
    '@id': ids(site).app,
    name: 'Just Sign It',
    url: abs(site, '/sign'),
    description:
      'Sign PDFs in your browser. Draw, type or upload your signature, place it on any page and download the signed PDF. Nothing is uploaded and no account is needed.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any (runs in a web browser)',
    browserRequirements: 'Requires a modern web browser with JavaScript.',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Draw, type or upload a signature',
      'Remove the white background from a photo of a signature',
      'Save more than one signature, such as full signature and initials',
      'Place signatures on any page',
      'Runs entirely in the browser; the PDF is never uploaded',
    ],
    image: abs(site, '/og.png'),
    publisher: { '@id': ids(site).organization },
    sameAs: [githubUrl],
  };
}

/** A guide page as an article. */
export function articleSchema(site: URL | undefined, page: LandingPage) {
  const url = abs(site, `/${page.slug}`);
  return {
    '@context': ctx,
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: page.headline,
    description: page.description,
    url,
    mainEntityOfPage: url,
    image: abs(site, '/og.png'),
    inLanguage: 'en',
    author: { '@id': ids(site).organization },
    publisher: { '@id': ids(site).organization },
    isPartOf: { '@id': ids(site).website },
    about: { '@id': ids(site).app },
  };
}

/** The "How it works" steps on a guide page, for the how-to guides. */
export function howToSchema(site: URL | undefined, page: LandingPage) {
  const url = abs(site, `/${page.slug}`);
  return {
    '@context': ctx,
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name: page.headline,
    description: page.answer,
    url,
    tool: { '@type': 'HowToTool', name: 'Just Sign It (free, runs in a web browser)' },
    step: page.steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
  };
}

/** A plain page on the site, e.g. AboutPage for /why. */
export function webPageSchema(
  site: URL | undefined,
  { type = 'WebPage', path, name, description }: { type?: string; path: string; name: string; description: string },
) {
  const url = abs(site, path);
  return {
    '@context': ctx,
    '@type': type,
    '@id': url,
    name,
    description,
    url,
    inLanguage: 'en',
    isPartOf: { '@id': ids(site).website },
    publisher: { '@id': ids(site).organization },
  };
}

export function faqSchema(faq: LandingPage['faq']) {
  return {
    '@context': ctx,
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** Breadcrumb trail below the homepage, e.g. [['Guides', '/guides'], ['Some guide', '/some-guide']]. */
export function breadcrumbSchema(site: URL | undefined, trail: [name: string, path: string][]) {
  const crumbs: [string, string][] = [['Just Sign It', '/'], ...trail];
  return {
    '@context': ctx,
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: abs(site, path),
    })),
  };
}
