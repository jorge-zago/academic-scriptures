/* global console, process */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const cacheRoot = path.join(root, '.corpus-cache');
const publicRoot = path.join(root, 'apps', 'web', 'public', 'corpora');
const generatedModule = path.join(
  root,
  'apps',
  'web',
  'src',
  'data',
  'generatedBible.ts',
);

const books = [
  ['GEN', 'genesis', 'Génesis', 'Genesis', ['gen', 'gn', 'génesis', 'genesis']],
  ['EXO', 'exodus', 'Éxodo', 'Exodus', ['ex', 'exo', 'éxodo', 'exodus']],
  ['LEV', 'leviticus', 'Levítico', 'Leviticus', ['lv', 'lev', 'levítico', 'leviticus']],
  ['NUM', 'numbers', 'Números', 'Numbers', ['nm', 'num', 'números', 'numbers']],
  ['DEU', 'deuteronomy', 'Deuteronomio', 'Deuteronomy', ['dt', 'deu', 'deuteronomio', 'deuteronomy']],
  ['JOS', 'joshua', 'Josué', 'Joshua', ['jos', 'josué', 'joshua']],
  ['JDG', 'judges', 'Jueces', 'Judges', ['jue', 'jdg', 'jueces', 'judges']],
  ['RUT', 'ruth', 'Rut', 'Ruth', ['rut', 'ruth']],
  ['1SA', '1-samuel', '1 Samuel', '1 Samuel', ['1 sa', '1 sam', '1 samuel']],
  ['2SA', '2-samuel', '2 Samuel', '2 Samuel', ['2 sa', '2 sam', '2 samuel']],
  ['1KI', '1-kings', '1 Reyes', '1 Kings', ['1 re', '1 rey', '1 ki', '1 kings', '1 reyes']],
  ['2KI', '2-kings', '2 Reyes', '2 Kings', ['2 re', '2 rey', '2 ki', '2 kings', '2 reyes']],
  ['1CH', '1-chronicles', '1 Crónicas', '1 Chronicles', ['1 cr', '1 cro', '1 ch', '1 chronicles', '1 crónicas']],
  ['2CH', '2-chronicles', '2 Crónicas', '2 Chronicles', ['2 cr', '2 cro', '2 ch', '2 chronicles', '2 crónicas']],
  ['EZR', 'ezra', 'Esdras', 'Ezra', ['esd', 'ezr', 'esdras', 'ezra']],
  ['NEH', 'nehemiah', 'Nehemías', 'Nehemiah', ['neh', 'nehemías', 'nehemiah']],
  ['EST', 'esther', 'Ester', 'Esther', ['est', 'ester', 'esther']],
  ['JOB', 'job', 'Job', 'Job', ['job']],
  ['PSA', 'psalms', 'Salmos', 'Psalms', ['sal', 'salmo', 'salmos', 'ps', 'psalm', 'psalms']],
  ['PRO', 'proverbs', 'Proverbios', 'Proverbs', ['pr', 'prov', 'proverbios', 'proverbs']],
  ['ECC', 'ecclesiastes', 'Eclesiastés', 'Ecclesiastes', ['ec', 'ecl', 'eclesiastés', 'ecclesiastes']],
  ['SNG', 'song-of-songs', 'Cantar de los Cantares', 'Song of Songs', ['cnt', 'cantares', 'song', 'song of songs']],
  ['ISA', 'isaiah', 'Isaías', 'Isaiah', ['is', 'isa', 'isaías', 'isaiah']],
  ['JER', 'jeremiah', 'Jeremías', 'Jeremiah', ['jer', 'jeremías', 'jeremiah']],
  ['LAM', 'lamentations', 'Lamentaciones', 'Lamentations', ['lam', 'lamentaciones', 'lamentations']],
  ['EZK', 'ezekiel', 'Ezequiel', 'Ezekiel', ['ez', 'ezk', 'ezequiel', 'ezekiel']],
  ['DAN', 'daniel', 'Daniel', 'Daniel', ['dan', 'daniel']],
  ['HOS', 'hosea', 'Oseas', 'Hosea', ['os', 'hos', 'oseas', 'hosea']],
  ['JOL', 'joel', 'Joel', 'Joel', ['jl', 'jol', 'joel']],
  ['AMO', 'amos', 'Amós', 'Amos', ['am', 'amo', 'amós', 'amos']],
  ['OBA', 'obadiah', 'Abdías', 'Obadiah', ['abd', 'oba', 'abdías', 'obadiah']],
  ['JON', 'jonah', 'Jonás', 'Jonah', ['jon', 'jonás', 'jonah']],
  ['MIC', 'micah', 'Miqueas', 'Micah', ['mi', 'mic', 'miqueas', 'micah']],
  ['NAM', 'nahum', 'Nahúm', 'Nahum', ['nah', 'nam', 'nahúm', 'nahum']],
  ['HAB', 'habakkuk', 'Habacuc', 'Habakkuk', ['hab', 'habacuc', 'habakkuk']],
  ['ZEP', 'zephaniah', 'Sofonías', 'Zephaniah', ['sof', 'zep', 'sofonías', 'zephaniah']],
  ['HAG', 'haggai', 'Hageo', 'Haggai', ['hag', 'hageo', 'haggai']],
  ['ZEC', 'zechariah', 'Zacarías', 'Zechariah', ['zac', 'zec', 'zacarías', 'zechariah']],
  ['MAL', 'malachi', 'Malaquías', 'Malachi', ['mal', 'malaquías', 'malachi']],
  ['MAT', 'matthew', 'Mateo', 'Matthew', ['mt', 'mat', 'mateo', 'matthew']],
  ['MRK', 'mark', 'Marcos', 'Mark', ['mc', 'mar', 'marcos', 'mk', 'mark']],
  ['LUK', 'luke', 'Lucas', 'Luke', ['lc', 'luc', 'lucas', 'lk', 'luke']],
  ['JHN', 'john', 'Juan', 'John', ['jn', 'juan', 'john']],
  ['ACT', 'acts', 'Hechos', 'Acts', ['hch', 'hechos', 'act', 'acts']],
  ['ROM', 'romans', 'Romanos', 'Romans', ['ro', 'rom', 'romanos', 'romans']],
  ['1CO', '1-corinthians', '1 Corintios', '1 Corinthians', ['1 co', '1 cor', '1 corintios', '1 corinthians']],
  ['2CO', '2-corinthians', '2 Corintios', '2 Corinthians', ['2 co', '2 cor', '2 corintios', '2 corinthians']],
  ['GAL', 'galatians', 'Gálatas', 'Galatians', ['ga', 'gal', 'gálatas', 'galatians']],
  ['EPH', 'ephesians', 'Efesios', 'Ephesians', ['ef', 'eph', 'efesios', 'ephesians']],
  ['PHP', 'philippians', 'Filipenses', 'Philippians', ['fil', 'php', 'filipenses', 'philippians']],
  ['COL', 'colossians', 'Colosenses', 'Colossians', ['col', 'colosenses', 'colossians']],
  ['1TH', '1-thessalonians', '1 Tesalonicenses', '1 Thessalonians', ['1 ts', '1 tes', '1 th', '1 tesalonicenses', '1 thessalonians']],
  ['2TH', '2-thessalonians', '2 Tesalonicenses', '2 Thessalonians', ['2 ts', '2 tes', '2 th', '2 tesalonicenses', '2 thessalonians']],
  ['1TI', '1-timothy', '1 Timoteo', '1 Timothy', ['1 ti', '1 tim', '1 timoteo', '1 timothy']],
  ['2TI', '2-timothy', '2 Timoteo', '2 Timothy', ['2 ti', '2 tim', '2 timoteo', '2 timothy']],
  ['TIT', 'titus', 'Tito', 'Titus', ['tit', 'tito', 'titus']],
  ['PHM', 'philemon', 'Filemón', 'Philemon', ['flm', 'phm', 'filemón', 'philemon']],
  ['HEB', 'hebrews', 'Hebreos', 'Hebrews', ['heb', 'hebreos', 'hebrews']],
  ['JAS', 'james', 'Santiago', 'James', ['stg', 'santiago', 'jas', 'james']],
  ['1PE', '1-peter', '1 Pedro', '1 Peter', ['1 pe', '1 ped', '1 peter', '1 pedro']],
  ['2PE', '2-peter', '2 Pedro', '2 Peter', ['2 pe', '2 ped', '2 peter', '2 pedro']],
  ['1JN', '1-john', '1 Juan', '1 John', ['1 jn', '1 juan', '1 john']],
  ['2JN', '2-john', '2 Juan', '2 John', ['2 jn', '2 juan', '2 john']],
  ['3JN', '3-john', '3 Juan', '3 John', ['3 jn', '3 juan', '3 john']],
  ['JUD', 'jude', 'Judas', 'Jude', ['jud', 'judas', 'jude']],
  ['REV', 'revelation', 'Apocalipsis', 'Revelation', ['ap', 'apo', 'apocalipsis', 'rev', 'revelation']],
];

