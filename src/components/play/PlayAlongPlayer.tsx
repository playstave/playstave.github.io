import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Notice, Segmented, Stars } from '../ui';
import { Icon } from '../Icon';
import { PlaySession, type Phase } from '../../play/session';
import { buildTimeline, type PlayExercise } from '../../play/exercise';
import { explain, type NoteResult, type Summary } from '../../play/assess';
import type { ListenState } from '../../audio/input';
import { getInstrument } from '../../audio/notes';
import { readJSON, writeJSON } from '../../lib/storage';
import { createDevPerformer, devPerformerSettings, devToneEnabled, type DevPerformance } from '../../audio/devTone';
import { PlayScore } from './PlayScore';
import styles from './PlayAlongPlayer.module.css';

const DEV_TONE = import.meta.env.DEV && devToneEnabled();

interface PlayPrefs { metronome: boolean; backing: boolean; speed: 'slow' | 'full' }
const DEFAULTS: PlayPrefs = { metronome: true, backing: true, speed: 'full' };

const pretty = (key: string) => { const [p, o] = key.split('/'); return `${p[0].toUpperCase()}${p.slice(1).replace('#', '♯').replace(/b$/, '♭')}${o}`; };

interface Props {
  exercise: PlayExercise;
  /** Called with the summary when a take finishes. */
  onFinish?: (summary: Summary, results: NoteResult[]) => void;
}

