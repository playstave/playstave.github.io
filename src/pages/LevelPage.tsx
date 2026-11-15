import { Link, Navigate, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ButtonLink, Notice, PageHeader, Stars } from '../components/ui';
import { getLevel } from '../data/levels';
import { getLesson } from '../lessons';
import { LessonPlayer } from '../components/lesson/LessonPlayer';
import { PlayLessonPlayer } from '../components/lesson/PlayLessonPlayer';
import { levelKind } from '../course/map';
import { getPlayLevel, LAST_WRITTEN_LEVEL } from '../course/playLevels';
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

  // Playing levels are written for the student's own instrument; theory levels are shared.
  const inst = progress.student?.instrument ?? 'violin';
  const kind = levelKind(n);
  if (kind.kind === 'play') {
    const play = getPlayLevel(inst, kind.index);
    if (play) return <PlayLessonPlayer key={`${n}-${inst}`} lesson={play} level={level} />;
  } else {
    const lesson = getLesson(n);
    if (lesson) return <LessonPlayer key={n} lesson={lesson} level={level} />;
  }

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
        <p>Lessons are written world by world — Levels 1–{LAST_WRITTEN_LEVEL} are ready for every instrument, and the next world is on its way. {kind.kind === 'play'
          ? 'When this playing lesson is ready it will open here: a short tutorial on what’s new, a chance to try the new notes, then a play-along test.'
          : 'When this theory lesson is ready it will open here with a short lesson, guided practice and a challenge.'}</p>
      </Notice>
      <div className={styles.actions}>
        <ButtonLink to={`/roadmap#level-${n}`} variant="secondary">Back to roadmap</ButtonLink>
        <ButtonLink to="/play" variant="ghost">Play along meanwhile</ButtonLink>
      </div>
    </div>
  );
}
