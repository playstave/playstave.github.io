import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Notice, PageHeader, Panel, Segmented, SectionTitle } from '../components/ui';
import { Icon } from '../components/Icon';
import { useListener } from '../audio/useListener';
import { centsFrom, INSTRUMENTS, midiName, midiToHz, nearestString, readNote } from '../audio/notes';
import { Link } from 'react-router-dom';
import { useAppState } from '../state/AppState';
import { instrumentInfo } from '../data/students';
import { DEFAULT_IN_TUNE_CENTS, TOLERANCE_CHOICES, verdict, type Tolerance } from '../audio/tolerance';
import { readJSON, writeJSON } from '../lib/storage';
import { createDevSource, devToneEnabled, devToneSettings, updateDevTone, type DevToneSettings } from '../audio/devTone';
import { MicPermission } from '../components/MicPermission';
import styles from './Tuner.module.css';

type Target = 'auto' | 'chromatic' | number; // number = index of a string

interface TunerPrefs { a4: number; tolerance: Tolerance }
const DEFAULT_PREFS: TunerPrefs = { a4: 440, tolerance: DEFAULT_IN_TUNE_CENTS };

const DEV_TONE = import.meta.env.DEV && devToneEnabled();

export function Tuner() {
  const [prefs, setPrefs] = useState<TunerPrefs>(() => ({ ...DEFAULT_PREFS, ...readJSON<Partial<TunerPrefs>>('tuner', {}) }));
  const [target, setTarget] = useState<Target>('auto');
  useEffect(() => { writeJSON('tuner', prefs); }, [prefs]);

  // Only the student's own instrument (chosen in the welcome questions / Settings).
  const { progress } = useAppState();
  const inst = INSTRUMENTS.find((i) => i.id === progress.student?.instrument) ?? INSTRUMENTS[0];
  useEffect(() => { setTarget('auto'); }, [inst.id]);
  const { state, error, frame, start, stop, playTone, toneHz } = useListener({
    minHz: inst.minHz, maxHz: inst.maxHz, devSource: DEV_TONE ? createDevSource : undefined,
  });
  const listening = state === 'listening';

  // What the needle measures against.
  const reading = frame?.reading ?? null;
  const shown = useMemo(() => {
    if (!reading) return null;
    const hz = reading.hz;
    if (target === 'chromatic') {
      const n = readNote(hz, prefs.a4);
      return { hz, label: n.name, sub: 'Nearest note', cents: n.cents, mode: 'note' as const };
    }
    const s = target === 'auto' ? nearestString(inst, hz, prefs.a4) : inst.strings[target];
    return { hz, label: s.name, sub: `${s.name} string · ${midiName(s.midi)}`, cents: centsFrom(hz, s.midi, prefs.a4), mode: 'string' as const };
  }, [reading, target, inst, prefs.a4]);

  const v = shown ? verdict(shown.cents, prefs.tolerance) : null;
  const far = shown && Math.abs(shown.cents) > 50;
  // More than ~2.5 semitones away is almost certainly a different string or a
  // fingered note, not a string that needs turning — say so instead of "loosen by 1400 cents".
  const otherNote = shown && shown.mode === 'string' && Math.abs(shown.cents) > 250;
  const heard = shown ? readNote(shown.hz, prefs.a4).name : '';
  const advice = !shown || !v ? '' :
    otherNote ? (target === 'auto'
      ? `That sounds like ${heard}, not an open string. Play one open string, or choose “Any note”.`
      : `That sounds like ${heard}. Play the open ${shown.label} string, or choose Auto.`) :
    v === 'in-tune' ? 'In tune' :
    shown.mode === 'string'
      ? (v === 'flat' ? `${far ? 'Much too low' : 'Too low'} — tighten the string slightly` : `${far ? 'Much too high' : 'Too high'} — loosen the string slightly`)
      : (v === 'flat' ? 'Flat — move your finger a little toward the bridge' : 'Sharp — move your finger a little toward the scroll');

  // Screen readers: announce only when the verdict or note changes, at most once a second.
  const [announce, setAnnounce] = useState('');
  const lastAnnounce = useRef({ key: '', at: 0 });
  useEffect(() => {
    if (!shown || !v) return;
    const key = `${shown.label}:${v}`;
    const now = Date.now();
    if (key !== lastAnnounce.current.key && now - lastAnnounce.current.at > 1000) {
      lastAnnounce.current = { key, at: now };
      setAnnounce(`${shown.label}. ${advice}.`);
    }
  }, [shown, v, advice]);

  const needle = shown ? Math.max(-50, Math.min(50, shown.cents)) : 0;
  const level = frame ? Math.min(1, frame.level * 8) : 0;
  const quiet = listening && frame && !reading && frame.level < 0.004;


  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Tuner"
        lede="Tune your strings, or check any note you play. Stave listens through your microphone and shows how close you are."
      />

      <p className={styles.instrumentLine}>Tuning your <strong>{instrumentInfo(inst.id).noun}</strong> · strings {inst.strings.map((x) => x.name).join(' ')}. <Link to="/settings#instrument-h">Change instrument</Link></p>

      {!listening && <div className={styles.micGate}><MicPermission /></div>}

      <Panel className={styles.meterPanel} aria-labelledby="tuner-h" data-tuner-state={state}>
        <h2 id="tuner-h" className="visually-hidden">Tuner display</h2>

        {!listening ? (
          <div className={styles.startBox}>
            <Icon name="mic" size={32} />
            {state === 'denied' ? (
              <Notice title="Microphone blocked" icon="info">
                <p>Stave needs your microphone to hear your instrument. Allow it in your browser’s site settings (the icon next to the address bar), then try again.</p>
              </Notice>
            ) : state === 'unsupported' ? (
              <Notice title="Listening isn’t available here" icon="info">
                <p>{error === 'insecure'
                  ? 'Browsers only allow the microphone on secure (https) pages. Open Stave from its https address.'
                  : 'This browser can’t share the microphone with web pages. Try a recent version of Chrome, Safari, Edge or Firefox.'}</p>
              </Notice>
            ) : state === 'no-device' ? (
              <Notice title="No microphone found" icon="info"><p>Connect a microphone or headset, or use a device with a built-in microphone.</p></Notice>
            ) : state === 'error' ? (
              <Notice title="Couldn’t start listening" icon="info"><p>Something went wrong starting the microphone. Try again; if it keeps happening, reload the page.</p></Notice>
            ) : (
              <p className={styles.startText}>Tap start, allow the microphone, then play one string at a time.</p>
            )}
            <Button onClick={start} icon="mic" size="lg" disabled={state === 'starting'}>
              {state === 'starting' ? 'Starting…' : state === 'idle' ? 'Start listening' : 'Try again'}
            </Button>
            <p className={styles.privacy}>Sound is analysed on this device only. Nothing is recorded or sent anywhere.</p>
          </div>
        ) : (
          <div className={styles.live}>
            <div className={`${styles.readout} ${v ? styles[v] : ''}`} data-verdict={v ?? 'none'}>
              <p className={styles.noteName} data-note={shown?.label ?? ''}>{shown ? shown.label : '–'}</p>
              <p className={styles.noteSub}>{toneHz ? `Playing reference ${midiName(readNote(toneHz, prefs.a4).midi)}…` : shown ? shown.sub : quiet ? 'Too quiet — play a little louder or move closer' : 'Play a note'}</p>
            </div>

            <div className={styles.gauge} role="img"
              aria-label={shown ? `${Math.round(shown.cents)} cents ${shown.cents < 0 ? 'flat' : 'sharp'}` : 'No note'}>
              <div className={styles.zone} style={{ width: `${prefs.tolerance * 2}%` }} />
              <div className={styles.ticks} aria-hidden="true">
                {[-50, -25, 0, 25, 50].map((t) => <span key={t} style={{ left: `${50 + t}%` }}>{t > 0 ? `+${t}` : t}</span>)}
              </div>
              <div className={`${styles.needle} ${shown ? '' : styles.needleIdle} ${v ? styles[v] : ''}`} style={{ left: `${50 + needle}%` }} data-cents={shown ? shown.cents.toFixed(1) : ''} />
            </div>
            <div className={styles.flatSharp} aria-hidden="true"><span>♭ Flat</span><span>Sharp ♯</span></div>

            <p className={`${styles.advice} ${v ? styles[v] : ''}`} data-advice>{shown ? <>{advice}{v !== 'in-tune' && !otherNote && <span className={styles.cents}> ({shown.cents > 0 ? '+' : ''}{Math.round(shown.cents)} cents)</span>}</> : ' '}</p>

            <div className={styles.metaRow}>
              <span className={styles.level} aria-label="Microphone level"><span style={{ width: `${level * 100}%` }} /></span>
              <span className="mono">{shown ? `${shown.hz.toFixed(1)} Hz` : '— Hz'}</span>
              <Button size="sm" variant="ghost" onClick={stop}>Stop listening</Button>
            </div>
          </div>
        )}
        <p className="visually-hidden" aria-live="polite">{announce}</p>
      </Panel>

      <section aria-labelledby="strings-h" className={styles.section}>
        <SectionTitle id="strings-h">Tune to</SectionTitle>
        <div className={styles.targets} role="group" aria-label="Tuning target">
          <button type="button" className={`${styles.target} ${target === 'auto' ? styles.targetOn : ''}`} aria-pressed={target === 'auto'} onClick={() => setTarget('auto')}>
            <span className={styles.targetName}>Auto</span><span className={styles.targetSub}>nearest string</span>
          </button>
          {inst.strings.map((s, i) => (
            <div key={s.name} className={`${styles.stringCard} ${target === i ? styles.targetOn : ''}`}>
              <button type="button" className={styles.target} aria-pressed={target === i} onClick={() => setTarget(i)}>
                <span className={styles.targetName}>{s.name}</span><span className={styles.targetSub}>{midiName(s.midi)}</span>
              </button>
              <button type="button" className={styles.play} onClick={() => playTone(midiToHz(s.midi, prefs.a4))} disabled={toneHz != null}
                aria-label={`Play reference ${s.name} (${midiName(s.midi)})`}>
                <Icon name="speaker" size={18} />
              </button>
            </div>
          ))}
          <button type="button" className={`${styles.target} ${target === 'chromatic' ? styles.targetOn : ''}`} aria-pressed={target === 'chromatic'} onClick={() => setTarget('chromatic')}>
            <span className={styles.targetName}>Any note</span><span className={styles.targetSub}>check notes you play</span>
          </button>
        </div>
      </section>

      <section aria-labelledby="settings-h" className={styles.section}>
        <SectionTitle id="settings-h">Settings</SectionTitle>
        <div className={styles.settings}>
          <div className={styles.setting}>
            <span className={styles.settingLabel} id="a4-label">Reference pitch</span>
            <div className={styles.stepper} role="group" aria-labelledby="a4-label">
              <Button size="sm" variant="secondary" onClick={() => setPrefs((p) => ({ ...p, a4: Math.max(430, p.a4 - 1) }))} aria-label="Lower reference pitch">−</Button>
              <span className="mono" aria-live="polite">A4 = {prefs.a4} Hz</span>
              <Button size="sm" variant="secondary" onClick={() => setPrefs((p) => ({ ...p, a4: Math.min(450, p.a4 + 1) }))} aria-label="Raise reference pitch">+</Button>
            </div>
            <span className={styles.settingHelp}>Most orchestras use 440–442 Hz. Ask your teacher if unsure.</span>
          </div>
          <div className={styles.setting}>
            <span className={styles.settingLabel}>Counts as in tune within</span>
            <Segmented name="tolerance" label="In-tune range" value={prefs.tolerance}
              options={TOLERANCE_CHOICES.map((t) => ({ value: t, label: `±${t} cents` }))}
              onChange={(t) => setPrefs((p) => ({ ...p, tolerance: t }))} />
            <span className={styles.settingHelp}>±20 is friendly for learning. Try ±10 or ±5 as your ear improves.</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="tips-h" className={styles.section}>
        <SectionTitle id="tips-h">Tuning tips</SectionTitle>
        <ul className={styles.tips}>
          <li>Tune in a quiet room, with the instrument close to the microphone.</li>
          <li>Start with the A string, then tune the others. Bow (or pluck) one open string at a time and let it ring.</li>
          <li>Use the fine tuners for small changes. Pegs move the pitch a lot — turn them gently, and ask a teacher to help if a string is far out.</li>
          <li>Play the reference note and listen: training your ear matters as much as the needle.</li>
        </ul>
      </section>

      {DEV_TONE && <DevTonePanel />}
    </>
  );
}

