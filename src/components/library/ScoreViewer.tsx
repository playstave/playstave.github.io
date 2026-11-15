import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Part, ScoreSource } from '../../music/score';
import { canDownload } from '../../music/score';
import { layoutScore } from '../../music/layout';
import { drawScore } from '../../music/render';
import { Icon } from '../Icon';
import { Button } from '../ui';
import styles from './ScoreViewer.module.css';

const ZOOMS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const PRINT_WIDTH = 720;

type VF = typeof import('vexflow');
let vfPromise: Promise<VF> | null = null;
const loadVF = () => (vfPromise ??= import('vexflow'));

/**
 * Paged score viewer. The page width (in drawing units) is the screen width
 * divided by the zoom, so zooming in puts fewer measures on each line and the
 * notation gets larger — it reflows rather than overflowing sideways.
 */
export function ScoreViewer({ score, part }: { score: ScoreSource; part: Part }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [frameW, setFrameW] = useState(0);
  const [zoomIdx, setZoomIdx] = useState(1);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isFs, setIsFs] = useState(false);
  const [renderMs, setRenderMs] = useState<number | null>(null);
  const zoom = ZOOMS[zoomIdx];
  const downloadable = canDownload(score);

  // Track the available width.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setFrameW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const logicalW = Math.max(300, Math.round(frameW / zoom));
  const layout = useMemo(() => (frameW ? layoutScore(part.measures, part.clef, part.key, logicalW) : null), [part, logicalW, frameW]);
  const pageCount = layout?.pages.length ?? 1;
  useEffect(() => { setPage((p) => Math.min(p, pageCount - 1)); }, [pageCount]);
  useEffect(() => { setPage(0); }, [part.id]);

  const header = useMemo(() => ({ title: score.title, composer: score.composer, tempo: score.tempo, part: part.id === 'concert' ? undefined : part.label }), [score, part]);

  // Draw the current page.
  useEffect(() => {
    if (!layout || !pageRef.current) return;
    let cancelled = false;
    setStatus((s) => (s === 'ready' ? s : 'loading'));
    loadVF().then((V) => {
      if (cancelled || !pageRef.current) return;
      const t0 = performance.now();
      drawScore(V, pageRef.current, {
        measures: part.measures, clef: part.clef, key: part.key, time: score.time, layout,
        systems: layout.pages[page] ?? [], header: page === 0 ? header : undefined, height: layout.pageHeight,
      });
      setRenderMs(Math.round(performance.now() - t0));
      setStatus('ready');
    }).catch((e) => { console.error('Score rendering failed', e); if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [layout, page, part, score.time, header]);

  const go = useCallback((d: number) => setPage((p) => Math.max(0, Math.min(pageCount - 1, p + d))), [pageCount]);
  const zoomBy = useCallback((d: number) => setZoomIdx((z) => Math.max(0, Math.min(ZOOMS.length - 1, z + d))), []);

  // Keyboard: ← → pages, + − zoom (ignored while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target instanceof HTMLElement ? e.target : document.body;
      if (t.closest('input, textarea, select, dialog') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(1); }
      else if (e.key === '-') { e.preventDefault(); zoomBy(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, zoomBy]);

  // Fullscreen.
  const fsSupported = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;
  useEffect(() => {
    const on = () => setIsFs(document.fullscreenElement === frameRef.current?.parentElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const toggleFs = () => {
    const el = frameRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen().catch(() => {});
  };

  /** Full score, every page, at a fixed print width. */
  const renderAllPages = async (target: HTMLElement) => {
    const V = await loadVF();
    const L = layoutScore(part.measures, part.clef, part.key, PRINT_WIDTH);
    target.innerHTML = '';
    L.pages.forEach((sysIdx, i) => {
      const holder = document.createElement('div');
      holder.className = styles.printPage;
      target.appendChild(holder);
      drawScore(V, holder, { measures: part.measures, clef: part.clef, key: part.key, time: score.time, layout: L, systems: sysIdx, header: i === 0 ? header : undefined, height: L.pageHeight });
    });
    return L.pages.length;
  };

  const print = async () => {
    if (!downloadable || !printRef.current) return;
    await renderAllPages(printRef.current);
    document.documentElement.classList.add('printing-score');
    const done = () => { document.documentElement.classList.remove('printing-score'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1000); // some browsers never fire afterprint
  };

  const download = async () => {
    if (!downloadable) return;
    const V = await loadVF();
    const L = layoutScore(part.measures, part.clef, part.key, 900);
    const tmp = document.createElement('div');
    tmp.style.cssText = 'position:absolute;left:-10000px;top:0;color:#1d1b17';
    document.body.appendChild(tmp);
    try {
      const svg = drawScore(V, tmp, { measures: part.measures, clef: part.clef, key: part.key, time: score.time, layout: L, systems: L.systems.map((_, i) => i), header });
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('width', String(L.pageWidth));
      svg.querySelectorAll('[fill="currentColor"]').forEach((n) => n.setAttribute('fill', '#1d1b17'));
      svg.querySelectorAll('[stroke="currentColor"]').forEach((n) => n.setAttribute('stroke', '#1d1b17'));
      const licence = `<!-- ${score.title} — ${score.composer}. ${score.licence.work} ${score.licence.edition} Source: Stave. -->\n`;
      const blob = new Blob([licence, new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${score.id}${part.id === 'concert' ? '' : `-${part.id}`}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      tmp.remove();
    }
  };

  return (
    <div className={`${styles.viewer} ${isFs ? styles.fs : ''}`} data-viewer>
      <div className={styles.toolbar} role="toolbar" aria-label="Score viewer controls">
        <div className={styles.group}>
          <button type="button" className={styles.tool} onClick={() => go(-1)} disabled={page === 0} aria-label="Previous page"><Icon name="chevron-left" size={18} /></button>
          <span className={styles.pageInfo} aria-live="polite" data-page-info>Page {page + 1} of {pageCount}</span>
          <button type="button" className={`${styles.tool} ${styles.flip}`} onClick={() => go(1)} disabled={page >= pageCount - 1} aria-label="Next page"><Icon name="chevron-left" size={18} /></button>
        </div>
        <div className={styles.group}>
          <button type="button" className={styles.tool} onClick={() => zoomBy(-1)} disabled={zoomIdx === 0} aria-label="Zoom out">−</button>
          <span className={styles.zoom} data-zoom>{Math.round(zoom * 100)}%</span>
          <button type="button" className={styles.tool} onClick={() => zoomBy(1)} disabled={zoomIdx === ZOOMS.length - 1} aria-label="Zoom in">+</button>
        </div>
        <div className={styles.group}>
          {fsSupported && <button type="button" className={styles.tool} onClick={toggleFs} aria-label={isFs ? 'Exit full screen' : 'Full screen'} aria-pressed={isFs}><Icon name={isFs ? 'close' : 'expand'} size={16} /><span className={styles.toolText}>{isFs ? 'Exit' : 'Full screen'}</span></button>}
          {downloadable && <Button size="sm" variant="secondary" onClick={print}>Print / PDF</Button>}
          {downloadable && <Button size="sm" variant="secondary" onClick={download}>Download SVG</Button>}
        </div>
      </div>

      <div ref={frameRef} className={styles.frame}>
        {status === 'loading' && <p className={styles.loading}>Engraving score…</p>}
        {status === 'error' && <p className={styles.error} role="alert">This score could not be displayed. Please reload the page.</p>}
        <div ref={pageRef} className={styles.page} role="img" aria-label={`${score.title}, page ${page + 1} of ${pageCount}`} data-render-ms={renderMs ?? undefined} data-systems={layout?.pages[page]?.length} />
      </div>
      {!downloadable && <p className={styles.small}>This score’s licence allows viewing only — printing and downloading are not available.</p>}
      <p className={styles.small}>Tip: ← and → turn pages, + and − zoom.</p>
      <div ref={printRef} className={styles.printArea} aria-hidden="true" />
    </div>
  );
}
