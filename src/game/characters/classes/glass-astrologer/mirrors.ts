import { makeZone } from '../../../entities/factories.ts';
import { addFx } from '../../../entities/fx.ts';
import type { ActionContext, EntityId, GameState } from '../../../types';
import { clampArenaPoint, ownMirrors } from './geometry.ts';

export function addGlassMirror(ctx: ActionContext, opt: {
  x: number;
  y: number;
  angle: number;
  length?: number;
  thickness?: number;
  charges?: number;
  lifetime?: number;
  createdAt?: number;
  extra?: Record<string, any>;
}) {
  const { state, caster, action } = ctx;
  const pos = clampArenaPoint({ x: opt.x, y: opt.y });
  const mirror = Object.assign(makeZone(caster.id, pos.x, pos.y, {
    radius: 0,
    dmg: 0,
    lifetime: opt.lifetime || action.lifetime || 7,
    tick: 999,
    color: action.color,
    vfx: action.vfx || 'glass_astrologer_mirror',
  }), {
    kind: 'glass_mirror',
    angle: opt.angle,
    length: opt.length || action.length || 190,
    thickness: opt.thickness || action.thickness || 18,
    charges: opt.charges || action.charges || 3,
    createdAt: opt.createdAt ?? state.time,
    srcSlot: ctx.source,
    ...opt.extra,
  });

  state.zones.push(mirror);
  addFx(state, { type: 'buff', x: mirror.x, y: mirror.y, facing: mirror.angle, color: action.color, life: 0.35, radius: mirror.length * 0.5, vfx: mirror.vfx });
  return mirror;
}

export function pushMirrorsOutward(state: GameState, ownerId: EntityId, x: number, y: number, action: any) {
  const radius = action.mirrorPushRadius || 520;
  const push = action.mirrorPushDistance || 140;
  const pushed: any[] = [];

  for (const mirror of ownMirrors(state, ownerId)) {
    const dx = mirror.x - x;
    const dy = mirror.y - y;
    const d = Math.hypot(dx, dy) || 1;
    if (d > radius) continue;

    const nx = dx / d;
    const ny = dy / d;
    const pos = clampArenaPoint({ x: mirror.x + nx * push, y: mirror.y + ny * push });
    mirror.x = pos.x;
    mirror.y = pos.y;

    const toCaster = Math.atan2(y - mirror.y, x - mirror.x);
    mirror.angle = toCaster + Math.PI / 2;
    mirror.createdAt = state.time;
    pushed.push(mirror);

    addFx(state, { type: 'buff', x: mirror.x, y: mirror.y, facing: mirror.angle, color: action.color, life: 0.28, radius: mirror.length * 0.45, vfx: mirror.vfx || 'glass_astrologer_mirror' });
  }

  return pushed;
}
