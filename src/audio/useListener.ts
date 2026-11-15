import { useCallback, useEffect, useRef, useState } from 'react';
import { Listener, playReferenceTone, type ListenFrame, type ListenState } from './input';

interface Options {
  minHz: number;
  maxHz: number;
  devSource?: (ctx: AudioContext) => AudioNode;
}

/**
 * React wrapper around Listener. The microphone is released when the
 * component unmounts or the tab is hidden (students should never wonder
 * whether the app is still listening).
 */
export function useListener({ minHz, maxHz, devSource }: Options) {
  const [state, setState] = useState<ListenState>('idle');
  const [error, setError] = useState('');
  const [frame, setFrame] = useState<ListenFrame | null>(null);
  const [toneHz, setToneHz] = useState<number | null>(null);
  const listener = useRef<Listener | null>(null);

  const get = useCallback(() => {
    if (!listener.current) {
      listener.current = new Listener({ minHz, maxHz, onFrame: setFrame, devSource }, (s, e) => { setState(s); setError(e); });
    }
    return listener.current;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { listener.current?.setRange(minHz, maxHz); }, [minHz, maxHz]);

  useEffect(() => {
    const onHide = () => { if (document.hidden) { listener.current?.stop(); setFrame(null); } };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      listener.current?.stop();
      listener.current = null;
    };
  }, []);

  const start = useCallback(() => get().start(), [get]);
  const stop = useCallback(() => { listener.current?.stop(); setFrame(null); }, []);

  /** Play a reference pitch; listening pauses meanwhile so the app doesn't hear itself. */
  const playTone = useCallback(async (hz: number) => {
    setToneHz(hz);
    listener.current?.setPaused(true);
    try { await playReferenceTone(hz); } finally {
      listener.current?.setPaused(false);
      setToneHz(null);
    }
  }, []);

  return { state, error, frame, start, stop, playTone, toneHz };
}
