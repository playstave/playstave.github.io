import { useEffect, useState } from 'react';
import { Button } from './ui';
import { Icon } from './Icon';
import { micSupported } from '../audio/input';
import { devToneEnabled } from '../audio/devTone';
import styles from './MicPermission.module.css';

type State = 'unknown' | 'granted' | 'prompt' | 'denied' | 'unsupported';

/**
 * A clear "Allow microphone" step, shown until the browser has permission.
 * Pressing the button makes the browser show its own permission box; nothing
 * is recorded — the microphone is opened and closed again straight away.
 */
export function MicPermission() {
  const [state, setState] = useState<State>('unknown');
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV && devToneEnabled()) { setState('granted'); return; }
    if (!micSupported()) { setState('unsupported'); return; }
    let cancelled = false;
    let status: PermissionStatus | null = null;
    const update = () => { if (!cancelled && status) setState(status.state as State); };
    navigator.permissions?.query({ name: 'microphone' as PermissionName })
      .then((s) => { status = s; update(); s.addEventListener('change', update); })
      .catch(() => { if (!cancelled) setState('prompt'); }); // browsers without the Permissions API: just offer the button
    if (!navigator.permissions) setState('prompt');
    return () => { cancelled = true; status?.removeEventListener('change', update); };
  }, []);

  const allow = async () => {
    setAsking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setState('granted');
    } catch (e) {
      const name = (e as DOMException)?.name;
      setState(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'prompt');
    } finally { setAsking(false); }
  };

  if (state === 'granted' || state === 'unknown') return null;
  return (
    <div className={styles.box} role="group" aria-label="Microphone permission" data-mic-permission={state}>
      <span className={styles.icon} aria-hidden="true"><Icon name="mic" size={22} /></span>
      <div className={styles.text}>
        {state === 'prompt' && <><p className={styles.title}>Stave needs your microphone to hear you play</p><p>Press the button, then choose “Allow” in the box your browser shows. Sound is checked on this device only — nothing is recorded or sent anywhere.</p></>}
        {state === 'denied' && <><p className={styles.title}>The microphone is blocked</p><p>Your browser is blocking the microphone for Stave. Click the icon next to the web address (a lock or sliders), set Microphone to “Allow”, then reload this page. If there is no such setting (some built-in preview windows never allow the microphone), open Stave in Chrome, Safari, Edge or Firefox instead.</p></>}
        {state === 'unsupported' && <><p className={styles.title}>Listening isn’t available here</p><p>This browser or page can’t share the microphone. Open Stave in a recent version of Chrome, Safari, Edge or Firefox, on a secure (https) address.</p></>}
      </div>
      {state === 'prompt' && <Button icon="mic" onClick={allow} disabled={asking} data-allow-mic>{asking ? 'Waiting for your answer…' : 'Allow microphone'}</Button>}
      {state === 'denied' && <Button variant="secondary" onClick={allow} disabled={asking}>Try again</Button>}
    </div>
  );
}
