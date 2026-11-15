import { it } from 'vitest';
import { getPlayLevel } from './playLevels';
import { levelKind } from './map';
import { pieceScore } from './generator';
import { buildTimeline } from '../play/exercise';
it('dbg', () => {
  for (const inst of ['violin', 'bass'] as const) console.log(inst, [1,2,3,4,5,6,7,8,10,11,13,14,15,16].map(n => { const e = getPlayLevel(inst, levelKind(n).index)!.exercise; return `L${n}:${pieceScore(e).toFixed(2)}(${buildTimeline(e).measures.length}b,${e.tempo})`; }).join(' '));
});
