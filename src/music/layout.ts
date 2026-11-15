/**
 * Score layout: how many measures fit on each line (system), and how many
 * systems fit on each page, for a given page width. Pure and testable; the
 * renderer only draws what this decides.
 */
import { keyAccidentals } from './pitch';
import type { Clef, Measure } from './score';

export const PAGE_RATIO = 1.414; // A4 portrait
export const MARGIN_X = 28;
export const SYSTEM_HEIGHT = 112;
export const HEADER_HEIGHT = 92;
export const TOP_MARGIN = 24;

const NOTE_W: Record<string, number> = { w: 34, h: 30, q: 26, '8': 22, '16': 19 };

/** Minimum comfortable width of a measure's notes. */
export function measureWidth(m: Measure): number {
  return 26 + m.reduce((t, n) => t + NOTE_W[n.duration] + (n.dotted ? 6 : 0) + (/[#b]/.test(n.key.split('/')[0].slice(1)) ? 10 : 0), 0);
}

/** Width taken by clef, key signature and (first system only) time signature. */
export function headerWidth(clef: Clef, key: string, withTime: boolean): number {
  const keyW = clef === 'percussion' ? 0 : Math.abs(keyAccidentals(key)) * 10;
  return 38 + keyW + (withTime ? 28 : 0) + 6;
}

export interface System { first: number; last: number; widths: number[] }
export interface Layout { pageWidth: number; pageHeight: number; systems: System[]; pages: number[][] }

export function layoutScore(measures: Measure[], clef: Clef, key: string, pageWidth: number): Layout {
  const usable = pageWidth - MARGIN_X * 2;
  const systems: System[] = [];
  let i = 0;
  while (i < measures.length) {
    const head = headerWidth(clef, key, systems.length === 0);
    const mins: number[] = [];
    let used = head;
    let j = i;
    while (j < measures.length) {
      const w = measureWidth(measures[j]);
      if (mins.length > 0 && used + w > usable) break;
      mins.push(w);
      used += w;
      j++;
    }
    // Stretch to fill the line, except a short final line (keeps spacing natural).
    const isLast = j >= measures.length;
    const fill = isLast && used < usable * 0.6 ? 1 : (usable - head) / (used - head);
    const widths = mins.map((w, k) => w * fill + (k === 0 ? head : 0));
    systems.push({ first: i, last: j - 1, widths });
    i = j;
  }
  const pageHeight = Math.round(pageWidth * PAGE_RATIO);
  const pages: number[][] = [];
  let page: number[] = [];
  let y = TOP_MARGIN + HEADER_HEIGHT;
  systems.forEach((_, k) => {
    if (y + SYSTEM_HEIGHT > pageHeight - TOP_MARGIN && page.length) {
      pages.push(page);
      page = [];
      y = TOP_MARGIN;
    }
    page.push(k);
    y += SYSTEM_HEIGHT;
  });
  if (page.length) pages.push(page);
  return { pageWidth, pageHeight, systems, pages };
}
