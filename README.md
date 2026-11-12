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

Everything runs in the browser. [pdf.js](https://mozilla.github.io/pdf.js/) renders the pages and [pdf-lib](https://pdf-lib.js.org/) writes the signed PDF. Both are vendored in `vendor/`, and the handwriting fonts are in `fonts/`, so the site doesn't load anything from a third party.

`vercel.json` sets a strict Content Security Policy that only allows the site's own scripts, styles and fonts.

## What's in this repo

There are two versions of the site right now:

- **Root (`index.html`, `app.js`, `style.css`)**: the original static app. No build step.
- **`astro/`**: an Astro version. It has a simple homepage at `/`, the signer at `/sign`, and a template for landing pages. I'm trying this out to see if it works better for adding landing pages. We may remove it later.

The signer code is the same in both. In the Astro version it lives in `astro/public/` and Astro serves it as is.

## Running it locally

**Static version:** serve the repo root with any static server, for example:

```sh
npx serve .
```

**Astro version:**

```sh
cd astro
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to astro/dist
```

## Adding a landing page (Astro)

Add an entry to `astro/src/data/landing-pages.ts`. Each entry becomes a page at `/<slug>` using `astro/src/components/LandingTemplate.astro`, and gets linked in the footer. There's a commented-out example in the file.

Shared styles for the homepage and landing pages are in `astro/src/styles/site.css`. They use the same colors as the app.

## Deploying

The repo root deploys as a static site on Vercel by default. To deploy the Astro version, set the Vercel project's Root Directory to `astro`.

Before deploying the Astro version, set `site` in `astro/astro.config.mjs` to the real domain. It's used for canonical URLs.

## Notes

- If you change the signer, update it in both places (root and `astro/public/`) until we pick one version.
- Keep CSS in external files. Inline styles or scripts will be blocked by the CSP. The Astro config already sets `inlineStylesheets: 'never'` for this.
