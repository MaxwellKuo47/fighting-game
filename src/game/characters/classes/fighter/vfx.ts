// @ts-nocheck
// 武僧（格鬥家）：聚氣→爆發。連環拳(掌風) / 聚氣(集氣球) / 不動明王(金身免傷) / 真·昇龍霸(化龍砸地·地裂)。
import * as THREE from 'three';
import { registerVfx } from '../../../render3d/vfx/registry.js';
import { ring, pillar, burst, cone, sphereFlash, slashBlade, addShake, addFlash } from '../../../render3d/vfx/lib.js';

// 大字字板（真·昇龍霸）：canvas 貼圖 → sprite，金底黑描邊。
function makeTextSprite(text, colorStr) {
  const cv = document.createElement('canvas');
  cv.width = 640; cv.height = 200;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, cv.width, cv.height);
  g.font = 'bold 120px "PingFang TC","Microsoft YaHei","Heiti TC",sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round';
  g.lineWidth = 16; g.strokeStyle = 'rgba(60,28,0,0.92)'; g.strokeText(text, cv.width / 2, cv.height / 2);
  g.shadowColor = 'rgba(255,180,40,0.9)'; g.shadowBlur = 24;
  g.fillStyle = colorStr; g.fillText(text, cv.width / 2, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.anisotropy = 4;
  return tex;
}

// ── 連環拳（普攻）：俐落掌風／拳勁，不再是「噴方塊」。
registerVfx('fighter_combo', {
  onCast(ctx, f, c) {
    const dx = Math.cos(f.facing), dz = Math.sin(f.facing);
    const R = f.range || 95;
    const hit = { x: c.x + dx * R * 0.7, z: c.z + dz * R * 0.7 };
    // 揮擊弧光（手勢）
    slashBlade(ctx, c, f.facing, { color: '#ffe9a8', len: R * 1.0, w: 7, swing: 1.3, life: 0.13 });
    // 前方拳勁尖（細長錐、朝目標衝出後淡出）
    const mat = new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const wedge = new THREE.Mesh(new THREE.ConeGeometry(5, 22, 6), mat);
    const g = new THREE.Group(); g.add(wedge); wedge.rotation.z = -Math.PI / 2; // 尖朝 +X
    g.position.set(c.x, 16, c.z); g.rotation.y = -f.facing;
    g.userData.geo = { dispose() { wedge.geometry.dispose(); } }; g.userData.mat = mat;
    ctx.addTransient(g, 0.15, (m, t) => {
      m.position.x = c.x + dx * R * (0.2 + t * 0.7);
      m.position.z = c.z + dz * R * (0.2 + t * 0.7);
      mat.opacity = 0.9 * (1 - t); m.scale.set(1 + t * 0.7, 1, 1);
    });
    // 命中震波 + 火花
    sphereFlash(ctx, hit, { color: '#fff3c8', from: 4, to: 26, life: 0.16, alpha: 0.95 });
    ring(ctx, hit, { color: '#ffd76a', from: 2, to: 30, life: 0.2, y: 3, ease: true });
    for (let i = 0; i < 8; i++) {
      const a = f.facing + (Math.random() - 0.5) * 1.2, spd = 120 + Math.random() * 120;
      ctx.particles.spawn({ x: hit.x, y: 14, z: hit.z, vx: Math.cos(a) * spd, vy: 40 + Math.random() * 60, vz: Math.sin(a) * spd, gravity: 240, drag: 2, life: 0.3, size: 3, color: '#ffe9a8', fade: true });
    }
  },
});

