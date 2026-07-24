import { describe, expect, it } from 'vitest';
import { decryptSyncData, encryptSyncData } from './googleSync';

describe('end-to-end encrypted synchronization', () => {
  it('round-trips private data without exposing plaintext', async () => {
    const value = {
      annotations: [{ id: 'note-1', note: 'private observation' }],
      bookmarks: ['rv1909-john:john-3:16'],
    };
    const encrypted = await encryptSyncData(
      value,
      'a sufficiently long private phrase',
    );

    expect(encrypted).not.toContain('private observation');
    await expect(
      decryptSyncData(encrypted, 'a sufficiently long private phrase'),
    ).resolves.toEqual(value);
  });

  it('rejects an incorrect encryption phrase', async () => {
    const encrypted = await encryptSyncData(
      { notes: ['private'] },
      'the correct encryption phrase',
    );

    await expect(
      decryptSyncData(encrypted, 'the wrong encryption phrase'),
    ).rejects.toThrow();
  });
});
