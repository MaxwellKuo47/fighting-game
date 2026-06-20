// @ts-nocheck
// R6 死靈樂章 技能特效。主題：幽紫／靈綠靈火／亡靈法陣。
// 效能：一次性走粒子池＋自動回收 transient；zone/projectile 只建少量網格。純視覺層。
import * as THREE from 'three';
import { registerVfx } from '../../render3d/vfx/registry.js';
import { burst, ring, column, sphereFlash } from '../../render3d/vfx/lib.js';

const PURPLE = '#7d5fff', SOUL = '#39ff88', LILAC = '#b39dff';

export function loadVfx() {
  // 靈魂彈：綠靈火彈（紫色尾跡）+ 命中潑散
  registerVfx('boss_necro_bolt', {
    projectile(ctx, pr) {
      const r = pr.radius || 12;
      const g = new THREE.Group();
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), new THREE.MeshStandardMaterial({ color: new THREE.Color(SOUL), emissive: new THREE.Color(SOUL), emissiveIntensity: 1.6, roughness: 0.4, transparent: true, opacity: 0.92 }));
      g.add(core);
      let t = 0, em = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt; core.rotation.y += dt * 5; core.scale.setScalar(1 + 0.15 * Math.sin(t * 16));
          em -= dt;
          if (em <= 0) { em = 0.04; ctx.particles.spawn({ x: g.position.x, y: g.position.y, z: g.position.z, vx: (Math.random() - 0.5) * 18, vy: (Math.random() - 0.5) * 18, vz: (Math.random() - 0.5) * 18, gravity: 0, drag: 2, life: 0.4, size: 2.8, color: Math.random() < 0.6 ? PURPLE : SOUL, fade: true }); }
        },
      };
    },
    onHit(ctx, f, c) {
      ring(ctx, c, { color: SOUL, from: 4, to: (f.radius || 12) * 2.4, life: 0.3, y: 2, alpha: 0.7 });
      burst(ctx, c, { color: [SOUL, PURPLE], count: 12, speed: 160, up: 20, life: 0.45, size: 3 });
    },
  });

  // 亡者召集：地面亡靈法陣 + 升起綠靈
  registerVfx('boss_necro_summon', {
    onCast(ctx, f, c) {
      const { THREE: T, addTransient } = ctx;
      // 旋轉法陣
      const circ = new T.Mesh(new T.RingGeometry(0.7, 1, 6, 1), new T.MeshBasicMaterial({ color: new T.Color(SOUL), transparent: true, opacity: 0.8, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending }));
      circ.rotation.x = -Math.PI / 2; circ.position.set(c.x, 2, c.z);
      addTransient(circ, 0.6, (m, t) => { m.scale.setScalar(40 + 90 * t); m.rotation.z += 0.1; m.material.opacity = 0.8 * (1 - t); });
      column(ctx, c, { color: [SOUL, PURPLE], count: 20, radius: 80, speed: 150, life: 0.9, size: 4 });
      ring(ctx, c, { color: PURPLE, from: 10, to: 130, life: 0.5, y: 2, alpha: 0.6 });
    },
    onHit(ctx, f, c) {
      burst(ctx, c, { color: [SOUL, LILAC], count: 8, speed: 120, up: 40, life: 0.5, size: 3 });
    },
  });

  // 亡靈護壁：靈魂護盾（環繞綠紫靈火）
  registerVfx('boss_necro_shield', {
    onCast(ctx, f, c) {
      sphereFlash(ctx, c, { color: LILAC, from: 8, to: 70, life: 0.4, alpha: 0.6 });
      ring(ctx, c, { color: PURPLE, from: 6, to: 90, life: 0.5, y: 2, alpha: 0.6 });
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * 6.283, rr = 40 + Math.random() * 40;
        ctx.particles.spawn({ x: c.x + Math.cos(a) * rr, y: 0, z: c.z + Math.sin(a) * rr, vx: 0, vy: 90 + Math.random() * 120, vz: 0, gravity: -30, drag: 0.6, life: 0.6 + Math.random() * 0.4, size: 3, color: Math.random() < 0.6 ? SOUL : LILAC, fade: true });
      }
    },
  });

  // 安魂彌撒：跟隨的亡靈領域（紫綠法陣 + 升騰靈魂）
  registerVfx('boss_necro_ult', {
    onCast(ctx, f, c) {
      sphereFlash(ctx, c, { color: SOUL, from: 8, to: 90, life: 0.36, alpha: 0.7 });
      burst(ctx, c, { color: [SOUL, PURPLE, LILAC], count: 30, speed: 220, up: 60, life: 0.7, size: 4.5 });
      ctx.sceneMgr.addShake(10); ctx.sceneMgr.addFlash(0.18, PURPLE);
    },
    zone(ctx, z) {
      const R = z.radius || 240;
      const g = new THREE.Group();
      const field = new THREE.Mesh(new THREE.CircleGeometry(R, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(PURPLE), transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      field.rotation.x = -Math.PI / 2; field.position.y = 1; g.add(field);
      const rune = new THREE.Mesh(new THREE.RingGeometry(R * 0.55, R * 0.62, 6, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(SOUL), transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      rune.rotation.x = -Math.PI / 2; rune.position.y = 1.5; g.add(rune);
      let t = 0, em = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt; rune.rotation.z += dt * 0.6; rune.material.opacity = 0.4 + 0.16 * Math.sin(t * 3);
          em -= dt;
          if (em <= 0) { em = 0.05; const a = Math.random() * 6.283, rr = Math.random() * R; ctx.particles.spawn({ x: g.position.x + Math.cos(a) * rr, y: 2, z: g.position.z + Math.sin(a) * rr, vx: 0, vy: 50 + Math.random() * 70, vz: 0, gravity: -16, drag: 0.7, life: 1.0, size: 3.5, color: Math.random() < 0.6 ? SOUL : LILAC, fade: true }); }
        },
      };
    },
  });
}
