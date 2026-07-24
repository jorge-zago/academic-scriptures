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

const id = <T extends string>(value: string) => value as EntityId<T>;

export const licenses: CorpusLicense[] = [
  {
    id: id('license-public-domain'),
    name: 'Public Domain',
    copyrightHolder: 'Public domain',
    source: {
      title: 'eBible.org public-domain editions',
      url: 'https://ebible.org/',
      accessedOn: '2026-07-24',
    },
    redistribution: 'allowed',
    modification: 'allowed',
    offlineUse: 'allowed',
    attribution: 'Public-domain source; digital provenance retained.',
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
    attribution: 'SBLGNT © 2010 Society of Biblical Literature and Logos Bible Software.',
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
      { language: 'es', value: 'Biblia hebrea y Nuevo Testamento.' },
      { language: 'en', value: 'Hebrew Bible and New Testament.' },
    ],
    availability: 'licensed-sample',
  },
  {
    id: id('judaism'),
    slug: 'judaism',
    labels: [
      { language: 'es', value: 'Judaísmo' },
      { language: 'en', value: 'Judaism' },
    ],
    description: [
      { language: 'es', value: 'Torá, Profetas y Escritos.' },
      { language: 'en', value: 'Torah, Prophets, and Writings.' },
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
      { language: 'es', value: 'Texto árabe del Corán y traducciones históricas.' },
      { language: 'en', value: 'Arabic Quran text and historical translations.' },
    ],
    availability: 'licensed-sample',
  },
];

