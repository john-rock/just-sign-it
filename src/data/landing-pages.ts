// Each entry becomes a page at /<slug>. Add an entry here to add a landing page.
export interface LandingPage {
  slug: string;
  title: string;        // <title> / SEO
  description: string;  // meta description
  headline: string;
  subhead: string;
  steps: string[];
  faq: { q: string; a: string }[];
}

export const landingPages: LandingPage[] = [
  // Example:
  // {
  //   slug: 'sign-pdf-on-mac',
  //   title: 'Sign a PDF on Mac — free, no upload | Just Sign It',
  //   description: 'Sign a PDF on your Mac in seconds, right in the browser.',
  //   headline: 'Sign a PDF on your Mac in under a minute',
  //   subhead: 'Drop in the PDF, draw or type your signature, drag it into place, download.',
  //   steps: ['Drop your PDF onto the page', 'Make your signature', 'Place it and download'],
  //   faq: [{ q: 'Is my PDF uploaded?', a: 'No. Everything happens in your browser.' }],
  // },
];
