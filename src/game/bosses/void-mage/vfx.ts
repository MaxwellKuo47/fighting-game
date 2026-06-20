// @ts-nocheck
// R8 虛空大魔導 技能特效。主題：虛空紫／星雲／符文金／奇點黑洞。
// 效能：一次性走粒子池＋自動回收 transient；zone 只建少量網格。純視覺層。
import * as THREE from 'three';
import { registerVfx } from '../../render3d/vfx/registry.js';
import { burst, ring, sphereFlash } from '../../render3d/vfx/lib.js';

const VOID = '#8e44ad', LILAC = '#c39bff', NEB = '#b14fd8', GOLD = '#ffd86a', DARK = '#1a0a2a';

export function loadVfx() {
  // 虛空彈：紫光虛空球（星點尾跡）+ 命中潑散
  registerVfx('boss_void_bolt', {
    projectile(ctx, pr) {
      const r = pr.radius || 14;
      const g = new THREE.Group();
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), new THREE.MeshStandardMaterial({ color: new THREE.Color(DARK), emissive: new THREE.Color(NEB), emissiveIntensity: 1.4, roughness: 0.4, transparent: true, opacity: 0.95 }));
      g.add(core);
      let t = 0, em = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt; core.rotation.y += dt * 5; core.rotation.x += dt * 3; core.scale.setScalar(1 + 0.14 * Math.sin(t * 16));
          em -= dt;
          if (em <= 0) { em = 0.04; ctx.particles.spawn({ x: g.position.x, y: g.position.y, z: g.position.z, vx: (Math.random() - 0.5) * 16, vy: (Math.random() - 0.5) * 16, vz: (Math.random() - 0.5) * 16, gravity: 0, drag: 2, life: 0.4, size: 2.6, color: Math.random() < 0.5 ? LILAC : NEB, fade: true }); }
        },
      };
    },
    onHit(ctx, f, c) {
      ring(ctx, c, { color: LILAC, from: 4, to: (f.radius || 14) * 2.4, life: 0.32, y: 2, alpha: 0.7 });
      burst(ctx, c, { color: [VOID, LILAC], count: 12, speed: 170, up: 20, life: 0.45, size: 3 });
    },
  });

  // 混沌符咒：大範圍旋轉紫色符文脈衝
  registerVfx('boss_void_scramble', {
    onCast(ctx, f, c) {
      const { THREE: T, addTransient } = ctx;
      const R = f.radius || 320;
      const sigil = new T.Mesh(new T.RingGeometry(0.66, 1, 6, 1), new T.MeshBasicMaterial({ color: new T.Color(GOLD), transparent: true, opacity: 0.7, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending }));
      sigil.rotation.x = -Math.PI / 2; sigil.position.set(c.x, 2, c.z);
      addTransient(sigil, 0.7, (m, t) => { m.scale.setScalar(R * (0.2 + 0.8 * t)); m.rotation.z += 0.18; m.material.opacity = 0.7 * (1 - t); });
      ring(ctx, c, { color: NEB, from: 20, to: R, life: 0.6, y: 3, alpha: 0.6, ease: true });
      sphereFlash(ctx, c, { color: LILAC, from: 8, to: 80, life: 0.34, alpha: 0.6 });
    },
  });

  // 奇點黑洞：暗核 + 旋轉吸積環 + 向內吸入粒子
  registerVfx('boss_void_blackhole', {
    zone(ctx, z) {
      const R = z.radius || 200;
      const g = new THREE.Group();
      const core = new THREE.Mesh(new THREE.SphereGeometry(R * 0.18, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(DARK), transparent: true, opacity: 0.95 }));
      core.position.y = R * 0.2; g.add(core);
      const disk = new THREE.Mesh(new THREE.RingGeometry(R * 0.2, R * 0.6, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(NEB), transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      disk.rotation.x = -Math.PI / 2.2; disk.position.y = R * 0.2; g.add(disk);
      const rimRing = new THREE.Mesh(new THREE.RingGeometry(R * 0.92, R, 44), new THREE.MeshBasicMaterial({ color: new THREE.Color(VOID), transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      rimRing.rotation.x = -Math.PI / 2; rimRing.position.y = 1; g.add(rimRing);
      let t = 0, em = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt; disk.rotation.z += dt * 2.4; core.scale.setScalar(1 + 0.1 * Math.sin(t * 6));
          em -= dt;
          if (em <= 0) { em = 0.03; const a = Math.random() * 6.283; const rr = R * (0.8 + Math.random() * 0.2); ctx.particles.spawn({ x: g.position.x + Math.cos(a) * rr, y: 2 + Math.random() * 30, z: g.position.z + Math.sin(a) * rr, vx: -Math.cos(a) * 200, vy: 20, vz: -Math.sin(a) * 200, gravity: 0, drag: 0.8, life: 0.5, size: 3, color: Math.random() < 0.5 ? LILAC : NEB, fade: true }); }
        },
      };
    },
  });

  // 時光倒流：紫色時空漣漪（環向內收回 + 反向粒子）
  registerVfx('boss_void_ult', {
    onCast(ctx, f, c) {
      const { THREE: T, addTransient } = ctx;
      const R = f.radius || 150;
      for (let k = 0; k < 3; k++) {
        const rp = new T.Mesh(new T.RingGeometry(0.9, 1, 48), new T.MeshBasicMaterial({ color: new T.Color(k % 2 ? LILAC : NEB), transparent: true, opacity: 0.8, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending }));
        rp.rotation.x = -Math.PI / 2; rp.position.set(c.x, 3 + k, c.z);
        addTransient(rp, 0.7, (m, t) => { m.scale.setScalar(R * (1 - 0.85 * t) + 6); m.material.opacity = 0.8 * (1 - t * 0.5); }); // 向內收回 = 倒流
      }
      sphereFlash(ctx, c, { color: GOLD, from: 6, to: 70, life: 0.36, alpha: 0.7 });
      // 反向吸回的星塵
      for (let i = 0; i < 30; i++) { const a = Math.random() * 6.283, rr = R * (0.5 + Math.random() * 0.5); ctx.particles.spawn({ x: c.x + Math.cos(a) * rr, y: 4, z: c.z + Math.sin(a) * rr, vx: -Math.cos(a) * 160, vy: 30, vz: -Math.sin(a) * 160, gravity: 0, drag: 1, life: 0.6, size: 3.4, color: Math.random() < 0.5 ? LILAC : GOLD, fade: true }); }
      ctx.sceneMgr.addShake(12); ctx.sceneMgr.addFlash(0.2, NEB);
    },
  });
}