// ── 聚氣（K）：向心匯聚的金氣凝成一顆氣球。chi 越高、爆光越亮。
registerVfx('fighter_qi', {
  onCast(ctx, f, c) {
    const chi = f.chi || 1;
    addFlash(ctx, 0.08, '#ffe9a8');
    sphereFlash(ctx, c, { color: '#fff3c8', from: 6, to: 20 + chi * 3, life: 0.26, alpha: 0.9 });
    ring(ctx, c, { color: '#ffd76a', from: 38, to: 6, life: 0.3, y: 5 });            // 內縮環＝聚氣
    pillar(ctx, c, { color: '#ffe27a', h: 56 + chi * 10, r: 9, taper: 0.4, life: 0.4, alpha: 0.6, grow: 0.3 });
    if (f.full) addFlash(ctx, 0.12, '#ffd700');                                       // 滿氣額外亮一下
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2, rr = 48 + Math.random() * 22;
      ctx.particles.spawn({ x: c.x + Math.cos(a) * rr, y: 8 + Math.random() * 34, z: c.z + Math.sin(a) * rr, vx: -Math.cos(a) * 150, vy: 24, vz: -Math.sin(a) * 150, gravity: -36, drag: 2.6, life: 0.4, size: 3.4, color: '#ffe9a8', fade: true });
    }
  },
});

// ── 不動明王（L）：金身護體。金色穹頂 + 旋轉光環 + 莊嚴金光，持續約增益時間。
registerVfx('fighter_steelbody', {
  onCast(ctx, f, c) {
    addFlash(ctx, 0.2, '#ffd76a');
    addShake(ctx, 6);
    ring(ctx, c, { color: '#ffd700', from: 6, to: 70, life: 0.5, y: 3, ease: true });
    sphereFlash(ctx, c, { color: '#fff3c8', from: 8, to: 46, life: 0.3, alpha: 0.95 });

    const DUR = 2.0;
    const g = new THREE.Group(); g.position.set(c.x, 0, c.z);
    const domeMat = new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(34, 20, 14), domeMat); dome.position.y = 26; dome.scale.y = 1.25;
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(20, 1.4, 8, 28), haloMat); halo.rotation.x = Math.PI / 2; halo.position.y = 46; // 頭頂佛光
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const footRing = new THREE.Mesh(new THREE.RingGeometry(28, 34, 28), ringMat); footRing.rotation.x = -Math.PI / 2; footRing.position.y = 2;
    g.add(dome, halo, footRing);
    g.userData.geo = { dispose() { dome.geometry.dispose(); halo.geometry.dispose(); footRing.geometry.dispose(); } };
    g.userData.mat = { dispose() { domeMat.dispose(); haloMat.dispose(); ringMat.dispose(); } };
    ctx.addTransient(g, DUR, (m, t) => {
      const fade = t < 0.85 ? 1 : (1 - t) / 0.15;
      const pulse = 0.85 + 0.15 * Math.sin(t * DUR * 8);
      domeMat.opacity = 0.16 * fade * pulse;
      haloMat.opacity = 0.85 * fade;
      ringMat.opacity = 0.7 * fade * pulse;
      halo.rotation.z += 0.05;
      footRing.rotation.z -= 0.04;
      m.position.y = Math.sin(t * DUR * 5) * 1.0;
    });
  },
});

// ── 真·昇龍霸（大招·施放氣爆）：施法者腳下金色氣勁爆發＋衝天前兆（由 casting.ts 自動觸發於施法者）。
registerVfx('fighter_ultimate', {
  onCast(ctx, f, c) {
    addShake(ctx, 10);
    addFlash(ctx, 0.22, '#ffe27a');
    ring(ctx, c, { color: '#ffd700', from: 8, to: 120, life: 0.45, y: 3, ease: true });
    sphereFlash(ctx, c, { color: '#fff7da', from: 8, to: 56, life: 0.3, alpha: 0.95 });
    pillar(ctx, c, { color: '#ffe27a', h: 150, r: 18, taper: 0.3, life: 0.5, alpha: 0.7, grow: 0.4 });
    for (let i = 0; i < 28; i++) {
      const a = Math.random() * Math.PI * 2, rr = Math.random() * 24;
      ctx.particles.spawn({ x: c.x + Math.cos(a) * rr, y: 3, z: c.z + Math.sin(a) * rr, vx: Math.cos(a) * 60, vy: 280 + Math.random() * 220, vz: Math.sin(a) * 60, gravity: 220, drag: 1.2, life: 0.6, size: 4.5, color: '#ffe9a8', fade: true });
    }
  },
});

