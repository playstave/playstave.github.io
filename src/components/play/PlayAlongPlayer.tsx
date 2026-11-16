import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Notice, Segmented, Stars } from '../ui';
import { Icon } from '../Icon';
import { PlaySession, type Phase } from '../../play/session';
import { buildTimeline, type PlayExercise } from '../../play/exercise';
import { explain, type NoteResult, type Summary } from '../../play/assess';
import type { ListenState } from '../../audio/input';
import { getInstrument } from '../../audio/notes';
import { readJSON, writeJSON } from '../../lib/storage';
import { useAppState } from '../../state/AppState';
import { createDevPerformer, devPerformerSettings, devToneEnabled, type DevPerformance } from '../../audio/devTone';
import { PlayScore } from './PlayScore';
import { keyName } from '../../course/build';
import type { SongKey } from '../../course/arrange';
import { diagnose, rescoreWithDelay, supportReport, type Diagnosis } from '../../play/diagnose';
import { midiName } from '../../audio/notes';
import { MicPermission } from '../MicPermission';
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
  const { progress } = useAppState();
  // Brand-new students start at the slower speed until they choose otherwise.
  const [prefs, setPrefs] = useState<PlayPrefs>(() => ({
    ...DEFAULTS, speed: progress.student?.experience === 'new' ? 'slow' : 'full', ...readJSON<Partial<PlayPrefs>>('playalong', {}),
  }));
  useEffect(() => { writeJSON('playalong', prefs); }, [prefs]);

  // Practising slower is allowed: the whole take (and its timing) slows down.
  const ex = useMemo(() => (prefs.speed === 'slow' ? { ...exercise, tempo: exercise.tempo * 0.75 } : exercise), [exercise, prefs.speed]);
  const timeline = useMemo(() => buildTimeline(ex), [ex]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [mic, setMic] = useState<ListenState>('idle');
  const [results, setResults] = useState<Map<number, NoteResult>>(new Map());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [lastRed, setLastRed] = useState('');
  const [beat, setBeat] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const session = useRef<PlaySession | null>(null);
  const [diag, setDiag] = useState<Diagnosis | null>(null);
  const [report, setReport] = useState('');
  const [copied, setCopied] = useState(false);
  const [corrected, setCorrected] = useState<number | null>(null);
  const [hearing, setHearing] = useState<{ name: string | null; level: number }>({ name: null, level: 0 });
  const lastHear = useRef(0);

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
    setResults(new Map()); setSummary(null); setLastRed(''); setFocus(null); setDiag(null); setCorrected(null);
    const s = new PlaySession(ex, {
      metronome: prefs.metronome, backing: prefs.backing && !!ex.backing,
      // A device delay measured on an earlier take (see "What Stave heard").
      latencyOffset: DEV_TONE ? 0 : readJSON<number>('device-delay', 0),
      devPerformer: DEV_TONE ? createDevPerformer : undefined,
      devBleed: DEV_TONE ? devPerformerSettings.bleed : false,
    }, {
      onPhase: setPhase,
      onMicState: setMic,
      onResult: (r) => {
        setResults((m) => new Map(m).set(r.index, r));
        if (r.verdict !== 'correct') setLastRed(explain(r, pretty(timeline.notes[r.index].key)));
      },
      onHear: (hz, rms) => {
        const now = performance.now();
        if (now - lastHear.current < 120) return; // ~8 updates a second is plenty for the eye
        lastHear.current = now;
        setHearing({ name: hz ? midiName(Math.round(69 + 12 * Math.log2(hz / 440))) : null, level: rms });
      },
      onFinish: (sum, rs, frames) => {
        let finalSum = sum, finalRs = rs;
        const d = diagnose(timeline, frames, rs);
        if (d.delay != null) {
          // Same notes, shifted by the device's delay: re-score, and remember the delay for next time.
          const fixed = rescoreWithDelay(timeline, frames, d.delay);
          if (fixed) {
            finalSum = fixed.summary; finalRs = fixed.results;
            setResults(new Map(fixed.results.map((r) => [r.index, r])));
            setCorrected(d.delay);
            const saved = readJSON<number>('device-delay', 0);
            writeJSON('device-delay', Math.max(-0.3, Math.min(0.9, saved + d.delay)));
          }
        }
        setDiag(d);
        setReport(supportReport(timeline, finalRs, d, {
          piece: ex.id, tempo: ex.tempo, backing: prefs.backing && !!ex.backing ? 'on' : 'off', metronome: prefs.metronome ? 'on' : 'off',
          browser: navigator.userAgent.match(/(Chrome|Safari|Firefox|Edg)\/[\d.]+/)?.[0] ?? 'unknown', 'delay correction used': readJSON<number>('device-delay', 0),
        }));
        setCopied(false);
        setSummary(finalSum);
        onFinish?.(finalSum, finalRs);
      },
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
        <span>{inst.name}</span><span>{keyName(ex.key as SongKey)}</span><span>{ex.time}</span><span>♩ = {Math.round(ex.tempo)}</span>
        {ex.backing && <span>Backing track</span>}
      </div>
      {exercise.hint && <p className={styles.hint}>{exercise.hint}</p>}

      <MicPermission />

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
        {(phase === 'playing' || phase === 'count-in') && (
          <p className={styles.hearing} data-hearing>
            <span className={styles.meter} aria-hidden="true"><span style={{ width: `${Math.min(100, hearing.level * 800)}%` }} /></span>
            {hearing.name ? <>Hearing <strong>{hearing.name}</strong></> : hearing.level > 0.003 ? 'Hearing sound, but no clear note' : 'Hearing nothing — is the microphone working?'}
          </p>
        )}
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
          {corrected != null && <p className={styles.fixNote} data-delay-fixed>Stave measured an audio delay of about {Math.round(Math.abs(corrected) * 1000)} ms on this computer and corrected for it. It will remember this for next time.</p>}
          {diag && (summary.percent < 70 || corrected != null) && (
            <div className={styles.diag} data-diagnosis>
              <p className={styles.diagTitle}>What Stave heard</p>
              {diag.findings.length > 0 ? <ul>{diag.findings.map((f) => <li key={f}>{f}</li>)}</ul> : <p>No single cause stood out — see the notes to work on below.</p>}
              <p className={styles.diagMeta}>Heard a clear note {Math.round(diag.heardShare * 100)}% of the time{diag.topHeard.length ? ` · most often ${diag.topHeard.join(', ')}` : ''} · input level {diag.level < 0.003 ? 'very low' : diag.level < 0.01 ? 'low' : 'good'}</p>
              {report && (
                <details className={styles.report}>
                  <summary>Details for support</summary>
                  <pre data-support-report>{report}</pre>
                  <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard?.writeText(report).then(() => setCopied(true)).catch(() => setCopied(false)); }}>{copied ? 'Copied' : 'Copy details'}</Button>
                </details>
              )}
            </div>
          )}
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
        <option value="perfect">perfectly</option><option value="mistakes">with mistakes</option><option value="silent">nothing</option><option value="delayed">perfectly, but 350 ms late (audio delay)</option>
      </select></label>
      <label><input type="checkbox" checked={bleed} onChange={(e) => { devPerformerSettings.bleed = e.target.checked; setBleed(e.target.checked); }} data-dev-bleed /> backing leaks into mic</label>
    </div>
  );
}
