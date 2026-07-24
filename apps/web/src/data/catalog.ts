import type {
  Collection,
  CorpusLicense,
  Division,
  Edition,
  EntityId,
  Passage,
  Religion,
  Work,
} from '@academic-scriptures/domain';
import { bibleBooks, bibleSources } from './generatedBible';

const id = <T extends string>(value: string) => value as EntityId<T>;

export const licenses: CorpusLicense[] = [
  {
    id: id('license-public-domain'),
    name: 'Public Domain',
    copyrightHolder: 'Public domain',
    source: {
      title: 'eBible.org',
      url: 'https://ebible.org/',
      accessedOn: '2026-07-24',
    },
    redistribution: 'allowed',
    modification: 'allowed',
    offlineUse: 'allowed',
    attribution:
      'Reina-Valera 1909, World English Bible and the WLC text are redistributed from documented public-domain sources.',
  },
  {
    id: id('license-sblgnt'),
    name: 'Creative Commons Attribution 4.0',
    copyrightHolder: 'Society of Biblical Literature and Logos Bible Software',
    source: {
      title: 'SBL Greek New Testament',
      url: 'https://sblgnt.com/license/',
      accessedOn: '2026-07-24',
    },
    redistribution: 'allowed',
    modification: 'allowed',
    offlineUse: 'allowed',
    attribution:
      'SBLGNT © 2010 Society of Biblical Literature and Logos Bible Software. Licensed CC BY 4.0.',
  },
  {
    id: id('license-tanzil'),
    name: 'Creative Commons Attribution 3.0',
    copyrightHolder: 'Tanzil Project',
    source: {
      title: 'Tanzil Quran Text',
      url: 'https://tanzil.net/docs/text_license',
      accessedOn: '2026-07-24',
    },
    redistribution: 'allowed',
    modification: 'forbidden',
    offlineUse: 'allowed',
    attribution: 'Tanzil Quran Text, copied verbatim. Source: tanzil.net.',
  },
];

export const religions: Religion[] = [
  {
    id: id('christianity'),
    slug: 'christianity',
    labels: [
      { language: 'es', value: 'Cristianismo' },
      { language: 'en', value: 'Christianity' },
    ],
    description: [
      {
        language: 'es',
        value: 'Biblia completa en hebreo, griego, español e inglés.',
      },
      {
        language: 'en',
        value: 'Complete Bible in Hebrew, Greek, Spanish, and English.',
      },
    ],
    availability: 'available',
  },
  {
    id: id('judaism'),
    slug: 'judaism',
    labels: [
      { language: 'es', value: 'Judaísmo' },
      { language: 'en', value: 'Judaism' },
    ],
    description: [
      { language: 'es', value: 'Tanaj completo en hebreo.' },
      { language: 'en', value: 'Complete Tanakh in Hebrew.' },
    ],
    availability: 'licensed-sample',
  },
  {
    id: id('islam'),
    slug: 'islam',
    labels: [
      { language: 'es', value: 'Islam' },
      { language: 'en', value: 'Islam' },
    ],
    description: [
      { language: 'es', value: 'Muestra coránica con licencia verificada.' },
      { language: 'en', value: 'Licensed Quran sample.' },
    ],
    availability: 'licensed-sample',
  },
];

export const works: Work[] = bibleBooks.map((book) => ({
  id: id<'work'>(book.id),
  slug: book.id,
  labels: [
    { language: 'es', value: book.es },
    { language: 'en', value: book.en },
  ],
  collectionIds: [
    id<'collection'>('christian-bible'),
    ...(book.testament === 'old'
      ? [id<'collection'>('tanakh')]
      : []),
  ],
  category: 'primary-sacred-text',
  divisionType: 'chapter',
  aliases: [...book.aliases],
}));

works.push({
  id: id('al-fatiha'),
  slug: 'al-fatiha',
  labels: [
    { language: 'es', value: 'Al-Fátiha' },
    { language: 'en', value: 'Al-Fatiha' },
    { language: 'ar', value: 'الفاتحة', direction: 'rtl' },
  ],
  collectionIds: [id('quran')],
  category: 'primary-sacred-text',
  divisionType: 'surah',
  aliases: [
    'corán',
    'quran',
    'koran',
    'al-fatiha',
    'fatiha',
    'sura 1',
    'surah 1',
  ],
});

const oldTestamentIds = bibleBooks
  .filter((book) => book.testament === 'old')
  .map((book) => id<'work'>(book.id));
const allBibleIds = bibleBooks.map((book) => id<'work'>(book.id));

export const collections: Collection[] = [
  {
    id: id('christian-bible'),
    religionId: id('christianity'),
    slug: 'bible',
    labels: [
      { language: 'es', value: 'Biblia' },
      { language: 'en', value: 'Bible' },
    ],
    workIds: allBibleIds,
    availability: 'available',
  },
  {
    id: id('tanakh'),
    religionId: id('judaism'),
    slug: 'tanakh',
    labels: [
      { language: 'es', value: 'Tanaj' },
      { language: 'en', value: 'Tanakh' },
    ],
    workIds: oldTestamentIds,
    availability: 'licensed-sample',
  },
  {
    id: id('quran'),
    religionId: id('islam'),
    slug: 'quran',
    labels: [
      { language: 'es', value: 'Corán' },
      { language: 'en', value: 'Quran' },
    ],
    workIds: [id('al-fatiha')],
    availability: 'licensed-sample',
  },
];

