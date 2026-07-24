# Academic Scriptures

Academic Scriptures is an open-source platform for reading, studying, and
comparing sacred texts, original sources, manuscript evidence, and scholarly
claims.

The project is static-first, local-first, privacy-preserving, and designed to
keep primary texts visually distinct from translations, commentary, academic
reconstructions, and user notes.

## Status

This repository contains the functional reader: reference and literal search,
parallel editions, pinned collections, searchable local notes, and portable
export/import. The Christian Bible is complete in four documented editions:
Reina-Valera 1909, World English Bible, Westminster Leningrad Codex, and
SBLGNT. Judaism and Islam remain clearly marked as incomplete until the
required translation sets are verified.

## Development

Requirements:

- Node.js 22.12 or newer
- npm 11 or newer

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run check
npm run build
```

## Repository map

```text
apps/web/              React/Vite progressive web application
apps/web/public/corpora Complete, generated Bible corpus chunks and indexes
packages/domain/       Shared domain model
packages/corpus/       Corpus manifest validation and loading primitives
scripts/               Reproducible corpus import and integrity verification
content/               License registry; no unverified corpus data
docs/                  Architecture, privacy, and licensing decisions
.github/workflows/     Continuous integration
```

## Principles

- Free, open-source, and without advertising or behavioral analytics.
- Fully usable without an account.
- Local notes and preferences remain on the user's device by default.
- Every source is accompanied by provenance and licensing metadata.
- Scripture, translations, witnesses, commentary, and reconstructions are
  never presented as interchangeable categories.

Code is licensed under the [MIT License](LICENSE). Textual content is licensed
separately and is never covered automatically by the code license.