export const collections: Collection[] = [
  {
    id: id('christian-bible'),
    religionId: id('christianity'),
    slug: 'bible',
    labels: [
      { language: 'es', value: 'Biblia' },
      { language: 'en', value: 'Bible' },
    ],
    workIds: [id('genesis'), id('matthew')],
    availability: 'licensed-sample',
  },
  {
    id: id('tanakh'),
    religionId: id('judaism'),
    slug: 'tanakh',
    labels: [
      { language: 'es', value: 'Tanaj' },
      { language: 'en', value: 'Tanakh' },
    ],
    workIds: [id('genesis')],
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

export const works: Work[] = [
  {
    id: id('genesis'),
    slug: 'genesis',
    labels: [
      { language: 'es', value: 'Génesis' },
      { language: 'en', value: 'Genesis' },
      { language: 'he', value: 'בְּרֵאשִׁית', direction: 'rtl' },
    ],
    collectionIds: [id('christian-bible'), id('tanakh')],
    category: 'primary-sacred-text',
    divisionType: 'chapter',
    aliases: ['gen', 'gn', 'génesis', 'genesis', 'bereshit'],
  },
  {
    id: id('matthew'),
    slug: 'matthew',
    labels: [
      { language: 'es', value: 'Mateo' },
      { language: 'en', value: 'Matthew' },
      { language: 'grc', value: 'Κατὰ Μαθθαῖον' },
    ],
    collectionIds: [id('christian-bible')],
    category: 'primary-sacred-text',
    divisionType: 'chapter',
    aliases: ['mt', 'mat', 'mateo', 'matthew'],
  },
  {
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
    aliases: ['corán', 'quran', 'koran', 'al-fatiha', 'fatiha', 'sura 1', 'surah 1'],
  },
];

export const divisions: Division[] = [
  {
    id: id('genesis-1'),
    workId: id('genesis'),
    order: 1,
    label: 'Génesis 1',
    locator: '1',
  },
  {
    id: id('matthew-25'),
    workId: id('matthew'),
    order: 25,
    label: 'Mateo 25',
    locator: '25',
  },
  {
    id: id('al-fatiha-1'),
    workId: id('al-fatiha'),
    order: 1,
    label: 'Al-Fátiha',
    locator: '1',
  },
];

export const editions: Edition[] = [
  {
    id: id('wlc'),
    workId: id('genesis'),
    licenseId: id('license-public-domain'),
    language: 'he',
    direction: 'rtl',
    title: 'Westminster Leningrad Codex',
    shortTitle: 'WLC',
    version: '4.20',
    isSourceLanguage: true,
    availability: 'licensed-sample',
  },
  {
    id: id('rv1909-genesis'),
    workId: id('genesis'),
    licenseId: id('license-public-domain'),
    language: 'es',
    direction: 'ltr',
    title: 'Reina-Valera 1909',
    shortTitle: 'RV1909',
    version: '1909',
    isSourceLanguage: false,
    translationOf: id('wlc'),
    availability: 'licensed-sample',
  },
  {
    id: id('web-genesis'),
    workId: id('genesis'),
    licenseId: id('license-public-domain'),
    language: 'en',
    direction: 'ltr',
    title: 'World English Bible',
    shortTitle: 'WEB',
    version: '2020',
    isSourceLanguage: false,
    translationOf: id('wlc'),
    availability: 'licensed-sample',
  },
  {
    id: id('jps1917'),
    workId: id('genesis'),
    licenseId: id('license-public-domain'),
    language: 'en',
    direction: 'ltr',
    title: 'JPS Tanakh 1917',
    shortTitle: 'JPS 1917',
    version: '1917',
    isSourceLanguage: false,
    translationOf: id('wlc'),
    availability: 'licensed-sample',
  },
  {
    id: id('sblgnt'),
    workId: id('matthew'),
    licenseId: id('license-sblgnt'),
    language: 'grc',
    direction: 'ltr',
    title: 'SBL Greek New Testament',
    shortTitle: 'SBLGNT',
    version: '2010',
    isSourceLanguage: true,
    availability: 'licensed-sample',
  },
  {
    id: id('rv1909-matthew'),
    workId: id('matthew'),
    licenseId: id('license-public-domain'),
    language: 'es',
    direction: 'ltr',
    title: 'Reina-Valera 1909',
    shortTitle: 'RV1909',
    version: '1909',
    isSourceLanguage: false,
    translationOf: id('sblgnt'),
    availability: 'licensed-sample',
  },
  {
    id: id('web-matthew'),
    workId: id('matthew'),
    licenseId: id('license-public-domain'),
    language: 'en',
    direction: 'ltr',
    title: 'World English Bible',
    shortTitle: 'WEB',
    version: '2020',
    isSourceLanguage: false,
    translationOf: id('sblgnt'),
    availability: 'licensed-sample',
  },
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
];

type VerseSet = Record<string, string[]>;

const texts: Record<string, VerseSet> = {
  wlc: {
    'genesis-1': [
      'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃',
      'וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם׃',
      'וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר׃',
      'וַיַּרְא אֱלֹהִים אֶת־הָאוֹר כִּי־טוֹב וַיַּבְדֵּל אֱלֹהִים בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ׃',
      'וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹם וְלַחֹשֶׁךְ קָרָא לָיְלָה וַיְהִי־עֶרֶב וַיְהִי־בֹקֶר יוֹם אֶחָד׃',
    ],
  },
  'rv1909-genesis': {
    'genesis-1': [
      'EN el principio crió Dios los cielos y la tierra.',
      'Y la tierra estaba desordenada y vacía, y las tinieblas estaban sobre la haz del abismo, y el Espíritu de Dios se movía sobre la haz de las aguas.',
      'Y dijo Dios: Sea la luz: y fué la luz.',
      'Y vió Dios que la luz era buena: y apartó Dios la luz de las tinieblas.',
      'Y llamó Dios á la luz Día, y á las tinieblas llamó Noche: y fué la tarde y la mañana un día.',
    ],
  },
  'web-genesis': {
    'genesis-1': [
      'In the beginning, God created the heavens and the earth.',
      'The earth was formless and empty. Darkness was on the surface of the deep and God’s Spirit was hovering over the surface of the waters.',
      'God said, “Let there be light,” and there was light.',
      'God saw the light, and saw that it was good. God divided the light from the darkness.',
      'God called the light “day”, and the darkness he called “night”. There was evening and there was morning, the first day.',
    ],
  },
  jps1917: {
    'genesis-1': [
      'In the beginning God created the heaven and the earth.',
      'Now the earth was unformed and void, and darkness was upon the face of the deep; and the spirit of God hovered over the face of the waters.',
      'And God said: ‘Let there be light.’ And there was light.',
      'And God saw the light, that it was good; and God divided the light from the darkness.',
      'And God called the light Day, and the darkness He called Night. And there was evening and there was morning, one day.',
    ],
  },
  sblgnt: {
    'matthew-25': [
      'ὕστερον δὲ ἔρχονται καὶ αἱ λοιπαὶ παρθένοι λέγουσαι· Κύριε κύριε, ἄνοιξον ἡμῖν·',
      'ὁ δὲ ἀποκριθεὶς εἶπεν· Ἀμὴν λέγω ὑμῖν, οὐκ οἶδα ὑμᾶς.',
      'γρηγορεῖτε οὖν, ὅτι οὐκ οἴδατε τὴν ἡμέραν οὐδὲ τὴν ὥραν.',
      'Ὥσπερ γὰρ ἄνθρωπος ἀποδημῶν ἐκάλεσεν τοὺς ἰδίους δούλους καὶ παρέδωκεν αὐτοῖς τὰ ὑπάρχοντα αὐτοῦ,',
      'καὶ ᾧ μὲν ἔδωκεν πέντε τάλαντα ᾧ δὲ δύο ᾧ δὲ ἕν, ἑκάστῳ κατὰ τὴν ἰδίαν δύναμιν, καὶ ἀπεδήμησεν.',
      'πορευθεὶς ὁ τὰ πέντε τάλαντα λαβὼν ἠργάσατο ἐν αὐτοῖς καὶ ἐκέρδησεν ἄλλα πέντε·',
      'ὡσαύτως ὁ τὰ δύο ἐκέρδησεν ἄλλα δύο·',
    ],
  },
  'rv1909-matthew': {
    'matthew-25': [
      'Y después vinieron también las otras vírgenes, diciendo: Señor, Señor, ábrenos.',
      'Mas respondiendo él, dijo: De cierto os digo, que no os conozco.',
      'Velad, pues, porque no sabéis el día ni la hora en que el Hijo del hombre ha de venir.',
      'Porque el reino de los cielos es como un hombre que partiéndose lejos llamó á sus siervos, y les entregó sus bienes.',
      'Y á éste dió cinco talentos, y al otro dos, y al otro uno: á cada uno conforme á su facultad; y luego se partió lejos.',
      'Y el que había recibido cinco talentos se fué, y granjeó con ellos, é hizo otros cinco talentos.',
      'Asimismo el que había recibido dos, ganó también él otros dos.',
    ],
  },
  'web-matthew': {
    'matthew-25': [
      'Afterward the other virgins also came, saying, “Lord, Lord, open to us.”',
      'But he answered, “Most certainly I tell you, I don’t know you.”',
      'Watch therefore, for you don’t know the day nor the hour in which the Son of Man is coming.',
      'For it is like a man going into another country, who called his own servants and entrusted his goods to them.',
      'To one he gave five talents, to another two, to another one, to each according to his own ability. Then he went on his journey.',
      'Immediately he who received the five talents went and traded with them, and made another five talents.',
      'In the same way, he also who got the two gained another two.',
    ],
  },
  'tanzil-uthmani': {
    'al-fatiha-1': [
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      'الرَّحْمَٰنِ الرَّحِيمِ',
      'مَالِكِ يَوْمِ الدِّينِ',
      'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    ],
  },
  'garcia-bravo-1907': {
    'al-fatiha-1': [
      'En el nombre de Dios clemente y misericordioso.',
      'Alabado sea Dios, soberano del universo,',
      'El clemente, el misericordioso,',
      'Soberano del día de la retribución.',
      'A ti adoramos y de ti imploramos ayuda.',
      'Dirígenos por el sendero recto,',
      'Por el sendero de aquellos a quienes has colmado de beneficios; no por el de aquellos que han incurrido en tus iras ni por el de los que se extravían.',
    ],
  },
  'sale-1734': {
    'al-fatiha-1': [
      'In the name of the most merciful God.',
      'Praise be to God, the Lord of all creatures;',
      'the most merciful,',
      'the king of the day of judgment.',
      'Thee do we worship, and of thee do we beg assistance.',
      'Direct us in the right way,',
      'in the way of those to whom thou hast been gracious; not of those against whom thou art incensed, nor of those who go astray.',
    ],
  },
};

const startNumber: Record<string, number> = {
  'matthew-25': 11,
};

export const passages: Passage[] = Object.entries(texts).flatMap(
  ([editionId, divisionSets]) =>
    Object.entries(divisionSets).flatMap(([divisionId, verses]) =>
      verses.map((text, index) => {
        const number = String((startNumber[divisionId] ?? 1) + index);
        return {
          id: id(`${editionId}:${divisionId}:${number}`),
          editionId: id(editionId),
          divisionId: id(divisionId),
          locator: `${divisions.find((item) => item.id === divisionId)?.locator ?? '1'}:${number}`,
          number,
          text,
          heading: index === 0 ? 'Texto de muestra con licencia documentada' : undefined,
          translatorNote:
            index === 0 ? 'El paratexto está separado del texto principal.' : undefined,
          crossReferences: index === 0 ? ['Fuentes y licencia'] : undefined,
        };
      }),
    ),
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

export const passagesFor = (editionId: string, divisionId: string) =>
  passages.filter(
    (passage) =>
      passage.editionId === editionId && passage.divisionId === divisionId,
  );
