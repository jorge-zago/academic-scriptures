import { describe, expect, it } from 'vitest';
import { isCorpusRegistry } from './index.js';

describe('isCorpusRegistry', () => {
  it('accepts an empty version-one registry', () => {
    expect(isCorpusRegistry({ schemaVersion: 1, corpora: [] })).toBe(true);
  });

  it('accepts a fully described corpus entry', () => {
    expect(
      isCorpusRegistry({
        schemaVersion: 1,
        corpora: [
          {
            id: 'sample',
            title: 'Sample',
            religionId: 'christianity',
            workId: 'matthew',
            editionId: 'rv1909',
            language: 'es',
            direction: 'ltr',
            licenseId: 'public-domain',
            manifest: '/corpora/sample.json',
            sha256: 'a'.repeat(64),
            offlineAllowed: true,
            completeness: 'sample',
          },
        ],
      }),
    ).toBe(true);
  });

  it('rejects unsupported registry versions', () => {
    expect(isCorpusRegistry({ schemaVersion: 2, corpora: [] })).toBe(false);
  });
});
