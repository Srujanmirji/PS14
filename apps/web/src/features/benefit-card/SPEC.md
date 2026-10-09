# benefit-card — SPEC

**Track:** Frontend · **Priority:** P1 · **Screen:** S9

## Purpose

A shareable, printable summary the person (or their child) can send on WhatsApp or show at the office.

## Folder

```
benefit-card/
├── SPEC.md
├── index.ts                  # export { routes, useBenefitCard }
├── routes.tsx                # /card
├── store.ts                  # included scheme ids, optional name, language
├── components/
│   ├── CardPreview.tsx       # 1080×1350 canvas-ready layout, light theme, solid (no blur — exports cleanly)
│   ├── CardSchemeRow.tsx     # scheme name, verdict word, 1-line next step
│   ├── CardDocuments.tsx     # documents to carry (missing ones marked)
│   ├── CardQr.tsx            # QR to a public scheme page (sourceUrl of first scheme, or a summary URL)
│   └── CardActions.tsx       # Share, Save image, Read aloud
├── lib/export.ts             # html-to-image → PNG blob
└── i18n/{en,kn,hi}.json
```

## Behaviour

- Defaults: all eligible schemes included; maybes excluded; name empty.
- Share: Capacitor `Share` (native) or `navigator.share({ files: [png] })`; fallback: download.
- Footer on the card: "Based on what you told Yojana Saathi on <date>. Confirm at the office." in the chosen language.
- QR encodes only public URLs — never profile data.

## Acceptance

- [ ] PNG exports with Kannada text rendered correctly (fonts embedded, not system fallback).
- [ ] Share opens WhatsApp on Android with the image attached.
- [ ] Works offline (except the share target itself).
