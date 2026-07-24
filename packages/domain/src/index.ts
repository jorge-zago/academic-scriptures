export type EntityId<T extends string> = string & { readonly __entity: T };

export type TextDirection = 'ltr' | 'rtl' | 'auto';
export type Availability = 'available' | 'licensed-sample' | 'unavailable';
export type ResourceCategory =
  | 'primary-sacred-text'
  | 'translation'
  | 'manuscript-witness'
  | 'critical-edition'
  | 'paratext'
  | 'user-note';

export interface LocalizedLabel {
  language: string;
  value: string;
  direction?: TextDirection;
}

export interface SourceReference {
  title: string;
  url: string;
  accessedOn: string;
}

export interface CorpusLicense {
  id: EntityId<'license'>;
  name: string;
  copyrightHolder: string;
  source: SourceReference;
  redistribution: 'allowed' | 'restricted' | 'forbidden' | 'unknown';
  modification: 'allowed' | 'restricted' | 'forbidden' | 'unknown';
  offlineUse: 'allowed' | 'restricted' | 'forbidden' | 'unknown';
  attribution: string;
}

export interface Religion {
  id: EntityId<'religion'>;
  slug: string;
  labels: LocalizedLabel[];
  description: LocalizedLabel[];
  availability: Availability;
}

export interface Collection {
  id: EntityId<'collection'>;
  religionId: EntityId<'religion'>;
  slug: string;
  labels: LocalizedLabel[];
  workIds: EntityId<'work'>[];
  availability: Availability;
}

export interface Work {
  id: EntityId<'work'>;
  slug: string;
  labels: LocalizedLabel[];
  collectionIds: EntityId<'collection'>[];
  category: ResourceCategory;
  divisionType: string;
  aliases: string[];
}

export interface Edition {
  id: EntityId<'edition'>;
  workId: EntityId<'work'>;
  licenseId: EntityId<'license'>;
  language: string;
  direction: TextDirection;
  title: string;
  shortTitle: string;
  version: string;
  isSourceLanguage: boolean;
  translationOf?: EntityId<'edition'>;
  availability: Availability;
}

export interface TranslationRelation {
  sourceEditionId: EntityId<'edition'>;
  translationEditionId: EntityId<'edition'>;
  relation: 'translation-of';
}

export interface Division {
  id: EntityId<'division'>;
  workId: EntityId<'work'>;
  order: number;
  label: string;
  locator: string;
  previousId?: EntityId<'division'>;
  nextId?: EntityId<'division'>;
}

export interface Passage {
  id: EntityId<'passage'>;
  editionId: EntityId<'edition'>;
  divisionId: EntityId<'division'>;
  locator: string;
  number: string;
  text: string;
  heading?: string;
  translatorNote?: string;
  crossReferences?: string[];
}

export interface PassageRange {
  workId: EntityId<'work'>;
  divisionLocator: string;
  start?: string;
  end?: string;
}

export interface UserAnnotation {
  id: string;
  passageId: EntityId<'passage'>;
  editionId: EntityId<'edition'>;
  selectedText?: string;
  note: string;
  color: 'graphite' | 'sage' | 'ochre';
  createdAt: string;
  updatedAt: string;
}

export interface ReadingPosition {
  religionId: EntityId<'religion'>;
  workId: EntityId<'work'>;
  divisionId: EntityId<'division'>;
  editionIds: EntityId<'edition'>[];
  updatedAt: string;
}

// Kept as a compatibility alias for integrations using the initial name.
export type LicenseRecord = CorpusLicense;
export type PassageRef = PassageRange & { editionId: EntityId<'edition'> };
