// @ts-nocheck
import { createWeaponKit } from '../../../render3d/weaponKit.js';

export function buildNecromancerWeapon(hand, ctx) {
  const { THREE, reg, mat, add } = createWeaponKit(hand, ctx);

  // 取得程序化貼圖
  const robeTex = ctx.materialTex ? ctx.materialTex('cloth', 'robe') : null;
  const steelTex = ctx.materialTex ? ctx.materialTex('steel', 'armor') : null;
  const gemTex = ctx.materialTex ? ctx.materialTex('glass', 'gem') : null;

  // 材質設定：暗鐵、象牙骨質、發光幽綠水晶、繃帶
  const darkMetalMat = reg(mat('#1b2022', { map: steelTex, rough: 0.5, metal: 0.8 }));
  const steelMat = reg(mat('#d5dbdb', { map: steelTex, rough: 0.25, metal: 0.9 }));
  const boneMat = reg(mat('#dcd3b8', { map: robeTex, rough: 0.65, metal: 0.15 }));
  const gemMat = reg(mat('#2ecc71', { map: gemTex, emissive: new THREE.Color('#27ae60'), ei: 1.8, rough: 0.15, metal: 0.35 }));
  const accentGlow = reg(mat('#27ae60', { emissive: new THREE.Color('#2ecc71'), ei: 2.5 }));
  const bandageMat = reg(mat('#3d245c', { map: robeTex, rough: 0.8, metal: 0.15 }));

  // 微調手部旋轉以適應鐮刀握持
  hand.rotation.set(0, 0, -0.4);
  hand.position.x += 1.2;

  // 1. 長桿 (Shaft)：Y = -28 到 Y = 32
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 60, 8), darkMetalMat);
  add(shaft, 0, 2, 0);

  // 2. 握把纏繞繃帶 (Bandage Wraps)
  for (let i = 0; i < 6; i++) {
    const wrapY = -10 + i * 4;
    const wrap = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.3, 3.2, 8), bandageMat);
    add(wrap, 0, wrapY, 0, 0.06 * (Math.random() - 0.5), 0, 0.06 * (Math.random() - 0.5));
  }

  // 3. 桿底錐刺 (Spiked Pommel)
  const pommel = new THREE.Mesh(new THREE.ConeGeometry(1.4, 6, 6), steelMat);
  add(pommel, 0, -31, 0, 0, 0, Math.PI);

  // 4. 桿頂脊骨狀浮雕
  for (let i = 0; i < 4; i++) {
    const spineSeg = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.5, 6, 12, Math.PI * 1.5), boneMat);
    add(spineSeg, 0, 18 + i * 4.5, 0, 0, Math.PI / 2, Math.PI * 0.25);
  }

  // 5. 骸骨護手爪 (Skeletal Claw Guard)
  const clawBase = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 8), boneMat);
  add(clawBase, 0, 32, 0);

  // 三指環扣
  const f1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.4, 6, 6), boneMat);
  add(f1, 1.3, 34, 1.1, 0.25, 0, 0.45);

  const f2 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.4, 6, 6), boneMat);
  add(f2, 1.3, 34, -1.1, -0.25, 0, 0.45);

  const f3 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.4, 4.8, 6), boneMat);
  add(f3, -1.3, 33, 0, 0, 0, -0.55);

  // 爪心嵌入靈魂綠寶石 (Gem Core)
  const gemCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 0), gemMat);
  add(gemCore, 0, 32.5, 0);

  // 6. 刀刃群組 (Blade Group)：支援 stretchBlade 拉伸，起點位於 Y = 32
  const bladeGroup = new THREE.Group();
  bladeGroup.name = 'blade-group';
  bladeGroup.position.set(0, 32, 0);

  // 刀背鋼鐵脊椎 (Steel Spine Support)
  const spineGeo1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 14, 2.0), darkMetalMat);
  spineGeo1.position.set(-0.6, 6.5, 0);
  spineGeo1.rotation.z = 0.1;
  bladeGroup.add(spineGeo1);

  const spineGeo2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 16, 1.8), darkMetalMat);
  spineGeo2.position.set(1.4, 19.5, 0);
  spineGeo2.rotation.z = 0.32;
  bladeGroup.add(spineGeo2);

  const spineGeo3 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 18, 1.5), darkMetalMat);
  spineGeo3.position.set(6.2, 33, 0);
  spineGeo3.rotation.z = 0.56;
  bladeGroup.add(spineGeo3);

  // 晶體刀刃片段 1
  const b1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 14, 1.8), gemMat);
  b1.position.set(0.8, 6.5, 0);
  b1.rotation.z = 0.12;
  bladeGroup.add(b1);

  // 晶體刀刃片段 2
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 16, 1.5), gemMat);
  b2.position.set(3.8, 19.5, 0);
  b2.rotation.z = 0.36;
  bladeGroup.add(b2);

  // 晶體刀刃片段 3
  const b3 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 18, 1.2), gemMat);
  b3.position.set(9.6, 33, 0);
  b3.rotation.z = 0.6;
  bladeGroup.add(b3);

  // 尖端晶體 (Crescent Tip)
  const tip = new THREE.Mesh(new THREE.ConeGeometry(1.6, 14, 4), gemMat);
  tip.position.set(17.2, 45, 0);
  tip.rotation.set(0, Math.PI / 4, 0.88);
  bladeGroup.add(tip);

  // 內刃發光刻痕 (Glowing Inner Edge)
  const glow1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 12, 1.9), accentGlow);
  glow1.position.set(2.0, 6.5, 0);
  glow1.rotation.z = 0.12;
  bladeGroup.add(glow1);

  const glow2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 14, 1.6), accentGlow);
  glow2.position.set(5.1, 19.5, 0);
  glow2.rotation.z = 0.36;
  bladeGroup.add(glow2);

  const glow3 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 16, 1.3), accentGlow);
  glow3.position.set(11.2, 33, 0);
  glow3.rotation.z = 0.6;
  bladeGroup.add(glow3);

  hand.add(bladeGroup);
}
