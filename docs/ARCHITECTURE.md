# Architecture

Academic Scriptures begins as a static React application deployed from
`apps/web/dist`. Cloudflare Pages reads this output path from the repository's
`wrangler.jsonc`. Public corpus files are immutable static assets generated
from documented USFM sources. User-created data remains local-first and stored
separately.

## Boundaries

- `apps/web`: user interface, routing, accessibility, and PWA behavior.
- `packages/domain`: identifiers and shared scholarly domain types.
- `packages/corpus`: validation and loading of corpus manifests and chunks.
- `content`: authoritative license registry and, later, approved manifests.

The application bundle must not import complete corpora. A reader route loads
only its catalog, work metadata, and requested passage chunks.

## Data flow

1. Load the small global catalog.
2. Resolve a work, edition, and passage through stable identifiers.
3. Fetch only the selected book and edition from `/corpora`.
4. Keep loaded books in an in-memory session cache.
5. Load a complete edition index only when literal search is requested.
6. Store pins, bookmarks, highlights, notes, and preferences locally.

## Optional encrypted synchronization

Google Identity Services issues a short-lived browser token scoped to
`drive.appdata`. The application merges its local data with one encrypted JSON
file in Google Drive's application-private folder. Encryption and decryption
happen exclusively through Web Crypto in the browser; neither a refresh token
nor the encryption phrase is persisted.

## Current V1 surface

The V1 reader is deliberately client-only. Christianity contains all 66 books
and 1,189 chapters in complete Spanish and English public-domain translations,
plus the complete WLC Hebrew Old Testament and SBLGNT Greek New Testament.
The import is reproducible with `npm run import:corpora`; `npm run
verify:corpora` checks book, chapter, verse, and empty-text counts. Judaism and
Islam remain sample contexts rather than being overstated as complete.

## Rendering

The interactive reader is a client application. Public informational pages can
be prerendered later if discoverability or no-JavaScript access requires it.
No backend is required for the MVP.

## Directionality and text integrity

Direction is metadata (`ltr`, `rtl`, or `auto`), never inferred solely from the
interface language. Source strings remain Unicode and are not stripped of
Greek accents, Hebrew marks, or Arabic marks during ingestion. Normalized
search keys are derived data and never replace display text.
