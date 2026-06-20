// @ts-nocheck
// R4 霜雪刺客 技能特效。主題：冰藍／霜白／鏡花冰晶。
// 效能：一次性走粒子池＋自動回收 transient；zone 只建少量網格。純視覺層。
import * as THREE from 'three';
import { registerVfx } from '../../render3d/vfx/registry.js';
import { slashBlade, cone, burst, ring, sphereFlash } from '../../render3d/vfx/lib.js';

const ICE = '#74e0ff', FROST = '#e0f8ff', GLOW = '#bfefff', DEEP = '#49d0ff';
const shardMat = () => new THREE.MeshStandardMaterial({ color: new THREE.Color(FROST), emissive: new THREE.Color(DEEP), emissiveIntensity: 1.2, metalness: 0.4, roughness: 0.2, transparent: true, opacity: 0.9 });
const addRing = (color, op = 0.7) => new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));

export function loadVfx() {
  // 寒霜疾刺：雙層冰藍快斬 + 碎冰
  registerVfx('boss_frost_slash', {
    onCast(ctx, f, c) {
      slashBlade(ctx, c, f.facing, { color: [GLOW, ICE], len: (f.range || 70) * 1.35, swing: 1.15, life: 0.24, y: 14, sparkCount: 12, alpha: 0.96 });
      slashBlade(ctx, c, f.facing, { color: [FROST, '#ffffff'], len: (f.range || 70) * 1.0, swing: 1.0, life: 0.18, y: 16, sparkCount: 6, alpha: 0.85 });
      cone(ctx, c, f.facing, { color: [ICE, FROST, GLOW], count: 16, speed: 260, spread: 0.6, up: 20, life: 0.45, size: 3.4 });
    },
  });

  // 霜影突襲：瞬移霜煙殘影 + 冰晶迸散
  registerVfx('boss_frost_blink', {
    onCast(ctx, f, c) {
      const { THREE: T, addTransient } = ctx;
      sphereFlash(ctx, c, { color: GLOW, from: 4, to: 50, life: 0.28, alpha: 0.78 });
      ring(ctx, c, { color: ICE, from: 6, to: 84, life: 0.36, y: 2, alpha: 0.75, ease: true });
      burst(ctx, c, { color: [ICE, FROST, GLOW], count: 24, speed: 220, up: 50, life: 0.55, size: 3.6 });
      // 霜煙殘影：殘影冰晶向上飄散淡出
      for (let i = 0; i < 5; i++) {
        const a = Math.random() * 6.283; const sh = new T.Mesh(new T.TetrahedronGeometry(5), shardMat()); sh.position.set(c.x, c.y, c.z);
        addTransient(sh, 0.5, (m, t) => { m.position.set(c.x + Math.cos(a) * 50 * t, c.y + 30 * t, c.z + Math.sin(a) * 50 * t); m.rotation.y += 0.2; m.material.opacity = 0.8 * (1 - t); });
      }
    },
  });

  // 鏡花幻影：鏡面冰晶大炸裂（召喚分身）
  registerVfx('boss_frost_clones', {
    onCast(ctx, f, c) {
      const { THREE: T, addTransient } = ctx;
      sphereFlash(ctx, c, { color: '#ffffff', from: 6, to: 62, life: 0.24, alpha: 0.92 });
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * 6.283; const shard = new T.Mesh(new T.TetrahedronGeometry(8), shardMat()); shard.position.set(c.x, c.y, c.z);
        addTransient(shard, 0.55, (m, t) => { const d = 125 * t; m.position.set(c.x + Math.cos(a) * d, c.y + 14 * Math.sin(t * 3), c.z + Math.sin(a) * d); m.rotation.x += 0.22; m.rotation.y += 0.2; m.material.opacity = 0.9 * (1 - t); });
      }
      ring(ctx, c, { color: GLOW, from: 8, to: 140, life: 0.45, y: 2, alpha: 0.75, ease: true });
      ring(ctx, c, { color: ICE, from: 6, to: 90, life: 0.35, y: 3, alpha: 0.6 });
      ctx.sceneMgr.addFlash(0.2, GLOW);
    },
  });

  // 絕對冰域：跟隨的冰封領域（霜地 + 旋轉冰渦 + 放射冰晶 + 厚落雪 + 凍結脈衝）
  registerVfx('boss_frost_ult', {
    onCast(ctx, f, c) {
      sphereFlash(ctx, c, { color: GLOW, from: 6, to: 96, life: 0.36, alpha: 0.85 });
      ring(ctx, c, { color: '#ffffff', from: 100, to: 14, life: 0.4, y: 4, alpha: 0.7 }); // 凍結內縮
      burst(ctx, c, { color: [ICE, FROST, GLOW], count: 32, speed: 220, up: 50, life: 0.65, size: 4.2 });
      ctx.sceneMgr.addShake(11); ctx.sceneMgr.addFlash(0.22, ICE);
    },
    zone(ctx, z) {
      const R = z.radius || 220;
      const g = new THREE.Group();
      const field = new THREE.Mesh(new THREE.CircleGeometry(R, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(ICE), transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      field.rotation.x = -Math.PI / 2; field.position.y = 1; g.add(field);
      const frostRing = addRing(GLOW, 0.5); frostRing.scale.setScalar(R); frostRing.position.y = 1.5; g.add(frostRing);
      // 旋轉冰渦（六角環，反向轉）
      const vortex = new THREE.Mesh(new THREE.RingGeometry(R * 0.45, R * 0.52, 6, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(DEEP), transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      vortex.rotation.x = -Math.PI / 2; vortex.position.y = 1.8; g.add(vortex);
      const spikes = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * 6.283; const rr = R * (0.55 + (i % 2) * 0.2);
        const sp = new THREE.Mesh(new THREE.ConeGeometry(R * 0.04, R * 0.32, 4), shardMat());
        sp.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); sp.userData = { ph: i }; g.add(sp); spikes.push(sp);
      }
      let t = 0, em = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt; g.rotation.y += dt * 0.5; vortex.rotation.z -= dt * 1.2;
          frostRing.material.opacity = 0.4 + 0.18 * Math.sin(t * 3); vortex.material.opacity = 0.4 + 0.18 * Math.sin(t * 4);
          for (const sp of spikes) sp.scale.y = 0.7 + 0.35 * Math.sin(t * 4 + sp.userData.ph);
          em -= dt;
          if (em <= 0) { em = 0.035; const a = Math.random() * 6.283, rr = Math.random() * R; ctx.particles.spawn({ x: g.position.x + Math.cos(a) * rr, y: 120, z: g.position.z + Math.sin(a) * rr, vx: 0, vy: -70 - Math.random() * 50, vz: 0, gravity: 0, drag: 0.4, life: 1.0, size: 3 + Math.random() * 1.5, color: Math.random() < 0.6 ? FROST : GLOW, fade: true }); }
        },
      };
    },
  });
}
