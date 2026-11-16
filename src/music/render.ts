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
  /** If given, every drawn note/rest is appended here in score order (for colouring and a play cursor). */
  collect?: RenderedNote[];
}

export interface RenderedNote {
  measure: number;
  pos: number;
  /** The note's SVG group (colour it with style.color, since it draws in currentColor). */
  el: SVGElement | undefined;
  /** Horizontal centre of the notehead, in drawing units. */
  x: number;
  /** y of the stave it sits on (staff lines start ~40 units below), in drawing units. */
  top: number;
  /** Which drawn system row (0-based) it is in. */
  row: number;
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
  const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Beam, Dot, Barline, Articulation, Annotation, Curve, Modifier } = V;
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
    ctx.setFont("'Alegreya Variable', Alegreya, Georgia, serif", 22, 'bold');
    const tw = ctx.measureText(o.header.title).width;
    ctx.fillText(o.header.title, (width - tw) / 2, TOP_MARGIN + 30);
    ctx.setFont("'Alegreya Sans', system-ui, sans-serif", 11, 'normal');
    const cw = ctx.measureText(o.header.composer).width;
    ctx.fillText(o.header.composer, width - MARGIN_X - cw, TOP_MARGIN + 58);
    if (o.header.tempo) ctx.fillText(o.header.tempo, MARGIN_X, TOP_MARGIN + 58);
    if (o.header.part) {
      ctx.setFont("'Alegreya Sans', system-ui, sans-serif", 10, 'italic');
      ctx.fillText(o.header.part, MARGIN_X, TOP_MARGIN + 74);
    }
    ctx.restore();
  }

  const lastMeasure = o.measures.length - 1;
  const ART: Record<string, [string, 'above' | 'below' | 'auto']> = {
    st: ['a.', 'auto'], ac: ['a>', 'auto'], ten: ['a-', 'auto'], fer: ['a@a', 'above'], harm: ['ah', 'above'], pz: ['a+', 'above'], v: ['a|', 'above'], n: ['am', 'above'],
  };
  const WORDS: Record<string, [string, 'above' | 'below', boolean]> = {
    pp: ['pp', 'below', true], p: ['p', 'below', true], mp: ['mp', 'below', true], mf: ['mf', 'below', true], f: ['f', 'below', true], ff: ['ff', 'below', true],
    cr: ['cresc.', 'below', false], dim: ['dim.', 'below', false], rit: ['rit.', 'above', false], accel: ['accel.', 'above', false], atempo: ['a tempo', 'above', false], tr: ['tr', 'above', true],
  };
  o.systems.forEach((sysIndex, row) => {
    const sys = o.layout.systems[sysIndex];
    let slurFrom: InstanceType<typeof StaveNote> | null = null;
    const slurs: [InstanceType<typeof StaveNote>, InstanceType<typeof StaveNote>][] = [];
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
        for (const mk of n.marks ?? []) {
          const art = ART[mk];
          if (art) {
            const a = new Articulation(art[0]);
            if (art[1] !== 'auto') a.setPosition(art[1] === 'above' ? Modifier.Position.ABOVE : Modifier.Position.BELOW);
            sn.addModifier(a, 0);
          }
          const w = WORDS[mk];
          if (w) {
            const an = new Annotation(w[0]);
            an.setFont("'Alegreya Variable', Alegreya, Georgia, serif", w[2] ? 13 : 11, w[2] ? 'bold italic' : 'italic');
            an.setVerticalJustification(w[1] === 'above' ? Annotation.VerticalJustify.TOP : Annotation.VerticalJustify.BOTTOM);
            sn.addModifier(an, 0);
          }
          if (mk === 'sl(') slurFrom = sn;
          if (mk === 'sl)' && slurFrom) { slurs.push([slurFrom, sn]); slurFrom = null; }
        }
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
      if (o.collect) {
        notes.forEach((sn, k) => {
          const el = sn.getSVGElement();
          el?.setAttribute('data-note-index', String(o.collect!.length));
          o.collect!.push({ measure: mi, pos: k, el, x: sn.getAbsoluteX() + sn.getGlyphWidth() / 2, top: y, row });
        });
      }
      x += w;
    }
    // Slurs are drawn once the whole line is laid out (they may cross bar lines).
    for (const [a, b] of slurs) {
      try { new Curve(a, b, { cps: [{ x: 0, y: 10 }, { x: 0, y: 10 }] }).setContext(ctx).draw(); } catch { /* a slur that can't be drawn is skipped, never fatal */ }
    }
  });

  const svg = host.querySelector('svg')!;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  return svg;
}