const sources = [
  {
    id: 'rv1909',
    folder: 'spaRV1909',
    title: 'Reina-Valera 1909',
    shortTitle: 'RV1909',
    language: 'es',
    direction: 'ltr',
    testament: 'both',
    licenseId: 'license-public-domain',
    sourceUrl: 'https://ebible.org/bible/details.php?id=spaRV1909',
    version: '1909',
    source: false,
  },
  {
    id: 'web',
    folder: 'engwebp',
    title: 'World English Bible',
    shortTitle: 'WEB',
    language: 'en',
    direction: 'ltr',
    testament: 'both',
    licenseId: 'license-public-domain',
    sourceUrl: 'https://ebible.org/details.php?id=engwebp',
    version: '2025',
    source: false,
  },
  {
    id: 'wlc',
    folder: 'hboWLC',
    title: 'Westminster Leningrad Codex',
    shortTitle: 'WLC',
    language: 'he',
    direction: 'rtl',
    testament: 'old',
    licenseId: 'license-public-domain',
    sourceUrl: 'https://hb.openscriptures.org/',
    version: '4.20',
    source: true,
  },
  {
    id: 'sblgnt',
    folder: 'grcsbl',
    title: 'SBL Greek New Testament',
    shortTitle: 'SBLGNT',
    language: 'grc',
    direction: 'ltr',
    testament: 'new',
    licenseId: 'license-sblgnt',
    sourceUrl: 'https://github.com/LogosBible/SBLGNT',
    version: '1.2',
    source: true,
  },
];

