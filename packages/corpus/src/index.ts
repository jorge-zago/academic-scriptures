export interface CorpusRegistry {
  schemaVersion: 1;
  corpora: CorpusRegistryEntry[];
}

export interface CorpusRegistryEntry {
  id: string;
  title: string;
  licenseId: string;
  manifest: string;
  sha256: string;
}

export function isCorpusRegistry(value: unknown): value is CorpusRegistry {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Partial<CorpusRegistry>;
  return candidate.schemaVersion === 1 && Array.isArray(candidate.corpora);
}

