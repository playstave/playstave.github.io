import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Notice, PageHeader, Segmented } from '../components/ui';
import { Icon } from '../components/Icon';
import { StepArt } from '../components/install/StepArt';
import { defaultGuideId, guidesFor } from '../data/installGuides';
import { detectPlatform, installState, onInstallChange, promptInstall, type DeviceKind } from '../lib/install';
import { useAccount } from '../state/AccountState';
import styles from './Install.module.css';

const DEVICES: { value: DeviceKind; label: string }[] = [
  { value: 'iphone', label: 'iPhone' }, { value: 'ipad', label: 'iPad' }, { value: 'android', label: 'Android' }, { value: 'desktop', label: 'Computer' },
];

export function Install() {
  const detected = useMemo(() => detectPlatform(navigator.userAgent, navigator.maxTouchPoints ?? 0), []);
  const [device, setDevice] = useState<DeviceKind>(detected.device);
  const guides = guidesFor(device);
  const [guideId, setGuideId] = useState(() => defaultGuideId(detected.device, detected.browser));
  useEffect(() => {
    // Switching device: pick that device's best guide (the detected browser if it matches).
    setGuideId(device === detected.device ? defaultGuideId(device, detected.browser) : guidesFor(device)[0].id);
  }, [device, detected]);
  const guide = guides.find((g) => g.id === guideId) ?? guides[0];

  const [inst, setInst] = useState(installState);
  useEffect(() => onInstallChange(() => setInst(installState())), []);
  const [choice, setChoice] = useState<'accepted' | 'dismissed' | null>(null);
  const account = useAccount();

  const install = async () => {
    const r = await promptInstall();
    if (r !== 'unavailable') setChoice(r);
  };

  const ios = device === 'iphone' || device === 'ipad';

  return (
    <>
      <PageHeader
        eyebrow="Install"
        title="Install Stave"
        lede="Add Stave to your Home Screen so it opens like a regular app — full screen, one tap away. It’s free, takes under a minute, and doesn’t use an app store."
      />

      {inst.standalone ? (
        <Notice title="You’re using Stave as an installed app" icon="check">
          <p>Stave is running from its Home Screen icon right now. Nothing more to do.</p>
        </Notice>
      ) : inst.installedNow ? (
        <Notice title="Stave was installed" icon="check">
          <p>Your browser confirmed the installation. Look for the Stave icon on your Home Screen, desktop or app list, and open it from there.</p>
        </Notice>
      ) : inst.canPrompt ? (
        <section className={styles.native} aria-labelledby="native-h" data-native-install>
          <div>
            <h2 id="native-h" className={styles.nativeTitle}>Your browser can install Stave directly</h2>
            <p className="muted">Press the button and confirm in the box your browser shows.</p>
          </div>
          <Button size="lg" icon="phone" onClick={install} data-install-button>Install Stave</Button>
        </section>
      ) : null}
      {choice === 'accepted' && !inst.installedNow && !inst.standalone && (
        <p className={styles.status} role="status">Your browser is installing Stave. When it’s done, the icon appears on your Home Screen or desktop — open it from there to check.</p>
      )}
      {choice === 'dismissed' && <p className={styles.status} role="status">No problem — Stave wasn’t installed. You can follow the steps below any time.</p>}

      <section aria-labelledby="steps-h" className={styles.section}>
        <h2 id="steps-h" className={styles.h2}>Step by step</h2>
        <div className={styles.pickers}>
          <div>
            <p className={styles.pickLabel} id="device-label">Your device{device === detected.device ? ' (detected)' : ''}</p>
            <Segmented name="install-device" label="Device" value={device} options={DEVICES} onChange={setDevice} />
          </div>
          <div>
            <p className={styles.pickLabel}>Browser</p>
            <div className={styles.chips} role="group" aria-label="Browser">
              {guides.map((g) => (
                <button key={g.id} type="button" className={`${styles.chip} ${g.id === guide.id ? styles.chipOn : ''}`} aria-pressed={g.id === guide.id} onClick={() => setGuideId(g.id)} data-guide={g.id}>
                  {g.label}{device === detected.device && g.id === defaultGuideId(detected.device, detected.browser) ? ' · yours' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ol className={styles.steps} data-guide-shown={`${device}:${guide.id}`}>
          {guide.steps.map((s, i) => (
            <li key={i} className={styles.step}>
              <div className={styles.stepArt}><StepArt kind={s.art} label={s.alt} /></div>
              <div className={styles.stepText}>
                <span className={styles.stepNo}>Step {i + 1}</span>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        {guide.note && <p className={styles.note}><Icon name="info" size={16} /> {guide.note}</p>}
        {guide.nativeButton && inst.canPrompt && <p className={styles.note}>Tip: the <strong>Install Stave</strong> button at the top of this page does steps 2–4 for you.</p>}
      </section>

      <section aria-labelledby="check-h" className={styles.section}>
        <h2 id="check-h" className={styles.h2}>How to check it worked</h2>
        <ul className={styles.checks}>
          <li>The Stave icon (a red note on dark staff lines) is on your Home Screen, desktop or app list.</li>
          <li>Tapping it opens Stave <strong>without</strong> the browser’s address bar.</li>
          <li>Open this page from the icon: it will say “You’re using Stave as an installed app”.</li>
        </ul>
      </section>

      {ios && (
        <Notice title="Keep your progress on iPhone and iPad">
          <p>On iPhone and iPad, the Home Screen app keeps its own storage, separate from Safari. {account.session
            ? <>You’re signed in as @{account.session.username}, so sign in again in the Home Screen app and your progress comes with you.</>
            : <>To bring your progress with you, <Link to="/profile#account-h">sign in or create a free account</Link> first, then sign in again in the Home Screen app.</>}</p>
        </Notice>
      )}

      <p className={styles.small}>Stave is a website that installs like an app: no app store, no download size worth worrying about, and it updates itself whenever you’re online. It stays free.</p>
    </>
  );
}
