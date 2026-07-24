# Architecture

Academic Scriptures begins as a static React application deployed from
`apps/web/dist`. Cloudflare Pages reads this output path from the repository's
`wrangler.jsonc`. Public corpus files will be immutable, versioned static
assets. User-created data will be local-first and stored separately.

## Boundaries

- `apps/web`: user interface, routing, accessibility, and PWA behavior.
- `packages/domain`: identifiers and shared scholarly domain types.
- `packages/corpus`: validation and loading of corpus manifests and chunks.
- `content`: authoritative license registry and, later, approved manifests.

The application bundle must not import complete corpora. A reader route loads
only its catalog, work metadata, and requested passage chunks.

## Planned data flow

1. Load the small global catalog.
2. Resolve a work, edition, and passage through stable identifiers.
3. Fetch an immutable, content-hashed passage chunk.
4. Validate its schema version.
5. Cache approved offline resources.
6. Store bookmarks, highlights, notes, and preferences in IndexedDB.

## Current V1 surface

The V1 reader is deliberately client-only. It presents three Abrahamic catalog
contexts with licensed excerpts used to validate multilingual, bidirectional,
parallel-reading, and reference-search behavior. Excerpts are not represented
as complete corpora. A religion can be promoted to complete catalog status only
when source-language, Spanish, and English editions pass the license registry
and completeness checks.

## Rendering

The interactive reader is a client application. Public informational pages can
be prerendered later if discoverability or no-JavaScript access requires it.
No backend is required for the MVP.

## Directionality and text integrity

Direction is metadata (`ltr`, `rtl`, or `auto`), never inferred solely from the
interface language. Source strings remain Unicode and are not stripped of
Greek accents, Hebrew marks, or Arabic marks during ingestion. Normalized
search keys are derived data and never replace display text.
