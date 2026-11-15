/**
 * One place to ask "what is Level n?" for a given instrument: a playing level
 * (tutorial → try it → play test) or a theory level, and whether its content
 * has been written yet.
 */
import type { InstrumentId } from '../audio/notes';
import { getLesson } from '../lessons';
import { levelKind } from './map';
import { getPlayLevel } from './playLevels';

export interface LevelInfo {
  kind: 'play' | 'theory';
  /** Title when the content exists. */
  title?: string;
  available: boolean;
}

export function levelInfo(n: number, inst: InstrumentId): LevelInfo {
  const k = levelKind(n);
  if (k.kind === 'theory') {
    const l = getLesson(n);
    return { kind: 'theory', title: l?.title, available: !!l };
  }
  const p = getPlayLevel(inst, k.index);
  return { kind: 'play', title: p?.title, available: !!p };
}

export { levelKind } from './map';
