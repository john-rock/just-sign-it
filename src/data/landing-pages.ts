// Each entry becomes a page at /<slug>. Add an entry here to add a landing page.
//
// Writing guide (for search and for answer engines like ChatGPT, Perplexity and Google AI Overviews):
// - One page answers one search. If two pages would say the same thing, merge them.
// - `answer` comes first on the page. Answer the question in 1–2 plain sentences, no lead-in.
// - `sections` is where the page earns its place: details specific to this device, document or question.
// - FAQ answers are shown on the page and sent to search engines as FAQ data. Keep each to a few sentences.
// - Only claim what the app really does.
// - Voice: plain and direct, speaking to the reader as “you”. Short sentences, contractions, no hype.
//   No “I/me” here; personal stories belong on /why.
//   Headlines stay close to what people actually search for.
// - Every page appears on /guides and in the footer, under its `group`. The `description` doubles as its summary on /guides.

export const guideGroups = [
  { id: 'sign', label: 'Sign a PDF' },
  { id: 'devices', label: 'Sign on your device' },
  { id: 'questions', label: 'Questions' },
] as const;
export type GuideGroup = (typeof guideGroups)[number];

export interface LandingPage {
  slug: string;
  group: GuideGroup['id']; // which list it appears under on /guides and in the footer
  title: string;        // <title> / SEO, ~60 characters
  description: string;  // meta description, ~150 characters
  headline: string;     // <h1>, also the link text in the footer and in "Related" lists
  answer: string;       // the direct answer, shown right under the headline
  sections?: { heading: string; paragraphs: string[] }[];
  steps: string[];
  faq: { q: string; a: string }[];
  related?: string[];   // slugs of other landing pages; defaults to the next few in this list
}

// Steps shared by the "how to sign" pages.
export const signSteps = [
  'Drop your PDF onto the page, or click “Choose PDF”.',
  'Click “New signature”. Draw it, type your name in a handwriting font, or upload a photo of it.',
  'Click your signature to place it. Drag it where it goes and use the corner dot to resize it.',
  'Click “Download signed PDF”. That’s it.',
];

