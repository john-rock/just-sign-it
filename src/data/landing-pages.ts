// Each entry becomes a page at /<slug>. Add an entry here to add a landing page.
//
// Writing guide (for search and for answer engines like ChatGPT, Perplexity and Google AI Overviews):
// - One page answers one search. If two pages would say the same thing, merge them.
// - `answer` comes first on the page. Answer the question in 1–2 plain sentences, no lead-in.
// - `sections` is where the page earns its place: details specific to this device, document or question.
// - FAQ answers are shown on the page and sent to search engines as FAQ data. Keep each to a few sentences.
// - Only claim what the app really does.
export interface LandingPage {
  slug: string;
  title: string;        // <title> / SEO, ~60 characters
  description: string;  // meta description, ~150 characters
  headline: string;     // <h1>, also the link text in the footer and in "Related" lists
  answer: string;       // the direct answer, shown right under the headline
  sections?: { heading: string; paragraphs: string[] }[];
  steps: string[];
  faq: { q: string; a: string }[];
  related?: string[];   // slugs of other landing pages; defaults to the next few in this list
}

export const landingPages: LandingPage[] = [
  // Example:
  // {
  //   slug: 'sign-pdf-without-account',
  //   title: 'Sign a PDF without creating an account | Just Sign It',
  //   description: 'Sign a PDF for free with no account, no trial and no upload. Open the file, add your signature and download it.',
  //   headline: 'Sign a PDF without creating an account',
  //   answer: 'Open your PDF in Just Sign It, add your signature and download the signed copy. There’s no account, no trial and no email address to give.',
  //   sections: [
  //     { heading: 'Why most signers ask for an account', paragraphs: ['…'] },
  //   ],
  //   steps: ['Drop your PDF onto the page', 'Draw, type or upload your signature', 'Drag it into place and download'],
  //   faq: [{ q: 'Is my PDF uploaded?', a: 'No. Everything happens in your browser, so the file never leaves your computer.' }],
  //   related: ['sign-pdf-without-uploading'],
  // },
];

/** Pages to link from the bottom of `page`: its `related` list, or the next three pages. */
export function relatedPages(page: LandingPage): LandingPage[] {
  if (page.related?.length) {
    return page.related
      .map((slug) => landingPages.find((p) => p.slug === slug))
      .filter((p): p is LandingPage => p !== undefined);
  }
  const i = landingPages.indexOf(page);
  return [1, 2, 3]
    .map((n) => landingPages[(i + n) % landingPages.length])
    .filter((p, idx, arr) => p !== page && arr.indexOf(p) === idx);
}
