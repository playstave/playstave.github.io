import { memo } from 'react';
import type { World } from '../data/curriculum';
import { DIFFICULTY_TIERS, LEVELS, type Level } from '../data/levels';
import { levelStatus, type LevelStatus, type ProgressionState } from '../lib/progression';
import { Icon } from './Icon';
import styles from './LevelPath.module.css';

/** Horizontal offsets (−1…1) repeating every 12 levels: a gentle S-curve. */
const WAVE = [0, 0.5, 0.85, 1, 0.85, 0.5, 0, -0.5, -0.85, -1, -0.85, -0.5];
const AMPLITUDE = 28; // % of the track width either side of centre
const ROW = 104;      // px between levels
const TOP_PAD = 56;

export const levelX = (n: number) => 50 + WAVE[(n - 1) % WAVE.length] * AMPLITUDE;

function curve(points: { x: number; y: number }[]): string {
  if (!points.length) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const my = (a.y + b.y) / 2;
    d += ` C ${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
  }
  return d;
}

function describe(l: Level, status: LevelStatus, stars: number): string {
  const kind = l.isMajor ? ', major milestone' : l.isMilestone ? ', milestone' : l.isCheckpoint ? ', checkpoint' : '';
  const state = status === 'completed' ? `completed, ${stars} of 3 stars` : status === 'current' ? 'current level, ready to start' : 'locked';
  return `Level ${l.n}${kind}. ${l.unit.title}. Difficulty ${l.difficulty}. ${state}.`;
}

interface NodeProps { level: Level; status: LevelStatus; stars: number; y: number; onSelect: (n: number) => void }

const LevelNode = memo(function LevelNode({ level: l, status, stars, y, onSelect }: NodeProps) {
  const x = levelX(l.n);
  const size = l.isMajor ? 'major' : l.isMilestone ? 'milestone' : l.isCheckpoint ? 'checkpoint' : 'regular';
  const labelSide = x > 50 ? styles.labelLeft : styles.labelRight;
  const isUnitStart = l.indexInUnit === 1;

  return (
    <li className={styles.slot} style={{ top: y, left: `${x}%` }} id={`level-${l.n}`}>
      {status === 'current' && <span className={styles.startTag} aria-hidden="true">Start</span>}
      <button
        type="button"
        className={`${styles.node} ${styles[status]} ${styles[size]}`}
        onClick={() => onSelect(l.n)}
        aria-label={describe(l, status, stars)}
        aria-current={status === 'current' ? 'step' : undefined}
        data-level={l.n}
        data-status={status}
      >
        {l.isMajor || l.isMilestone ? <span className={styles.ring} aria-hidden="true" /> : null}
        <span className={styles.num} aria-hidden="true">{l.n}</span>
        {status === 'locked' && <span className={styles.lock} aria-hidden="true"><Icon name="lock" size={11} /></span>}
        {status === 'completed' && <span className={styles.done} aria-hidden="true"><Icon name="check" size={11} /></span>}
      </button>
      <span className={styles.meta} aria-hidden="true">
        <span className={styles.stars}>
          {[0, 1, 2].map((i) => <span key={i} className={i < stars ? styles.starOn : styles.starOff} />)}
        </span>
        <span className={styles.pips} title={l.difficulty}>
          {DIFFICULTY_TIERS.map((_, i) => <span key={i} className={i <= l.difficultyRank ? styles.pipOn : styles.pipOff} />)}
        </span>
      </span>
      {(isUnitStart || l.isCheckpoint) && (
        <span className={`${styles.label} ${labelSide}`} aria-hidden="true">
          {l.isMajor ? <><strong>Level {l.n}</strong>Major milestone</>
            : l.isMilestone ? <><strong>Milestone</strong>Level {l.n} celebration</>
            : l.isCheckpoint ? <><strong>Checkpoint</strong>{l.unit.title} review</>
            : <><strong>Unit {l.unit.id}</strong>{l.unit.title}</>}
        </span>
      )}
    </li>
  );
});

interface PathProps { world: World; progress: ProgressionState; onSelect: (n: number) => void }

/** One world's stretch of the winding path. */
export function WorldPath({ world, progress, onSelect }: PathProps) {
  const levels = LEVELS.slice(world.firstLevel - 1, world.lastLevel);
  const pts = levels.map((l, i) => ({ x: levelX(l.n), y: TOP_PAD + i * ROW }));
  const height = TOP_PAD * 2 + (levels.length - 1) * ROW;
  const doneIdx = Math.min(levels.length - 1, Math.max(-1, progress.currentLevel - world.firstLevel));
  const trail = doneIdx >= 1 ? curve(pts.slice(0, doneIdx + 1)) : '';

  return (
    <div className={styles.track} style={{ height, ['--wc' as string]: world.colorVar }}>
      <svg className={styles.svg} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d={curve(pts)} className={styles.road} vectorEffect="non-scaling-stroke" />
        {trail && <path d={trail} className={styles.trail} vectorEffect="non-scaling-stroke" />}
      </svg>
      <ol className={styles.nodes} aria-label={`${world.name}, levels ${world.firstLevel} to ${world.lastLevel}`}>
        {levels.map((l, i) => {
          const status = levelStatus(l.n, progress);
          return <LevelNode key={l.n} level={l} status={status} stars={progress.completedLevels[l.n]?.stars ?? 0} y={pts[i].y} onSelect={onSelect} />;
        })}
      </ol>
    </div>
  );
}
