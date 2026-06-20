// @ts-nocheck
// R4 霜雪刺客 技能特效。主題：冰藍／霜白／鏡花冰晶。
// 效能：一次性走粒子池＋自動回收 transient；zone 只建少量網格。純視覺層。
import * as THREE from 'three';
import { registerVfx } from '../../render3d/vfx/registry.js';
import { slashBlade, cone, burst, ring, sphereFlash } from '../../render3d/vfx/lib.js';

const ICE = '#74e0ff', FROST = '#e0f8ff', GLOW = '#bfefff', DEEP = '#49d0ff';

export function loadVfx() {
  // 寒霜疾刺：銳利冰藍快斬 + 碎冰
  registerVfx('boss_frost_slash', {
    onCast(ctx, f, c) {
      slashBlade(ctx, c, f.facing, { color: [GLOW, ICE], len: (f.range || 70) * 1.25, swing: 1.1, life: 0.22, y: 14, sparkCount: 9, alpha: 0.95 });
      cone(ctx, c, f.facing, { color: [ICE, FROST], count: 12, speed: 240, spread: 0.55, up: 18, life: 0.4, size: 3 });
    },
  });

  // 霜影突襲：瞬移霜煙殘影 + 冰晶迸散
  registerVfx('boss_frost_blink', {
    onCast(ctx, f, c) {
      sphereFlash(ctx, c, { color: GLOW, from: 4, to: 44, life: 0.26, alpha: 0.7 });
      ring(ctx, c, { color: ICE, from: 6, to: 70, life: 0.34, y: 2, alpha: 0.7 });
      burst(ctx, c, { color: [ICE, FROST, GLOW], count: 18, speed: 200, up: 40, life: 0.5, size: 3.4 });
    },
  });

  // 鏡花幻影：鏡面冰晶炸裂（召喚分身）
  registerVfx('boss_frost_clones', {
    onCast(ctx, f, c) {
      const { THREE: T, addTransient } = ctx;
      // 數片鏡面冰晶向外飛散
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * 6.283;
        const shard = new T.Mesh(new T.TetrahedronGeometry(7), new T.MeshStandardMaterial({ color: new T.Color(FROST), emissive: new T.Color(DEEP), emissiveIntensity: 1.2, metalness: 0.4, roughness: 0.2, transparent: true, opacity: 0.9 }));
        shard.position.set(c.x, c.y, c.z);
        addTransient(shard, 0.5, (m, t) => {
          const d = 90 * t;
          m.position.set(c.x + Math.cos(a) * d, c.y + 10 * Math.sin(t * 3), c.z + Math.sin(a) * d);
          m.rotation.x += 0.2; m.rotation.y += 0.18; m.material.opacity = 0.9 * (1 - t);
        });
      }
      ring(ctx, c, { color: GLOW, from: 8, to: 120, life: 0.42, y: 2, alpha: 0.7, ease: true });
      ctx.sceneMgr.addFlash(0.16, GLOW);
    },
  });

  // 絕對冰域：跟隨魔王的冰封領域（霜地 + 旋轉冰環 + 落雪）
  registerVfx('boss_frost_ult', {
    onCast(ctx, f, c) {
      sphereFlash(ctx, c, { color: GLOW, from: 6, to: 80, life: 0.32, alpha: 0.8 });
      burst(ctx, c, { color: [ICE, FROST, GLOW], count: 28, speed: 210, up: 50, life: 0.6, size: 4 });
      ctx.sceneMgr.addShake(10); ctx.sceneMgr.addFlash(0.2, ICE);
    },
    zone(ctx, z) {
      const R = z.radius || 220;
      const g = new THREE.Group();
      const field = new THREE.Mesh(new THREE.CircleGeometry(R, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(ICE), transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      field.rotation.x = -Math.PI / 2; field.position.y = 1; g.add(field);
      const frostRing = new THREE.Mesh(new THREE.RingGeometry(R * 0.82, R, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(GLOW), transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      frostRing.rotation.x = -Math.PI / 2; frostRing.position.y = 1.5; g.add(frostRing);
      // 放射冰晶
      const spikes = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 6.283;
        const sp = new THREE.Mesh(new THREE.ConeGeometry(R * 0.04, R * 0.3, 4), new THREE.MeshStandardMaterial({ color: new THREE.Color(FROST), emissive: new THREE.Color(DEEP), emissiveIntensity: 0.8, roughness: 0.3, transparent: true, opacity: 0.85 }));
        sp.position.set(Math.cos(a) * R * 0.7, 0, Math.sin(a) * R * 0.7); g.add(sp); spikes.push(sp);
      }
      let t = 0, em = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt;
          g.rotation.y += dt * 0.5;
          frostRing.material.opacity = 0.4 + 0.18 * Math.sin(t * 3);
          for (const sp of spikes) sp.scale.y = 0.7 + 0.3 * Math.sin(t * 4 + sp.position.x);
          em -= dt;
          if (em <= 0) { em = 0.05; const a = Math.random() * 6.283, rr = Math.random() * R; ctx.particles.spawn({ x: g.position.x + Math.cos(a) * rr, y: 120, z: g.position.z + Math.sin(a) * rr, vx: 0, vy: -60 - Math.random() * 40, vz: 0, gravity: 0, drag: 0.4, life: 1.0, size: 3, color: Math.random() < 0.6 ? FROST : GLOW, fade: true }); }
        },
      };
    },
  });
}
