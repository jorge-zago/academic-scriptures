import JSZip from 'jszip';
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Download,
  FileDown,
  FileUp,
  History,
  Languages,
  Library,
  Menu,
  MessageSquareText,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  Sun,
  TextQuote,
  X,
} from 'lucide-react';
import {
  type ChangeEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  Edition,
  ReadingPosition,
  UserAnnotation,
} from '@academic-scriptures/domain';
import {
  collections,
  divisions,
  editions,
  editionsForWork,
  getDivision,
  getEdition,
  getLabel,
  getWork,
  licenses,
  passages,
  passagesFor,
  religions,
  works,
} from './data/catalog';
import {
  isAmbiguousWorkQuery,
  parseReferences,
  searchText,
  type SearchResult,
} from './lib/search';

type Language = 'es' | 'en';
type Theme = 'system' | 'light' | 'dark';
type View =
  | 'catalog'
  | 'reader'
  | 'search'
  | 'notes'
  | 'offline'
  | 'privacy'
  | 'sources';

interface LocalData {
  schemaVersion: 1;
  annotations: UserAnnotation[];
  bookmarks: string[];
  history: ReadingPosition[];
  offlineEditionIds: string[];
  theme: Theme;
  language: Language;
  continuous: boolean;
  religionId: string;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
}

const STORAGE_KEY = 'academic-scriptures:v1';

const defaultLocalData: LocalData = {
  schemaVersion: 1,
  annotations: [],
  bookmarks: [],
  history: [],
  offlineEditionIds: [],
  theme: 'system',
  language:
    typeof navigator !== 'undefined' && navigator.language.startsWith('en')
      ? 'en'
      : 'es',
  continuous: false,
  religionId: 'christianity',
  sidebarWidth: 276,
  sidebarCollapsed: false,
};

const copy = {
  es: {
    searchPlaceholder: 'Referencia, palabra o frase exacta…',
    catalog: 'Catálogo',
    notes: 'Notas',
    history: 'Historial',
    offline: 'Sin conexión',
    chooseReligion: 'Religión',
    library: 'Biblioteca',
    collection: 'Colección',
    works: 'Textos',
    divisions: 'Divisiones',
    startTitle: 'Textos sagrados, directamente.',
    startBody:
      'Selecciona una religión o escribe una referencia. Sin comentarios, recomendaciones ni contenido promocional.',
    continue: 'Continuar leyendo',
    sourceSample: 'Corpus de muestra con licencia verificada',
    search: 'Buscar',
    exact: 'Búsqueda literal',
    open: 'Abrir',
    searchWord: 'Buscar como palabra',
    noResults: 'No se encontraron coincidencias literales.',
    cleanText: 'Texto',
    paratext: 'Paratexto',
    references: 'Referencias',
    continuous: 'Continuo',
    addParallel: 'Añadir paralelo',
    removeColumn: 'Quitar columna',
    previous: 'Anterior',
    next: 'Siguiente',
    bookmark: 'Guardar pasaje',
    bookmarked: 'Pasaje guardado',
    addNote: 'Añadir nota',
    notePlaceholder: 'Escribe una nota privada…',
    save: 'Guardar',
    cancel: 'Cancelar',
    selection: 'Selección',
    passage: 'Pasaje',
    emptyNotes: 'Todavía no hay notas privadas.',
    emptyHistory: 'Todavía no hay lecturas recientes.',
    download: 'Descargar edición',
    downloaded: 'Disponible sin conexión',
    removeDownload: 'Eliminar descarga',
    manualOnly:
      'Nada se descarga automáticamente. Elige las ediciones que quieres conservar en este dispositivo.',
    export: 'Exportar datos',
    import: 'Importar datos',
    privacyWarning:
      'La exportación será legible y contendrá notas, historial y preferencias. Guárdala en un lugar privado. ¿Continuar?',
    imported: 'Datos importados correctamente.',
    importError: 'No se pudo validar el archivo.',
    appearance: 'Apariencia',
    system: 'Sistema',
    light: 'Claro',
    dark: 'Oscuro',
    language: 'Idioma',
    sources: 'Fuentes y licencias',
    privacy: 'Privacidad',
    sourceCode: 'Código',
    sampleNotice:
      'Esta compilación incorpora fragmentos verificables para validar el lector. Una religión solo se publicará como corpus completo cuando sus ediciones fuente, española e inglesa estén verificadas.',
  },
  en: {
    searchPlaceholder: 'Reference, word, or exact phrase…',
    catalog: 'Catalog',
    notes: 'Notes',
    history: 'History',
    offline: 'Offline',
    chooseReligion: 'Religion',
    library: 'Library',
    collection: 'Collection',
    works: 'Texts',
    divisions: 'Divisions',
    startTitle: 'Sacred texts, directly.',
    startBody:
      'Choose a religion or enter a reference. No commentary, recommendations, or promotional content.',
    continue: 'Continue reading',
    sourceSample: 'Licensed sample corpus',
    search: 'Search',
    exact: 'Literal search',
    open: 'Open',
    searchWord: 'Search as a word',
    noResults: 'No literal matches were found.',
    cleanText: 'Text',
    paratext: 'Paratext',
    references: 'References',
    continuous: 'Continuous',
    addParallel: 'Add parallel',
    removeColumn: 'Remove column',
    previous: 'Previous',
    next: 'Next',
    bookmark: 'Bookmark passage',
    bookmarked: 'Passage bookmarked',
    addNote: 'Add note',
    notePlaceholder: 'Write a private note…',
    save: 'Save',
    cancel: 'Cancel',
    selection: 'Selection',
    passage: 'Passage',
    emptyNotes: 'No private notes yet.',
    emptyHistory: 'No recent readings yet.',
    download: 'Download edition',
    downloaded: 'Available offline',
    removeDownload: 'Remove download',
    manualOnly:
      'Nothing downloads automatically. Choose the editions you want to keep on this device.',
    export: 'Export data',
    import: 'Import data',
    privacyWarning:
      'The export is readable and includes notes, history, and preferences. Keep it private. Continue?',
    imported: 'Data imported successfully.',
    importError: 'The file could not be validated.',
    appearance: 'Appearance',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    sources: 'Sources and licenses',
    privacy: 'Privacy',
    sourceCode: 'Source',
    sampleNotice:
      'This build includes verifiable excerpts to validate the reader. A religion is released as a complete corpus only after source, Spanish, and English editions are verified.',
  },
} as const;

