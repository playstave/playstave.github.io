import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Notice, PageHeader, Segmented } from '../components/ui';
import { Icon } from '../components/Icon';
import { PlayAlongPlayer } from '../components/play/PlayAlongPlayer';
import { DEMO_EXERCISES, getExercise } from '../play/exercises';
import { INSTRUMENTS, type InstrumentId } from '../audio/notes';
import { readJSON, writeJSON } from '../lib/storage';
import { NotFound } from './NotFound';
import styles from './PlayAlong.module.css';

/** List of play-along exercises, by instrument. */
export function PlayAlong() {
  const [inst, setInst] = useState<InstrumentId>(() => readJSON<InstrumentId>('tuner-instrument-tab', 'violin'));
  const list = DEMO_EXERCISES.filter((e) => e.instrument === inst);
  return (
    <>
      <PageHeader
        eyebrow="Play along"
        title="Play-along"
        lede="Play the music on screen while Stave listens. Each note turns green when it’s right, or red with a tip when it needs work."
      />
      <div className={styles.tabs}>
        <Segmented name="play-instrument" label="Instrument" value={inst}
          options={INSTRUMENTS.map((i) => ({ value: i.id, label: i.name }))}
          onChange={(v) => { setInst(v); writeJSON('tuner-instrument-tab', v); }} />
      </div>
      <ul className={styles.list}>
        {list.map((e) => (
          <li key={e.id}>
            <Link to={`/play/${e.id}`} className={styles.card} data-exercise={e.id}>
              <span className={styles.cardTitle}>{e.title}</span>
              <span className={styles.cardMeta}>{e.key} major · {e.time} · ♩ = {e.tempo}{e.backing ? ' · backing track' : ''}</span>
              <Icon name="arrow-right" size={18} />
            </Link>
          </li>
        ))}
      </ul>
      <Notice title="These are practice pieces">
        <p>The full 500-level course — with a tutorial before every piece — is being built on top of this player. Tune up on the <Link to="/tuner">Tuner</Link> first for the best results.</p>
      </Notice>
    </>
  );
}

/** One exercise. */
export function PlayAlongExercise() {
  const { exerciseId } = useParams();
  const ex = exerciseId ? getExercise(exerciseId) : undefined;
  if (!ex) return <NotFound />;
  return (
    <>
      <Link to="/play" className={styles.back}><Icon name="chevron-left" size={18} /> All play-along pieces</Link>
      <PageHeader eyebrow="Play along" title={ex.title} />
      <PlayAlongPlayer exercise={ex} />
    </>
  );
}
