import { useEffect, useRef, useState } from 'react';
import styles from './Notation.module.css';

export interface NotationNote {
  /** VexFlow key, e.g. "c/4", "f#/5", "bb/3". */
  key: string;
  /** VexFlow duration: "w", "h", "q", "8", "16"; append "r" for rests (e.g. "qr"). */
  duration?: string;
  /** Highlight this note in the accent colour (e.g. the note being asked about). */
  highlight?: boolean;
}

interface NotationProps {
  clef?: 'treble' | 'bass' | 'alto' | 'tenor' | 'none';
  notes?: NotationNote[];
  timeSignature?: string;
  keySignature?: string;
  /** Logical drawing width in px; the SVG scales to its container. */
  width?: number;
  height?: number;
  /** Required: a text description of what the notation shows. */
  label: string;
  className?: string;
}

/**
 * Engraved notation rendered with VexFlow (loaded on demand so pages without
 * notation never pay for it). Colours follow the current theme via currentColor.
 */
export function Notation({ clef = 'treble', notes = [], timeSignature, keySignature, width = 320, height = 130, label, className }: NotationProps) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  const notesKey = JSON.stringify(notes);

  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    if (!el) return;

    import('vexflow')
      .then((VF) => {
        if (cancelled || !el) return;
        el.innerHTML = '';
        const { Renderer, Stave, StaveNote, Formatter, Accidental } = VF;
        const renderer = new Renderer(el, Renderer.Backends.SVG);
        renderer.resize(width, height);
        const ctx = renderer.getContext();
        ctx.setFillStyle('currentColor');
        ctx.setStrokeStyle('currentColor');

        const staveY = Math.max(0, (height - 100) / 2);
        const stave = new Stave(4, staveY, width - 8);
        if (clef !== 'none') stave.addClef(clef);
        if (keySignature) stave.addKeySignature(keySignature);
        if (timeSignature) stave.addTimeSignature(timeSignature);
        stave.setContext(ctx).draw();

        if (notes.length) {
          const vfNotes = notes.map((n) => {
            const isRest = n.duration?.endsWith('r');
            const sn = new StaveNote({ clef: clef === 'none' ? 'treble' : clef, keys: [n.key], duration: n.duration ?? 'q' });
            const acc = n.key.split('/')[0].slice(1);
            if (!isRest && acc && /^(#|##|b|bb|n)$/.test(acc)) sn.addModifier(new Accidental(acc), 0);
            if (n.highlight) sn.setStyle({ fillStyle: 'var(--accent)', strokeStyle: 'var(--accent)' });
            return sn;
          });
          Formatter.FormatAndDraw(ctx, stave, vfNotes);
        }

        const svg = el.querySelector('svg');
        if (svg) {
          svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
          svg.removeAttribute('width');
          svg.removeAttribute('height');
          svg.setAttribute('aria-hidden', 'true');
          svg.setAttribute('focusable', 'false');
        }
        setError(false);
      })
      .catch((e) => {
        console.error('Notation failed to render', e);
        if (!cancelled) setError(true);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- notesKey stands in for notes
  }, [clef, notesKey, timeSignature, keySignature, width, height]);

  return (
    <figure className={`${styles.figure} ${className ?? ''}`} style={{ ['--w' as string]: `${width}px` }}>
      <div ref={host} className={styles.host} role="img" aria-label={label} />
      {error && <figcaption className={styles.error}>Notation could not be displayed. {label}</figcaption>}
    </figure>
  );
}
