import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { InstrumentPicture } from '../components/InstrumentPicture';
import { EXPERIENCE_OPTIONS, INSTRUMENT_INFO, instrumentInfo, startPlan } from '../data/students';
import { useAppState } from '../state/AppState';
import type { Experience, StudentInstrument } from '../state/progress';
import styles from './Welcome.module.css';

/**
 * First-run questions: which instrument, and how much you've played. The
 * answers personalise the whole app (only that instrument's pieces, tuner and
 * lessons are shown) and can be changed later in Settings.
 */
export function Welcome() {
  const { progress, setStudent } = useAppState();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') && params.get('next')!.startsWith('/') && !params.get('next')!.startsWith('//') ? params.get('next')! : '/';
  const [step, setStep] = useState(0);
  const [instrument, setInstrument] = useState<StudentInstrument | null>(progress.student?.instrument ?? null);
  const [experience, setExperience] = useState<Experience | null>(progress.student?.experience ?? null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => { document.title = 'Welcome · Stave'; }, []);
  useEffect(() => { heading.current?.focus(); }, [step]);

  const finish = () => {
    if (!instrument || !experience) return;
    setStudent({ instrument, experience });
    navigate(next, { replace: true });
  };

  const info = instrument ? instrumentInfo(instrument) : null;

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <Logo />
        <span className={styles.stepCount} aria-hidden="true">Step {step + 1} of 3</span>
      </header>
      <div className={styles.dots} role="progressbar" aria-label="Welcome questions" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1}>
        {[0, 1, 2].map((i) => <span key={i} className={i <= step ? styles.dotOn : ''} />)}
      </div>

      <main className={styles.main}>
        {step === 0 && (
          <section aria-labelledby="w-h">
            <p className="eyebrow">Welcome to Stave</p>
            <h1 id="w-h" ref={heading} tabIndex={-1} className={styles.title}>Which instrument do you want to learn?</h1>
            <p className={styles.lede}>Stave will show you lessons, pieces and a tuner for just this instrument. You can change it later in Settings.</p>
            <div className={styles.instruments} role="radiogroup" aria-labelledby="w-h">
              {INSTRUMENT_INFO.map((i) => (
                <button key={i.id} type="button" role="radio" aria-checked={instrument === i.id}
                  className={`${styles.instrument} ${instrument === i.id ? styles.on : ''}`}
                  onClick={() => setInstrument(i.id)} data-instrument={i.id}>
                  <span className={styles.pic}><InstrumentPicture size={i.size} /></span>
                  <span className={styles.instName}>{i.name}</span>
                  <span className={styles.instBlurb}>{i.blurb}</span>
                  <span className={styles.instMeta}>{i.clef} · strings {i.strings}</span>
                  {instrument === i.id && <span className={styles.check}><Icon name="check" size={16} /></span>}
                </button>
              ))}
            </div>
            <div className={styles.actions}>
              <Button size="lg" iconAfter="arrow-right" disabled={!instrument} onClick={() => setStep(1)} data-welcome-next>Continue</Button>
            </div>
          </section>
        )}

        {step === 1 && info && (
          <section aria-labelledby="w-h">
            <p className="eyebrow">{info.name}</p>
            <h1 id="w-h" ref={heading} tabIndex={-1} className={styles.title}>Have you played the {info.noun} before?</h1>
            <p className={styles.lede}>This helps Stave suggest where to start. There are no wrong answers.</p>
            <div className={styles.options} role="radiogroup" aria-labelledby="w-h">
              {EXPERIENCE_OPTIONS.map((o) => (
                <button key={o.id} type="button" role="radio" aria-checked={experience === o.id}
                  className={`${styles.option} ${experience === o.id ? styles.on : ''}`}
                  onClick={() => setExperience(o.id)} data-experience={o.id}>
                  <span className={styles.optLabel}>{o.label}</span>
                  <span className={styles.optDesc}>{o.desc}</span>
                  {experience === o.id && <span className={styles.check}><Icon name="check" size={16} /></span>}
                </button>
              ))}
            </div>
            <div className={styles.actions}>
              <Button variant="ghost" icon="chevron-left" onClick={() => setStep(0)}>Back</Button>
              <Button size="lg" iconAfter="arrow-right" disabled={!experience} onClick={() => setStep(2)} data-welcome-next>Continue</Button>
            </div>
          </section>
        )}

        {step === 2 && info && experience && (
          <section aria-labelledby="w-h">
            <p className="eyebrow">Your plan</p>
            <h1 id="w-h" ref={heading} tabIndex={-1} className={styles.title}>Here’s how you’ll start on the {info.noun}</h1>
            <ol className={styles.plan}>
              {startPlan(info.id, experience).map((s, i) => (
                <li key={s.title}>
                  <span className={styles.planNo}>{i + 1}</span>
                  <span><strong>{s.title}</strong><br /><span className={styles.optDesc}>{s.desc}</span></span>
                </li>
              ))}
            </ol>
            <p className={styles.note}>Stave listens through your microphone during play-alongs and tuning. Sound is checked on your device and never recorded or sent anywhere.</p>
            <div className={styles.actions}>
              <Button variant="ghost" icon="chevron-left" onClick={() => setStep(1)}>Back</Button>
              <Button size="lg" iconAfter="arrow-right" onClick={finish} data-welcome-finish>Let’s go</Button>
            </div>
          </section>
        )}

        <p className={styles.signin}>Already have an account? <Link to="/profile#account-h">Sign in</Link> — your instrument and progress come with you.</p>
      </main>
    </div>
  );
}
