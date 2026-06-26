// 忍者大招「千影分身」：召出 5 個無敵殘影分身，於一段時間內持續環繞最近目標連續斬擊。
//   ・分身非實體（純傷害來源＋殘影 VFX），故天生「無敵」、不可被攻擊。
//   ・施法者本體於施放期間隱身＋無敵（由 ult 的 self 效果套用），形成安全爆發窗。
// 由 BaseCharacter 的 tick 每幀呼叫（見 index.ts）；狀態 p._ninjaClones 由 shadowflurry handler 設定。
// 決定性：目標以「最近敵人」決定、分身角度由固定相位推進，無 Math.random。
import { ARENA, PLAYER_RADIUS } from '../../../constants.js';
import { clamp } from '../../../entities/math.ts';
import { dealDamage } from '../../../entities/damage.ts';
import { addFx } from '../../../entities/fx.ts';
import { isEnemy } from '../../../entities/team.ts';
import type { Player } from '../../../types';

function nearestEnemy(state: any, p: Player, range: number): Player | null {
  let best: Player | null = null;
  let bestD = range;
  for (const o of Object.values(state.players) as any[]) {
    if (!o.alive || !isEnemy(state, p.id, o)) continue;
    const d = Math.hypot(o.x - p.x, o.y - p.y);
    if (d <= bestD) { bestD = d; best = o; }
  }
  return best;
}

export function tickNinjaClones(state: any, p: Player, dt: number) {
  const cl = (p as any)._ninjaClones;
  if (!cl) return;
  if (!p.alive) { (p as any)._ninjaClones = null; return; }

  cl.remaining -= dt;
  cl.timer -= dt;
  if (cl.timer <= 0 && cl.remaining > 0) {
    cl.timer += cl.interval;
    cl.phase += 0.55;                                  // 分身環繞旋轉
    const target = nearestEnemy(state, p, cl.range);
    if (target) {
      for (let i = 0; i < cl.count; i++) {
        const ang = cl.phase + (i / cl.count) * Math.PI * 2;
        const cx = clamp(target.x + Math.cos(ang) * cl.orbit, PLAYER_RADIUS, ARENA.width - PLAYER_RADIUS);
        const cy = clamp(target.y + Math.sin(ang) * cl.orbit, PLAYER_RADIUS, ARENA.height - PLAYER_RADIUS);
        const faceIn = Math.atan2(target.y - cy, target.x - cx);
        // 對被控目標吃滿影殺天賦（dealDamage 內走 modifyOutgoing）
        dealDamage(state, target, cl.dmg, p.id, { source: 'ultimate' });
        addFx(state, { type: 'blink', x: cx, y: cy, facing: faceIn, color: '#9fd2ff', life: 0.3, radius: PLAYER_RADIUS * 1.7, vfx: 'ninja_ultimate', clone: true });
      }
    }
  }
  if (cl.remaining <= 0) (p as any)._ninjaClones = null;
}
