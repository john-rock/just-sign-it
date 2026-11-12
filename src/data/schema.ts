// JSON-LD builders shared by the pages. Pass the result to <Site schema={...}>.
import type { LandingPage } from './landing-pages';

export function appSchema(site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Just Sign It',
    url: new URL('/', site).href,
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
    sameAs: ['https://github.com/john-rock/just-sign-it'],
  };
}

export function faqSchema(faq: LandingPage['faq']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function breadcrumbSchema(site: URL | undefined, name: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Just Sign It', item: new URL('/', site).href },
      { '@type': 'ListItem', position: 2, name, item: new URL(path, site).href },
    ],
  };
}
