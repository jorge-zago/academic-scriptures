/* global console, process */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const expectations = {
  rv1909: { books: 66, chapters: 1189, minimumVerses: 31000 },
  web: { books: 66, chapters: 1189, minimumVerses: 31000 },
  wlc: { books: 39, chapters: 929, minimumVerses: 23000 },
  sblgnt: { books: 27, chapters: 260, minimumVerses: 7900 },
};

const root = path.join(process.cwd(), 'apps', 'web', 'public', 'corpora');

for (const [editionId, expected] of Object.entries(expectations)) {
  const rows = JSON.parse(
    await readFile(path.join(root, editionId, 'search.json'), 'utf8'),
  );
  const bookCount = new Set(rows.map((row) => row[0])).size;
  const chapterCount = new Set(rows.map((row) => `${row[0]}:${row[1]}`)).size;
  const emptyCount = rows.filter((row) => !String(row[3]).trim()).length;

  if (
    bookCount !== expected.books ||
    chapterCount !== expected.chapters ||
    rows.length < expected.minimumVerses ||
    emptyCount
  ) {
    throw new Error(
      `${editionId} failed integrity checks: ${JSON.stringify({
        bookCount,
        chapterCount,
        verseCount: rows.length,
        emptyCount,
      })}`,
    );
  }

  console.log(
    `${editionId}: ${bookCount} books, ${chapterCount} chapters, ${rows.length} populated verses`,
  );
}
