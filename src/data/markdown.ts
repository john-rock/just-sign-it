// Markdown versions of every page, for AI agents and answer engines.
// Served at /<page>.md (and /index.md for the homepage), and returned from the normal page URL
// when a request sends `Accept: text/markdown` (see /middleware.ts).
// Also used to build /llms.txt and /llms-full.txt.
//
// Guide pages are built from data/landing-pages.ts, so they stay in sync automatically.
// The homepage, /why and /sign are written by hand below: KEEP THEM IN SYNC with
// src/pages/index.astro, src/pages/why.astro and src/pages/sign.astro when you edit those pages.
import { pagesByGroup, relatedPages, signSteps, type LandingPage } from './landing-pages';

export const siteName = 'Just Sign It';
export const siteSummary =
  'A free PDF signer that runs entirely in your browser. Draw, type or upload your signature, place it on any page and download the signed PDF. Nothing is uploaded and no account is needed.';

export interface MarkdownPage {
  path: string; // the HTML page's path, e.g. "/" or "/why"
  title: string;
  description: string;
  body: string; // markdown, starting with the page's "# " heading
}

/** Path of the markdown copy of an HTML page: "/" → "/index.md", "/why" → "/why.md". */
export function markdownPath(path: string): string {
  const clean = path.replace(/\/+$/, '');
  return clean === '' ? '/index.md' : `${clean}.md`;
}

/** The full .md file: a small front matter block (title, description, canonical URL) and the body. */
export function renderMarkdown(page: MarkdownPage, site: URL | undefined): string {
  const frontMatter = [
    '---',
    // JSON strings are valid YAML, which keeps quotes and colons in titles safe.
    `title: ${JSON.stringify(page.title)}`,
    `description: ${JSON.stringify(page.description)}`,
    `url: ${new URL(page.path, site).href}`,
    '---',
  ].join('\n');
  return `${frontMatter}\n\n${page.body.trim()}\n`;
}

export function markdownResponse(text: string): Response {
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}

const link = (site: URL | undefined, text: string, path: string) => `[${text}](${new URL(path, site).href})`;
const signCta = (site: URL | undefined) => link(site, 'Sign a PDF', '/sign');

export function homePage(site: URL | undefined): MarkdownPage {
  return {
    path: '/',
    title: 'Just Sign It — Sign a PDF in your browser',
    description:
      'Sign PDFs right in your browser. Nothing gets uploaded, so your file never leaves your computer. Free, no account.',
    body: `
# Sign PDFs right in your browser.

Open a PDF, add your signature, and download the signed copy. Nothing gets uploaded, so your file never leaves your computer.

It’s free and you don’t need an account.

${signCta(site)}

## What it does

- Opens any PDF. Drop it on the page or pick it from your files.
- Lets you draw your signature, type your name in a handwriting font, or upload a photo of it. If you upload a photo, it can remove the white background.
- Saves more than one signature, so you can keep your full signature and your initials.
- Puts a signature anywhere on any page. Drag to move it, use the corner to resize it, and use the arrow keys to nudge it.
- Downloads a new PDF with your signatures on it.

## Why it works this way

- **Your file stays on your computer.** Leases, contracts and tax forms are private. There’s ${link(site, 'no server here to send them to', '/sign-pdf-without-uploading')}.
- **No account.** ${link(site, 'You shouldn’t need to sign up', '/sign-pdf-without-account')} just to sign one page.
- **It only remembers your signatures if you ask it to.** Check “Remember my signatures” to save them on your device. Leave it off on shared computers.
- **It’s an image of your signature.** It isn’t a ${link(site, 'certified digital signature', '/electronic-vs-digital-signature')}. Wondering if that counts? See ${link(site, 'whether electronic signatures are legally binding', '/are-electronic-signatures-legally-binding')}.

## Want to improve it or found a bug?

The code is open source. Report a bug or suggest a change on [GitHub](https://github.com/john-rock/just-sign-it).
`,
  };
}

