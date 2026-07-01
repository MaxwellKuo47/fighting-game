// @ts-nocheck
import { createWeaponKit } from '../../../render3d/weaponKit.js';

export function buildMagicSwordsmanWeapon(hand, ctx) {
  const kit = createWeaponKit(hand, ctx);
  const { THREE, reg, mat } = kit;
  
  // Rotate hand to make the character hold the massive sword correctly
  hand.rotation.set(0, 0, -0.85);
  hand.position.x += 3.5;
  hand.position.y -= 1.5;

  // Create sub-groups for blade and hilt/guard
  const bladeGroup = new THREE.Group();
  bladeGroup.name = 'magic-sword-blade';
  // Position bladeGroup at the top of the hilt guard/brace (Y = 25)
  // to ensure that stretching scales the blade outward from the guard without drifting.
  bladeGroup.position.set(3, 25, 0);
  hand.add(bladeGroup);

  const hiltGroup = new THREE.Group();
  hiltGroup.name = 'magic-sword-hilt';
  hand.add(hiltGroup);

  // Helper for adding meshes to bladeGroup (the crystal blade and emissive core)
  const addBlade = (m, x, y, z, rx = 0, ry = 0, rz = 0) => {
    m.castShadow = true;
    m.receiveShadow = true;
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    bladeGroup.add(m);
    return m;
  };

  // Helper for adding meshes to hiltGroup (the crossguard, gem, hilt, pommel)
  const addHilt = (m, x, y, z, rx = 0, ry = 0, rz = 0) => {
    m.castShadow = true;
    m.receiveShadow = true;
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    hiltGroup.add(m);
    return m;
  };

  // ── 取得材質貼圖 ──
  const steelTex = ctx.materialTex ? ctx.materialTex('steel', 'metal') : null;
  const armorTex = ctx.materialTex ? ctx.materialTex('metal', 'armor') : null;
  const glassTex = ctx.materialTex ? ctx.materialTex('glass', 'gem') : null;

  // ── 精緻材質定義 ──
  // 青藍半透明發光水晶刀刃
  const cyanCrystal = reg(mat('#00f3ff', { map: glassTex, emissive: new THREE.Color('#00d2ff'), ei: 2.2, rough: 0.15, metal: 0.5, transparent: true, opacity: 0.85 }));
  // 核心強光
  const brightCore = reg(mat('#ffffff', { emissive: new THREE.Color('#e0ffff'), ei: 4.8, rough: 0.05, metal: 0.2 }));
  // 護手星海藍寶石
  const sapphireGem = reg(mat('#0055ff', { map: glassTex, emissive: new THREE.Color('#0033aa'), ei: 3.2, rough: 0.1, metal: 0.2 }));
  // 冷銀裝飾
  const steelMetal = reg(mat('#d2d5db', { map: steelTex, rough: 0.18, metal: 0.9 }));
  // 暗鋼把手與防護夾
  const darkSteel = reg(mat('#12132e', { map: armorTex, rough: 0.6, metal: 0.7 }));

  // ── 巨型劍刃 (高約 80 單位，保持原本巨大的威嚴比例) ──
  const bladeMain = new THREE.Mesh(new THREE.BoxGeometry(8.5, 52, 3.2), cyanCrystal);
  addBlade(bladeMain, 0, 26, 0);

  const bladeTip = new THREE.Mesh(new THREE.ConeGeometry(5.0, 24, 4), cyanCrystal);
  addBlade(bladeTip, 0, 64, 0, 0, Math.PI / 4, 0);

  // ── 劍刃中央流光核心 (白色強光 core) ──
  const coreGlow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 75, 0.8), brightCore);
  addBlade(coreGlow, 0, 28, 0);

  // ── 劍刃底部加固暗鋼甲 (縮小比例以匹配細長手柄，更顯精緻) ──
  const brace = new THREE.Mesh(new THREE.BoxGeometry(6.8, 14, 2.8), darkSteel);
  addHilt(brace, 3, 25, 0);

  const braceSteel1 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.5, 3.2), steelMetal);
  addHilt(braceSteel1, 3, 31, 0);

  const braceSteel2 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.5, 3.2), steelMetal);
  addHilt(braceSteel2, 3, 19, 0);

  // ── 護手 (橫向收窄，比例更靈巧，冷銀羽翼風格) ──
  const guardL = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.2, 1.8), steelMetal);
  addHilt(guardL, 3, 13, -5.0, 0.35, 0, 0);

  const guardR = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.2, 1.8), steelMetal);
  addHilt(guardR, 3, 13, 5.0, -0.35, 0, 0);

  const guardCenter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.8, 4.2), darkSteel);
  addHilt(guardCenter, 3, 13, 0);

  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(2.8, 0), sapphireGem);
  addHilt(gem, 3, 13, 0);

  // ── 握柄與劍首 (細長化手柄，手感更佳) ──
  // 把手半徑從 2.5 縮小至 1.3，手持部分比例更完美
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 26, 8), darkSteel);
  addHilt(grip, 3, -2, 0);

  // 細長防滑冷銀裝飾圈
  for (let i = 0; i < 3; i++) {
    const gripRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.3, 6, 12), steelMetal);
    addHilt(gripRing, 3, 6 - i * 6, 0, Math.PI / 2, 0, 0);
  }

  // 縮小的冷銀劍首
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(2.4, 8, 8), steelMetal);
  addHilt(pommel, 3, -16, 0);

  // 劍首末端發光青藍水晶
  const pommelGem = new THREE.Mesh(new THREE.OctahedronGeometry(1.3, 0), cyanCrystal);
  addHilt(pommelGem, 3, -19, 0);
}
