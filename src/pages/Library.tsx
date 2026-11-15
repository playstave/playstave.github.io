import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, EmptyState, Notice, PageHeader, SectionTitle } from '../components/ui';
import { Icon } from '../components/Icon';
import { ScoreCard } from '../components/library/ScoreCard';
import { SCORES, getScore } from '../data/scores';
import { DIFFICULTIES, GENRES, INSTRUMENTS, type Difficulty, type Genre, type Instrument } from '../music/score';
import { facetCounts, searchScores, type Query } from '../lib/librarySearch';
import { useAppState } from '../state/AppState';
import styles from './Library.module.css';

type View = 'browse' | 'favourites' | 'collections' | 'recent';

export function Library() {
  const [params, setParams] = useSearchParams();
  const view = (params.get('view') as View) || 'browse';
  const { progress } = useAppState();

  const setView = (v: View) => setParams((prev) => { const p = new URLSearchParams(prev); if (v === 'browse') p.delete('view'); else p.set('view', v); return p; }, { replace: true });
  const tabs: { id: View; label: string; count?: number; icon: 'search' | 'heart' | 'folder' | 'clock' }[] = [
    { id: 'browse', label: 'Browse', icon: 'search' },
    { id: 'favourites', label: 'Favourites', count: progress.favorites.length, icon: 'heart' },
    { id: 'collections', label: 'Collections', count: progress.collections.length, icon: 'folder' },
    { id: 'recent', label: 'Recently opened', count: progress.recentScores.length, icon: 'clock' },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Sheet music"
        title="Library"
        lede={`${SCORES.length} scores, every one free to view, print and share — public-domain works and Stave originals, engraved for this library.`}
      />
      <div className={styles.tabs} role="tablist" aria-label="Library sections">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={view === t.id} aria-controls={`panel-${t.id}`} className={`${styles.tab} ${view === t.id ? styles.tabOn : ''}`} onClick={() => setView(t.id)}>
            <Icon name={t.icon} size={16} /> {t.label}{t.count != null && <span className={styles.count}>{t.count}</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${view}`} aria-labelledby={`tab-${view}`}>
        {view === 'browse' && <Browse params={params} setParams={setParams} />}
        {view === 'favourites' && <Favourites />}
        {view === 'collections' && <Collections />}
        {view === 'recent' && <Recent />}
      </div>

      <section aria-labelledby="licensing" className={styles.licensing}>
        <SectionTitle id="licensing">Licensing</SectionTitle>
        <Notice title="Only music we have the right to share">
          <p>Every score here is either a composition in the public domain (traditional, or by a composer who died long ago) or an original written for Stave. All are freshly engraved by Stave — nothing is scanned or copied from a copyrighted edition — and our engravings are dedicated to the public domain under CC0 1.0. Each score page shows its source and licence. If a future score’s licence does not allow printing or downloading, those buttons will not appear.</p>
        </Notice>
      </section>
    </>
  );
}

function Browse({ params, setParams }: { params: URLSearchParams; setParams: ReturnType<typeof useSearchParams>[1] }) {
  const q: Query = {
    q: params.get('q') ?? '',
    instrument: (params.get('instrument') as Instrument) || '',
    difficulty: (params.get('difficulty') as Difficulty) || '',
    genre: (params.get('genre') as Genre) || '',
    sort: (params.get('sort') as Query['sort']) || 'title',
  };
  // React Router's setSearchParams does not queue updates: two changes before the
  // next render would each start from the same old URL. Keep the latest pending
  // params in a ref so successive changes always build on each other.
  const pending = useRef<URLSearchParams | null>(null);
  useEffect(() => { pending.current = null; }, [params]);
  const commit = (p: URLSearchParams) => { pending.current = p; setParams(p, { replace: true }); };
  const set = (k: string, v: string) => { const p = new URLSearchParams(pending.current ?? params); if (v) p.set(k, v); else p.delete(k); commit(p); };
  const results = useMemo(() => searchScores(SCORES, q), [q.q, q.instrument, q.difficulty, q.genre, q.sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const counts = useMemo(() => ({
    instrument: facetCounts(SCORES, q, 'instrument', INSTRUMENTS),
    difficulty: facetCounts(SCORES, q, 'difficulty', DIFFICULTIES),
    genre: facetCounts(SCORES, q, 'genre', GENRES),
  }), [q.q, q.instrument, q.difficulty, q.genre]); // eslint-disable-line react-hooks/exhaustive-deps
  const filtered = !!(q.q || q.instrument || q.difficulty || q.genre);
  const clear = () => { const prev = pending.current ?? params; const p = new URLSearchParams(); if (prev.get('sort')) p.set('sort', prev.get('sort')!); commit(p); };

  return (
    <>
      <form className={styles.controls} role="search" onSubmit={(e) => e.preventDefault()}>
        <label className={styles.searchBox}>
          <span className="visually-hidden">Search scores</span>
          <Icon name="search" size={18} />
          <input type="search" value={q.q} onChange={(e) => set('q', e.target.value)} placeholder="Search title, composer, instrument…" maxLength={80} />
        </label>
        <div className={styles.filters}>
          <Facet label="Instrument" value={q.instrument ?? ''} options={INSTRUMENTS} counts={counts.instrument} onChange={(v) => set('instrument', v)} />
          <Facet label="Difficulty" value={q.difficulty ?? ''} options={DIFFICULTIES} counts={counts.difficulty} onChange={(v) => set('difficulty', v)} />
          <Facet label="Genre" value={q.genre ?? ''} options={GENRES} counts={counts.genre} onChange={(v) => set('genre', v)} />
          <label className={styles.facet}>
            <span>Sort</span>
            <select value={q.sort} onChange={(e) => set('sort', e.target.value === 'title' ? '' : e.target.value)}>
              <option value="title">Title A–Z</option>
              <option value="easiest">Easiest first</option>
              <option value="hardest">Hardest first</option>
            </select>
          </label>
        </div>
      </form>
      <div className={styles.resultBar}>
        <p aria-live="polite" data-result-count={results.length}>{filtered ? `${results.length} of ${SCORES.length} scores` : `All ${SCORES.length} scores`}</p>
        {filtered && <button type="button" className={styles.clear} onClick={clear}>Clear search and filters</button>}
      </div>
      {results.length ? (
        <div className={styles.grid}>{results.map((s) => <ScoreCard key={s.id} score={s} />)}</div>
      ) : (
        <EmptyState title="No scores match" action={<Button variant="secondary" onClick={clear}>Clear search and filters</Button>}>
          Try fewer words, or remove a filter. The catalogue is still small and growing.
        </EmptyState>
      )}
    </>
  );
}

function Facet({ label, value, options, counts, onChange }: { label: string; value: string; options: readonly string[]; counts: Record<string, number>; onChange: (v: string) => void }) {
  return (
    <label className={styles.facet}>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Any</option>
        {options.map((o) => <option key={o} value={o} disabled={!counts[o] && value !== o}>{o} ({counts[o] ?? 0})</option>)}
      </select>
    </label>
  );
}

function Favourites() {
  const { progress } = useAppState();
  const list = progress.favorites.map(getScore).filter((s): s is NonNullable<typeof s> => !!s);
  if (!list.length) return <EmptyState title="No favourites yet">Tap the heart on any score to keep it here.</EmptyState>;
  return <div className={styles.grid}>{list.map((s) => <ScoreCard key={s.id} score={s} />)}</div>;
}

function Recent() {
  const { progress } = useAppState();
  const list = progress.recentScores.map(getScore).filter((s): s is NonNullable<typeof s> => !!s);
  if (!list.length) return <EmptyState title="Nothing opened yet">Scores you open will appear here, newest first.</EmptyState>;
  return <div className={styles.grid}>{list.map((s) => <ScoreCard key={s.id} score={s} />)}</div>;
}

function Collections() {
  const { progress, createCollection, renameCollection, deleteCollection, setInCollection } = useAppState();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const create = (e: FormEvent) => {
    e.preventDefault();
    const r = createCollection(name);
    if (!r.ok) { setError(r.error); return; }
    setName(''); setError('');
  };

  return (
    <div className={styles.collections}>
      <form onSubmit={create} className={styles.newCollection} noValidate>
        <label htmlFor="new-collection" className={styles.formLabel}>New collection</label>
        <div className={styles.row}>
          <input id="new-collection" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="e.g. Recital pieces" maxLength={40} aria-invalid={!!error} aria-describedby={error ? 'new-collection-err' : undefined} />
          <Button type="submit">Create</Button>
        </div>
        {error && <p id="new-collection-err" className={styles.err} role="alert">{error}</p>}
      </form>

      {progress.collections.length === 0 && <EmptyState title="No collections yet">Create one above, then add scores from any score page.</EmptyState>}

      {progress.collections.map((c) => (
        <section key={c.id} className={styles.collection} aria-labelledby={`col-${c.id}`} data-collection={c.name}>
          <div className={styles.colHead}>
            {editing === c.id ? (
              <form className={styles.row} onSubmit={(e) => { e.preventDefault(); const r = renameCollection(c.id, editName); if (r.ok) { setEditing(null); setEditError(''); } else setEditError(r.error!); }}>
                <label htmlFor={`rename-${c.id}`} className="visually-hidden">Collection name</label>
                <input id={`rename-${c.id}`} value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={40} autoFocus aria-invalid={!!editError} />
                <Button type="submit" size="sm">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(null); setEditError(''); }}>Cancel</Button>
              </form>
            ) : (
              <h2 id={`col-${c.id}`} className={styles.colTitle}>{c.name} <span className={styles.count}>{c.scoreIds.length}</span></h2>
            )}
            {editing !== c.id && (
              <div className={styles.row}>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(c.id); setEditName(c.name); }}>Rename</Button>
                {confirmDelete === c.id ? (
                  <>
                    <Button size="sm" variant="danger" onClick={() => { deleteCollection(c.id); setConfirmDelete(null); }}>Delete “{c.name}”</Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>Keep</Button>
                  </>
                ) : <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(c.id)}>Delete…</Button>}
              </div>
            )}
          </div>
          {editing === c.id && editError && <p className={styles.err} role="alert">{editError}</p>}
          {confirmDelete === c.id && <p className={styles.small}>Deleting the collection does not delete any scores.</p>}
          {c.scoreIds.length === 0 ? (
            <p className={styles.small}>Empty. Open a score and use “Add to collection”. <Link to="/library">Browse scores</Link></p>
          ) : (
            <div className={styles.grid}>
              {c.scoreIds.map(getScore).filter((s): s is NonNullable<typeof s> => !!s).map((s) => (
                <ScoreCard key={s.id} score={s} extra={<button type="button" className={styles.clear} onClick={() => setInCollection(c.id, s.id, false)}>Remove from “{c.name}”</button>} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