export const landingPages: LandingPage[] = [
  // ---- The pain: accounts, uploads, trials ----
  {
    slug: 'sign-pdf-without-account',
    group: 'sign',
    title: 'Sign a PDF without creating an account | Just Sign It',
    description: 'Sign a PDF without creating an account, giving your email or starting a free trial. Open it, sign it, download it. That’s it.',
    headline: 'Sign a PDF without creating an account',
    answer: 'Open your PDF in Just Sign It, add your signature and download the signed copy. No account, no email, no free trial to remember to cancel.',
    sections: [
      {
        heading: 'Why every PDF signer wants you to sign up',
        paragraphs: [
          'Most online signing tools are built for businesses that send out contracts all day, and accounts are how they sell a monthly plan. That makes sense if you sign things for a living.',
          'But if you just have one form to sign, it’s a thousand hoops for a ten-second job: make a password, confirm your email, dodge the trial offer, all to put your name on one line.',
        ],
      },
      {
        heading: 'Why this one doesn’t need an account',
        paragraphs: [
          'Everything happens in your browser. Your PDF never gets sent to a server, so there’s nothing to store and nothing to tie to an account.',
          'If you sign things a lot, check “Remember my signatures” and they’ll be saved in your browser for next time. That’s on your device, not in an account somewhere.',
        ],
      },
    ],
    steps: signSteps,
    faq: [
      { q: 'Is it really free?', a: 'Yes. There’s no paid plan, no trial and no watermark on your PDF.' },
      { q: 'Do I need to give an email address?', a: 'No. You don’t enter anything about yourself. Open the page and sign.' },
      { q: 'Can I save my signature for next time?', a: 'Yes. Check “Remember my signatures” and they’ll stay in your browser on that device. Leave it off on a shared or public computer.' },
    ],
    related: ['sign-pdf-without-uploading', 'free-pdf-signer-no-watermark', 'sign-pdf-without-printing'],
  },
  {
    slug: 'sign-pdf-without-uploading',
    group: 'sign',
    title: 'Sign a PDF without uploading it | Just Sign It',
    description: 'Sign a PDF without sending it to anyone’s server. It all happens in your browser, so your document never leaves your computer.',
    headline: 'Sign a PDF without uploading it',
    answer: 'Just Sign It opens and signs your PDF right in your browser. Your file never gets uploaded, so it never leaves your computer or phone.',
    sections: [
      {
        heading: 'What usually happens when you sign a PDF online',
        paragraphs: [
          'Most online PDF tools upload your file to their servers, add your signature there and send you back the result. That means your lease, tax form or medical paperwork is now sitting on someone else’s computer, for as long as they decide to keep it. For a lot of what people sign, that’s not great.',
        ],
      },
      {
        heading: 'How this one works instead',
        paragraphs: [
          'Your PDF is opened, shown and signed by code running in your own browser. When you hit download, your browser puts together the signed copy and saves it straight to your device.',
          'There’s no server behind it that accepts files, and the site’s security settings block the page from sending data to any other website. The code is open source on GitHub if you want to see for yourself.',
        ],
      },
      {
        heading: 'Check it yourself',
        paragraphs: [
          'Open your browser’s developer tools, go to the Network tab, then open and sign a PDF. You’ll see the page load its own code and fonts, but your document never goes anywhere.',
        ],
      },
    ],
    steps: signSteps,
    faq: [
      { q: 'Is my PDF stored anywhere?', a: 'No. It only lives in your browser’s memory while the page is open. Close the tab and it’s gone.' },
      { q: 'Are my signatures stored?', a: 'Only if you check “Remember my signatures”. Then they’re saved in your browser on that device and nowhere else.' },
      { q: 'Does it work with password-protected PDFs?', a: 'No. If a PDF is locked against editing, you’ll need to unlock it first. Opening it and using Print → Save as PDF usually does the trick.' },
    ],
    related: ['sign-pdf-without-account', 'electronic-vs-digital-signature', 'free-pdf-signer-no-watermark'],
  },
  {
    slug: 'free-pdf-signer-no-watermark',
    group: 'sign',
    title: 'Free PDF signer, no sign-up or watermark | Just Sign It',
    description: 'A PDF signer that’s actually free. No sign-up, no trial, no watermark. Draw, type or upload your signature and download a clean PDF.',
    headline: 'A free PDF signer with no sign-up, trial or watermark',
    answer: 'Just Sign It is free, with no limits. There’s no sign-up, no trial and no watermark on the PDF you download.',
    sections: [
      {
        heading: 'What “free” usually means',
        paragraphs: [
          'A lot of “free” PDF signers let you sign one or two documents, then ask for a subscription. Some stamp their logo on your page. Others hold your download hostage until you make an account.',
        ],
      },
      {
        heading: 'What you actually get here',
        paragraphs: [
          'Sign as many PDFs as you want. Draw your signature, type your name in a handwriting font, or upload a photo of your signature and it’ll remove the white background. You can save your full signature and your initials and put them on as many pages as you need.',
          'It’s free because it costs almost nothing to run. There are no servers doing the work. Your browser does all of it.',
        ],
      },
    ],
    steps: signSteps,
    faq: [
      { q: 'Is there a limit on how many PDFs I can sign?', a: 'No. Sign as many as you want.' },
      { q: 'Will there be a watermark or logo on my PDF?', a: 'No. The only thing added to your PDF is the signature you put there.' },
      { q: 'Can I sign in blue ink?', a: 'Yes. Drawn and typed signatures can be black or blue.' },
    ],
    related: ['sign-pdf-without-account', 'add-signature-and-initials-to-pdf', 'sign-pdf-without-printing'],
  },

  // ---- How-to ----
  {
    slug: 'sign-pdf-without-printing',
    group: 'sign',
    title: 'How to sign a PDF without printing it | Just Sign It',
    description: 'Skip printing, signing and scanning. Add your signature to a PDF on your computer or phone and send it back in a couple of minutes.',
    headline: 'How to sign a PDF without printing it',
    answer: 'Open the PDF in a browser-based signer like Just Sign It, draw or type your signature, drop it on the signature line and download the signed copy. No printer or scanner needed.',
    sections: [
      {
        heading: 'Skip the print, sign, scan routine',
        paragraphs: [
          'Printing a form, signing it with a pen and scanning it back in takes a printer, a scanner and usually a few tries to get a copy that isn’t crooked. And what you end up sending is a blurry picture of a document that used to be crisp.',
          'Signing the PDF directly keeps the original exactly as it was and just adds your signature on top. The text stays sharp and searchable.',
        ],
      },
      {
        heading: 'Making it look like your real signature',
        paragraphs: [
          'Signing with a mouse can look shaky. A trackpad is better. On a phone or tablet, using your finger looks the most natural.',
          'Or sign a piece of white paper, snap a photo and upload it. Just Sign It can remove the white background so only your ink ends up on the page.',
        ],
      },
    ],
    steps: signSteps,
    faq: [
      { q: 'Does this work on a phone?', a: 'Yes. It runs in your phone’s browser. Tap your signature to place it, then drag it where it goes.' },
      { q: 'Will the person I send it to be able to tell it wasn’t printed?', a: 'They’ll see your signature on the page. It’s an image of your signature, which is how most people sign PDFs these days.' },
      { q: 'Is a signature added this way legally valid?', a: 'In the US and a lot of other countries, electronic signatures are generally valid for most everyday documents. Some documents and some people have extra requirements. The guide on whether electronic signatures are legally binding covers the details.' },
    ],
    related: ['are-electronic-signatures-legally-binding', 'add-signature-and-initials-to-pdf', 'sign-pdf-without-account'],
  },
  {
    slug: 'add-signature-and-initials-to-pdf',
    group: 'sign',
    title: 'Add a signature and initials to a PDF | Just Sign It',
    description: 'Add your full signature and initials to every page of a PDF. Make both once, put them where they go and download the signed copy.',
    headline: 'Add your signature and initials to a PDF',
    answer: 'Make two signatures in Just Sign It, one for your full signature and one for your initials. Click each to place it, drag it onto the right line, and repeat on every page that needs it.',
    sections: [
      {
        heading: 'Initialing every page',
        paragraphs: [
          'Leases and contracts love asking you to initial the bottom of every page. Make your initials once, then click them in the sidebar to drop a copy on the page you’re looking at. Scroll to the next page and click again.',
          'You can also select one you’ve already placed and hit the duplicate button to make a copy, then drag it where it needs to go.',
        ],
      },
      {
        heading: 'Getting it exactly on the line',
        paragraphs: [
          'Drag a signature to move it and use the corner dot to resize it. On a computer, the arrow keys nudge it a little at a time, and holding Shift moves it further.',
        ],
      },
    ],
    steps: [
      'Open your PDF in Just Sign It.',
      'Click “New signature” and make your full signature.',
      'Click “New signature” again and make your initials.',
      'Click each one to place it, then drag it onto the right line on each page.',
      'Click “Download signed PDF”.',
    ],
    faq: [
      { q: 'Can I reuse my signature and initials next time?', a: 'Yes. Check “Remember my signatures” and they’ll stay in your browser on that device.' },
      { q: 'Can I add the date or fill in text fields?', a: 'Not yet. Right now it only does signatures. You can type your name as a signature, but it’ll be in a handwriting style.' },
      { q: 'Can I remove a signature I put in the wrong place?', a: 'Yes. Select it and click the ×.' },
    ],
    related: ['sign-pdf-without-printing', 'free-pdf-signer-no-watermark', 'sign-pdf-without-account'],
  },

  // ---- On your device ----
  {
    slug: 'sign-pdf-on-iphone',
    group: 'devices',
    title: 'How to sign a PDF on iPhone, free | Just Sign It',
    description: 'Sign a PDF on your iPhone in the browser. Draw your signature with your finger, place it on the page and save the signed copy. No app, no account.',
    headline: 'How to sign a PDF on an iPhone',
    answer: 'Open Just Sign It in your iPhone’s browser, choose your PDF, draw your signature with your finger and tap it to place it. Then download the signed copy. There’s no app to install and no account to make.',
    sections: [
      {
        heading: 'Why use the browser instead of an app',
        paragraphs: [
          'You don’t need to download anything. Just Sign It is a web page, so it works from whatever browser you already have on your phone, and your PDF stays on your phone while you sign it.',
          'Your finger is the best pen for this. A signature drawn on a touchscreen usually looks more like your real one than one drawn with a mouse.',
        ],
      },
      {
        heading: 'Getting the PDF in and out',
        paragraphs: [
          'Tap “Choose PDF” and pick the file from your iPhone’s file picker. That’s where PDFs you saved from Mail, Messages or the Files app show up.',
          'When you tap “Download signed PDF”, your browser saves the new copy to your phone. Check your browser’s downloads list or the Files app to find it, then share it from there.',
        ],
      },
    ],
    steps: [
      'Open Just Sign It in your iPhone’s browser and tap “Choose PDF”.',
      'Pick your PDF from your files.',
      'Tap “New signature” and draw your signature with your finger. You can also type it or upload a photo of it.',
      'Tap your signature to place it, then drag it onto the signature line. Use the corner dot to resize it.',
      'Tap “Download signed PDF”, then share or attach the saved file.',
    ],
    faq: [
      { q: 'Do I need to install an app?', a: 'No. It runs in your phone’s browser.' },
      { q: 'Is my PDF uploaded?', a: 'No. Your PDF is opened and signed on your phone and never sent to a server.' },
      { q: 'Where does the signed PDF go?', a: 'Your browser saves it to your phone, the same as any other download. Look in your browser’s downloads or the Files app.' },
      { q: 'Will it remember my signature?', a: 'Only if you check “Remember my signatures”. Then it’s saved in your browser on that phone. Leave it off if the phone is shared.' },
    ],
    related: ['sign-pdf-on-android', 'sign-pdf-without-uploading', 'sign-pdf-without-printing'],
  },
  {
    slug: 'sign-pdf-on-android',
    group: 'devices',
    title: 'How to sign a PDF on Android, free | Just Sign It',
    description: 'Sign a PDF on your Android phone or tablet in the browser. Draw your signature with your finger and download the signed copy. No app, no account.',
    headline: 'How to sign a PDF on an Android phone or tablet',
    answer: 'Open Just Sign It in your Android browser, choose your PDF, draw your signature with your finger and tap it to place it. Then download the signed copy. No app and no account.',
    sections: [
      {
        heading: 'Works in the browser you already have',
        paragraphs: [
          'Just Sign It is a web page, so there’s nothing to install from the Play Store. Open it in your browser, pick a PDF and sign.',
          'Your PDF is opened and signed on your device. It isn’t uploaded anywhere.',
        ],
      },
      {
        heading: 'Phone or tablet',
        paragraphs: [
          'On a phone, tap a signature to place it on the page you’re viewing, then drag it into position. On a tablet, you can also use a stylus to draw your signature, which usually looks the most natural.',
          'The signed copy is saved like any other download. Look in your browser’s downloads or your Files app to find and share it.',
        ],
      },
    ],
    steps: [
      'Open Just Sign It in your Android browser and tap “Choose PDF”.',
      'Pick your PDF from your files.',
      'Tap “New signature” and draw it with your finger or a stylus. You can also type it or upload a photo of it.',
      'Tap your signature to place it, then drag it onto the signature line and resize it with the corner dot.',
      'Tap “Download signed PDF”, then share or attach the saved file.',
    ],
    faq: [
      { q: 'Do I need to install an app?', a: 'No. It runs in your browser.' },
      { q: 'Does it work on a tablet?', a: 'Yes. The page works on phones, tablets and computers.' },
      { q: 'Is it free?', a: 'Yes. There’s no account, no trial and no watermark on your PDF.' },
    ],
    related: ['sign-pdf-on-iphone', 'free-pdf-signer-no-watermark', 'sign-pdf-without-account'],
  },
  {
    slug: 'sign-pdf-on-mac',
    group: 'devices',
    title: 'How to sign a PDF on a Mac, free | Just Sign It',
    description: 'Sign a PDF on your Mac in the browser, with a trackpad, a typed name or a photo of your signature. No app, no account, nothing uploaded.',
    headline: 'How to sign a PDF on a Mac',
    answer: 'Open Just Sign It in Safari, Chrome or another browser on your Mac, choose your PDF, make a signature and drop it on the page. Then download the signed copy. No account, and nothing is uploaded.',
    sections: [
      {
        heading: 'You may not need this on a Mac',
        paragraphs: [
          'macOS has a built-in way to sign a PDF in Preview. If that works for you, use it. It’s a good tool.',
          'Just Sign It is handy when you’re on a Mac that isn’t yours, when you want to place the same signature and your initials on many pages, or when you’d rather not hunt for the right menu in Preview.',
        ],
      },
      {
        heading: 'Three ways to make your signature',
        paragraphs: [
          'Draw it with your trackpad, which usually looks better than drawing with a mouse. Type your name and pick a handwriting font. Or sign a piece of white paper, take a photo and upload it. Just Sign It can remove the white background.',
          'You can save your full signature and your initials. Use the arrow keys to nudge a placed signature a little at a time.',
        ],
      },
    ],
    steps: signSteps,
    faq: [
      { q: 'Is this the same as signing in Preview?', a: 'It does a similar job, but it runs in your browser instead of an app. That means you can use it on any computer without setting anything up.' },
      { q: 'Does it work in Safari?', a: 'It’s a regular web page, so it should work in current versions of Safari, Chrome, Firefox and Edge on a Mac.' },
      { q: 'Is my PDF uploaded?', a: 'No. Everything happens in your browser, so your file never leaves your Mac.' },
    ],
    related: ['sign-pdf-on-windows', 'add-signature-and-initials-to-pdf', 'sign-pdf-without-uploading'],
  },
  {
    slug: 'sign-pdf-on-windows',
    group: 'devices',
    title: 'How to sign a PDF on Windows, free | Just Sign It',
    description: 'Sign a PDF on Windows 10 or 11 in your browser. Draw, type or upload your signature and download the signed copy. No app, no account.',
    headline: 'How to sign a PDF on Windows',
    answer: 'Open Just Sign It in Edge, Chrome or Firefox on your Windows PC, choose your PDF, make a signature and drop it on the page. Then download the signed copy. No software to install and no account.',
    sections: [
      {
        heading: 'No extra software',
        paragraphs: [
          'Windows doesn’t have a simple built-in way to put a signature on a PDF, and a lot of the free tools out there want you to install a program or make an account first.',
          'Just Sign It runs in your browser instead. There’s nothing to install, and your PDF stays on your computer.',
        ],
      },
      {
        heading: 'Making a signature that looks right',
        paragraphs: [
          'Drawing with a mouse can look shaky. If you have a touchscreen, a pen or a laptop trackpad, use that. Otherwise, type your name in a handwriting font, or sign white paper, snap a photo with your phone and upload it. Just Sign It can remove the white background.',
          'Once it’s placed, drag it into position, use the corner dot to resize it and use the arrow keys to nudge it.',
        ],
      },
    ],
    steps: signSteps,
    faq: [
      { q: 'Do I need Adobe Acrobat?', a: 'No. Just Sign It does the signing in your browser, so you don’t need Acrobat or any other PDF program.' },
      { q: 'Which browsers work?', a: 'It’s a regular web page, so it should work in current versions of Edge, Chrome and Firefox.' },
      { q: 'Is my PDF uploaded?', a: 'No. Everything happens in your browser, so your file never leaves your computer.' },
    ],
    related: ['sign-pdf-on-mac', 'sign-pdf-without-account', 'free-pdf-signer-no-watermark'],
  },
  {
    slug: 'sign-pdf-on-chromebook',
    group: 'devices',
    title: 'How to sign a PDF on a Chromebook | Just Sign It',
    description: 'Sign a PDF on a Chromebook right in Chrome. Draw, type or upload your signature and download the signed copy. No app, no account.',
    headline: 'How to sign a PDF on a Chromebook',
    answer: 'Open Just Sign It in Chrome on your Chromebook, choose your PDF, make a signature and drop it on the page. Then download the signed copy. No app to install and no account.',
    sections: [
      {
        heading: 'Built for a browser-only computer',
        paragraphs: [
          'A Chromebook mostly runs web pages, which is exactly what Just Sign It is. There’s nothing to install and no extension to add.',
          'Your PDF is opened and signed in the browser. It isn’t uploaded to a server.',
        ],
      },
      {
        heading: 'Touchscreen, trackpad or paper',
        paragraphs: [
          'If your Chromebook has a touchscreen, draw your signature with your finger or a stylus. If not, a trackpad works, or you can type your name in a handwriting font.',
          'You can also sign a piece of white paper, take a photo and upload it. Just Sign It can remove the white background.',
        ],
      },
      {
        heading: 'Finding the signed PDF',
        paragraphs: [
          'The signed copy is saved like any other download, usually to your Downloads folder in the Files app. From there you can attach it to an email or upload it where it needs to go.',
        ],
      },
    ],
    steps: signSteps,
    faq: [
      { q: 'Do I need an extension or app?', a: 'No. It works as a regular web page in Chrome.' },
      { q: 'Is it free?', a: 'Yes. There’s no account, no trial and no watermark on your PDF.' },
      { q: 'Is my PDF uploaded?', a: 'No. Everything happens in your browser, so your file never leaves your Chromebook.' },
    ],
    related: ['sign-pdf-on-windows', 'sign-pdf-without-uploading', 'sign-pdf-without-account'],
  },

  // ---- Questions people ask (answer engines) ----
  {
    slug: 'are-electronic-signatures-legally-binding',
    group: 'questions',
    title: 'Are electronic signatures legally binding? | Just Sign It',
    description: 'In the US, electronic signatures are generally as valid as ink under the ESIGN Act and UETA. What counts, the exceptions, and when to ask first.',
    headline: 'Are electronic signatures legally binding?',
    answer: 'In the United States, yes, for most documents. The federal ESIGN Act and state laws based on the Uniform Electronic Transactions Act (UETA) say a signature can’t be rejected just because it’s electronic. There are exceptions, and whoever you’re sending it to can still ask you to sign a different way.',
    sections: [
      {
        heading: 'This isn’t legal advice',
        paragraphs: [
          'This is a plain-English overview, not legal advice. Laws are different from state to state and country to country, and they change. If it’s an important contract or there’s real money or risk involved, talk to a lawyer.',
        ],
      },
      {
        heading: 'What counts as an electronic signature',
        paragraphs: [
          'Under US law, an electronic signature is pretty much any electronic sound, symbol or process attached to a document by someone who means to sign it. A typed name counts. Clicking “I agree” counts. An image of your handwritten signature on a PDF counts.',
          'The big thing is that you meant to sign, and that your signature is tied to the document you signed.',
        ],
      },
      {
        heading: 'The exceptions',
        paragraphs: [
          'ESIGN and UETA don’t cover everything. Wills and testamentary trusts, a lot of family-law documents like adoption and divorce papers, and some court documents are usually left out. Certain notices, like foreclosure, eviction or utility shut-off notices, have their own rules too.',
          'Some documents also need to be notarized or witnessed. Electronic notarization is a thing in many states, but it’s a separate process from just signing a PDF yourself.',
        ],
      },
      {
        heading: 'When to check first',
        paragraphs: [
          'Whoever is getting the document decides what they’ll accept. A bank, a court, your town office or an employer might want a wet-ink signature or a certificate-based digital signature. If you’re not sure, just ask them before you send it.',
          'Outside the US, most countries accept electronic signatures too. In the EU, the eIDAS regulation recognizes them, with a stronger “qualified” type for cases that need the same weight as a handwritten signature.',
        ],
      },
    ],
    steps: signSteps,
    faq: [
      { q: 'Is a pasted image of my signature legally binding?', a: 'In the US, generally yes for most everyday documents, as long as you meant to sign. ESIGN and UETA don’t require any particular technology.' },
      { q: 'Is a typed name a valid signature?', a: 'It can be. US law treats a typed name as an electronic signature when you type it intending to sign.' },
      { q: 'What documents can’t be signed electronically?', a: 'Usually wills, testamentary trusts, a lot of family-law documents and some court filings. Some notices, like foreclosure and eviction notices, have their own rules too.' },
      { q: 'Can the person I’m sending it to refuse an electronic signature?', a: 'Yes. Nobody has to accept electronic signatures. If they want wet ink or a digital signature, do it their way.' },
    ],
    related: ['electronic-vs-digital-signature', 'sign-pdf-without-printing', 'sign-pdf-without-uploading'],
  },
  {
    slug: 'electronic-vs-digital-signature',
    group: 'questions',
    title: 'Electronic vs. digital signatures | Just Sign It',
    description: 'An electronic signature is any mark that shows you agree. A digital signature uses a certificate to prove who signed and that nothing changed.',
    headline: 'Electronic signature vs. digital signature',
    answer: 'An electronic signature is any electronic mark that shows you agree to a document, like an image of your signature or your typed name. A digital signature is a specific kind that uses a cryptographic certificate to prove who signed and that the document hasn’t been changed since.',
    sections: [
      {
        heading: 'Electronic signatures',
        paragraphs: [
          'This is what most people mean when they say they “signed a PDF”: an image of their signature, a typed name or a click to agree. It shows you meant to sign. It’s also what Just Sign It adds to your document.',
          'Electronic signatures are generally legally valid in the US for most documents. On their own, though, they don’t prove who put the signature there, and they don’t stop someone from editing the document afterwards.',
        ],
      },
      {
        heading: 'Digital signatures',
        paragraphs: [
          'A digital signature is built on a certificate that’s issued to you, usually by a trusted provider. When you sign, the PDF gets sealed with a cryptographic code tied to that certificate. Then PDF readers like Adobe Acrobat show a signature panel with who signed and whether the file has changed.',
          'Getting a certificate usually means verifying your identity with a provider, and often paying for it.',
        ],
      },
      {
        heading: 'Which one do you need?',
        paragraphs: [
          'For most everyday paperwork, like leases, permission slips, offer letters and forms from your town, an electronic signature is what people expect.',
          'Use a digital signature if the person you’re sending it to asks for one, or if you need proof the document wasn’t changed after you signed. That comes up with some government filings, regulated industries and big contracts.',
        ],
      },
    ],
    steps: signSteps,
    faq: [
      { q: 'Does Just Sign It create digital signatures?', a: 'No. It puts an image of your signature on the PDF, which is an electronic signature. It doesn’t add a certificate.' },
      { q: 'Is a digital signature more legally valid?', a: 'Not necessarily. Both can be legally binding. A digital signature just makes it easier to prove who signed and that nothing changed afterwards.' },
      { q: 'How can I tell if a PDF has a digital signature?', a: 'Open it in Adobe Acrobat Reader. If it has one, you’ll see a signature panel or a blue bar at the top showing who signed and whether the signature is valid.' },
    ],
    related: ['are-electronic-signatures-legally-binding', 'sign-pdf-without-uploading', 'sign-pdf-without-printing'],
  },
];

/** Pages grouped for /guides and the footer, in the order of `guideGroups`. */
export function pagesByGroup() {
  return guideGroups
    .map((group) => ({ ...group, pages: landingPages.filter((p) => p.group === group.id) }))
    .filter((group) => group.pages.length > 0);
}

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
