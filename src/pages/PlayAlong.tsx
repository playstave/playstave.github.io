import { Link, useParams } from 'react-router-dom';
import { Notice, PageHeader } from '../components/ui';
import { Icon } from '../components/Icon';
import { PlayAlongPlayer } from '../components/play/PlayAlongPlayer';
import { DEMO_EXERCISES, getExercise } from '../play/exercises';
import { instrumentInfo } from '../data/students';
import { useAppState } from '../state/AppState';
import { NotFound } from './NotFound';
import styles from './PlayAlong.module.css';

/** Play-along pieces for the student's own instrument only. */
export function PlayAlong() {
  const { progress } = useAppState();
  const inst = progress.student?.instrument ?? 'violin';
  const info = instrumentInfo(inst);
  const list = DEMO_EXERCISES.filter((e) => e.instrument === inst);
  return (
    <>
      <PageHeader
        eyebrow={`Your ${info.noun}`}
        title="Play-along"
        lede="Play the music on screen while Stave listens. Each note turns green when it’s right, or red with a tip when it needs work."
      />
      <p className={styles.instrumentLine}>Showing pieces for <strong>{info.name}</strong>. <Link to="/settings#instrument-h">Change instrument</Link></p>
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
        <p>The full 500-level {info.noun} course — with a tutorial before every piece — is being built on top of this player. Tune up on the <Link to="/tuner">Tuner</Link> first for the best results.</p>
      </Notice>
    </>
  );
}

/** One exercise. */
export function PlayAlongExercise() {
  const { exerciseId } = useParams();
  const ex = exerciseId ? getExercise(exerciseId) : undefined;
  const { progress } = useAppState();
  if (!ex) return <NotFound />;
  const mine = progress.student?.instrument;
  if (mine && ex.instrument !== mine) {
    return (
      <>
        <PageHeader eyebrow="Play along" title={ex.title} />
        <Notice title={`This piece is for ${instrumentInfo(ex.instrument).noun}`}>
          <p>You’re learning the {instrumentInfo(mine).noun}, so Stave shows {instrumentInfo(mine).noun} pieces. <Link to="/play">See your pieces</Link> or <Link to="/settings#instrument-h">change instrument</Link>.</p>
        </Notice>
      </>
    );
  }
  return (
    <>
      <Link to="/play" className={styles.back}><Icon name="chevron-left" size={18} /> All play-along pieces</Link>
      <PageHeader eyebrow="Play along" title={ex.title} />
      <PlayAlongPlayer exercise={ex} />
    </>
  );
}
