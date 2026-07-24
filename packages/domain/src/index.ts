export type EntityId<T extends string> = string & { readonly __entity: T };

export type TextDirection = 'ltr' | 'rtl' | 'auto';

export type ResourceCategory =
  | 'primary-sacred-text'
  | 'translation'
  | 'manuscript-witness'
  | 'critical-edition'
  | 'commentary'
  | 'historical-source'
  | 'interpretation'
  | 'denominational-position'
  | 'academic-reconstruction'
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

export interface LicenseRecord {
  id: EntityId<'license'>;
  name: string;
  copyrightHolder: string;
  source: SourceReference;
  redistribution: 'allowed' | 'restricted' | 'forbidden' | 'unknown';
  modification: 'allowed' | 'restricted' | 'forbidden' | 'unknown';
  offlineUse: 'allowed' | 'restricted' | 'forbidden' | 'unknown';
  attribution: string;
}

export interface Work {
  id: EntityId<'work'>;
  traditionId: EntityId<'tradition'>;
  labels: LocalizedLabel[];
  category: ResourceCategory;
}

export interface Edition {
  id: EntityId<'edition'>;
  workId: EntityId<'work'>;
  licenseId: EntityId<'license'>;
  language: string;
  direction: TextDirection;
  title: string;
  version: string;
}

export interface PassageRef {
  editionId: EntityId<'edition'>;
  divisionId: string;
  start: string;
  end?: string;
}

