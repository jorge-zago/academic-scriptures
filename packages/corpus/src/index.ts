export interface CorpusRegistry {
  schemaVersion: 1;
  generatedAt?: string;
  corpora: CorpusRegistryEntry[];
}

export interface CorpusRegistryEntry {
  id: string;
  title: string;
  religionId: string;
  workId: string;
  editionId: string;
  language: string;
  direction: 'ltr' | 'rtl' | 'auto';
  licenseId: string;
  manifest: string;
  sha256: string;
  offlineAllowed: boolean;
  completeness: 'sample' | 'complete';
}

export function isCorpusRegistry(value: unknown): value is CorpusRegistry {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<CorpusRegistry>;
  if (candidate.schemaVersion !== 1 || !Array.isArray(candidate.corpora)) {
    return false;
  }

  return candidate.corpora.every((entry) => {
    if (typeof entry !== 'object' || entry === null) return false;
    const item = entry as Partial<CorpusRegistryEntry>;
    return (
      typeof item.id === 'string' &&
      typeof item.religionId === 'string' &&
      typeof item.editionId === 'string' &&
      typeof item.sha256 === 'string' &&
      /^[a-f0-9]{64}$/.test(item.sha256)
    );
  });
}
