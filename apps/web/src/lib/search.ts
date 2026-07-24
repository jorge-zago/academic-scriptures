import type { PassageRange } from '@academic-scriptures/domain';
import { editions, getWork, passages, works } from '../data/catalog';

export interface ReferenceMatch {
  raw: string;
  workId: string;
  range: PassageRange;
}

export interface SearchResult {
  passageId: string;
  workId: string;
  editionId: string;
  locator: string;
  text: string;
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim();

export function parseReferences(query: string): ReferenceMatch[] {
  const segments = query
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean);

  return segments.flatMap((segment) => {
    const normalized = normalize(segment);
    const work = works
      .slice()
      .sort((a, b) => Math.max(...b.aliases.map((x) => x.length)) - Math.max(...a.aliases.map((x) => x.length)))
      .find((candidate) =>
        candidate.aliases.some((alias) => {
          const normalizedAlias = normalize(alias);
          return (
            normalized === normalizedAlias ||
            normalized.startsWith(`${normalizedAlias} `)
          );
        }),
      );

    if (!work) return [];
    const alias = work.aliases
      .map(normalize)
      .sort((a, b) => b.length - a.length)
      .find(
        (candidate) =>
          normalized === candidate || normalized.startsWith(`${candidate} `),
      );
    if (!alias) return [];

    const locator = normalized.slice(alias.length).trim();
    if (!locator) return [];
    const locatorMatch = locator.match(/^(\d+)(?::(\d+)(?:-(\d+))?)?$/);
    if (!locatorMatch) return [];

    return [
      {
        raw: segment,
        workId: work.id,
        range: {
          workId: work.id,
          divisionLocator: locatorMatch[1] ?? '1',
          start: locatorMatch[2],
          end: locatorMatch[3],
        },
      },
    ];
  });
}

interface LexicalQuery {
  phrases: string[];
  required: string[];
  excluded: string[];
  alternatives: string[];
}

export function parseLexicalQuery(query: string): LexicalQuery {
  const phrases = Array.from(query.matchAll(/"([^"]+)"/g), (match) =>
    normalize(match[1] ?? ''),
  ).filter(Boolean);
  const remainder = query.replace(/"[^"]+"/g, ' ');
  const tokens = remainder.split(/\s+/).filter(Boolean);
  const excluded = tokens
    .filter((token) => token.startsWith('-'))
    .map((token) => normalize(token.slice(1)))
    .filter(Boolean);
  const orIndex = tokens.findIndex((token) => token.toUpperCase() === 'OR');
  const alternatives =
    orIndex > 0 && orIndex < tokens.length - 1
      ? [tokens[orIndex - 1], tokens[orIndex + 1]]
          .filter((token): token is string => Boolean(token))
          .map(normalize)
      : [];
  const alternativeSet = new Set(alternatives);
  const required = tokens
    .filter(
      (token) =>
        !token.startsWith('-') &&
        token.toUpperCase() !== 'OR' &&
        !alternativeSet.has(normalize(token)),
    )
    .map(normalize)
    .filter(Boolean);
  return { phrases, required, excluded, alternatives };
}

export function searchText(
  query: string,
  religionWorkIds?: string[],
): SearchResult[] {
  const parsed = parseLexicalQuery(query);
  if (
    !parsed.phrases.length &&
    !parsed.required.length &&
    !parsed.alternatives.length
  ) {
    return [];
  }

  return passages
    .filter((passage) => {
      const edition = editions.find((item) => item.id === passage.editionId);
      if (!edition) return false;
      if (
        religionWorkIds?.length &&
        !religionWorkIds.includes(edition.workId)
      ) {
        return false;
      }
      const haystack = normalize(passage.text);
      return (
        parsed.phrases.every((phrase) => haystack.includes(phrase)) &&
        parsed.required.every((term) => haystack.includes(term)) &&
        parsed.excluded.every((term) => !haystack.includes(term)) &&
        (!parsed.alternatives.length ||
          parsed.alternatives.some((term) => haystack.includes(term)))
      );
    })
    .map((passage) => {
      const edition = editions.find((item) => item.id === passage.editionId)!;
      return {
        passageId: passage.id,
        workId: edition.workId,
        editionId: edition.id,
        locator: passage.locator,
        text: passage.text,
      };
    });
}

export function isAmbiguousWorkQuery(query: string) {
  const normalized = normalize(query);
  const work = works.find((candidate) =>
    candidate.aliases.some((alias) => normalize(alias) === normalized),
  );
  return work ? getWork(work.id) : undefined;
}
