// @ts-nocheck
import * as THREE from 'three';
import { buildNecromancerWeapon } from './weapon.ts';

export const modelConfig = {
  bulk: 1.92,
  weapon: 'scythe',
  skinKind: 'cloth',
  headgear: 'none', // 自訂立體兜帽，不使用 models.js 的預設 hood
  pauldron: false,
  stretchBlade: true
};

// 死靈法師：重置後的「冥界主宰」彩色配飾版本。
// 配色：幽冥暗紫（法袍主色）+ 深邃墨綠（內襯/副色）+ 象牙骸骨色 + 冷鋼銀色（金屬裝飾與滾邊）+ 幽綠強光（魔能核心）。
export function buildModel(ctx) {
  const {
    base, bulk, reg, mat, shade,
    torsoW, torsoD, torsoH, shoulderY, frontX, bodyTex,
    mkLimb, addAccent, faceGroup, materialTex
  } = ctx;

  // 取得程序化材質貼圖
  const robeTex = materialTex ? materialTex('cloth', 'robe') : bodyTex;
  const boneTex = materialTex ? materialTex('cloth', 'hair') : bodyTex;
  const metalTex = materialTex ? materialTex('steel', 'armor') : bodyTex;
  const gemTex = materialTex ? materialTex('glass', 'gem') : null;

  // 配色材質定義
  const robeMat = reg(mat('#3d245c', { map: robeTex, rough: 0.72, metal: 0.2 }));      // 幽冥暗紫 (主法袍)
  const liningMat = reg(mat('#114f38', { map: robeTex, rough: 0.75, metal: 0.15 }));   // 深邃墨綠 (內襯/副色)
  const boneMat = reg(mat('#dcd3b8', { map: boneTex, rough: 0.65, metal: 0.15 }));     // 象牙骸骨
  const metalMat = reg(mat('#1e2528', { map: metalTex, rough: 0.45, metal: 0.8 }));     // 暗影鐵甲
  const steelMat = reg(mat('#bdc3c7', { map: metalTex, rough: 0.22, metal: 0.95 }));    // 冷鋼亮銀 (金屬邊飾)
  const gemMat = reg(mat('#2ecc71', { map: gemTex, emissive: new THREE.Color('#27ae60'), ei: 1.8, rough: 0.15, metal: 0.35 }));
  const accentGlow = reg(mat('#2ecc71', { emissive: new THREE.Color('#2ecc71'), ei: 2.5 }));
  const skinMat = reg(mat('#0b0e10', { rough: 0.8, metal: 0.05 }));                    // 兜帽內部的陰影面部

  // 1. 多段式軀幹 (Torso Group)
  const torso = new THREE.Group();

  // 胸甲 (Upper Torso Chest Armor)：斜置的菱形柱，代表骸骨胸板
  const upperTorso = new THREE.Mesh(new THREE.CylinderGeometry(torsoW * 0.44, torsoW * 0.52, torsoH * 0.55, 4), metalMat);
  upperTorso.rotation.y = Math.PI / 4;
  upperTorso.position.y = torsoH * 0.22;
  upperTorso.castShadow = true;
  torso.add(upperTorso);

  // 胸前冷鋼銀裝飾條 (Silver Chest Trim)
  const chestTrim = new THREE.Mesh(new THREE.BoxGeometry(torsoW * 0.48, 1.4, torsoD * 0.52), steelMat);
  chestTrim.position.set(0, torsoH * 0.3, torsoD * 0.28);
  chestTrim.rotation.y = Math.PI / 4;
  chestTrim.castShadow = true;
  torso.add(chestTrim);

  // 纖細腰部 (Waist Connector) - 採用綠色內襯包覆
  const waist = new THREE.Mesh(new THREE.CylinderGeometry(torsoW * 0.28, torsoW * 0.32, torsoH * 0.22, 8), liningMat);
  waist.position.y = -torsoH * 0.12;
  waist.castShadow = true;
  torso.add(waist);

  // 臀部/下腹甲 (Pelvis Base) - 紫色底衣
  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(torsoW * 0.42, torsoW * 0.36, torsoH * 0.25, 4), robeMat);
  pelvis.rotation.y = Math.PI / 4;
  pelvis.position.y = -torsoH * 0.35;
  pelvis.castShadow = true;
  torso.add(pelvis);

  // 胸前發光肋骨 (Ribcage Core)
  const spine = new THREE.Mesh(new THREE.BoxGeometry(1.6, torsoH * 0.65, 1.4), boneMat);
  spine.position.set(0, 0.8, torsoD * 0.45 + 0.6);
  spine.castShadow = true;
  torso.add(spine);

  for (let i = 0; i < 3; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(2.8 + i * 1.5, 0.52, 6, 14, Math.PI), boneMat);
    rib.position.set(0, torsoH * 0.2 - i * 4.2, torsoD * 0.45 + 0.4);
    rib.rotation.set(Math.PI / 2, 0, 0);
    rib.castShadow = true;
    torso.add(rib);
  }

  // 核心死氣綠晶 (Death Core)
  const deathCore = new THREE.Mesh(new THREE.IcosahedronGeometry(2.3, 0), gemMat);
  deathCore.position.set(0, torsoH * 0.16, torsoD * 0.5 + 0.8);
  torso.add(deathCore);

  // 護腰皮帶 (Silver Sash Belt)
  const belt = new THREE.Mesh(new THREE.TorusGeometry(torsoW * 0.44, 1.2, 6, 24), steelMat);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = -torsoH * 0.22;
  torso.add(belt);

  // 垂掛破爛裙擺 (Tassets) - 左右墨綠，前後暗紫，交錯配色
  const tassetW = torsoW * 0.38;
  const tassetH = torsoH * 0.55;

  // 後裙擺 (紫色)
  const tassetB = new THREE.Mesh(new THREE.BoxGeometry(tassetW, tassetH, 1.2), robeMat);
  tassetB.position.set(-torsoD * 0.42, -torsoH * 0.6, 0);
  tassetB.rotation.z = -0.15;
  tassetB.castShadow = true;
  torso.add(tassetB);

  // 左裙擺 (綠色)
  const tassetL = new THREE.Mesh(new THREE.BoxGeometry(1.2, tassetH, tassetW), liningMat);
  tassetL.position.set(0, -torsoH * 0.6, -torsoW * 0.4);
  tassetL.rotation.x = -0.15;
  tassetL.castShadow = true;
  torso.add(tassetL);

  // 右裙擺 (綠色)
  const tassetR = new THREE.Mesh(new THREE.BoxGeometry(1.2, tassetH, tassetW), liningMat);
  tassetR.position.set(0, -torsoH * 0.6, torsoW * 0.4);
  tassetR.rotation.x = 0.15;
  tassetR.castShadow = true;
  torso.add(tassetR);

  // 骷髏肩飾 (Skeletal Pauldrons) - 增加冷鋼底座襯托
  for (const sz of [-1, 1]) {
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(0, torsoH * 0.38, sz * (torsoW * 0.5 + 1.2));

    // 冷鋼肩甲托盤 (Silver Shoulder Plate)
    const plate = new THREE.Mesh(new THREE.SphereGeometry(3.2 * bulk, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), steelMat);
    plate.position.set(0, -0.2, 0);
    plate.rotation.z = sz * 0.15;
    plate.castShadow = true;
    shoulderGroup.add(plate);

    // 骷髏頭
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6 * bulk, 0), boneMat);
    skull.scale.set(1.0, 1.15, 0.9);
    skull.position.set(0, 1.2, 0);
    skull.castShadow = true;
    shoulderGroup.add(skull);

    // 下顎
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(2.0 * bulk, 1.0 * bulk, 2.0 * bulk), boneMat);
    jaw.position.set(0, -0.4, 0);
    jaw.castShadow = true;
    shoulderGroup.add(jaw);

    // 眼窩發光
    const se = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), accentGlow);
    se.position.set(1.4 * bulk, 1.2, 0.5 * sz * bulk);
    shoulderGroup.add(se);

    torso.add(shoulderGroup);
  }

  // 2. 頭部 (Head) 與自訂雙層兜帽、枯骨雙角
  const head = new THREE.Mesh(new THREE.SphereGeometry(6.4 * bulk, 16, 12), skinMat);
  head.scale.set(0.9, 1.05, 0.9);
  head.castShadow = true;

  // 外兜帽 (Outer Hood)：幽冥暗紫
  const hoodOuter = new THREE.Mesh(
    new THREE.SphereGeometry(8.0 * bulk, 16, 12, Math.PI * 0.15, Math.PI * 1.7, 0, Math.PI * 0.85),
    robeMat
  );
  hoodOuter.position.set(-0.8 * bulk, 0.8 * bulk, 0);
  hoodOuter.rotation.set(0, -Math.PI / 2 - 0.15, 0);
  hoodOuter.castShadow = true;
  head.add(hoodOuter);

  // 內兜帽 (Inner Hood)：深邃墨綠，創造兜帽邊緣的拼色層次
  const hoodInner = new THREE.Mesh(
    new THREE.SphereGeometry(7.6 * bulk, 16, 12, Math.PI * 0.2, Math.PI * 1.6, 0, Math.PI * 0.8),
    liningMat
  );
  hoodInner.position.set(-0.6 * bulk, 0.8 * bulk, 0);
  hoodInner.rotation.set(0, -Math.PI / 2 - 0.2, 0);
  head.add(hoodInner);

  // 枯骨雙角 (Curved Horns) - 根部帶有冷鋼固定環
  for (const sz of [-1, 1]) {
    const hornGroup = new THREE.Group();
    hornGroup.position.set(0.5 * bulk, 2.2 * bulk, sz * 4.2 * bulk);

    // 金屬環 (Silver Horn Ring)
    const ringGeo = new THREE.Mesh(new THREE.TorusGeometry(1.6 * bulk, 0.35 * bulk, 6, 12), steelMat);
    ringGeo.position.set(0, 0, sz * 0.5 * bulk);
    ringGeo.rotation.y = Math.PI / 2;
    hornGroup.add(ringGeo);

    // 根部 (向外後延展)
    const h1 = new THREE.Mesh(new THREE.CylinderGeometry(1.3 * bulk, 1.7 * bulk, 4.0 * bulk, 6), boneMat);
    h1.position.set(0, 0, sz * 1.6 * bulk);
    h1.rotation.set(0.35 * sz, 0.25 * sz, 1.3 * sz);
    h1.castShadow = true;
    hornGroup.add(h1);

    // 中段 (向下彎折)
    const h2 = new THREE.Mesh(new THREE.CylinderGeometry(0.8 * bulk, 1.3 * bulk, 4.2 * bulk, 6), boneMat);
    h2.position.set(0.4 * bulk, -2.0 * bulk, sz * 2.8 * bulk);
    h2.rotation.set(-0.35 * sz, 0.1 * sz, 0.65 * sz);
    h2.castShadow = true;
    hornGroup.add(h2);

    // 尖端 (向前勾起)
    const h3 = new THREE.Mesh(new THREE.ConeGeometry(0.8 * bulk, 4.8 * bulk, 6), boneMat);
    h3.position.set(2.0 * bulk, -3.5 * bulk, sz * 3.2 * bulk);
    h3.rotation.set(-0.85 * sz, -0.35 * sz, -0.25 * sz);
    h3.castShadow = true;
    hornGroup.add(h3);

    head.add(hornGroup);
  }

  // 兜帽下深藏的幽綠發光眼
  for (const sz of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 1.8), accentGlow);
    eye.position.set(frontX - 0.25, 0.6, sz * 2.2 * bulk);
    faceGroup.add(eye);
  }

  // 3. 客製化肢體 (Custom Detailed Limbs) - 採暗紫與墨綠色交錯拼色
  const armL = mkLimb(0, -ctx.shoulderX, true, robeMat, metalMat, '#27ae60', 4.5 * bulk, 15);
  const armR = mkLimb(0, ctx.shoulderX, true, robeMat, metalMat, '#27ae60', 4.5 * bulk, 15);
  const legL = mkLimb(0, -ctx.hipX, false, liningMat, metalMat, '#27ae60', 5.5 * bulk, 15); // 大腿採用墨綠褲管
  const legR = mkLimb(0, ctx.hipX, false, liningMat, metalMat, '#27ae60', 5.5 * bulk, 15);

  const rebuildArm = (pivot, isLeft) => {
    while (pivot.children.length > 0) pivot.remove(pivot.children[0]);
    const w = 4.5 * bulk;
    const len = 15;

    // 肩關節球 - 亮銀色
    const joint = new THREE.Mesh(new THREE.SphereGeometry(w * 0.42, 8, 8), steelMat);
    joint.castShadow = true;
    pivot.add(joint);

    // 上臂：法袍護袖 (紫色)
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.35, w * 0.3, len * 0.5, 6), robeMat);
    upper.position.y = -len * 0.25;
    upper.castShadow = true;
    pivot.add(upper);

    // 肘關節：發光幽晶
    const elbow = new THREE.Mesh(new THREE.OctahedronGeometry(w * 0.3, 0), gemMat);
    elbow.position.y = -len * 0.5;
    elbow.castShadow = true;
    pivot.add(elbow);

    // 前臂：暗鐵護手
    const forearm = new THREE.Mesh(new THREE.BoxGeometry(w * 1.05, len * 0.42, w * 1.05), metalMat);
    forearm.position.y = -len * 0.71;
    forearm.castShadow = true;
    pivot.add(forearm);

    // 護腕銀框 (Silver Wrist Trim)
    const wristTrim = new THREE.Mesh(new THREE.TorusGeometry(w * 0.56, 0.4, 4, 12), steelMat);
    wristTrim.position.y = -len * 0.9;
    wristTrim.rotation.x = Math.PI / 2;
    pivot.add(wristTrim);

    // 外側骸骨護板
    const bonePlate = new THREE.Mesh(new THREE.BoxGeometry(w * 1.2, len * 0.35, w * 0.48), boneMat);
    const sideSign = isLeft ? -1 : 1;
    bonePlate.position.set(0, -len * 0.71, sideSign * w * 0.15);
    bonePlate.castShadow = true;
    pivot.add(bonePlate);

    // 發光魔紋環
    const armRing = new THREE.Mesh(new THREE.TorusGeometry(w * 0.65, 0.4, 4, 12), accentGlow);
    armRing.position.y = -len * 0.52;
    armRing.rotation.x = Math.PI / 2;
    pivot.add(armRing);
  };

  const rebuildLeg = (pivot, isLeft) => {
    while (pivot.children.length > 0) pivot.remove(pivot.children[0]);
    const w = 5.5 * bulk;
    const len = 15;

    // 胯關節
    const joint = new THREE.Mesh(new THREE.SphereGeometry(w * 0.4, 8, 8), metalMat);
    joint.castShadow = true;
    pivot.add(joint);

    // 大腿：破爛褲管 (墨綠色，拉開與上衣紫色對比)
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.38, w * 0.32, len * 0.5, 6), liningMat);
    upper.position.y = -len * 0.25;
    upper.castShadow = true;
    pivot.add(upper);

    // 膝關節：發光幽晶
    const knee = new THREE.Mesh(new THREE.OctahedronGeometry(w * 0.28, 0), gemMat);
    knee.position.y = -len * 0.5;
    knee.castShadow = true;
    pivot.add(knee);

    // 小腿：暗鐵重靴
    const boot = new THREE.Mesh(new THREE.BoxGeometry(w * 1.1, len * 0.42, w * 1.1), metalMat);
    boot.position.y = -len * 0.71;
    boot.castShadow = true;
    pivot.add(boot);

    // 靴頭銀護片 (Silver Toe Protection)
    const toeCap = new THREE.Mesh(new THREE.BoxGeometry(w * 1.15, len * 0.1, w * 0.6), steelMat);
    toeCap.position.set(w * 0.1, -len * 0.88, 0);
    toeCap.castShadow = true;
    pivot.add(toeCap);

    // 前側枯骨護面
    const shin = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, len * 0.38, w * 1.2), boneMat);
    shin.position.set(w * 0.15, -len * 0.71, 0);
    shin.rotation.y = Math.PI / 2;
    shin.castShadow = true;
    pivot.add(shin);

    // 發光魔紋環
    const legRing = new THREE.Mesh(new THREE.TorusGeometry(w * 0.65, 0.4, 4, 12), accentGlow);
    legRing.position.y = -len * 0.52;
    legRing.rotation.x = Math.PI / 2;
    pivot.add(legRing);
  };

  rebuildArm(armL, true);
  rebuildArm(armR, false);
  rebuildLeg(legL, true);
  rebuildLeg(legR, false);

  // 4. 背部破爛斗篷 (Tattered Cape) & 懸浮魂魄冥環 (Soulfire Halo)
  // 斗篷拼色設計：中幅暗紫，兩側墨綠
  const capeC = new THREE.Mesh(new THREE.BoxGeometry(0.8, torsoH * 1.25, torsoW * 0.32), robeMat);
  capeC.position.set(-torsoD * 0.54, -torsoH * 0.28, 0);
  capeC.rotation.z = -0.22;
  capeC.castShadow = true;
  torso.add(capeC);

  const capeL = new THREE.Mesh(new THREE.BoxGeometry(0.8, torsoH * 1.2, torsoW * 0.28), liningMat);
  capeL.position.set(-torsoD * 0.52, -torsoH * 0.28, -torsoW * 0.22);
  capeL.rotation.set(0.16, 0, -0.24);
  capeL.castShadow = true;
  torso.add(capeL);

  const capeR = new THREE.Mesh(new THREE.BoxGeometry(0.8, torsoH * 1.2, torsoW * 0.28), liningMat);
  capeR.position.set(-torsoD * 0.52, -torsoH * 0.28, torsoW * 0.22);
  capeR.rotation.set(-0.16, 0, -0.24);
  capeR.castShadow = true;
  torso.add(capeR);

  // 斗篷冷銀與幽綠裂痕內襯
  const trimL = new THREE.Mesh(new THREE.BoxGeometry(0.4, torsoH * 1.05, 0.8), steelMat); // 左側冷銀織帶
  trimL.position.set(-torsoD * 0.53, -torsoH * 0.26, -torsoW * 0.11);
  trimL.rotation.set(0.08, 0, -0.23);
  torso.add(trimL);

  const trimR = new THREE.Mesh(new THREE.BoxGeometry(0.4, torsoH * 1.05, 0.8), accentGlow); // 右側發光魔紋
  trimR.position.set(-torsoD * 0.53, -torsoH * 0.26, torsoW * 0.11);
  trimR.rotation.set(-0.08, 0, -0.23);
  torso.add(trimR);

  // 懸浮魂魄冥環 (Soulfire Halo) - 環身改為冷銀色，使浮空質感更立體
  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(8.5 * bulk, 0.38, 4, 24), steelMat);
  haloRing.position.set(-4.5 * bulk, 24.5, 0);
  haloRing.rotation.y = Math.PI / 2;
  addAccent(haloRing);

  // 5 顆靈魂火球 (Soul orbs)
  for (let i = 0; i < 5; i++) {
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 * bulk, 0), gemMat);
    const angle = Math.PI * 0.22 + (i / 4) * Math.PI * 0.56;
    const ox = -4.5 * bulk;
    const oy = 24.5 + Math.sin(angle) * 8.5 * bulk;
    const oz = Math.cos(angle) * 8.5 * bulk;
    orb.position.set(ox, oy, oz);
    addAccent(orb);
  }

  return { torso, head, armL, armR, legL, legR };
}

export const buildWeapon = buildNecromancerWeapon;