export function whyPage(site: URL | undefined): MarkdownPage {
  return {
    path: '/why',
    title: 'Why I built Just Sign It',
    description:
      'I needed to sign a few documents for my township and couldn’t find a simple PDF signer that didn’t make me create an account. So I built one.',
    body: `
# Why I built this

I recently had to sign a few documents for my township. Simple stuff: open the PDF, put my signature on it, send it back.

Ten minutes and four failed attempts later, I still hadn’t found an online PDF signer that just let me do that. Every one of them wanted me to create an account, start a free trial, or jump through a thousand hoops before I could sign a single page.

I realized it doesn’t need to be that way. Signing a PDF should take less than a minute. So I built Just Sign It.

## What I wanted

- **No account.** Open the page, sign the PDF, download it. Done.
- **No uploading.** Documents like these are private, so everything happens in your browser and your file never leaves your computer.
- **No catch.** It’s free, and the code is open source on [GitHub](https://github.com/john-rock/just-sign-it).

If you’ve got a PDF to sign, I hope this saves you the ten minutes it cost me.

${signCta(site)}
`,
  };
}

export function signPage(site: URL | undefined): MarkdownPage {
  return {
    path: '/sign',
    title: 'Sign a PDF — Just Sign It',
    description:
      'Sign PDFs in your browser. Drag in a PDF, add one or more signatures, place them exactly where you need them, and download. Your file never leaves your device.',
    body: `
# Sign a PDF

This page is the Just Sign It app: an interactive PDF signer that runs in a web browser with JavaScript. Open ${new URL('/sign', site).href} in a browser to use it. There is no API.

## How it works

${signSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Features

- Draw a signature, type your name in a handwriting font, or upload a photo of your signature (the white background can be removed).
- Black or blue ink for drawn and typed signatures.
- Save more than one signature, such as your full signature and your initials.
- Place signatures on any page. Drag to move, use the corner dot to resize, and use the arrow keys to nudge (Shift moves further).
- Zoom in and out while placing signatures.

## Privacy

- Your PDF never leaves your device. It’s opened, signed and saved by code running in your browser.
- Signatures are only saved if you check “Remember my signatures on this device”. Leave it off on shared or public computers.

## Limits

- It places an image of your signature on the document. It is not a certified or verifiable ${link(site, 'digital signature', '/electronic-vs-digital-signature')}.
- It doesn’t fill in text fields or dates.
- PDFs locked against editing need to be unlocked first.
`,
  };
}

export function guidesPage(site: URL | undefined): MarkdownPage {
  const groups = pagesByGroup()
    .map((group) => {
      const items = group.pages.map((p) => `- ${link(site, p.headline, `/${p.slug}`)}: ${p.description}`);
      return `## ${group.label}\n\n${items.join('\n')}`;
    })
    .join('\n\n');
  return {
    path: '/guides',
    title: 'Guides to signing PDFs | Just Sign It',
    description:
      'How to sign a PDF without an account, uploads or printing, plus plain answers about whether electronic signatures are legally binding.',
    body: `
# Guides

How to sign a PDF without jumping through a thousand hoops, plus straight answers to the questions that come up when you do.

${groups}

${signCta(site)}
`,
  };
}

export function landingPage(page: LandingPage, site: URL | undefined): MarkdownPage {
  const parts = [`# ${page.headline}`, page.answer, signCta(site)];
  for (const { heading, paragraphs } of page.sections ?? []) {
    parts.push(`## ${heading}`, ...paragraphs);
  }
  parts.push('## How it works', page.steps.map((step, i) => `${i + 1}. ${step}`).join('\n'));
  if (page.faq.length > 0) {
    parts.push('## Questions', ...page.faq.flatMap(({ q, a }) => [`### ${q}`, a]));
  }
  const related = relatedPages(page);
  if (related.length > 0) {
    parts.push('## Related', related.map((p) => `- ${link(site, p.headline, `/${p.slug}`)}`).join('\n'));
  }
  return { path: `/${page.slug}`, title: page.title, description: page.description, body: parts.join('\n\n') };
}

/** Every page on the site, in reading order: home, the app, the guides hub, each guide, then /why. */
export function allPages(site: URL | undefined): MarkdownPage[] {
  const guides = pagesByGroup().flatMap((g) => g.pages);
  return [
    homePage(site),
    signPage(site),
    guidesPage(site),
    ...guides.map((p) => landingPage(p, site)),
    whyPage(site),
  ];
}
