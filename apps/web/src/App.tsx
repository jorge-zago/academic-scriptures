const pillars = [
  {
    eyebrow: 'Read',
    title: 'Primary sources in context',
    body: 'A calm reading environment with provenance, edition, language, and license always visible.',
  },
  {
    eyebrow: 'Examine',
    title: 'Evidence without category errors',
    body: 'Witnesses, translations, commentary, and reconstruction remain explicitly distinct.',
  },
  {
    eyebrow: 'Compare',
    title: 'Traditions on their own terms',
    body: 'Parallel texts and claims preserve context while supporting rigorous critical analysis.',
  },
] as const;

export function App() {
  const commit =
    __BUILD_COMMIT__ === 'development'
      ? __BUILD_COMMIT__
      : __BUILD_COMMIT__.slice(0, 7);

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Academic Scriptures home">
          <img src="/icon.svg" alt="" width="34" height="34" />
          <span>Academic Scriptures</span>
        </a>
        <span className="status">Foundational release</span>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <p className="kicker">Open-source comparative sacred-text research</p>
          <h1 id="hero-title">
            Read closely.
            <br />
            <em>Examine honestly.</em>
          </h1>
          <p className="lede">
            Sacred texts, original sources, and comparative evidence in a
            private, transparent, academically serious workspace.
          </p>
          <div className="actions">
            <a className="button primary" href="#principles">
              Explore the approach
            </a>
            <a
              className="button secondary"
              href="https://github.com/jorge-zago/academic-scriptures"
            >
              View source
            </a>
          </div>
        </section>

        <section className="principles" id="principles" aria-label="Principles">
          {pillars.map((pillar) => (
            <article className="principle" key={pillar.eyebrow}>
              <p>{pillar.eyebrow}</p>
              <h2>{pillar.title}</h2>
              <span>{pillar.body}</span>
            </article>
          ))}
        </section>

        <aside className="notice">
          <strong>Corpus integrity first.</strong>
          <span>
            No sacred text is bundled until its source and redistribution
            rights have been documented.
          </span>
        </aside>
      </main>

      <footer>
        <span>No ads. No tracking. No account required.</span>
        <span>
          Build <code>{commit}</code>
        </span>
      </footer>
    </div>
  );
}

