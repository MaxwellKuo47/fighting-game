// @ts-nocheck
// R1 巨木傀儡 技能特效。主題：樹幹／苔蘚／藤根／翠綠生命光。
// 效能：一次性用粒子池(particles)＋自動回收的 addTransient；持續型(zone)只建少量網格、
// 由 entities3d 負責 dispose。純視覺層，不進網路協定。
import * as THREE from 'three';
import { registerVfx } from '../../render3d/vfx/registry.js';
import { slashBlade, cone, burst } from '../../render3d/vfx/lib.js';

const BARK = '#6b4a2b', BARKD = '#4a3220', LEAF = '#4a7a2c', LEAFB = '#7ac050', LIFE = '#9acd32';

const matBark = () => new THREE.MeshStandardMaterial({ color: BARK, roughness: 0.95, metalness: 0 });
const matLeaf = (c = LEAF) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, emissive: new THREE.Color('#1c3a12'), emissiveIntensity: 0.3 });

export function loadVfx() {
  // 橫掃巨臂：揮出一根帶葉樹幹橫掃 + 綠褐刀光 + 落葉木屑
  registerVfx('boss_golem_sweep', {
    onCast(ctx, f, c) {
      const { addTransient, sceneMgr } = ctx;
      const reach = (f.range || 200) * 0.95;
      slashBlade(ctx, c, f.facing, { color: [LEAFB, BARK], len: reach, swing: 1.7, life: 0.34, y: 16, sparkCount: 12, alpha: 0.92 });
      // 橫掃的樹幹枝
      const branch = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 6, reach, 6), matBark());
      trunk.rotation.z = Math.PI / 2; trunk.position.x = reach * 0.5; branch.add(trunk);
      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(6 + Math.random() * 4, 0), matLeaf(i % 2 ? LEAF : LEAFB));
        leaf.position.set(reach * (0.55 + i * 0.1), (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 8); branch.add(leaf);
      }
      branch.position.set(c.x, 16, c.z);
      const sw = f.arc >= 6 ? 6.283 : 1.8; const start = -f.facing - sw * 0.5;
      branch.traverse((o) => { if (o.material) { o.material.transparent = true; } });
      addTransient(branch, 0.34, (g, t) => {
        g.rotation.y = start + sw * t;
        g.traverse((o) => { if (o.material) o.material.opacity = 1 - t * t; });
      });
      cone(ctx, c, f.facing, { color: [LEAF, LEAFB, BARK], count: 16, speed: 210, spread: 0.85, up: 30, life: 0.5, size: 4 });
      sceneMgr.addShake(6);
    },
  });

  // 巨力砸地：樹樁從天砸落 → 坑洞 + 木石碎屑震波
  registerVfx('boss_golem_slam', {
    zone(ctx, z) {
      const { particles, sceneMgr } = ctx;
      const R = z.radius || 130;
      const g = new THREE.Group();
      const crater = new THREE.Mesh(new THREE.CircleGeometry(R, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color('#332313'), transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
      crater.rotation.x = -Math.PI / 2; crater.position.y = 0.5; g.add(crater);
      const rim = new THREE.Mesh(new THREE.RingGeometry(R * 0.86, R, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(LEAFB), transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      rim.rotation.x = -Math.PI / 2; rim.position.y = 0.7; g.add(rim);
      // 砸落樹樁
      const stump = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.32, R * 0.4, R * 0.8, 8), matBark());
      stump.position.y = R * 1.6; g.add(stump);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.36, R * 0.3, R * 0.18, 8), matLeaf()); cap.position.y = R * 1.6 + R * 0.45; g.add(cap);
      let t = 0, hit = false;
      return {
        object3D: g,
        update(dt) {
          t += dt;
          if (!hit) {
            const drop = Math.min(1, t / 0.14);
            const y = R * 1.6 * (1 - drop * drop);
            stump.position.y = y; cap.position.y = y + R * 0.49;
            if (drop >= 1) {
              hit = true;
              burst(ctx, { x: g.position.x, y: 4, z: g.position.z }, { color: [BARK, LEAF, LEAFB], count: 26, speed: 240, up: 60, flat: true, life: 0.55, size: 5 });
              sceneMgr.addShake(13); sceneMgr.addFlash(0.12, LEAFB);
            }
          } else {
            stump.material.opacity = (stump.material.transparent = true, Math.max(0, 1 - (t - 0.14) * 2));
            cap.material.opacity = (cap.material.transparent = true, Math.max(0, 1 - (t - 0.14) * 2));
          }
          rim.material.opacity = Math.max(0, 0.85 * (1 - t * 1.6));
        },
      };
    },
  });

  // 纏根束縛：地面長出一圈藤根，向中心彎曲纏縛
  registerVfx('boss_golem_roots', {
    zone(ctx, z) {
      const { particles } = ctx;
      const R = z.radius || 200;
      const g = new THREE.Group();
      const ringMesh = new THREE.Mesh(new THREE.RingGeometry(R * 0.9, R, 44), new THREE.MeshBasicMaterial({ color: new THREE.Color(LEAF), transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      ringMesh.rotation.x = -Math.PI / 2; ringMesh.position.y = 1; g.add(ringMesh);
      const roots = [];
      const N = 10;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const rr = R * (0.5 + Math.random() * 0.4);
        const root = new THREE.Mesh(new THREE.ConeGeometry(R * 0.05, R * 0.55, 5), matBark());
        root.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr);
        root.userData = { a, baseH: R * 0.55, lean: 0.4 + Math.random() * 0.3 };
        g.add(root); roots.push(root);
      }
      let t = 0, em = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt;
          const grow = Math.min(1, t / 0.3);
          for (const r of roots) {
            r.scale.set(grow, grow, grow);
            r.position.y = r.userData.baseH * 0.5 * grow;
            // 向中心彎曲（朝內傾）
            r.rotation.z = Math.cos(r.userData.a) * r.userData.lean * grow;
            r.rotation.x = -Math.sin(r.userData.a) * r.userData.lean * grow;
          }
          ringMesh.material.opacity = 0.32 + 0.14 * Math.sin(t * 4);
          em -= dt;
          if (em <= 0) {
            em = 0.1;
            const a = Math.random() * Math.PI * 2, rr = Math.random() * R * 0.7;
            particles.spawn({ x: g.position.x + Math.cos(a) * rr, y: 2, z: g.position.z + Math.sin(a) * rr, vx: 0, vy: 40 + Math.random() * 50, vz: 0, gravity: -10, drag: 1, life: 0.6, size: 3.5, color: Math.random() < 0.6 ? LEAFB : LIFE, fade: true });
          }
        },
      };
    },
  });

  // 森羅旋掃：數棵巨樹繞中心高速旋轉橫掃 + 翠綠衝擊環
  registerVfx('boss_golem_ult', {
    zone(ctx, z) {
      const { sceneMgr } = ctx;
      const R = z.radius || 200;
      const g = new THREE.Group();
      const shock = new THREE.Mesh(new THREE.RingGeometry(0.84, 1, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(LIFE), transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      shock.rotation.x = -Math.PI / 2; shock.position.y = 4; g.add(shock);
      const core = new THREE.Mesh(new THREE.RingGeometry(R * 0.92, R, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(LIFE), transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      core.rotation.x = -Math.PI / 2; core.position.y = 2; g.add(core);
      const trees = [];
      const N = 4;
      for (let i = 0; i < N; i++) {
        const tree = new THREE.Group();
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.05, R * 0.08, R * 0.7, 6), matBark()); tr.position.y = R * 0.35; tree.add(tr);
        const cv = new THREE.Mesh(new THREE.IcosahedronGeometry(R * 0.2, 0), matLeaf(i % 2 ? LEAF : LEAFB)); cv.position.y = R * 0.72; tree.add(cv);
        tree.position.set(Math.cos((i / N) * 6.283) * R * 0.7, 0, Math.sin((i / N) * 6.283) * R * 0.7);
        g.add(tree); trees.push(tree);
      }
      sceneMgr.addShake(16); sceneMgr.addFlash(0.2, LIFE);
      let t = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt;
          const sp = Math.min(1, t / 0.6); shock.scale.setScalar(R * (0.3 + sp)); shock.material.opacity = 0.85 * (1 - sp);
          const spin = t * 6;
          for (let i = 0; i < trees.length; i++) {
            const a = (i / trees.length) * 6.283 + spin;
            trees[i].position.set(Math.cos(a) * R * 0.72, 0, Math.sin(a) * R * 0.72);
            trees[i].rotation.y = -a;
          }
          core.rotation.z += dt * 3;
          core.material.opacity = 0.4 + 0.2 * Math.sin(t * 8);
        },
      };
    },
  });
}
