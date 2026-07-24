import { describe, expect, it } from 'vitest';
import { isCorpusRegistry } from './index.js';

describe('isCorpusRegistry', () => {
  it('accepts an empty version-one registry', () => {
    expect(isCorpusRegistry({ schemaVersion: 1, corpora: [] })).toBe(true);
  });

  it('rejects unsupported registry versions', () => {
    expect(isCorpusRegistry({ schemaVersion: 2, corpora: [] })).toBe(false);
  });
});

