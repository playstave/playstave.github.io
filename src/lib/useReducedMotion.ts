import { useEffect, useState } from 'react';
import { useAppState } from '../state/AppState';

/** True when motion should be reduced: the in-app setting wins, otherwise the OS preference. */
export function useReducedMotion(): boolean {
  const { prefs } = useAppState();
  const [os, setOs] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setOs(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return prefs.motion === 'reduced' || (prefs.motion === 'system' && os);
}
