// @ts-nocheck
// R9 審判之翼 技能特效。主題：聖金白光／暗影紫／審判光柱／光暗對撞。
// 效能：一次性走粒子池＋自動回收 transient；zone 只建少量網格。純視覺層。
import * as THREE from 'three';
import { registerVfx } from '../../render3d/vfx/registry.js';
import { slashBlade, burst, ring, column, sphereFlash } from '../../render3d/vfx/lib.js';

const GOLD = '#f5d76e', LIGHT = '#fff2b0', WHITE = '#ffffff', SHADOW = '#b08cff', DARK = '#3a2c50';

export function loadVfx() {
  // 聖劍光弧：金白聖光斬
  registerVfx('boss_angel_slash', {
    onCast(ctx, f, c) {
      slashBlade(ctx, c, f.facing, { color: [WHITE, GOLD], len: (f.range || 140) * 1.05, swing: 1.5, life: 0.3, y: 16, sparkCount: 12, alpha: 0.98 });
      burst(ctx, c, { color: [GOLD, WHITE], count: 12, speed: 200, up: 30, life: 0.45, size: 3.4 });
      ctx.sceneMgr.addFlash(0.1, LIGHT);
    },
  });

  // 靈魂綁定：金色束縛脈衝（連線由引擎繪，這裡是綁定光環）
  registerVfx('boss_angel_bind', {
    onCast(ctx, f, c) {
      ring(ctx, c, { color: GOLD, from: 6, to: 70, life: 0.5, y: 2, alpha: 0.8 });
      sphereFlash(ctx, c, { color: SHADOW, from: 4, to: 36, life: 0.3, alpha: 0.6 });
      for (let i = 0; i < 14; i++) ctx.particles.spawn({ x: c.x + (Math.random() - 0.5) * 30, y: 0, z: c.z + (Math.random() - 0.5) * 30, vx: 0, vy: 90 + Math.random() * 110, vz: 0, gravity: -20, drag: 0.7, life: 0.6, size: 3, color: Math.random() < 0.6 ? GOLD : SHADOW, fade: true });
    },
  });

  // 審判光柱：自天而降的聖光柱（多道散落）
  registerVfx('boss_angel_judgment', {
    zone(ctx, z) {
      const R = z.radius || 110;
      const g = new THREE.Group();
      const col = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.75, R * 0.55, 260, 16, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(GOLD), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      col.position.y = 130; g.add(col);
      const coreCol = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.35, R * 0.22, 260, 12, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      coreCol.position.y = 130; g.add(coreCol);
      const gring = new THREE.Mesh(new THREE.RingGeometry(R * 0.78, R, 36), new THREE.MeshBasicMaterial({ color: new THREE.Color(LIGHT), transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      gring.rotation.x = -Math.PI / 2; gring.position.y = 1.5; g.add(gring);
      let t = 0, struck = false;
      return {
        object3D: g,
        update(dt) {
          t += dt;
          const e = Math.min(1, t / 0.18);
          const fade = 1 - Math.max(0, (t - 0.3) / 0.5);
          col.material.opacity = Math.max(0, 0.55 * e * fade); coreCol.material.opacity = Math.max(0, 0.8 * e * fade);
          gring.material.opacity = Math.max(0, 0.6 * (1 - t));
          if (!struck && t > 0.04) { struck = true; column(ctx, { x: g.position.x, y: 0, z: g.position.z }, { color: [GOLD, WHITE], count: 22, radius: R * 0.5, speed: 240, life: 0.7, size: 4 }); ctx.sceneMgr.addFlash(0.14, LIGHT); }
        },
      };
    },
  });

  // 光暗審判：聖光與暗影對撞總爆發
  registerVfx('boss_angel_ult', {
    onCast(ctx, f, c) {
      sphereFlash(ctx, c, { color: WHITE, from: 8, to: 100, life: 0.4, alpha: 0.95 });
      ring(ctx, c, { color: GOLD, from: 16, to: 240, life: 0.6, y: 4, alpha: 0.9, ease: true });
      ring(ctx, c, { color: SHADOW, from: 10, to: 200, life: 0.7, y: 3, alpha: 0.7, ease: true });
      burst(ctx, c, { color: [GOLD, WHITE], count: 24, speed: 280, up: 70, life: 0.7, size: 5 });
      burst(ctx, c, { color: [SHADOW, DARK], count: 20, speed: 240, up: 50, flat: true, life: 0.7, size: 4.5 });
      column(ctx, c, { color: [WHITE, GOLD], count: 30, radius: 90, speed: 280, life: 1.0, size: 5 });
      ctx.sceneMgr.addShake(20); ctx.sceneMgr.addFlash(0.34, LIGHT);
    },
  });
}