const normalizeText = (input) =>
  input
    .replace(/\\f\s[\s\S]*?\\f\*/g, '')
    .replace(/\\x\s[\s\S]*?\\x\*/g, '')
    .replace(/\\fig\s[\s\S]*?\\fig\*/g, '')
    .replace(/\\w\s+([^|\\]+)\|[^\\]*?\\w\*/g, '$1')
    .replace(/\\\+?w\*/g, '')
    .replace(/\\zaln-[se]\s+[^\\]*?\\\*/g, '')
    .replace(/\\k-[se]\s+[^\\]*?\\\*/g, '')
    .replace(/\\(?:add|nd|wj|qt|dc|bk|pn)\s+([^\\]*?)\\(?:add|nd|wj|qt|dc|bk|pn)\*/g, '$1')
    .replace(/\\[a-z0-9+-]+\*?/gi, ' ')
    .replace(/\|[a-z]+="[^"]*"/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

function parseUsfm(raw) {
  const chapters = {};
  let chapter;
  let currentVerse;

  for (const originalLine of raw.replace(/\r\n?/g, '\n').split('\n')) {
    const line = originalLine.trim();
    const chapterMatch = line.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      chapter = chapterMatch[1];
      chapters[chapter] ??= {};
      currentVerse = undefined;
      continue;
    }

    const verseMatch = line.match(/^\\v\s+([0-9]+[a-z]?(?:-[0-9]+[a-z]?)?)\s*(.*)$/i);
    if (verseMatch && chapter) {
      currentVerse = verseMatch[1];
      chapters[chapter][currentVerse] = normalizeText(verseMatch[2]);
      continue;
    }

    if (
      chapter &&
      currentVerse &&
      line &&
      !/^\\(?:id|h|toc|mt|c|s|ms|r|d|cl|cp|rem)\b/.test(line)
    ) {
      const continuation = normalizeText(line);
      if (continuation) {
        chapters[chapter][currentVerse] =
          `${chapters[chapter][currentVerse]} ${continuation}`.trim();
      }
    }
  }

  for (const verses of Object.values(chapters)) {
    for (const [number, text] of Object.entries(verses)) {
      if (!text.trim()) delete verses[number];
    }
  }

  return chapters;
}

await rm(publicRoot, { recursive: true, force: true });
await mkdir(publicRoot, { recursive: true });

const generatedBooks = [];
const checksums = {};

for (const source of sources) {
  const sourceDirectory = path.join(cacheRoot, source.folder);
  const files = await readdir(sourceDirectory);
  const editionDirectory = path.join(publicRoot, source.id);
  await mkdir(editionDirectory, { recursive: true });
  const searchRows = [];

  for (const [code, id, es, en, aliases] of books) {
    const file = files.find((candidate) =>
      new RegExp(`-${code}${source.folder}\\.usfm$`, 'i').test(candidate),
    );
    if (!file) continue;
    const raw = await readFile(path.join(sourceDirectory, file), 'utf8');
    const chapters = parseUsfm(raw);
    const payload = JSON.stringify({ editionId: source.id, workId: id, chapters });
    await writeFile(path.join(editionDirectory, `${id}.json`), payload);
    checksums[`${source.id}/${id}`] = createHash('sha256')
      .update(payload)
      .digest('hex');

    for (const [chapter, verses] of Object.entries(chapters)) {
      for (const [verse, text] of Object.entries(verses)) {
        searchRows.push([id, chapter, verse, text]);
      }
    }

    const existing = generatedBooks.find((book) => book.id === id);
    if (!existing) {
      generatedBooks.push({
        code,
        id,
        es,
        en,
        aliases,
        testament: books.findIndex((entry) => entry[0] === code) < 39 ? 'old' : 'new',
        chapterCount: Object.keys(chapters).length,
      });
    }
  }

  const searchPayload = JSON.stringify(searchRows);
  await writeFile(path.join(editionDirectory, 'search.json'), searchPayload);
  checksums[`${source.id}/search`] = createHash('sha256')
    .update(searchPayload)
    .digest('hex');
}

const manifest = {
  schemaVersion: 1,
  generatedOn: new Date().toISOString(),
  sources,
  books: generatedBooks,
  checksums,
};
await writeFile(
  path.join(publicRoot, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
);

const moduleContents = `/* Generated by scripts/import-bibles.mjs. Do not edit manually. */
export const bibleBooks = ${JSON.stringify(generatedBooks, null, 2)} as const;
export const bibleSources = ${JSON.stringify(sources, null, 2)} as const;
`;
await writeFile(generatedModule, moduleContents);

console.log(
  `Imported ${sources.length} complete editions across ${generatedBooks.length} canonical books.`,
);
