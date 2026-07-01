import { trimMirrors } from '../../geometry.ts';
import { addGlassMirror } from '../../mirrors.ts';
import type { ActionContext } from '../../../../../types';

export function glass_mirror(ctx: ActionContext) {
  const { state, caster, action } = ctx;
  const range = action.range || 180;
  const sideAngle = action.sideAngle ?? action.catchSpread ?? 0.3;
  const offsets = action.pairMirrors === false ? [0] : [-sideAngle, sideAngle];

  for (const offset of offsets) {
    const angle = caster.facing + offset;
    addGlassMirror(ctx, {
      x: caster.x + Math.cos(angle) * range,
      y: caster.y + Math.sin(angle) * range,
      angle: caster.facing + Math.PI / 2 + offset / 2,
    });
  }
  trimMirrors(state, caster.id, action.maxMirrors || 2);
}

export const handlers = { glass_mirror };