export const divisions: Division[] = bibleBooks.flatMap((book) =>
  Array.from({ length: book.chapterCount }, (_, index) => ({
    id: id<'division'>(`${book.id}-${index + 1}`),
    workId: id<'work'>(book.id),
    order: index + 1,
    label: `${book.es} ${index + 1}`,
    locator: String(index + 1),
  })),
);

divisions.push({
  id: id('al-fatiha-1'),
  workId: id('al-fatiha'),
  order: 1,
  label: 'Al-Fátiha',
  locator: '1',
});

export const editions: Edition[] = bibleBooks.flatMap((book) =>
  bibleSources
    .filter(
      (source) =>
        source.testament === 'both' ||
        source.testament === book.testament,
    )
    .map((source) => ({
      id: id<'edition'>(`${source.id}-${book.id}`),
      workId: id<'work'>(book.id),
      licenseId: id<'license'>(source.licenseId),
      language: source.language,
      direction: source.direction,
      title: source.title,
      shortTitle: source.shortTitle,
      version: source.version,
      isSourceLanguage: source.source,
      availability: 'available',
    })),
);

editions.push(
  {
    id: id('tanzil-uthmani'),
    workId: id('al-fatiha'),
    licenseId: id('license-tanzil'),
    language: 'ar',
    direction: 'rtl',
    title: 'Tanzil Uthmani',
    shortTitle: 'Tanzil',
    version: '1.1',
    isSourceLanguage: true,
    availability: 'licensed-sample',
  },
  {
    id: id('garcia-bravo-1907'),
    workId: id('al-fatiha'),
    licenseId: id('license-public-domain'),
    language: 'es',
    direction: 'ltr',
    title: 'Joaquín García-Bravo',
    shortTitle: 'García-Bravo',
    version: '1907',
    isSourceLanguage: false,
    translationOf: id('tanzil-uthmani'),
    availability: 'licensed-sample',
  },
  {
    id: id('sale-1734'),
    workId: id('al-fatiha'),
    licenseId: id('license-public-domain'),
    language: 'en',
    direction: 'ltr',
    title: 'George Sale',
    shortTitle: 'Sale',
    version: '1734',
    isSourceLanguage: false,
    translationOf: id('tanzil-uthmani'),
    availability: 'licensed-sample',
  },
);

const quranText: Record<string, string[]> = {
  'tanzil-uthmani': [
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    'الرَّحْمَٰنِ الرَّحِيمِ',
    'مَالِكِ يَوْمِ الدِّينِ',
    'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
  ],
  'garcia-bravo-1907': [
    'En el nombre de Dios clemente y misericordioso.',
    'Alabado sea Dios, soberano del universo,',
    'El clemente, el misericordioso,',
    'Soberano del día de la retribución.',
    'A ti adoramos y de ti imploramos ayuda.',
    'Dirígenos por el sendero recto,',
    'Por el sendero de aquellos a quienes has colmado de beneficios; no por el de aquellos que han incurrido en tus iras ni por el de los que se extravían.',
  ],
  'sale-1734': [
    'In the name of the most merciful God.',
    'Praise be to God, the Lord of all creatures;',
    'the most merciful,',
    'the king of the day of judgment.',
    'Thee do we worship, and of thee do we beg assistance.',
    'Direct us in the right way,',
    'in the way of those to whom thou hast been gracious; not of those against whom thou art incensed, nor of those who go astray.',
  ],
};

export const samplePassages: Passage[] = Object.entries(quranText).flatMap(
  ([editionId, verses]) =>
    verses.map((text, index) => ({
      id: id(`${editionId}:al-fatiha-1:${index + 1}`),
      editionId: id(editionId),
      divisionId: id('al-fatiha-1'),
      locator: `1:${index + 1}`,
      number: String(index + 1),
      text,
    })),
);

export const getLabel = (
  labels: { language: string; value: string }[],
  language: 'es' | 'en',
) =>
  labels.find((label) => label.language === language)?.value ??
  labels.find((label) => label.language === 'en')?.value ??
  labels[0]?.value ??
  '';

export const getEdition = (editionId: string) =>
  editions.find((edition) => edition.id === editionId);

export const getWork = (workId: string) =>
  works.find((work) => work.id === workId);

export const getDivision = (divisionId: string) =>
  divisions.find((division) => division.id === divisionId);

export const editionsForWork = (workId: string) =>
  editions.filter((edition) => edition.workId === workId);

export const corpusSourceId = (edition: Edition) => {
  const source = bibleSources.find((item) =>
    edition.id.startsWith(`${item.id}-`),
  );
  return source?.id;
};
