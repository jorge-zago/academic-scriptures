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

## Rendering

The interactive reader is a client application. Public informational pages can
be prerendered later if discoverability or no-JavaScript access requires it.
No backend is required for the MVP.

## Directionality and text integrity

Direction is metadata (`ltr`, `rtl`, or `auto`), never inferred solely from the
interface language. Source strings remain Unicode and are not stripped of
Greek accents, Hebrew marks, or Arabic marks during ingestion. Normalized
search keys are derived data and never replace display text.
