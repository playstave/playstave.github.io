import { Link, Navigate, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ButtonLink, Notice, PageHeader, Stars } from '../components/ui';
import { getLevel } from '../data/levels';
import { getLesson } from '../lessons';
import { LessonPlayer } from '../components/lesson/LessonPlayer';
import { canOpen, levelStatus, nextLevel } from '../lib/progression';
import { useAppState } from '../state/AppState';
import styles from './LevelPage.module.css';

/**
 * Entry point for a single level. Enforces sequential access: typing the URL of
 * a locked level shows why it is locked instead of the lesson.
 * The lesson engine (introduction → lesson → guided practice → challenge) mounts here.
 */
export function LevelPage() {
  const { levelId } = useParams();
  const { progress } = useAppState();
  const n = Number(levelId);
  const level = getLevel(n);
  if (!level) return <Navigate to="/roadmap" replace />;

  const current = nextLevel(progress);
  const back = <Link to={`/roadmap#level-${n}`} className={styles.back}><Icon name="chevron-left" size={18} /> Roadmap</Link>;

  if (!canOpen(n, progress)) {
    return (
      <div data-level-locked>
        {back}
        <PageHeader eyebrow={`World ${level.world.id} · ${level.unit.title}`} title={`Level ${n} is locked`}
          lede={`Levels open in order. You are on Level ${current}, so ${n - current === 1 ? 'one more level stands' : `${n - current} levels stand`} between you and this one.`} />
        <ButtonLink to={`/level/${current}`} iconAfter="arrow-right">Go to Level {current}</ButtonLink>
      </div>
    );
  }

  const lesson = getLesson(n);
  if (lesson) return <LessonPlayer key={n} lesson={lesson} level={level} />;

  const status = levelStatus(n, progress);
  const record = progress.completedLevels[n];

  return (
    <div style={{ ['--wc' as string]: level.world.colorVar }}>
      {back}
      <PageHeader
        eyebrow={`World ${level.world.id} · Unit ${level.unit.id}: ${level.unit.title} · ${level.indexInUnit} of 10`}
        title={`Level ${n}`}
        lede={level.unit.outcome}
      />
      <dl className={styles.facts}>
        <div><dt className="eyebrow">Difficulty</dt><dd>{level.difficulty}</dd></div>
        <div><dt className="eyebrow">Status</dt><dd>{status === 'completed' ? 'Completed — replaying keeps your best result' : 'Up next'}</dd></div>
        {record && <div><dt className="eyebrow">Best</dt><dd className={styles.best}><Stars earned={record.stars} size={18} /> {record.bestScore}%</dd></div>}
        {level.isCheckpoint && <div><dt className="eyebrow">Type</dt><dd>{level.isMajor ? 'Major milestone' : level.isMilestone ? 'Milestone' : 'Checkpoint review'}</dd></div>}
      </dl>
      <Notice title="This level’s lesson is not available yet">
        <p>Interactive lessons are being added in order, starting with Levels 1–10. When this lesson is ready it will open here with an introduction, the lesson, guided practice and a short challenge.</p>
      </Notice>
      <div className={styles.actions}>
        <ButtonLink to={`/roadmap#level-${n}`} variant="secondary">Back to roadmap</ButtonLink>
        <ButtonLink to="/practice" variant="ghost">Practise note reading meanwhile</ButtonLink>
      </div>
    </div>
  );
}
