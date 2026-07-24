import { describe, expect, it } from 'vitest';
import {
  isAmbiguousWorkQuery,
  parseLexicalQuery,
  parseReferences,
} from './search';

describe('reference parser', () => {
  it('parses bilingual abbreviations and ranges', () => {
    const [match] = parseReferences('Mt 25:11-17');
    expect(match?.workId).toBe('matthew');
    expect(match?.range).toMatchObject({
      divisionLocator: '25',
      start: '11',
      end: '17',
    });
  });

  it('parses mixed references separated by semicolons', () => {
    const matches = parseReferences('Mt 25:11-17; Corán 1:1-7');
    expect(matches.map((match) => match.workId)).toEqual([
      'matthew',
      'al-fatiha',
    ]);
  });

  it('treats a bare work name as ambiguous', () => {
    expect(isAmbiguousWorkQuery('Mateo')?.id).toBe('matthew');
  });
});

describe('lexical search', () => {
  it('supports exact phrases', () => {
    expect(parseLexicalQuery('"sea la luz"').phrases).toEqual(['sea la luz']);
  });

  it('supports required and excluded words', () => {
    const parsed = parseLexicalQuery('Dios luz -tinieblas');
    expect(parsed.required).toEqual(['dios', 'luz']);
    expect(parsed.excluded).toEqual(['tinieblas']);
  });
});