// ── 真·昇龍霸（大招·落地龍）：飛撲落地點生成。delay≈leap dur 後爆發：砸地震波＋地裂＋金龍衝天＋大字。
//   氣球(chi)越多 → 龍越大、地裂越多越長、字越大。由 risingdragon handler 於落地點送出。
registerVfx('fighter_dragon', {
  onCast(ctx, f, c) {
    const chi = Math.max(0, Math.min(5, f.chi || 0));
    const dur = f.dur || 0.5;                  // 飛撲時間 → 延後到落地才爆
    const scale = 1 + chi * 0.16;              // 氣球越多越大
    const life = f.life || 1.5;

    // 落地前：地面預警圈（標出砸點），落地瞬間消失。
    const warnMat = new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const warn = new THREE.Mesh(new THREE.RingGeometry(54 * scale, 60 * scale, 36), warnMat);
    warn.rotation.x = -Math.PI / 2; warn.position.set(c.x, 2, c.z);
    warn.userData.geo = { dispose() { warn.geometry.dispose(); } }; warn.userData.mat = warnMat;
    ctx.addTransient(warn, dur, (m, t) => { warnMat.opacity = 0.5 * Math.sin(t * Math.PI) * (0.6 + 0.4 * Math.sin(t * 30)); });

    // 落地爆發（單發排程）：用一個隱形計時器在 age>=dur 觸發。
    const timer = new THREE.Object3D();
    let fired = false;
    timer.userData.geo = { dispose() {} }; timer.userData.mat = { dispose() {} };
    ctx.addTransient(timer, life, (m, t) => {
      const age = t * life;
      if (fired || age < dur) return;
      fired = true;
      const hit = { x: c.x, y: c.y, z: c.z };

      // 1) 砸地：鏡頭重震 + 閃白 + 雙層震環 + 白光球
      addShake(ctx, 20 + chi * 2);
      addFlash(ctx, 0.4, '#fff2c0');
      ring(ctx, hit, { color: '#ffe27a', from: 12, to: (150 + chi * 18) * 1.0, life: 0.5, y: 4, ease: true });
      ring(ctx, hit, { color: '#ffd700', from: 8, to: 90 + chi * 10, life: 0.36, y: 8 });
      sphereFlash(ctx, hit, { color: '#ffffff', from: 10, to: 70, life: 0.26, alpha: 0.98 });

      // 2) 地裂：自砸點向外輻射的發光裂縫（數量/長度隨 chi）。
      const cracks = 6 + chi * 2;
      const crackMat = new THREE.MeshBasicMaterial({ color: 0xffb734, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
      const crackGroup = new THREE.Group(); crackGroup.position.set(hit.x, 1.5, hit.z);
      const crackGeo = new THREE.PlaneGeometry(1, 1);
      const segs = [];
      for (let i = 0; i < cracks; i++) {
        const ang = (i / cracks) * Math.PI * 2 + (i % 2) * 0.25;
        const len = (90 + Math.random() * 70) * scale;
        const seg = new THREE.Mesh(crackGeo, crackMat);
        seg.rotation.x = -Math.PI / 2; seg.rotation.z = -ang;
        seg.position.set(Math.cos(ang) * len * 0.5, 0, Math.sin(ang) * len * 0.5);
        seg.scale.set(len, 1, 1);
        seg.userData.w = 3 + Math.random() * 3;
        crackGroup.add(seg); segs.push(seg);
      }
      crackGroup.userData.geo = { dispose() { crackGeo.dispose(); } };
      crackGroup.userData.mat = crackMat;
      ctx.addTransient(crackGroup, 1.1, (mm, tt) => {
        const grow = Math.min(1, tt / 0.18);
        for (const s of segs) s.scale.z = s.userData.w * grow;
        crackMat.opacity = 0.95 * (1 - Math.max(0, (tt - 0.5) / 0.5));
      });

      // 3) 金龍：自砸點盤旋衝天（鱗段 + 龍頭），chi 越多越粗壯。
      const dragon = new THREE.Group(); dragon.position.set(hit.x, 0, hit.z);
      const segMat = new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
      const segGeo = new THREE.TorusGeometry(1, 0.34, 8, 18);
      const N = 9;
      const rings = [];
      for (let k = 0; k < N; k++) { const rm = new THREE.Mesh(segGeo, segMat); rm.rotation.x = -Math.PI / 2; dragon.add(rm); rings.push(rm); }
      const headMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xff8a00, emissiveIntensity: 2.4, transparent: true, opacity: 0.98 });
      const headGeo = new THREE.ConeGeometry(9 * scale, 26 * scale, 6);
      const head = new THREE.Mesh(headGeo, headMat); head.rotation.x = Math.PI / 2;
      const hornGeo = new THREE.ConeGeometry(1.6, 10, 5);
      const horns = new THREE.Group();
      for (const sx of [-1, 1]) { const h = new THREE.Mesh(hornGeo, headMat); h.position.set(sx * 4, 4, -6); h.rotation.x = -0.5; horns.add(h); }
      const headG = new THREE.Group(); headG.add(head, horns); dragon.add(headG);
      dragon.userData.geo = { dispose() { segGeo.dispose(); headGeo.dispose(); hornGeo.dispose(); } };
      dragon.userData.mat = { dispose() { segMat.dispose(); headMat.dispose(); } };
      const rise = 300 + chi * 26;
      ctx.addTransient(dragon, 1.4, (mm, tt) => {
        rings.forEach((rm, idx) => {
          const st = Math.max(0, tt - idx * 0.06);
          const ang = st * Math.PI * 4;
          const rad = (26 - idx * 1.4) * scale;
          rm.position.set(Math.cos(ang) * rad, st * rise, Math.sin(ang) * rad);
          rm.scale.setScalar((6 - idx * 0.3) * scale);
        });
        const ang = tt * Math.PI * 4;
        const rad = 26 * scale;
        headG.position.set(Math.cos(ang) * rad, tt * rise + 16, Math.sin(ang) * rad);
        headG.rotation.y = -ang;
        headG.scale.setScalar((1.3 - tt * 0.3) * scale);
        const op = Math.max(0, 1 - Math.max(0, (tt - 0.55) / 0.45));
        segMat.opacity = 0.95 * op; headMat.opacity = 0.98 * op;
      });

      // 4) 大字「真·昇龍霸」：砸點上方放大字板，punch-in 後上飄淡出。
      const tex = makeTextSprite('真·昇龍霸', '#ffe14a');
      const spMat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, depthTest: false });
      const sprite = new THREE.Sprite(spMat); sprite.position.set(hit.x, 64, hit.z);
      const baseW = 150, baseH = 47;
      sprite.userData.geo = { dispose() { tex.dispose(); } }; sprite.userData.mat = spMat;
      ctx.addTransient(sprite, 1.6, (mm, tt) => {
        const pop = tt < 0.12 ? tt / 0.12 : 1;          // 彈入
        const s = (0.7 + pop * 0.5);
        sprite.scale.set(baseW * s, baseH * s, 1);
        sprite.position.y = 64 + tt * 26;
        spMat.opacity = tt < 0.74 ? Math.min(1, pop) : (1 - tt) / 0.26;
      });

      // 5) 碎石塵爆
      for (let i = 0; i < 46 + chi * 6; i++) {
        const a = Math.random() * Math.PI * 2, spd = 200 + Math.random() * 260;
        ctx.particles.spawn({ x: hit.x, y: 4, z: hit.z, vx: Math.cos(a) * spd, vy: 120 + Math.random() * 240, vz: Math.sin(a) * spd, gravity: 360, drag: 1.1, life: 0.6 + Math.random() * 0.5, size: 4 + Math.random() * 4, color: i % 3 ? '#ffe27a' : '#c98a2e', fade: true });
      }
    });
  },
});
