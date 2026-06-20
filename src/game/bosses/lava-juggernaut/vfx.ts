// @ts-nocheck
// R3 熔岩鐵衛 技能特效。主題：熔岩橘紅／餘燼／黑鐵焦土。
// 效能：一次性走粒子池(particles)＋自動回收 transient；zone 只建少量網格，由 entities3d dispose。
import * as THREE from 'three';
import { registerVfx } from '../../render3d/vfx/registry.js';
import { slashBlade, cone, burst, ring, column } from '../../render3d/vfx/lib.js';

const LAVA = '#ff5a1f', EMBER = '#ff3010', GLOW = '#ff7043', SPARK = '#ffcf6b', ASH = '#3a2218';

export function loadVfx() {
  // 熔岩劈斬：熾紅刀光 + 餘燼噴濺
  registerVfx('boss_juggernaut_slash', {
    onCast(ctx, f, c) {
      slashBlade(ctx, c, f.facing, { color: [GLOW, LAVA], len: (f.range || 120) * 1.1, swing: 1.5, life: 0.3, y: 16, sparkCount: 12, alpha: 0.95 });
      cone(ctx, c, f.facing, { color: [LAVA, EMBER, SPARK], count: 16, speed: 240, spread: 0.6, up: 20, life: 0.45, size: 3.6 });
      ctx.sceneMgr.addShake(5);
    },
  });

  // 烈焰衝鋒：起步噴火前衝 + 撞擊爆燃
  registerVfx('boss_juggernaut_charge', {
    onCast(ctx, f, c) {
      burst(ctx, c, { color: [LAVA, EMBER], count: 18, speed: 160, up: 30, life: 0.4, size: 4 });
      cone(ctx, c, f.facing, { color: [LAVA, SPARK], count: 20, speed: 320, spread: 0.4, up: 10, life: 0.5, size: 4 });
    },
    onHit(ctx, f, c) {
      ring(ctx, c, { color: LAVA, from: 10, to: (f.radius || 70) * 1.6, life: 0.4, y: 2, alpha: 0.85, ease: true });
      burst(ctx, c, { color: [LAVA, EMBER, SPARK], count: 26, speed: 260, up: 60, flat: true, life: 0.55, size: 4.5 });
      ctx.sceneMgr.addShake(14); ctx.sceneMgr.addFlash(0.2, LAVA);
    },
  });

  // 震地烈焰：焦土 + 放射熔岩裂縫 + 上竄火舌
  registerVfx('boss_juggernaut_quake', {
    zone(ctx, z) {
      const R = z.radius || 150;
      const g = new THREE.Group();
      const scorch = new THREE.Mesh(new THREE.CircleGeometry(R, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(ASH), transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
      scorch.rotation.x = -Math.PI / 2; scorch.position.y = 0.5; g.add(scorch);
      const cracks = [];
      const N = 8;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * 6.283;
        const cr = new THREE.Mesh(new THREE.PlaneGeometry(R * 0.95, R * 0.09), new THREE.MeshBasicMaterial({ color: new THREE.Color(LAVA), transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
        cr.rotation.x = -Math.PI / 2; cr.rotation.z = a; cr.position.set(Math.cos(a) * R * 0.46, 0.7, Math.sin(a) * R * 0.46); g.add(cr); cracks.push(cr);
      }
      let t = 0, em = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt;
          for (const cr of cracks) cr.material.opacity = 0.5 + 0.3 * Math.sin(t * 6 + cr.rotation.z);
          em -= dt;
          if (em <= 0) { em = 0.05; const a = Math.random() * 6.283, rr = Math.random() * R * 0.9; ctx.particles.spawn({ x: g.position.x + Math.cos(a) * rr, y: 2, z: g.position.z + Math.sin(a) * rr, vx: (Math.random() - 0.5) * 20, vy: 80 + Math.random() * 120, vz: (Math.random() - 0.5) * 20, gravity: -30, drag: 1.3, life: 0.4 + Math.random() * 0.3, size: 3 + Math.random() * 3, color: Math.random() < 0.5 ? LAVA : SPARK, fade: true }); }
        },
      };
    },
  });

  // 熔岩噴發：地表噴出熔岩火柱（多處散落）+ 施放爆燃
  registerVfx('boss_juggernaut_ult', {
    onCast(ctx, f, c) {
      burst(ctx, c, { color: [LAVA, EMBER], count: 28, speed: 240, up: 70, life: 0.6, size: 5 });
      ctx.sceneMgr.addShake(14); ctx.sceneMgr.addFlash(0.22, LAVA);
    },
    zone(ctx, z) {
      const R = z.radius || 120;
      const g = new THREE.Group();
      const ringMesh = new THREE.Mesh(new THREE.RingGeometry(R * 0.8, R, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(LAVA), transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      ringMesh.rotation.x = -Math.PI / 2; ringMesh.position.y = 1; g.add(ringMesh);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.45, R * 0.7, R * 1.6, 12, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(GLOW), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      col.position.y = R * 0.8; g.add(col);
      let t = 0, em = 0, erupted = false;
      return {
        object3D: g,
        update(dt) {
          t += dt;
          const e = Math.min(1, t / 0.3);
          col.material.opacity = Math.max(0, 0.7 * e * (1 - Math.max(0, (t - 0.4) / 0.7)));
          col.scale.y = 0.4 + e;
          ringMesh.material.opacity = Math.max(0, 0.8 * (1 - t));
          if (!erupted && t > 0.02) { erupted = true; column(ctx, { x: g.position.x, y: 0, z: g.position.z }, { color: [LAVA, SPARK], count: 24, radius: R * 0.5, speed: 300, life: 0.8, size: 5 }); }
          em -= dt;
          if (em <= 0) { em = 0.06; const a = Math.random() * 6.283, rr = Math.random() * R * 0.6; ctx.particles.spawn({ x: g.position.x + Math.cos(a) * rr, y: 2, z: g.position.z + Math.sin(a) * rr, vx: (Math.random() - 0.5) * 30, vy: 140 + Math.random() * 160, vz: (Math.random() - 0.5) * 30, gravity: 60, drag: 1, life: 0.6, size: 4, color: Math.random() < 0.5 ? LAVA : EMBER, fade: true }); }
        },
      };
    },
  });
}