function loadLocalData(): LocalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultLocalData;
    const parsed = JSON.parse(raw) as Partial<LocalData>;
    if (parsed.schemaVersion !== 1) return defaultLocalData;
    return { ...defaultLocalData, ...parsed };
  } catch {
    return defaultLocalData;
  }
}

function formatReference(workId: string, divisionId: string) {
  const work = getWork(workId);
  const division = getDivision(divisionId);
  return `${work?.labels[0]?.value ?? workId} ${division?.locator ?? ''}`.trim();
}

export function App() {
  const [localData, setLocalData] = useState<LocalData>(loadLocalData);
  const [view, setView] = useState<View>('catalog');
  const [religionId, setReligionId] = useState(localData.religionId);
  const [workId, setWorkId] = useState('matthew');
  const [divisionId, setDivisionId] = useState('matthew-25');
  const [editionIds, setEditionIds] = useState<string[]>([
    'rv1909-matthew',
  ]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [referenceResults, setReferenceResults] = useState<
    ReturnType<typeof parseReferences>
  >([]);
  const [ambiguousWorkId, setAmbiguousWorkId] = useState<string>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localData.sidebarCollapsed,
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(localData.sidebarWidth);
  const [showParatext, setShowParatext] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [noteTarget, setNoteTarget] = useState<{
    passageId: string;
    editionId: string;
    selectedText?: string;
  }>();
  const [noteText, setNoteText] = useState('');
  const [notice, setNotice] = useState('');
  const importRef = useRef<HTMLInputElement>(null);
  const t = copy[localData.language];
  const language = localData.language;

  const commit =
    __BUILD_COMMIT__ === 'development'
      ? __BUILD_COMMIT__
      : __BUILD_COMMIT__.slice(0, 7);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
    document.documentElement.dataset.theme = localData.theme;
    document.documentElement.lang = localData.language;
  }, [localData]);

  useEffect(() => {
    setLocalData((current) => ({
      ...current,
      religionId,
      sidebarWidth,
      sidebarCollapsed,
    }));
  }, [religionId, sidebarWidth, sidebarCollapsed]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const activeReligion = religions.find((item) => item.id === religionId)!;
  const activeCollections = collections.filter(
    (item) => item.religionId === religionId,
  );
  const activeWorkIds = activeCollections.flatMap((item) => item.workIds);
  const activeWorks = works.filter((item) => activeWorkIds.includes(item.id));
  const activeDivisions = divisions.filter((item) => item.workId === workId);
  const activeWork = getWork(workId)!;
  const activeDivision = getDivision(divisionId)!;
  const availableEditions = editionsForWork(workId);
  const selectedEditions = editionIds
    .map(getEdition)
    .filter((edition): edition is Edition => Boolean(edition));
  const lastPosition = localData.history[0];

  const activeCollection = collections.find((collection) =>
    collection.workIds.includes(activeWork.id),
  );

  const openReading = (
    nextWorkId: string,
    nextDivisionId?: string,
    requestedEditionId?: string,
  ) => {
    const nextWork = getWork(nextWorkId);
    if (!nextWork) return;
    const nextDivision =
      divisions.find(
        (item) =>
          item.workId === nextWorkId &&
          (!nextDivisionId ||
            item.id === nextDivisionId ||
            item.locator === nextDivisionId),
      ) ?? divisions.find((item) => item.workId === nextWorkId);
    if (!nextDivision) return;

    const collection = collections.find((item) =>
      item.workIds.includes(nextWork.id),
    );
    if (collection) setReligionId(collection.religionId);
    setWorkId(nextWork.id);
    setDivisionId(nextDivision.id);
    const workEditions = editionsForWork(nextWork.id);
    const preferred =
      workEditions.find((edition) => edition.id === requestedEditionId) ??
      workEditions.find((edition) => edition.language === language) ??
      workEditions[0];
    setEditionIds(preferred ? [preferred.id] : []);
    setView('reader');
    setMobileSidebarOpen(false);

    setLocalData((current) => {
      const position: ReadingPosition = {
        religionId: collection?.religionId ?? current.history[0]?.religionId,
        workId: nextWork.id,
        divisionId: nextDivision.id,
        editionIds: preferred ? [preferred.id] : [],
        updatedAt: new Date().toISOString(),
      } as ReadingPosition;
      return {
        ...current,
        history: [
          position,
          ...current.history.filter(
            (item) =>
              !(
                item.workId === position.workId &&
                item.divisionId === position.divisionId
              ),
          ),
        ].slice(0, 40),
      };
    });
  };

  const chooseReligion = (nextReligionId: string) => {
    const collection = collections.find(
      (item) => item.religionId === nextReligionId,
    );
    const nextWork = works.find((item) =>
      collection?.workIds.includes(item.id),
    );
    const nextDivision = divisions.find(
      (item) => item.workId === nextWork?.id,
    );
    setReligionId(nextReligionId);
    if (nextWork && nextDivision) {
      setWorkId(nextWork.id);
      setDivisionId(nextDivision.id);
      const preferred =
        editionsForWork(nextWork.id).find(
          (edition) => edition.language === language,
        ) ?? editionsForWork(nextWork.id)[0];
      setEditionIds(preferred ? [preferred.id] : []);
    }
    setView('catalog');
  };

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const references = parseReferences(trimmed);
    setReferenceResults(references);
    setSearchResults([]);
    setAmbiguousWorkId(undefined);

    if (references.length) {
      setView('search');
      return;
    }

    const ambiguous = isAmbiguousWorkQuery(trimmed);
    if (ambiguous) {
      setAmbiguousWorkId(ambiguous.id);
      setView('search');
      return;
    }

    setSearchResults(searchText(trimmed));
    setView('search');
  };

  const runLiteralAmbiguousSearch = () => {
    setSearchResults(searchText(`"${query.trim()}"`));
    setAmbiguousWorkId(undefined);
  };

  const changeEdition = (index: number, nextEditionId: string) => {
    setEditionIds((current) =>
      current.map((editionId, editionIndex) =>
        editionIndex === index ? nextEditionId : editionId,
      ),
    );
  };

  const addParallel = () => {
    const next = availableEditions.find(
      (edition) => !editionIds.includes(edition.id),
    );
    if (next && editionIds.length < 3) {
      setEditionIds((current) => [...current, next.id]);
    }
  };

  const toggleBookmark = (passageId: string) => {
    setLocalData((current) => ({
      ...current,
      bookmarks: current.bookmarks.includes(passageId)
        ? current.bookmarks.filter((id) => id !== passageId)
        : [...current.bookmarks, passageId],
    }));
  };

  const openNote = (
    passageId: string,
    editionId: string,
    selectedText?: string,
  ) => {
    const existing = localData.annotations.find(
      (annotation) =>
        annotation.passageId === passageId &&
        annotation.selectedText === selectedText,
    );
    setNoteTarget({ passageId, editionId, selectedText });
    setNoteText(existing?.note ?? '');
  };

  const captureSelection = (
    passageId: string,
    editionId: string,
    element: HTMLElement,
  ) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (
      selectedText &&
      selection?.anchorNode &&
      element.contains(selection.anchorNode)
    ) {
      openNote(passageId, editionId, selectedText);
    }
  };

  const saveNote = () => {
    if (!noteTarget || !noteText.trim()) return;
    const now = new Date().toISOString();
    setLocalData((current) => {
      const existing = current.annotations.find(
        (annotation) =>
          annotation.passageId === noteTarget.passageId &&
          annotation.selectedText === noteTarget.selectedText,
      );
      const annotation: UserAnnotation = {
        id: existing?.id ?? crypto.randomUUID(),
        passageId: noteTarget.passageId as UserAnnotation['passageId'],
        editionId: noteTarget.editionId as UserAnnotation['editionId'],
        selectedText: noteTarget.selectedText,
        note: noteText.trim(),
        color: existing?.color ?? 'graphite',
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      return {
        ...current,
        annotations: [
          annotation,
          ...current.annotations.filter((item) => item.id !== annotation.id),
        ],
      };
    });
    setNoteTarget(undefined);
    setNoteText('');
  };

  const toggleOfflineEdition = (editionId: string) => {
    setLocalData((current) => ({
      ...current,
      offlineEditionIds: current.offlineEditionIds.includes(editionId)
        ? current.offlineEditionIds.filter((id) => id !== editionId)
        : [...current.offlineEditionIds, editionId],
    }));
  };

  const exportData = async () => {
    if (!window.confirm(t.privacyWarning)) return;
    const zip = new JSZip();
    zip.file(
      'academic-scriptures-data.json',
      JSON.stringify(
        {
          ...localData,
          exportedAt: new Date().toISOString(),
          application: 'Academic Scriptures',
        },
        null,
        2,
      ),
    );
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `academic-scriptures-${new Date().toISOString().slice(0, 10)}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      let raw: string;
      if (file.name.toLowerCase().endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file);
        const entry = zip.file('academic-scriptures-data.json');
        if (!entry) throw new Error('Missing data entry');
        raw = await entry.async('string');
      } else {
        raw = await file.text();
      }
      const parsed = JSON.parse(raw) as Partial<LocalData>;
      if (
        parsed.schemaVersion !== 1 ||
        !Array.isArray(parsed.annotations) ||
        !Array.isArray(parsed.history) ||
        !Array.isArray(parsed.bookmarks)
      ) {
        throw new Error('Invalid schema');
      }
      setLocalData({ ...defaultLocalData, ...parsed });
      setNotice(t.imported);
    } catch {
      setNotice(t.importError);
    } finally {
      event.target.value = '';
    }
  };

  const startResize = (event: ReactPointerEvent) => {
    if (sidebarCollapsed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startWidth = sidebarWidth;
    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      setSidebarWidth(
        Math.max(228, Math.min(380, startWidth + moveEvent.clientX - startX)),
      );
    };
    const handleUp = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  };

  const renderSidebar = () => (
    <aside
      className={`sidebar ${sidebarCollapsed ? 'is-collapsed' : ''} ${
        mobileSidebarOpen ? 'is-mobile-open' : ''
      }`}
      style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
      aria-label={t.library}
    >
      <div className="sidebar-heading">
        {!sidebarCollapsed && <span>{t.library}</span>}
        <button
          className="icon-button desktop-only"
          onClick={() => setSidebarCollapsed((value) => !value)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
        <button
          className="icon-button mobile-only"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close navigation"
        >
          <X size={19} />
        </button>
      </div>

      {sidebarCollapsed ? (
        <nav className="collapsed-nav">
          <button
            className={view === 'catalog' ? 'active' : ''}
            onClick={() => setView('catalog')}
            aria-label={t.catalog}
          >
            <Library size={19} />
          </button>
          <button
            className={view === 'notes' ? 'active' : ''}
            onClick={() => setView('notes')}
            aria-label={t.notes}
          >
            <MessageSquareText size={19} />
          </button>
          <button
            className={view === 'offline' ? 'active' : ''}
            onClick={() => setView('offline')}
            aria-label={t.offline}
          >
            <Download size={19} />
          </button>
        </nav>
      ) : (
        <div className="sidebar-content">
          <label className="field-label" htmlFor="religion-select">
            {t.chooseReligion}
          </label>
          <div className="select-wrap">
            <select
              id="religion-select"
              value={religionId}
              onChange={(event) => chooseReligion(event.target.value)}
            >
              {religions.map((religion) => (
                <option key={religion.id} value={religion.id}>
                  {getLabel(religion.labels, language)}
                </option>
              ))}
            </select>
            <ChevronDown size={15} aria-hidden />
          </div>

          <div className="sidebar-section">
            <span className="section-label">{t.collection}</span>
            {activeCollections.map((collection) => (
              <div className="tree-parent" key={collection.id}>
                <BookMarked size={17} />
                <span>{getLabel(collection.labels, language)}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <span className="section-label">{t.works}</span>
            {activeWorks.map((work) => (
              <button
                key={work.id}
                className={`tree-button ${work.id === workId ? 'active' : ''}`}
                onClick={() => {
                  const nextDivision = divisions.find(
                    (division) => division.workId === work.id,
                  );
                  openReading(work.id, nextDivision?.id);
                }}
              >
                <span>{getLabel(work.labels, language)}</span>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>

          <div className="sidebar-section">
            <span className="section-label">{t.divisions}</span>
            <div className="division-grid">
              {activeDivisions.map((division) => (
                <button
                  key={division.id}
                  className={division.id === divisionId ? 'active' : ''}
                  onClick={() => openReading(workId, division.id)}
                >
                  {division.locator}
                </button>
              ))}
            </div>
          </div>

          <nav className="utility-nav">
            <button
              className={view === 'notes' ? 'active' : ''}
              onClick={() => setView('notes')}
            >
              <MessageSquareText size={17} />
              {t.notes}
              <span>{localData.annotations.length}</span>
            </button>
            <button
              className={view === 'catalog' ? '' : undefined}
              onClick={() => setView('catalog')}
            >
              <History size={17} />
              {t.history}
              <span>{localData.history.length}</span>
            </button>
            <button
              className={view === 'offline' ? 'active' : ''}
              onClick={() => setView('offline')}
            >
              <Download size={17} />
              {t.offline}
              <span>{localData.offlineEditionIds.length}</span>
            </button>
          </nav>
        </div>
      )}
      {!sidebarCollapsed && (
        <div
          className="resize-handle desktop-only"
          onPointerDown={startResize}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
        />
      )}
    </aside>
  );

  const renderCatalog = () => (
    <div className="catalog-page">
      <header className="page-intro">
        <p className="eyebrow">{t.catalog}</p>
        <h1>{t.startTitle}</h1>
        <p>{t.startBody}</p>
      </header>

      {lastPosition && (
        <button
          className="continue-row"
          onClick={() =>
            openReading(
              lastPosition.workId,
              lastPosition.divisionId,
              lastPosition.editionIds[0],
            )
          }
        >
          <span className="continue-icon">
            <ArrowRight size={18} />
          </span>
          <span>
            <small>{t.continue}</small>
            <strong>
              {formatReference(
                lastPosition.workId,
                lastPosition.divisionId,
              )}
            </strong>
          </span>
          <ChevronRight size={18} />
        </button>
      )}

      <section className="religion-catalog" aria-label={t.chooseReligion}>
        {religions.map((religion) => {
          const religionCollections = collections.filter(
            (collection) => collection.religionId === religion.id,
          );
          const religionWorks = works.filter((work) =>
            religionCollections.some((collection) =>
              collection.workIds.includes(work.id),
            ),
          );
          return (
            <article className="religion-row" key={religion.id}>
              <button
                className="religion-summary"
                onClick={() => chooseReligion(religion.id)}
              >
                <span className="religion-monogram">
                  {getLabel(religion.labels, language).slice(0, 1)}
                </span>
                <span>
                  <strong>{getLabel(religion.labels, language)}</strong>
                  <small>
                    {getLabel(religion.description, language)}
                  </small>
                </span>
              </button>
              <div className="work-links">
                {religionWorks.map((work) => (
                  <button
                    key={work.id}
                    onClick={() => openReading(work.id)}
                  >
                    {getLabel(work.labels, language)}
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <div className="integrity-note">
        <Check size={17} />
        <div>
          <strong>{t.sourceSample}</strong>
          <p>{t.sampleNotice}</p>
        </div>
      </div>

      {localData.history.length > 0 && (
        <section className="compact-section">
          <div className="section-heading">
            <h2>{t.history}</h2>
          </div>
          <div className="plain-list">
            {localData.history.slice(0, 6).map((position) => (
              <button
                key={`${position.workId}:${position.divisionId}`}
                onClick={() =>
                  openReading(
                    position.workId,
                    position.divisionId,
                    position.editionIds[0],
                  )
                }
              >
                <span>
                  {formatReference(position.workId, position.divisionId)}
                </span>
                <time>
                  {new Intl.DateTimeFormat(language, {
                    month: 'short',
                    day: 'numeric',
                  }).format(new Date(position.updatedAt))}
                </time>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const renderReader = () => (
    <div className="reader-page">
      <header className="reader-header">
        <div className="breadcrumbs">
          <button onClick={() => setView('catalog')}>
            {getLabel(activeReligion.labels, language)}
          </button>
          <ChevronRight size={13} />
          <span>
            {activeCollection
              ? getLabel(activeCollection.labels, language)
              : ''}
          </span>
        </div>
        <div className="reader-title-row">
          <div>
            <h1>
              {getLabel(activeWork.labels, language)} {activeDivision.locator}
            </h1>
            <p>{t.sourceSample}</p>
          </div>
          <div className="reader-navigation">
            <button className="icon-button" disabled aria-label={t.previous}>
              <ChevronLeft size={19} />
            </button>
            <button className="icon-button" disabled aria-label={t.next}>
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
        <div className="reader-toolbar" aria-label="Reader settings">
          <button
            className={showParatext ? 'active' : ''}
            onClick={() => setShowParatext((value) => !value)}
          >
            <TextQuote size={16} />
            {t.paratext}
          </button>
          <button
            className={showReferences ? 'active' : ''}
            onClick={() => setShowReferences((value) => !value)}
          >
            <BookMarked size={16} />
            {t.references}
          </button>
          <button
            className={localData.continuous ? 'active' : ''}
            onClick={() =>
              setLocalData((current) => ({
                ...current,
                continuous: !current.continuous,
              }))
            }
          >
            <MoreHorizontal size={16} />
            {t.continuous}
          </button>
          <span className="toolbar-spacer" />
          <button
            onClick={addParallel}
            disabled={
              editionIds.length >= 3 ||
              editionIds.length >= availableEditions.length
            }
          >
            <Columns3 size={16} />
            {t.addParallel}
          </button>
        </div>
      </header>

      <div
        className="parallel-reader"
        style={{ '--column-count': editionIds.length } as React.CSSProperties}
      >
        {selectedEditions.map((edition, columnIndex) => {
          const editionPassages = passagesFor(edition.id, divisionId);
          const license = licenses.find(
            (item) => item.id === edition.licenseId,
          );
          return (
            <article
              className="edition-column"
              key={`${edition.id}:${columnIndex}`}
              dir={edition.direction === 'rtl' ? 'rtl' : 'ltr'}
            >
              <div className="edition-heading" dir="ltr">
                <div className="select-wrap edition-select">
                  <select
                    value={edition.id}
                    onChange={(event) =>
                      changeEdition(columnIndex, event.target.value)
                    }
                    aria-label="Edition"
                  >
                    {availableEditions.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        disabled={
                          editionIds.includes(item.id) &&
                          item.id !== edition.id
                        }
                      >
                        {item.shortTitle} · {item.language.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} />
                </div>
                {editionIds.length > 1 && (
                  <button
                    className="icon-button"
                    onClick={() =>
                      setEditionIds((current) =>
                        current.filter((_, index) => index !== columnIndex),
                      )
                    }
                    aria-label={t.removeColumn}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="edition-meta" dir="ltr">
                <span>{edition.title}</span>
                <a href={license?.source.url} target="_blank" rel="noreferrer">
                  {license?.name}
                </a>
              </div>

              <div className="passage-text">
                {editionPassages.map((passage) => {
                  const bookmarked = localData.bookmarks.includes(passage.id);
                  const annotation = localData.annotations.find(
                    (item) => item.passageId === passage.id,
                  );
                  return (
                    <div
                      className={`verse ${annotation ? 'has-note' : ''}`}
                      key={passage.id}
                      onMouseUp={(event) =>
                        captureSelection(
                          passage.id,
                          edition.id,
                          event.currentTarget,
                        )
                      }
                    >
                      {showParatext && passage.heading && (
                        <p className="paratext-label" dir="ltr">
                          {passage.heading}
                        </p>
                      )}
                      <span className="verse-number">{passage.number}</span>
                      <span>{passage.text}</span>
                      <span className="verse-actions" dir="ltr">
                        <button
                          onClick={() => toggleBookmark(passage.id)}
                          aria-label={
                            bookmarked ? t.bookmarked : t.bookmark
                          }
                        >
                          <Bookmark
                            size={15}
                            fill={bookmarked ? 'currentColor' : 'none'}
                          />
                        </button>
                        <button
                          onClick={() => openNote(passage.id, edition.id)}
                          aria-label={t.addNote}
                        >
                          <MessageSquareText
                            size={15}
                            fill={annotation ? 'currentColor' : 'none'}
                          />
                        </button>
                      </span>
                      {showParatext && passage.translatorNote && (
                        <p className="translator-note" dir="ltr">
                          <strong>{t.paratext}:</strong>{' '}
                          {passage.translatorNote}
                        </p>
                      )}
                      {showReferences && passage.crossReferences && (
                        <p className="cross-reference" dir="ltr">
                          {passage.crossReferences.join(' · ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <div className="reader-bottom-nav">
        <button disabled>
          <ArrowLeft size={16} />
          {t.previous}
        </button>
        <span>
          {getLabel(activeWork.labels, language)} {activeDivision.locator}
        </span>
        <button disabled>
          {t.next}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderSearch = () => {
    const ambiguous = ambiguousWorkId ? getWork(ambiguousWorkId) : undefined;
    return (
      <div className="results-page">
        <header className="page-title">
          <p className="eyebrow">{t.search}</p>
          <h1>“{query}”</h1>
        </header>

        {ambiguous && (
          <div className="ambiguity-panel">
            <p>
              {language === 'es'
                ? 'La consulta puede ser un texto o una palabra.'
                : 'The query can be a text or a word.'}
            </p>
            <button onClick={() => openReading(ambiguous.id)}>
              <BookMarked size={18} />
              <span>
                <small>{t.open}</small>
                <strong>{getLabel(ambiguous.labels, language)}</strong>
              </span>
              <ChevronRight size={17} />
            </button>
            <button onClick={runLiteralAmbiguousSearch}>
              <Search size={18} />
              <span>
                <small>{t.searchWord}</small>
                <strong>“{query}”</strong>
              </span>
              <ChevronRight size={17} />
            </button>
          </div>
        )}

        {referenceResults.length > 0 && (
          <div className="result-list">
            {referenceResults.map((result) => {
              const work = getWork(result.workId)!;
              const division = divisions.find(
                (item) =>
                  item.workId === result.workId &&
                  item.locator === result.range.divisionLocator,
              );
              return (
                <button
                  key={result.raw}
                  onClick={() =>
                    openReading(result.workId, division?.id)
                  }
                >
                  <span className="result-type">{t.passage}</span>
                  <span>
                    <strong>{result.raw}</strong>
                    <small>{getLabel(work.labels, language)}</small>
                  </span>
                  <ArrowRight size={18} />
                </button>
              );
            })}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="result-list">
            {searchResults.map((result) => {
              const work = getWork(result.workId)!;
              const edition = getEdition(result.editionId)!;
              const passage = passages.find(
                (item) => item.id === result.passageId,
              )!;
              return (
                <button
                  key={result.passageId}
                  onClick={() =>
                    openReading(
                      result.workId,
                      passage.divisionId,
                      result.editionId,
                    )
                  }
                >
                  <span className="result-type">{edition.shortTitle}</span>
                  <span>
                    <strong>
                      {getLabel(work.labels, language)} {result.locator}
                    </strong>
                    <small>{result.text}</small>
                  </span>
                  <ArrowRight size={18} />
                </button>
              );
            })}
          </div>
        )}

        {!ambiguous &&
          !referenceResults.length &&
          !searchResults.length && (
            <div className="empty-state">
              <Search size={22} />
              <p>{t.noResults}</p>
            </div>
          )}
      </div>
    );
  };

  const renderNotes = () => (
    <div className="utility-page">
      <header className="page-title">
        <p className="eyebrow">{t.notes}</p>
        <h1>{t.notes}</h1>
      </header>
      {localData.annotations.length ? (
        <div className="note-list">
          {localData.annotations.map((annotation) => {
            const passage = passages.find(
              (item) => item.id === annotation.passageId,
            );
            const edition = getEdition(annotation.editionId);
            const work = edition ? getWork(edition.workId) : undefined;
            return (
              <article key={annotation.id}>
                <button
                  className="note-reference"
                  onClick={() =>
                    edition &&
                    passage &&
                    openReading(
                      edition.workId,
                      passage.divisionId,
                      edition.id,
                    )
                  }
                >
                  {work ? getLabel(work.labels, language) : ''}{' '}
                  {passage?.locator} · {edition?.shortTitle}
                </button>
                {annotation.selectedText && (
                  <blockquote>“{annotation.selectedText}”</blockquote>
                )}
                <p>{annotation.note}</p>
                <div>
                  <time>
                    {new Intl.DateTimeFormat(language, {
                      dateStyle: 'medium',
                    }).format(new Date(annotation.updatedAt))}
                  </time>
                  <button
                    onClick={() => {
                      setNoteTarget({
                        passageId: annotation.passageId,
                        editionId: annotation.editionId,
                        selectedText: annotation.selectedText,
                      });
                      setNoteText(annotation.note);
                    }}
                  >
                    {language === 'es' ? 'Editar' : 'Edit'}
                  </button>
                  <button
                    onClick={() =>
                      setLocalData((current) => ({
                        ...current,
                        annotations: current.annotations.filter(
                          (item) => item.id !== annotation.id,
                        ),
                      }))
                    }
                  >
                    {language === 'es' ? 'Eliminar' : 'Delete'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <MessageSquareText size={22} />
          <p>{t.emptyNotes}</p>
        </div>
      )}
    </div>
  );

  const renderOffline = () => (
    <div className="utility-page">
      <header className="page-title">
        <p className="eyebrow">{t.offline}</p>
        <h1>{t.offline}</h1>
        <p>{t.manualOnly}</p>
      </header>
      <div className="edition-downloads">
        {editions.map((edition) => {
          const downloaded = localData.offlineEditionIds.includes(edition.id);
          const work = getWork(edition.workId)!;
          return (
            <article key={edition.id}>
              <div>
                <span>{edition.language.toUpperCase()}</span>
                <strong>{edition.title}</strong>
                <small>{getLabel(work.labels, language)}</small>
              </div>
              <button
                className={downloaded ? 'downloaded' : ''}
                onClick={() => toggleOfflineEdition(edition.id)}
              >
                {downloaded ? <Check size={16} /> : <Download size={16} />}
                {downloaded ? t.removeDownload : t.download}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );

  const renderPolicyPage = (page: 'privacy' | 'sources') => (
    <div className="utility-page policy-page">
      <header className="page-title">
        <p className="eyebrow">
          {page === 'privacy' ? t.privacy : t.sources}
        </p>
        <h1>{page === 'privacy' ? t.privacy : t.sources}</h1>
      </header>
      {page === 'privacy' ? (
        <div className="policy-copy">
          <h2>
            {language === 'es'
              ? 'Tus datos permanecen en este dispositivo'
              : 'Your data stays on this device'}
          </h2>
          <p>
            {language === 'es'
              ? 'Academic Scriptures no incluye publicidad, analítica conductual, píxeles de seguimiento ni una base de datos de cuentas. Las notas, marcadores, historial y preferencias se almacenan localmente en el navegador.'
              : 'Academic Scriptures includes no advertising, behavioral analytics, tracking pixels, or account database. Notes, bookmarks, history, and preferences are stored locally in your browser.'}
          </p>
          <p>
            {language === 'es'
              ? 'La exportación es un archivo legible. Quien obtenga una copia podrá leer su contenido. Cloudflare y los proveedores de red pueden procesar datos técnicos como direcciones IP al servir la aplicación.'
              : 'Exports are readable files. Anyone who obtains a copy can read their contents. Cloudflare and network providers may process technical data such as IP addresses while serving the application.'}
          </p>
        </div>
      ) : (
        <div className="source-register">
          {licenses.map((license) => (
            <article key={license.id}>
              <div>
                <span>{license.name}</span>
                <h2>{license.copyrightHolder}</h2>
              </div>
              <p>{license.attribution}</p>
              <dl>
                <div>
                  <dt>Redistribution</dt>
                  <dd>{license.redistribution}</dd>
                </div>
                <div>
                  <dt>Offline</dt>
                  <dd>{license.offlineUse}</dd>
                </div>
              </dl>
              <a href={license.source.url} target="_blank" rel="noreferrer">
                {license.source.title} <ArrowRight size={14} />
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="icon-button mobile-only"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <button className="brand" onClick={() => setView('catalog')}>
          <img src="/icon.svg" alt="" width="30" height="30" />
          <span>Academic Scriptures</span>
        </button>
        <form className="global-search" onSubmit={handleSearch}>
          <Search size={18} aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
          />
          <kbd>↵</kbd>
        </form>
        <div className="topbar-actions">
          <button
            className="icon-button"
            onClick={() =>
              setLocalData((current) => ({
                ...current,
                language: current.language === 'es' ? 'en' : 'es',
              }))
            }
            aria-label={t.language}
          >
            <Languages size={19} />
            <span>{language.toUpperCase()}</span>
          </button>
          <button
            className="icon-button"
            onClick={() =>
              setLocalData((current) => ({
                ...current,
                theme:
                  current.theme === 'system'
                    ? 'light'
                    : current.theme === 'light'
                      ? 'dark'
                      : 'system',
              }))
            }
            aria-label={t.appearance}
          >
            {localData.theme === 'dark' ? (
              <Moon size={19} />
            ) : localData.theme === 'light' ? (
              <Sun size={19} />
            ) : (
              <Settings2 size={19} />
            )}
          </button>
        </div>
      </header>

      <div className="workspace">
        {renderSidebar()}
        {mobileSidebarOpen && (
          <button
            className="sidebar-scrim mobile-only"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close navigation"
          />
        )}
        <main className="main-content">
          {view === 'catalog' && renderCatalog()}
          {view === 'reader' && renderReader()}
          {view === 'search' && renderSearch()}
          {view === 'notes' && renderNotes()}
          {view === 'offline' && renderOffline()}
          {view === 'privacy' && renderPolicyPage('privacy')}
          {view === 'sources' && renderPolicyPage('sources')}

          <footer>
            <nav>
              <button onClick={() => setView('privacy')}>{t.privacy}</button>
              <button onClick={() => setView('sources')}>{t.sources}</button>
              <a
                href="https://github.com/jorge-zago/academic-scriptures"
                target="_blank"
                rel="noreferrer"
              >
                {t.sourceCode}
              </a>
            </nav>
            <div className="footer-actions">
              <button onClick={exportData}>
                <FileDown size={15} />
                {t.export}
              </button>
              <button onClick={() => importRef.current?.click()}>
                <FileUp size={15} />
                {t.import}
              </button>
              <input
                ref={importRef}
                type="file"
                accept=".zip,.json,application/zip,application/json"
                onChange={importData}
                hidden
              />
            </div>
            <code>{commit}</code>
          </footer>
        </main>
      </div>

      {noteTarget && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="note-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-title"
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  {noteTarget.selectedText ? t.selection : t.passage}
                </span>
                <h2 id="note-title">{t.addNote}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setNoteTarget(undefined)}
                aria-label={t.cancel}
              >
                <X size={18} />
              </button>
            </div>
            {noteTarget.selectedText && (
              <blockquote>“{noteTarget.selectedText}”</blockquote>
            )}
            <textarea
              autoFocus
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder={t.notePlaceholder}
              rows={6}
            />
            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setNoteTarget(undefined)}
              >
                {t.cancel}
              </button>
              <button
                className="button primary"
                onClick={saveNote}
                disabled={!noteText.trim()}
              >
                {t.save}
              </button>
            </div>
          </section>
        </div>
      )}

      {notice && (
        <div className="toast" role="status">
          <Check size={16} />
          {notice}
        </div>
      )}
    </div>
  );
}
