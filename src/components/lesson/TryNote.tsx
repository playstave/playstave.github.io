import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui';
import { Icon } from '../Icon';
import { Fingerboard } from '../Fingerboard';
import { useListener } from '../../audio/useListener';
import { centsFrom, getInstrument, midiToHz, readNote, type InstrumentId } from '../../audio/notes';
import { DEFAULT_IN_TUNE_CENTS } from '../../audio/tolerance';
import { describePlacement, placeNote, sharpName, sharpNameOct } from '../../course/fingering';
import { createDevSource, devToneEnabled, updateDevTone } from '../../audio/devTone';
import styles from './Lesson.module.css';

const DEV_TONE = import.meta.env.DEV && devToneEnabled();
/** How long the right note must be held, in tune, to count (ms). */
const HOLD_MS = 700;

/**
 * "Try it": play one new note while Stave listens. It turns green once the
 * note is held in tune (±20 cents) for a moment. Friendly by design — the
 * student can always skip.
 */
export function TryNote({ instrument, midi, onDone, last }: { instrument: InstrumentId; midi: number; onDone: () => void; last: boolean }) {
  const inst = getInstrument(instrument)!;
  const { state, frame, start, stop, playTone, toneHz } = useListener({ minHz: inst.minHz, maxHz: inst.maxHz, devSource: DEV_TONE ? createDevSource : undefined });
  const [done, setDone] = useState(false);
  const heldSince = useRef<number | null>(null);
  const p = placeNote(instrument, midi)!;
  const name = sharpName(midi);

  // DEV: point the synthetic tone at the target so the flow can be tested.
  useEffect(() => { if (DEV_TONE) updateDevTone({ hz: midiToHz(midi) }); }, [midi]);
  useEffect(() => { setDone(false); heldSince.current = null; }, [midi]);

  const reading = frame?.reading ?? null;
  const cents = reading ? centsFrom(reading.hz, midi) : null;
  const near = cents != null && Math.abs(cents) <= 60;
  const inTune = cents != null && Math.abs(cents) <= DEFAULT_IN_TUNE_CENTS;

  useEffect(() => {
    if (done || !frame) return;
    if (inTune) {
      heldSince.current ??= frame.time;
      if (frame.time - heldSince.current >= HOLD_MS) { setDone(true); stop(); }
    } else heldSince.current = null;
  }, [frame, inTune, done, stop]);

  const feedback = done ? `That’s ${name}, in tune!`
    : state !== 'listening' ? ''
    : !reading ? 'Play the note and let it ring…'
    : near ? (inTune ? 'In tune — hold it…' : cents! < 0 ? `${name} is a little flat — aim slightly higher` : `${name} is a little sharp — aim slightly lower`)
    : `That sounds like ${sharpName(readNote(reading.hz).midi)}. Look at the fingering again.`;

  return (
    <div className={styles.tryBox} data-try-note={sharpNameOct(midi)} data-try-done={done}>
      <div className={styles.tryNote}>
        <p className={`${styles.tryName} ${done ? styles.tryOk : ''}`}>{name}{done && <Icon name="check" size={40} />}</p>
        <p className={styles.para}>{describePlacement(p, instrument).replace(/^./, (c) => c.toUpperCase())}.</p>
        <Button variant="ghost" icon="speaker" onClick={() => playTone(midiToHz(midi))} disabled={toneHz != null}>Hear it</Button>
      </div>
      <div className={styles.tryBoard}><Fingerboard instrument={instrument} notes={[midi]} highlight={[midi]} /></div>
      <p className={styles.tryFeedback} aria-live="polite" data-try-feedback>{feedback || ' '}</p>
      <div className={styles.nav}>
        {done ? (
          <Button iconAfter="arrow-right" onClick={onDone} data-try-next>{last ? 'Go to the play test' : 'Next note'}</Button>
        ) : state === 'listening' ? (
          <Button variant="secondary" onClick={stop}>Stop listening</Button>
        ) : (
          <Button icon="mic" onClick={start} data-try-start>{state === 'denied' ? 'Microphone blocked — try again' : 'Start listening'}</Button>
        )}
        {!done && <Button variant="ghost" onClick={() => { stop(); onDone(); }} data-try-skip>Skip</Button>}
      </div>
    </div>
  );
}