/** DEV ONLY: controls for the synthetic test tone. */
function DevTonePanel() {
  const [s, setS] = useState<DevToneSettings>({ ...devToneSettings });
  const set = (patch: Partial<DevToneSettings>) => { updateDevTone(patch); setS({ ...devToneSettings }); };
  return (
    <Panel className={styles.dev} aria-label="Developer test tone" data-dev-tone>
      <p className="eyebrow">Dev only — synthetic input instead of the microphone</p>
      <label>Hz <input type="number" step="0.1" value={s.hz} onChange={(e) => set({ hz: Number(e.target.value) || 440 })} data-dev-hz /></label>
      <label>Timbre <select value={s.timbre} onChange={(e) => set({ timbre: e.target.value as DevToneSettings['timbre'] })}><option value="string">string</option><option value="weak">weak fundamental</option><option value="sine">sine</option></select></label>
      <label>Vibrato ¢ <input type="number" value={s.vibratoCents} onChange={(e) => set({ vibratoCents: Number(e.target.value) })} /></label>
      <label>Noise <input type="number" step="0.01" value={s.noise} onChange={(e) => set({ noise: Number(e.target.value) })} /></label>
      <label><input type="checkbox" checked={s.on} onChange={(e) => set({ on: e.target.checked })} data-dev-on /> sounding</label>
    </Panel>
  );
}
