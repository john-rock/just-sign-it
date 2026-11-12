# Just Sign It

Sign PDFs right in your browser. You open a PDF, add your signature, and download the signed copy. Nothing gets uploaded, so the file never leaves your computer.

## What it does

- Opens any PDF. Drop it on the page or pick it from your files.
- Lets you draw your signature, type your name in a handwriting font, or upload a photo of it. It can remove the white background from a photo.
- Saves more than one signature, so you can keep your full signature and your initials.
- Puts a signature anywhere on any page. Drag to move it, use the corner to resize it, and use the arrow keys to nudge it (Shift for bigger steps).
- Downloads a new PDF with your signatures on it.

Signatures are only saved on your device if you check "Remember my signatures on this device."

This places an image of your signature on the page. It isn't a certified or verifiable digital signature.

## How it works

Everything runs in the browser. [pdf.js](https://mozilla.github.io/pdf.js/) renders the pages and [pdf-lib](https://pdf-lib.js.org/) writes the signed PDF. Both are vendored in `public/vendor/`, and the handwriting fonts are in `public/fonts/`, so the site doesn't load anything from a third party.

`vercel.json` sets a strict Content Security Policy that only allows the site's own scripts, styles and fonts.

## Project structure

The site is built with [Astro](https://astro.build/).

```
public/                  Served as is
  app.js, style.css      The signer app
  vendor/                pdf.js and pdf-lib
  fonts/                 Handwriting fonts for typed signatures
src/
  pages/index.astro      Homepage (/)
  pages/sign.astro       The signer (/sign)
  pages/[slug].astro     Landing pages, generated from the data file below
  data/landing-pages.ts  Landing page content
  components/LandingTemplate.astro
  layouts/Base.astro     Shared <head> for every page
  layouts/Site.astro     Shared layout for the homepage and landing pages
  styles/site.css        Styles for the homepage and landing pages
```

The signer is plain JavaScript in `public/`. Astro doesn't bundle or change it.

## Running it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview  # serves the build
```

## Adding a landing page

Add an entry to `src/data/landing-pages.ts`. Each entry becomes a page at `/<slug>` using `src/components/LandingTemplate.astro`, and gets linked in the footer. There's a commented-out example in the file.

## Deploying

Vercel detects Astro automatically. No extra settings needed.

Before deploying, set `site` in `astro.config.mjs` to the real domain. It's used for canonical URLs.

## Notes

- Keep CSS in external files. Inline styles or scripts will be blocked by the CSP. `astro.config.mjs` already sets `inlineStylesheets: 'never'` for this.
