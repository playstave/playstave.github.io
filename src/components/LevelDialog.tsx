import { useEffect, useRef } from 'react';
import { getLevel } from '../data/levels';
import { levelStatus, type ProgressionState } from '../lib/progression';
import { Icon } from './Icon';
import { Button, ButtonLink, Stars } from './ui';
import styles from './LevelDialog.module.css';

interface Props { level: number | null; progress: ProgressionState; onClose: () => void; onGoTo: (n: number) => void }

/** Details for a roadmap node. Locked levels explain how to unlock them; there is no way to start one. */
export function LevelDialog({ level, progress, onClose, onGoTo }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const l = level ? getLevel(level) : undefined;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (l && !d.open) d.showModal();
    if (!l && d.open) d.close();
  }, [l]);

  const status = l ? levelStatus(l.n, progress) : 'locked';
  const record = l ? progress.completedLevels[l.n] : undefined;
  const current = Math.min(progress.currentLevel, 500);

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby="level-dialog-title" onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {l && (
        <div className={styles.inner} style={{ ['--wc' as string]: l.world.colorVar }}>
          <div className={styles.head}>
            <p className="eyebrow">World {l.world.id} · Unit {l.unit.id} · {l.indexInUnit} of 10</p>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close"><Icon name="close" /></button>
          </div>
          <h2 id="level-dialog-title" className={styles.title}>Level {l.n}</h2>
          <p className={styles.unit}>{l.unit.title}</p>
          <ul className={styles.tags}>
            <li>{l.difficulty}</li>
            {l.isCheckpoint && !l.isMilestone && <li>Checkpoint</li>}
            {l.isMilestone && !l.isMajor && <li className={styles.gold}>Milestone</li>}
            {l.isMajor && <li className={styles.gold}>Major milestone</li>}
          </ul>
          <p className={styles.outcome}>Unit goal: {l.unit.outcome}</p>

          <div className={styles.status}>
            {status === 'completed' && <><Stars earned={record?.stars ?? 0} size={20} /><span>Completed · best score {record?.bestScore ?? 0}%</span></>}
            {status === 'current' && <span><strong>Up next.</strong> This is the level you are on.</span>}
            {status === 'locked' && <span><Icon name="lock" size={16} /> Locked. Complete Level {current} and every level after it to reach this one.</span>}
          </div>

          <div className={styles.actions}>
            {status === 'current' && <ButtonLink to={`/level/${l.n}`} iconAfter="arrow-right">Start level {l.n}</ButtonLink>}
            {status === 'completed' && <ButtonLink to={`/level/${l.n}`} variant="secondary">Practice again</ButtonLink>}
            {status === 'locked' && <Button variant="secondary" onClick={() => onGoTo(current)}>Go to Level {current}</Button>}
          </div>
        </div>
      )}
    </dialog>
  );
}
