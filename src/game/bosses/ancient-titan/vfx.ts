// @ts-nocheck
// R5 廢墟古代巨兵 技能特效。主題：石塵震波／符文藍雷射／橙焰巨鋸／核心過載藍白爆。
// 效能：一次性走粒子池＋自動回收 transient；zone 只建少量網格、update 內輕量更新。純視覺層。
import * as THREE from 'three';
import { registerVfx } from '../../render3d/vfx/registry.js';
import { burst, ring, column, sphereFlash } from '../../render3d/vfx/lib.js';

const STONE = '#b0a99f', RUNE = '#49d0ff', RUNED = '#9fe8ff', SAW = '#ff7043', SPARK = '#ffd166';

export function loadVfx() {
  // 踏地震波：擴張石塵環 + 揚塵 + 震動
  registerVfx('boss_titan_stomp', {
    zone(ctx, z) {
      const R = z.radius || 160;
      const g = new THREE.Group();
      const wave = new THREE.Mesh(new THREE.RingGeometry(0.84, 1, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(STONE), transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      wave.rotation.x = -Math.PI / 2; wave.position.y = 2; g.add(wave);
      let t = 0, kicked = false;
      return {
        object3D: g,
        update(dt) {
          t += dt;
          const e = Math.min(1, t / 0.4);
          wave.scale.setScalar(R * (0.2 + e)); wave.material.opacity = 0.85 * (1 - e);
          if (!kicked) { kicked = true; burst(ctx, { x: g.position.x, y: 3, z: g.position.z }, { color: [STONE, '#7d7066'], count: 22, speed: 200, up: 50, flat: true, life: 0.5, size: 5 }); ctx.sceneMgr.addShake(11); }
        },
      };
    },
  });

  // 殲滅雷射：符文藍能量光束（隨 zone 掃過）+ 灼地藍火星
  registerVfx('boss_titan_laser', {
    zone(ctx, z) {
      const R = z.radius || 90;
      const g = new THREE.Group();
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.7, R * 0.5, 220, 14, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color(RUNE), transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      beam.position.y = 110; g.add(beam);
      const coreBeam = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.3, R * 0.2, 220, 10, 1, true), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff'), transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      coreBeam.position.y = 110; g.add(coreBeam);
      const spot = new THREE.Mesh(new THREE.CircleGeometry(R, 28), new THREE.MeshBasicMaterial({ color: new THREE.Color(RUNED), transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      spot.rotation.x = -Math.PI / 2; spot.position.y = 1; g.add(spot);
      let t = 0, em = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt;
          const pulse = 0.85 + 0.15 * Math.sin(t * 20);
          beam.scale.x = beam.scale.z = pulse; coreBeam.scale.x = coreBeam.scale.z = pulse;
          spot.material.opacity = 0.5 + 0.2 * Math.sin(t * 12);
          em -= dt;
          if (em <= 0) { em = 0.04; ctx.particles.spawn({ x: g.position.x + (Math.random() - 0.5) * R, y: 2, z: g.position.z + (Math.random() - 0.5) * R, vx: 0, vy: 120 + Math.random() * 140, vz: 0, gravity: -10, drag: 0.8, life: 0.5, size: 3.5, color: Math.random() < 0.5 ? RUNE : RUNED, fade: true }); }
        },
      };
    },
  });

  // 旋轉巨鋸：橙焰鋸盤旋轉（隨 zone 掃過）+ 火星
  registerVfx('boss_titan_saw', {
    zone(ctx, z) {
      const R = z.radius || 150;
      const g = new THREE.Group();
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 6, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(SAW), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      disc.position.y = 6; g.add(disc);
      const teeth = new THREE.Mesh(new THREE.TorusGeometry(R, R * 0.12, 4, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(SPARK), transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }));
      teeth.rotation.x = -Math.PI / 2; teeth.position.y = 6; g.add(teeth);
      let t = 0, em = 0;
      return {
        object3D: g,
        update(dt) {
          t += dt; disc.rotation.y += dt * 16; teeth.rotation.z += dt * 16;
          teeth.material.opacity = 0.6 + 0.2 * Math.sin(t * 24);
          em -= dt;
          if (em <= 0) { em = 0.04; const a = Math.random() * 6.283; ctx.particles.spawn({ x: g.position.x + Math.cos(a) * R, y: 6, z: g.position.z + Math.sin(a) * R, vx: Math.cos(a) * 120, vy: 40 + Math.random() * 80, vz: Math.sin(a) * 120, gravity: 160, drag: 2, life: 0.4, size: 3, color: Math.random() < 0.5 ? SAW : SPARK, fade: true }); }
        },
      };
    },
  });

  // 核心過載：符文藍白能量總爆發
  registerVfx('boss_titan_ult', {
    onCast(ctx, f, c) {
      sphereFlash(ctx, c, { color: '#ffffff', from: 8, to: 90, life: 0.34, alpha: 0.95 });
      burst(ctx, c, { color: [RUNE, RUNED, '#ffffff'], count: 36, speed: 280, up: 80, life: 0.7, size: 5 });
      ctx.sceneMgr.addShake(20); ctx.sceneMgr.addFlash(0.32, RUNE);
    },
    zone(ctx, z) {
      const R = z.radius || 260;
      const g = new THREE.Group();
      const ringMesh = new THREE.Mesh(new THREE.RingGeometry(R * 0.85, R, 56), new THREE.MeshBasicMaterial({ color: new THREE.Color(RUNE), transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      ringMesh.rotation.x = -Math.PI / 2; ringMesh.position.y = 2; g.add(ringMesh);
      let t = 0, kicked = false;
      return {
        object3D: g,
        update(dt) {
          t += dt;
          ringMesh.rotation.z += dt * 2; ringMesh.material.opacity = Math.max(0, 0.7 * (1 - t));
          if (!kicked) { kicked = true; column(ctx, { x: g.position.x, y: 0, z: g.position.z }, { color: [RUNE, '#ffffff'], count: 40, radius: R * 0.5, speed: 320, life: 1.0, size: 5 }); }
        },
      };
    },
  });
}
