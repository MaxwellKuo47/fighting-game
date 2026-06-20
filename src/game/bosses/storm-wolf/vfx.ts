// @ts-nocheck
// R7 風暴巨狼 技能特效。主題：藍白雷電／電弧／雷擊光柱。
// 效能：一次性走粒子池＋自動回收 transient；無持續 zone（招式多為瞬時）。純視覺層。
import * as THREE from 'three';
import { registerVfx } from '../../render3d/vfx/registry.js';
import { slashBlade, cone, burst, ring, pillar, sphereFlash } from '../../render3d/vfx/lib.js';

const ELEC = '#aee3ff', BLUE = '#7ec8ff', WHITE = '#ffffff';

// 雷擊：細藍光柱 + 球閃 + 火星（瞬時，自動回收）
function strike(ctx, c, big = false) {
  pillar(ctx, c, { color: ELEC, h: big ? 200 : 150, r: big ? 14 : 9, taper: 0.2, life: big ? 0.4 : 0.3, alpha: 0.8, grow: 0.3 });
  pillar(ctx, c, { color: WHITE, h: big ? 200 : 150, r: big ? 6 : 4, taper: 0.15, life: big ? 0.32 : 0.24, alpha: 0.9 });
  sphereFlash(ctx, c, { color: WHITE, from: 4, to: big ? 44 : 30, life: 0.2, alpha: 0.9 });
  ring(ctx, c, { color: BLUE, from: 6, to: big ? 100 : 64, life: 0.3, y: 2, alpha: 0.8 });
  burst(ctx, c, { color: [ELEC, WHITE], count: big ? 20 : 12, speed: 240, up: 40, life: 0.4, size: 3.4 });
}

export function loadVfx() {
  // 雷爪連擊：藍電快爪 + 電火星
  registerVfx('boss_wolf_claw', {
    onCast(ctx, f, c) {
      slashBlade(ctx, c, f.facing, { color: [WHITE, ELEC], len: (f.range || 90) * 1.2, swing: 1.0, life: 0.2, y: 14, sparkCount: 8, alpha: 0.95 });
      cone(ctx, c, f.facing, { color: [ELEC, BLUE], count: 10, speed: 280, spread: 0.5, up: 16, life: 0.35, size: 3 });
    },
  });

  // 迅雷撲擊：起跳電爆 + 落地雷擊
  registerVfx('boss_wolf_pounce', {
    onCast(ctx, f, c) {
      burst(ctx, c, { color: [ELEC, BLUE], count: 16, speed: 200, up: 40, life: 0.4, size: 3.6 });
      cone(ctx, c, f.facing, { color: [ELEC, WHITE], count: 16, speed: 340, spread: 0.35, life: 0.4, size: 3.6 });
    },
    onHit(ctx, f, c) {
      strike(ctx, c, false);
      ctx.sceneMgr.addShake(10); ctx.sceneMgr.addFlash(0.16, ELEC);
    },
  });

  // 暴風咆哮：擊退風暴衝擊環 + 放射電弧
  registerVfx('boss_wolf_howl', {
    onCast(ctx, f, c) {
      ring(ctx, c, { color: ELEC, from: 12, to: 260, life: 0.5, y: 3, alpha: 0.85, ease: true });
      ring(ctx, c, { color: WHITE, from: 8, to: 180, life: 0.4, y: 4, alpha: 0.7 });
      sphereFlash(ctx, c, { color: BLUE, from: 8, to: 90, life: 0.34, alpha: 0.6 });
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * 6.283;
        ctx.particles.spawn({ x: c.x, y: 6, z: c.z, vx: Math.cos(a) * 260, vy: 30 + Math.random() * 60, vz: Math.sin(a) * 260, gravity: 80, drag: 1.6, life: 0.5, size: 3.4, color: Math.random() < 0.5 ? ELEC : WHITE, fade: true });
      }
      ctx.sceneMgr.addShake(12); ctx.sceneMgr.addFlash(0.2, ELEC);
    },
  });

  // 雷霆亂舞：連續閃現雷擊（multiblink，每次閃現觸發一次落雷）
  registerVfx('boss_wolf_ult', {
    onCast(ctx, f, c) {
      strike(ctx, c, true);
      ctx.sceneMgr.addShake(14); ctx.sceneMgr.addFlash(0.22, ELEC);
    },
  });
}
