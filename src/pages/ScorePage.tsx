import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Button, PageHeader } from '../components/ui';
import { ScoreViewer } from '../components/library/ScoreViewer';
import { getScore } from '../data/scores';
import { partsFor } from '../music/score';
import { useAppState } from '../state/AppState';
import { NotFound } from './NotFound';
import styles from './ScorePage.module.css';

export function ScorePage() {
  const { scoreId } = useParams();
  const score = scoreId ? getScore(scoreId) : undefined;
  const [params, setParams] = useSearchParams();
  const { progress, openScore, toggleFavorite, createCollection, setInCollection } = useAppState();
  const parts = useMemo(() => (score ? partsFor(score) : []), [score]);
  const part = parts.find((p) => p.id === params.get('part')) ?? parts[0];
  const [colOpen, setColOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [colError, setColError] = useState('');
  const opened = useRef<string | null>(null);

  // Record the visit once per score (recent list, Sheet Music Explorer badge).
  useEffect(() => {
    if (score && opened.current !== score.id) { opened.current = score.id; openScore(score.id); }
  }, [score, openScore]);

  if (!score || !part) return <NotFound />;
  const fav = progress.favorites.includes(score.id);

  const addNew = (e: FormEvent) => {
    e.preventDefault();
    const r = createCollection(newName);
    if (!r.ok) { setColError(r.error); return; }
    setInCollection(r.id, score.id, true);
    setNewName(''); setColError('');
  };

  return (
    <>
      <Link to="/library" className={styles.back}><Icon name="chevron-left" size={18} /> Library</Link>
      <PageHeader
        eyebrow={`${score.genre} · ${score.difficulty} · ${score.time}${score.key ? ` · ${score.clef === 'percussion' ? 'percussion' : `key of ${score.key.replace('m', ' minor').replace('b', '♭').replace('#', '♯')}`}` : ''}`}
        title={score.title}
        lede={score.composer}
        actions={
          <>
            <Button size="sm" variant={fav ? 'primary' : 'secondary'} icon="heart" onClick={() => toggleFavorite(score.id)} aria-pressed={fav}>{fav ? 'Favourite' : 'Add to favourites'}</Button>
            <Button size="sm" variant="secondary" icon="folder" onClick={() => setColOpen((o) => !o)} aria-expanded={colOpen} aria-controls="collection-panel">Add to collection</Button>
          </>
        }
      />

      {colOpen && (
        <div id="collection-panel" className={styles.colPanel}>
          <p className={styles.colTitle}>Collections</p>
          {progress.collections.length ? (
            <ul className={styles.colList}>
              {progress.collections.map((c) => (
                <li key={c.id}>
                  <label><input type="checkbox" checked={c.scoreIds.includes(score.id)} onChange={(e) => setInCollection(c.id, score.id, e.target.checked)} /> {c.name}</label>
                </li>
              ))}
            </ul>
          ) : <p className={styles.small}>You have no collections yet.</p>}
          <form onSubmit={addNew} className={styles.colForm} noValidate>
            <label htmlFor="quick-collection" className="visually-hidden">New collection name</label>
            <input id="quick-collection" value={newName} onChange={(e) => { setNewName(e.target.value); setColError(''); }} placeholder="New collection" maxLength={40} aria-invalid={!!colError} />
            <Button type="submit" size="sm">Create and add</Button>
          </form>
          {colError && <p className={styles.err} role="alert">{colError}</p>}
        </div>
      )}

      {parts.length > 1 && (
        <div className={styles.partRow}>
          <label htmlFor="part" className={styles.partLabel}>Part</label>
          <select id="part" value={part.id} onChange={(e) => { const p = new URLSearchParams(params); if (e.target.value === parts[0].id) p.delete('part'); else p.set('part', e.target.value); setParams(p, { replace: true }); }}>
            {parts.map((p) => <option key={p.id} value={p.id}>{p.label} — {p.instruments.join(', ')}</option>)}
          </select>
        </div>
      )}
      {parts.length === 1 && <p className={styles.small}>For: {part.instruments.join(', ')}</p>}

      <ScoreViewer score={score} part={part} />

      <div className={styles.about}>
        <section aria-labelledby="about-h">
          <h2 id="about-h" className={styles.h2}>About this piece</h2>
          <p>{score.description}</p>
          <p className={styles.small}>{score.source}</p>
        </section>
        <section aria-labelledby="licence-h" className={styles.licence}>
          <h2 id="licence-h" className={styles.h2}>Licence</h2>
          <p><strong>{score.licence.kind === 'cc0' ? 'Stave original (CC0)' : 'Public domain'}</strong></p>
          <p>{score.licence.work}</p>
          <p>{score.licence.edition}</p>
          <p className={styles.small}>{score.licence.downloadable ? 'Printing and downloading are permitted.' : 'Viewing only.'}</p>
        </section>
      </div>
    </>
  );
}
