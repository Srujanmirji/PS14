# documents — SPEC

**Track:** Frontend · **Priority:** P0 · **Screen:** S8

## Purpose

One checklist of every document needed for the schemes the person qualifies for (and maybes), with how to get the missing ones.

## Folder

```
documents/
├── SPEC.md
├── index.ts                  # export { routes, DocumentRow, useDocumentStatus }
├── routes.tsx                # /documents
├── store.ts                  # docId → "have" | "missing" | "unknown" (Dexie)
├── components/
│   ├── DocumentsProgress.tsx # "You have 4 of 7"
│   ├── DocumentRow.tsx       # name, "needed for 3 schemes", have/missing toggle, HowToGet expander
│   └── HowToGet.tsx          # DocumentDef.howToGet + portal link + "Check with office" if verify
├── lib/collect.ts            # dedupe documents across eligible + maybe verdicts, count usage, sort by usage desc
└── i18n/{en,kn,hi}.json
```

## Acceptance

- [ ] List updates when results change.
- [ ] Toggling a document here updates the scheme detail section (shared store).
- [ ] Missing documents sort first.
- [ ] All text comes from `documents.json`; nothing generated.
