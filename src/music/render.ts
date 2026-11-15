/**
 * Draws laid-out systems with VexFlow into an SVG. VexFlow is passed in (it is
 * loaded on demand) so this module adds nothing to pages without notation.
 */
import type * as VexFlow from 'vexflow';
import { HEADER_HEIGHT, MARGIN_X, SYSTEM_HEIGHT, TOP_MARGIN, type Layout } from './layout';
import type { Clef, Measure } from './score';

type VF = typeof VexFlow;

export interface DrawOptions {
  measures: Measure[];
  clef: Clef;
  key: string;
  time: string;
  layout: Layout;
  /** Indices into layout.systems to draw, top to bottom. */
  systems: number[];
  /** Print title/composer above the first system. */
  header?: { title: string; composer: string; tempo?: string; part?: string };
  /** Height of the drawing; defaults to exactly what the systems need. */
  height?: number;
}

const REST_KEY: Record<Clef, string> = { treble: 'b/4', bass: 'd/3', alto: 'c/4', percussion: 'b/4' };

function beamGroups(V: VF, time: string) {
  if (time === '7/8') return [new V.Fraction(2, 8), new V.Fraction(2, 8), new V.Fraction(3, 8)];
  if (time === '5/8') return [new V.Fraction(3, 8), new V.Fraction(2, 8)];
  return V.Beam.getDefaultBeamGroups(time);
}

/** Render into `host` (its contents are replaced). Returns the SVG element. */
export function drawScore(V: VF, host: HTMLElement, o: DrawOptions): SVGSVGElement {
  host.innerHTML = '';
  const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Beam, Dot, Barline } = V;
  const width = o.layout.pageWidth;
  const top = TOP_MARGIN + (o.header ? HEADER_HEIGHT : 0);
  const height = o.height ?? top + o.systems.length * SYSTEM_HEIGHT + TOP_MARGIN;

  const renderer = new Renderer(host as HTMLDivElement, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const ctx = renderer.getContext();
  ctx.setFillStyle('currentColor');
  ctx.setStrokeStyle('currentColor');

  if (o.header) {
    ctx.save();
    ctx.setFont("'Source Serif 4 Variable', Georgia, serif", 22, 'bold');
    const tw = ctx.measureText(o.header.title).width;
    ctx.fillText(o.header.title, (width - tw) / 2, TOP_MARGIN + 30);
    ctx.setFont('IBM Plex Sans, system-ui, sans-serif', 11, 'normal');
    const cw = ctx.measureText(o.header.composer).width;
    ctx.fillText(o.header.composer, width - MARGIN_X - cw, TOP_MARGIN + 58);
    if (o.header.tempo) ctx.fillText(o.header.tempo, MARGIN_X, TOP_MARGIN + 58);
    if (o.header.part) {
      ctx.setFont('IBM Plex Sans, system-ui, sans-serif', 10, 'italic');
      ctx.fillText(o.header.part, MARGIN_X, TOP_MARGIN + 74);
    }
    ctx.restore();
  }

  const lastMeasure = o.measures.length - 1;
  o.systems.forEach((sysIndex, row) => {
    const sys = o.layout.systems[sysIndex];
    const y = top + row * SYSTEM_HEIGHT + 14;
    let x = MARGIN_X;
    for (let mi = sys.first; mi <= sys.last; mi++) {
      const w = sys.widths[mi - sys.first];
      const stave = new Stave(x, y, w);
      if (mi === sys.first) {
        stave.addClef(o.clef);
        if (o.clef !== 'percussion') stave.addKeySignature(o.key);
        if (sysIndex === 0) stave.addTimeSignature(o.time);
        if (mi > 0) stave.setMeasure(mi + 1);
      }
      if (mi === lastMeasure) stave.setEndBarType(Barline.type.END);
      stave.setContext(ctx).draw();

      const notes = o.measures[mi].map((n) => {
        const keys = [n.rest ? REST_KEY[o.clef] : n.notehead ? `${n.key}/${n.notehead}` : n.key];
        const sn = new StaveNote({ clef: o.clef === 'percussion' ? 'percussion' : o.clef, keys, duration: `${n.duration}${n.rest ? 'r' : ''}`, auto_stem: true });
        if (n.dotted) Dot.buildAndAttach([sn], { all: true });
        return sn;
      });
      const [num, den] = o.time.split('/').map(Number);
      const voice = new Voice({ num_beats: num, beat_value: den }).setMode(Voice.Mode.SOFT).addTickables(notes);
      if (o.clef !== 'percussion') Accidental.applyAccidentals([voice], o.key);
      const beams = Beam.generateBeams(notes, { groups: beamGroups(V, o.time) });
      const room = w - (stave.getNoteStartX() - x) - 12;
      new Formatter().joinVoices([voice]).format([voice], Math.max(room, 20));
      voice.draw(ctx, stave);
      beams.forEach((b) => b.setContext(ctx).draw());
      x += w;
    }
  });

  const svg = host.querySelector('svg')!;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  return svg;
}