export function PlayAlongPlayer({ exercise, onFinish }: Props) {
  const [prefs, setPrefs] = useState<PlayPrefs>(() => ({ ...DEFAULTS, ...readJSON<Partial<PlayPrefs>>('playalong', {}) }));
  useEffect(() => { writeJSON('playalong', prefs); }, [prefs]);

  // Practising slower is allowed: the whole take (and its timing) slows down.
  const ex = useMemo(() => (prefs.speed === 'slow' ? { ...exercise, tempo: Math.round(exercise.tempo * 0.75) } : exercise), [exercise, prefs.speed]);
  const timeline = useMemo(() => buildTimeline(ex), [ex]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [mic, setMic] = useState<ListenState>('idle');
  const [results, setResults] = useState<Map<number, NoteResult>>(new Map());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [lastRed, setLastRed] = useState('');
  const [beat, setBeat] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const session = useRef<PlaySession | null>(null);

  const stop = useCallback(() => { session.current?.stop(); }, []);
  useEffect(() => () => session.current?.stop(), []);
  useEffect(() => {
    const onHide = () => { if (document.hidden) session.current?.stop(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);
  // A new exercise or speed resets everything.
  useEffect(() => { session.current?.stop(); setResults(new Map()); setSummary(null); setPhase('idle'); setFocus(null); }, [ex]);

  const start = async () => {
    session.current?.stop();
    setResults(new Map()); setSummary(null); setLastRed(''); setFocus(null);
    const s = new PlaySession(ex, {
      metronome: prefs.metronome, backing: prefs.backing && !!ex.backing,
      devPerformer: DEV_TONE ? createDevPerformer : undefined,
      devBleed: DEV_TONE ? devPerformerSettings.bleed : false,
    }, {
      onPhase: setPhase,
      onMicState: setMic,
      onResult: (r) => {
        setResults((m) => new Map(m).set(r.index, r));
        if (r.verdict !== 'correct') setLastRed(explain(r, pretty(timeline.notes[r.index].key)));
      },
      onFinish: (sum, rs) => { setSummary(sum); onFinish?.(sum, rs); },
    });
    session.current = s;
    await s.start();
  };

  // Count-in beat display.
  useEffect(() => {
    if (phase !== 'count-in') { setBeat(null); return; }
    const [num, den] = ex.time.split('/').map(Number);
    const every = (4 / den) * timeline.beat;
    const id = setInterval(() => {
      const pos = session.current?.position() ?? -Infinity;
      const k = Math.floor((pos + timeline.measureSec) / every);
      setBeat(k >= 0 && k < num ? k + 1 : null);
    }, 40);
    return () => clearInterval(id);
  }, [phase, ex.time, timeline]);

  const getPosition = useCallback(() => session.current?.position() ?? -Infinity, []);
  const running = phase === 'count-in' || phase === 'playing';
  const reds = summary ? timeline.notes.filter((n) => !n.rest && results.get(n.index)?.verdict !== 'correct') : [];
  const inst = getInstrument(ex.instrument)!;
  const greens = [...results.values()].filter((r) => r.verdict === 'correct').length;

  return (
    <div className={styles.player} data-phase={phase}>
      <div className={styles.meta}>
        <span>{inst.name}</span><span>{ex.key} major</span><span>{ex.time}</span><span>♩ = {ex.tempo}</span>
        {ex.backing && <span>Backing track</span>}
      </div>
      {exercise.hint && <p className={styles.hint}>{exercise.hint}</p>}

      <div className={styles.controls}>
        {!running ? (
          <Button size="lg" icon="mic" onClick={start} disabled={phase === 'starting'} data-play-start>
            {phase === 'starting' ? 'Starting…' : summary ? 'Play again' : 'Play'}
          </Button>
        ) : (
          <Button size="lg" variant="secondary" onClick={stop} data-play-stop>Stop</Button>
        )}
        <label className={styles.toggle}><input type="checkbox" checked={prefs.metronome} disabled={running} onChange={(e) => setPrefs((p) => ({ ...p, metronome: e.target.checked }))} /> Metronome</label>
        {ex.backing && <label className={styles.toggle}><input type="checkbox" checked={prefs.backing} disabled={running} onChange={(e) => setPrefs((p) => ({ ...p, backing: e.target.checked }))} /> Backing track</label>}
        <Segmented name={`speed-${exercise.id}`} label="Speed" value={prefs.speed}
          options={[{ value: 'slow', label: 'Slower (75%)' }, { value: 'full', label: 'Full speed' }]}
          onChange={(v) => { if (!running) setPrefs((p) => ({ ...p, speed: v })); }} />
      </div>

      <div className={styles.status} aria-live="polite">
        {phase === 'count-in' && <p className={styles.countIn}>Get ready… <span className={styles.beat} data-beat={beat ?? ''}>{beat ?? ''}</span></p>}
        {phase === 'playing' && <p>Listening — <span className={styles.good}>{greens}</span> green so far.{lastRed && <span className={styles.lastRed}> {lastRed}</span>}</p>}
        {phase === 'stopped' && <p>Stopped. Press Play to start again from the beginning.</p>}
        {phase === 'idle' && mic === 'idle' && <p className="muted">Press Play, allow the microphone, and start on the beat after the count-in clicks.{ex.backing && prefs.backing ? ' Headphones help: then only your instrument reaches the microphone.' : ''}</p>}
      </div>
      {(mic === 'denied' || mic === 'unsupported' || mic === 'no-device' || mic === 'error') && (
        <Notice title={mic === 'denied' ? 'Microphone blocked' : mic === 'no-device' ? 'No microphone found' : 'Listening isn’t available'}>
          <p>{mic === 'denied' ? 'Stave needs your microphone to hear you play. Allow it in your browser’s site settings, then press Play again.'
            : mic === 'no-device' ? 'Connect a microphone or use a device with a built-in one.'
            : 'This browser or page can’t share the microphone. Use a recent browser on a secure (https) page.'}</p>
        </Notice>
      )}

      <PlayScore exercise={ex} timeline={timeline} results={results} getPosition={getPosition} running={running} focusIndex={focus} />
      <p className={styles.legend}><span className={styles.dotGood} /> Played well <span className={styles.dotBad} /> Needs work <span className="muted">· Nothing is recorded — sound is checked on this device and then discarded.</span></p>

      {summary && (
        <section className={styles.results} aria-labelledby={`res-${exercise.id}`} data-results data-percent={summary.percent}>
          <div className={styles.resHead}>
            <div>
              <h2 id={`res-${exercise.id}`} className={styles.resTitle}>{summary.percent >= 85 ? 'Excellent!' : summary.percent >= 70 ? 'Nicely done' : summary.percent >= 50 ? 'Good effort' : 'Keep practising'}</h2>
              <Stars earned={summary.stars} size={22} />
            </div>
            <p className={styles.bigPct}><span className="num">{summary.percent}%</span> notes green</p>
          </div>
          <dl className={styles.breakdown}>
            <div><dt>Right notes, in tune</dt><dd>{summary.pitchPercent}%</dd></div>
            <div><dt>On time</dt><dd>{summary.rhythmPercent}%</dd></div>
            <div><dt>Green</dt><dd>{summary.correct} of {summary.total}</dd></div>
          </dl>
          {reds.length > 0 ? (
            <>
              <h3 className={styles.redTitle}>Notes to work on</h3>
              <ul className={styles.redList}>
                {reds.map((n) => (
                  <li key={n.index}>
                    <button type="button" onClick={() => setFocus(n.index)} className={styles.redItem} aria-pressed={focus === n.index}>
                      <span className={styles.bar}>Bar {n.measure + 1}</span> {explain(results.get(n.index)!, pretty(n.key))}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : <p className={styles.allGreen}><Icon name="check" size={18} /> Every note green. Try it at full speed, or without the metronome.</p>}
        </section>
      )}

      {DEV_TONE && <DevPerformerPanel />}
    </div>
  );
}

/** DEV ONLY: choose how the synthetic performer plays. */
function DevPerformerPanel() {
  const [mode, setMode] = useState<DevPerformance>(devPerformerSettings.mode);
  const [bleed, setBleed] = useState(devPerformerSettings.bleed);
  return (
    <div className={styles.dev} data-dev-performer>
      <strong>Dev only — synthetic performer instead of the microphone</strong>
      <label>Plays <select value={mode} onChange={(e) => { devPerformerSettings.mode = e.target.value as DevPerformance; setMode(devPerformerSettings.mode); }} data-dev-mode>
        <option value="perfect">perfectly</option><option value="mistakes">with mistakes</option><option value="silent">nothing</option>
      </select></label>
      <label><input type="checkbox" checked={bleed} onChange={(e) => { devPerformerSettings.bleed = e.target.checked; setBleed(e.target.checked); }} data-dev-bleed /> backing leaks into mic</label>
    </div>
  );
}
