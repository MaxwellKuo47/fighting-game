// @ts-nocheck
// R10 另一個自己 技能特效。主題：虛空黑／星光白／終焉靛光／鏡面碎裂。
// 效能：一次性走粒子池＋自動回收 transient；zone 只建少量網格。純視覺層。
import * as THREE from 'three';
import { registerVfx } from '../../render3d/vfx/registry.js';
import { slashBlade, burst, ring, column, sphereFlash } from '../../render3d/vfx/lib.js';

const STAR = '#e8e8f0', AURA = '#c9c0ff', WHITE = '#ffffff', VOID = '#1a0a2a';

export function loadVfx() {
  // 虛空裂斬：星光白裂斬 + 虛空裂縫
  registerVfx('boss_doppel_slash', {
    onCast(ctx, f, c) {
      slashBlade(ctx, c, f.facing, { color: [WHITE, AURA], len: (f.range || 150) * 1.05, swing: 1.4, life: 0.28, y: 16, sparkCount: 12, alpha: 0.98 });
      burst(ctx, c, { color: [STAR, AURA], count: 12, speed: 220, up: 30, life: 0.45, size: 3.4 });
    },
  });

  // 鏡像複製：鏡面碎裂閃光（飛散白色碎片）
  registerVfx('boss_doppel_mirror', {
    onCast(ctx, f, c) {
      const { THREE: T, addTransient } = ctx;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * 6.283;
        const shard = new T.Mesh(new T.TetrahedronGeometry(8), new T.MeshStandardMaterial({ color: new T.Color(STAR), emissive: new T.Color(AURA), emissiveIntensity: 1.4, metalness: 0.6, roughness: 0.15, transparent: true, opacity: 0.92 }));
        shard.position.set(c.x, c.y, c.z);
        addTransient(shard, 0.5, (m, t) => { const d = 100 * t; m.position.set(c.x + Math.cos(a) * d, c.y + 12 * Math.sin(t * 3), c.z + Math.sin(a) * d); m.rotation.x += 0.22; m.rotation.y += 0.2; m.material.opacity = 0.9 * (1 - t); });
      }
      ring(ctx, c, { color: STAR, from: 8, to: 120, life: 0.42, y: 2, alpha: 0.75, ease: true });
      sphereFlash(ctx, c, { color: WHITE, from: 6, to: 60, life: 0.26, alpha: 0.85 });
    },
  });

  // 竊取絕技：向內匯聚的能量虹吸 + 白光脈衝
  registerVfx('boss_doppel_steal', {
    onCast(ctx, f, c) {
      sphereFlash(ctx, c, { color: AURA, from: 8, to: 70, life: 0.36, alpha: 0.7 });
      for (let i = 0; i < 30; i++) { const a = Math.random() * 6.283, rr = 60 + Math.random() * 90; ctx.particles.spawn({ x: c.x + Math.cos(a) * rr, y: 6 + Math.random() * 30, z: c.z + Math.sin(a) * rr, vx: -Math.cos(a) * 180, vy: 10, vz: -Math.sin(a) * 180, gravity: 0, drag: 1, life: 0.55, size: 3.2, color: Math.random() < 0.5 ? STAR : AURA, fade: true }); }
      ring(ctx, c, { color: AURA, from: 110, to: 14, life: 0.4, y: 2, alpha: 0.7 });
    },
  });

  // 終焉之刻：虛空＋星光的終末總爆發領域
  registerVfx('boss_doppel_ult', {
    onCast(ctx, f, c) {
      sphereFlash(ctx, c, { color: WHITE, from: 10, to: 120, life: 0.44, alpha: 0.98 });
      ring(ctx, c, { color: STAR, from: 18, to: 320, life: 0.7, y: 4, alpha: 0.9, ease: true });
      ring(ctx, c, { color: AURA, from: 12, to: 260, life: 0.8, y: 3, alpha: 0.7, ease: true });
      column(ctx, c, { color: [WHITE, AURA], count: 40, radius: 110, speed: 320, life: 1.1, size: 5 });
      burst(ctx, c, { color: [STAR, AURA, WHITE], count: 36, speed: 300, up: 80, life: 0.8, size: 5 });
      ctx.sceneMgr.addShake(24); ctx.sceneMgr.addFlash(0.4, AURA);
    },
    zone(ctx, z) {
      const R = z.radius || 320;
      const g = new THREE.Group();
      const field = new THREE.Mesh(new THREE.CircleGeometry(R, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(VOID), transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false }));
      field.rotation.x = -Math.PI / 2; field.position.y = 0.6; g.add(field);
      const star = new THREE.Mesh(new THREE.RingGeometry(R * 0.5, R * 0.56, 6, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(AURA), transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      star.rotation.x = -Math.PI / 2; star.position.y = 1.2; g.add(star);
      const rimRing = new THREE.Mesh(new THREE.RingGeometry(R * 0.9, R, 56), new THREE.MeshBasicMaterial({ color: new THREE.Color(STAR), transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      rimRing.rotation.x = -Math.PI / 2; rimRing.position.y = 1.4; g.add(rimRing);
      let t = 0, em = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt; star.rotation.z += dt * 1.2; rimRing.material.opacity = 0.4 + 0.18 * Math.sin(t * 4);
          field.material.opacity = 0.3 + 0.12 * Math.sin(t * 2);
          em -= dt;
          if (em <= 0) { em = 0.04; const a = Math.random() * 6.283, rr = Math.random() * R; ctx.particles.spawn({ x: g.position.x + Math.cos(a) * rr, y: 2, z: g.position.z + Math.sin(a) * rr, vx: 0, vy: 60 + Math.random() * 90, vz: 0, gravity: -14, drag: 0.6, life: 1.0, size: 3.5, color: Math.random() < 0.5 ? STAR : AURA, fade: true }); }
        },
      };
    },
  });
}
