import type { Passage } from '@academic-scriptures/domain';
import {
  corpusSourceId,
  getDivision,
  getEdition,
  samplePassages,
} from './catalog';

interface BookPayload {
  editionId: string;
  workId: string;
  chapters: Record<string, Record<string, string>>;
}

export interface CorpusSearchRow {
  workId: string;
  chapter: string;
  verse: string;
  text: string;
}

const books = new Map<string, Promise<BookPayload>>();
const indexes = new Map<string, Promise<CorpusSearchRow[]>>();

const loadJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Corpus request failed: ${response.status}`);
  return response.json() as Promise<T>;
};

export async function loadPassages(
  editionId: string,
  workId: string,
  divisionId: string,
): Promise<Passage[]> {
  const edition = getEdition(editionId);
  const division = getDivision(divisionId);
  if (!edition || !division) return [];
  const sourceId = corpusSourceId(edition);

  if (!sourceId) {
    return samplePassages.filter(
      (passage) =>
        passage.editionId === editionId &&
        passage.divisionId === divisionId,
    );
  }

  const key = `${sourceId}/${workId}`;
  if (!books.has(key)) {
    books.set(
      key,
      loadJson<BookPayload>(`/corpora/${sourceId}/${workId}.json`),
    );
  }
  const book = await books.get(key)!;
  const verses = book.chapters[division.locator] ?? {};

  return Object.entries(verses).map(([number, text]) => ({
    id: `${editionId}:${divisionId}:${number}` as Passage['id'],
    editionId: edition.id,
    divisionId: division.id,
    locator: `${division.locator}:${number}`,
    number,
    text,
  }));
}

export async function searchCorpus(
  editionId: string,
  query: string,
  limit = 200,
): Promise<CorpusSearchRow[]> {
  const edition = getEdition(editionId);
  if (!edition) return [];
  const sourceId = corpusSourceId(edition);

  if (!sourceId) {
    const needle = normalize(query);
    return samplePassages
      .filter(
        (passage) =>
          passage.editionId === editionId &&
          normalize(passage.text).includes(needle),
      )
      .map((passage) => ({
        workId: edition.workId,
        chapter: '1',
        verse: passage.number,
        text: passage.text,
      }));
  }

  if (!indexes.has(sourceId)) {
    indexes.set(
      sourceId,
      loadJson<[string, string, string, string][]>(
        `/corpora/${sourceId}/search.json`,
      ).then((rows) =>
        rows.map(([workId, chapter, verse, text]) => ({
          workId,
          chapter,
          verse,
          text,
        })),
      ),
    );
  }

  const parsed = parseQuery(query);
  const rows = await indexes.get(sourceId)!;
  return rows
    .filter((row) => {
      const text = normalize(row.text);
      return (
        parsed.phrases.every((phrase) => text.includes(phrase)) &&
        parsed.required.every((term) => text.includes(term)) &&
        parsed.excluded.every((term) => !text.includes(term)) &&
        (!parsed.alternatives.length ||
          parsed.alternatives.some((term) => text.includes(term)))
      );
    })
    .slice(0, limit);
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim();

function parseQuery(query: string) {
  const phrases = Array.from(query.matchAll(/"([^"]+)"/g), (match) =>
    normalize(match[1] ?? ''),
  ).filter(Boolean);
  const tokens = query.replace(/"[^"]+"/g, ' ').split(/\s+/).filter(Boolean);
  const excluded = tokens
    .filter((token) => token.startsWith('-'))
    .map((token) => normalize(token.slice(1)));
  const orIndex = tokens.findIndex((token) => token.toUpperCase() === 'OR');
  const alternatives =
    orIndex > 0 && orIndex < tokens.length - 1
      ? [tokens[orIndex - 1], tokens[orIndex + 1]].map((token) =>
          normalize(token ?? ''),
        )
      : [];
  const alternativeSet = new Set(alternatives);
  const required = tokens
    .filter(
      (token) =>
        !token.startsWith('-') &&
        token.toUpperCase() !== 'OR' &&
        !alternativeSet.has(normalize(token)),
    )
    .map(normalize);
  return { phrases, required, excluded, alternatives };
}
