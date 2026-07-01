// @ts-nocheck
import * as THREE from 'three';
import { buildPaladinWeapon } from './weapon.ts';

// 聖騎士：以魔獸「審判之甲（Judgement / T2）」為藍本重製 ——
//   黑色兜帽下僅露緋紅雙眸與黃金面甲、巨大黃金鑲寶肩甲、胸前銀鋼聖十字、
//   刻著紅色符文的羊皮聖帶、緋紅鋼片裙襬，背負雙劍。
//
// 設計取捨（有別於其他角色的重製手法）：
//   1. 肢體沿用 rig 的 mkLimb 基底再「附掛」細節，不砍掉重建，避免無謂的建立即丟棄。
//   2. 遵守 rig 的「面向 +X」慣例：胸甲、十字、聖帶一律置於 +X 正面（舊版誤置於 ±Z 側面）。
export const modelConfig = { bulk: 2.4, weapon: 'warhammer', skinKind: 'metal', headgear: 'none', pauldron: false };

export function buildModel(ctx) {
  const {
    bulk, reg, mat,
    torsoW, torsoD, torsoH, shoulderX, hipX,
    frontX, faceGroup, mkLimb, materialTex,
  } = ctx;

  // ---- 色盤 ----
  const BLACK = '#151515';  // 黑袍
  const GOLD = '#caa63a';   // 黃金重甲
  const RED = '#7d1a1a';    // 緋紅裙襬
  const STEEL = '#c3c9d2';  // 銀鋼十字/鋼片
  const PARCH = '#e7d9a6';  // 羊皮聖帶
  const GEM = '#e21b1b';    // 紅寶石

  // ---- 程序化材質貼圖 ----
  const robeTex = materialTex ? materialTex('cloth', 'robe') : null;
  const goldTex = materialTex ? materialTex('metal', 'gold') : null;
  const steelTex = materialTex ? materialTex('steel', 'steel') : null;
  const redTex = materialTex ? materialTex('cloth', 'red') : null;
  const parchTex = materialTex ? materialTex('cloth', 'parch') : null;

  const robeMat = reg(mat(BLACK, { map: robeTex, rough: 0.85, metal: 0.08 }));
  const goldMat = reg(mat(GOLD, { map: goldTex, rough: 0.28, metal: 0.95 }));
  const steelMat = reg(mat(STEEL, { map: steelTex, rough: 0.24, metal: 0.9 }));
  const redMat = reg(mat(RED, { map: redTex, rough: 0.7, metal: 0.12 }));
  const parchMat = reg(mat(PARCH, { map: parchTex, rough: 0.75, metal: 0.05 }));
  const gemMat = reg(mat(GEM, { emissive: new THREE.Color(GEM), ei: 2.0, rough: 0.25, metal: 0.4 }));
  const eyeMat = reg(mat('#ff2a1e', { emissive: new THREE.Color('#ff2a1e'), ei: 3.2, rough: 0.3, metal: 0.2 }));
  const voidMat = reg(mat('#0b0b0b', { rough: 0.95, metal: 0.02 })); // 兜帽陰影/臉部空洞

  // ---- 小工具 ----
  const box = (w, h, d, m) => { const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); me.castShadow = true; return me; };
  const cyl = (rt, rb, h, seg, m) => { const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); me.castShadow = true; return me; };
  const gem = (r, m = gemMat) => { const me = new THREE.Mesh(new THREE.OctahedronGeometry(r, 0), m); me.castShadow = true; return me; };

  const TOP = torsoH * 0.5;   // 軀幹上緣（肩線）
  const FZ = torsoD * 0.5;    // 正面 (+X) 表面距離

  // ================= 軀幹 =================
  const torso = new THREE.Group();

  // 黑袍底層（微微上窄下寬）
  const body = cyl(torsoW * 0.34, torsoW * 0.40, torsoH * 1.02, 12, robeMat);
  torso.add(body);

  // 黃金胸甲（正面）
  const chest = box(torsoD * 0.52, torsoH * 0.66, torsoW * 0.56, goldMat);
  chest.position.set(torsoD * 0.14, torsoH * 0.12, 0);
  torso.add(chest);

  // 胸口銀鋼盾板 + 聖十字
  const shield = box(torsoD * 0.12, torsoH * 0.5, torsoW * 0.3, steelMat);
  shield.position.set(FZ * 0.72, torsoH * 0.1, 0);
  torso.add(shield);
  const crossV = box(torsoD * 0.14, torsoH * 0.42, 2.6, goldMat);
  crossV.position.set(FZ * 0.78, torsoH * 0.1, 0);
  torso.add(crossV);
  const crossH = box(torsoD * 0.14, 3.0, torsoW * 0.22, goldMat);
  crossH.position.set(FZ * 0.78, torsoH * 0.22, 0);
  torso.add(crossH);

  // 腹甲兩段
  for (let i = 0; i < 2; i++) {
    const ab = box(torsoD * 0.44, torsoH * 0.12, torsoW * 0.44, goldMat);
    ab.position.set(torsoD * 0.16, -torsoH * (0.16 + i * 0.16), 0);
    torso.add(ab);
  }

  // 黃金腰帶 + 三顆紅寶石
  const belt = cyl(torsoW * 0.42, torsoW * 0.42, torsoH * 0.16, 12, goldMat);
  belt.position.y = -torsoH * 0.46;
  torso.add(belt);
  for (const z of [-torsoW * 0.24, 0, torsoW * 0.24]) {
    const g = gem(2.6);
    g.position.set(FZ * 0.86, -torsoH * 0.46, z);
    torso.add(g);
  }

  // 黃金護頸（gorget）
  const gorget = cyl(torsoW * 0.24, torsoW * 0.3, torsoH * 0.28, 12, goldMat);
  gorget.position.y = TOP + torsoH * 0.04;
  torso.add(gorget);

  // ---- 圓弧黃金肩甲：罩住肩頭並向下垂，而非水平外突的層板 ----
  const buildPauldron = (sign) => {
    const g = new THREE.Group();
    g.position.set(0, TOP - 1, sign * shoulderX);
    const R = torsoW * 0.26;
    // 主圓頂（半球）
    const dome = new THREE.Mesh(new THREE.SphereGeometry(R, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), goldMat);
    dome.scale.set(1.0, 1.12, 1.08);
    dome.position.y = 2;
    dome.castShadow = true;
    g.add(dome);
    // 下垂第二層甲片（下寬上窄，罩住上臂）
    const flare = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.72, R * 0.98, 6, 16, 1, true), goldMat);
    flare.position.y = -3;
    flare.scale.set(1.06, 1, 1.12);
    flare.castShadow = true;
    g.add(flare);
    // 鋼緣滾邊
    const trim = new THREE.Mesh(new THREE.TorusGeometry(R * 0.95, 0.8, 6, 22), steelMat);
    trim.rotation.x = Math.PI / 2;
    trim.position.y = -0.4;
    trim.scale.set(1.06, 1.12, 1);
    trim.castShadow = true;
    g.add(trim);
    // 正面紅寶石
    const gm = gem(2.9);
    gm.position.set(R * 0.72, 1.5, 0);
    g.add(gm);
    return g;
  };
  torso.add(buildPauldron(-1));
  torso.add(buildPauldron(1));

  // ---- 背負雙劍（劍柄越肩而出）----
  const buildBackSword = (sign) => {
    const g = new THREE.Group();
    g.position.set(-torsoD * 0.42, TOP + 1, sign * shoulderX * 0.42);
    g.rotation.x = sign * 0.42; // 交叉張開
    g.rotation.z = -0.18;       // 略微後仰
    // 淺色皮革握把（便於在深色兜帽前辨識）
    const grip = cyl(1.6, 1.6, 16, 8, parchMat);
    grip.position.y = 15; g.add(grip);
    // 鋼十字護手
    const guard = box(3.4, 2.8, 15, steelMat);
    guard.position.y = 6; g.add(guard);
    // 黃金劍首 + 紅寶石
    const pommel = new THREE.Mesh(new THREE.SphereGeometry(2.6, 12, 10), goldMat);
    pommel.position.y = 24; pommel.castShadow = true; g.add(pommel);
    const pgem = gem(1.5); pgem.position.y = 24; g.add(pgem);
    // 沒入背後的劍鞘
    const scab = box(3.6, 24, 5.2, robeMat);
    scab.position.y = -8; g.add(scab);
    const scabTip = box(3.4, 4, 4.8, goldMat);
    scabTip.position.y = -20; g.add(scabTip);
    return g;
  };
  torso.add(buildBackSword(-1));
  torso.add(buildBackSword(1));

  // ---- 正面中央聖帶（黃金垂片 + 底部銀鋼十字）----
  const tabard = box(torsoD * 0.16, torsoH * 1.5, torsoW * 0.26, goldMat);
  tabard.position.set(FZ * 0.7, -torsoH * 1.05, 0);
  torso.add(tabard);
  const tabardCrossV = box(2.2, torsoH * 0.4, 3.2, steelMat);
  tabardCrossV.position.set(FZ * 0.7 + torsoD * 0.09, -torsoH * 1.5, 0);
  torso.add(tabardCrossV);
  const tabardCrossH = box(2.2, 3.2, torsoW * 0.16, steelMat);
  tabardCrossH.position.set(FZ * 0.7 + torsoD * 0.09, -torsoH * 1.4, 0);
  torso.add(tabardCrossH);

  // ---- 兩側羊皮聖帶（刻紅色符文，垂於聖帶兩旁）----
  for (const z of [-torsoW * 0.2, torsoW * 0.2]) {
    const ribbon = box(1.4, torsoH * 1.35, torsoW * 0.12, parchMat);
    ribbon.position.set(FZ * 0.66, -torsoH * 0.95, z);
    ribbon.rotation.z = 0.03;
    torso.add(ribbon);
  }

  // ---- 緋紅鋼片裙襬 ----
  const skirt = cyl(torsoW * 0.36, torsoW * 0.52, torsoH * 0.95, 14, redMat);
  skirt.position.y = -torsoH * 0.92;
  torso.add(skirt);
  // 裙襬底部銀鋼護片一圈
  const plateCount = 12;
  for (let i = 0; i < plateCount; i++) {
    const a = (i / plateCount) * Math.PI * 2;
    const plate = box(3.2, torsoH * 0.28, torsoW * 0.16, steelMat);
    plate.position.set(Math.cos(a) * torsoW * 0.5, -torsoH * 1.34, Math.sin(a) * torsoW * 0.5);
    plate.rotation.y = -a;
    torso.add(plate);
  }

  // ================= 頭部：兜帽 + 黃金面甲 + 緋紅雙眸 =================
  const head = new THREE.Group();

  // 陰影中的臉/頭底
  const headCore = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 14), voidMat);
  headCore.scale.set(0.95, 1.05, 0.95);
  headCore.castShadow = true;
  head.add(headCore);

  // 黑色兜帽外殼（後推、上抬且拉長成蛋形，讓正面成為臉部開口）
  const hood = new THREE.Mesh(new THREE.SphereGeometry(12.5, 18, 16), robeMat);
  hood.position.set(-3.5, 2.5, 0);
  hood.scale.set(0.9, 1.28, 1.02);
  hood.castShadow = true;
  head.add(hood);

  // 兜帽尖頂（後仰的錐形冠，塑造審判兜帽輪廓）
  const crown = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 10), robeMat);
  crown.position.set(-2, 12, 0);
  crown.rotation.z = 0.28; // 尖端向後傾
  crown.castShadow = true;
  head.add(crown);

  // 兜帽後背的中脊接縫
  const ridge = box(2.4, 20, 2.2, robeMat);
  ridge.position.set(-12, 2, 0);
  ridge.rotation.z = -0.12;
  head.add(ridge);

  // 兜帽前緣壓低的眉簷（把臉罩入陰影）
  const hoodBrow = box(6, 3.2, 17, robeMat);
  hoodBrow.position.set(6.5, 7.4, 0);
  hoodBrow.rotation.z = 0.18;
  head.add(hoodBrow);

  // 臉部開口的黃金鑲邊（框住臉孔，正面/斜側都能看見）
  const rim = new THREE.Mesh(new THREE.TorusGeometry(8.6, 1.1, 8, 22), goldMat);
  rim.position.set(8.2, -1, 0);
  rim.rotation.y = Math.PI / 2;
  rim.castShadow = true;
  head.add(rim);

  // ---- 簡潔銀鋼面甲：只留眉樑 + 鼻樑（T 形），避免柵欄／橘糊感 ----
  // （銀鋼在黑兜帽陰影下比暗金更清晰，不會糊成一片橘色。）
  const browBar = box(2.2, 2.2, 12, steelMat);
  browBar.position.set(9.7, 3.4, 0);
  browBar.rotation.z = 0.05;
  head.add(browBar);
  const noseGuard = box(2.4, 6.5, 2.2, steelMat);
  noseGuard.position.set(9.8, -0.4, 0);
  head.add(noseGuard);

  // 額前小聖十字 + 紅寶石（兜帽正面的信仰徽記）
  const fcV = box(1.4, 4.0, 1.4, goldMat); fcV.position.set(9.7, 8.2, 0); head.add(fcV);
  const fcH = box(1.4, 1.4, 4.0, goldMat); fcH.position.set(9.7, 9.1, 0); head.add(fcH);
  const foreGem = gem(1.6); foreGem.position.set(10.1, 8.2, 0); head.add(foreGem);

  // ---- 緋紅雙眸：大而明亮，作為臉部焦點（凸出於臉面，清楚可見）----
  for (const s of [-1, 1]) {
    const eye = box(3.0, 2.2, 3.2, eyeMat);
    eye.position.set(9.6, 0.8, s * 3.7);
    eye.rotation.z = -0.18 * s; // 內低外高，凶悍
    faceGroup.add(eye);
  }

  // ================= 四肢（沿用 mkLimb 基底 + 附掛細節）=================
  // 上臂黑袍、前臂/脛甲黃金；手腕紅寶光環、腳踝暗金光環。
  const armL = mkLimb(0, -shoulderX, true, robeMat, goldMat, GEM, 5.0 * bulk, 15);
  const armR = mkLimb(0, shoulderX, true, robeMat, goldMat, GEM, 5.0 * bulk, 15);
  const legL = mkLimb(0, -hipX, false, robeMat, goldMat, '#3a2e0e', 5.6 * bulk, 15);
  const legR = mkLimb(0, hipX, false, robeMat, goldMat, '#3a2e0e', 5.6 * bulk, 15);

  const len = 15;
  const augArm = (pivot) => {
    const w = 5.0 * bulk;
    // 鋼護腕環
    const cuff = box(w * 1.35 + 1.2, 1.8, w * 1.35 + 1.2, steelMat);
    cuff.position.y = -len * 0.65 + 0.6;
    pivot.add(cuff);
    // 前臂紅寶石
    const g = gem(2.2);
    g.position.set(w * 0.95, -len * 0.82, 0);
    pivot.add(g);
  };
  const augLeg = (pivot) => {
    const w = 5.6 * bulk;
    // 膝甲
    const knee = box(w * 0.7, 3.4, w * 1.15, goldMat);
    knee.position.set(w * 0.6, -len * 0.6, 0);
    pivot.add(knee);
  };
  augArm(armL); augArm(armR);
  augLeg(legL); augLeg(legR);

  return { torso, head, armL, armR, legL, legR };
}

export const buildWeapon = buildPaladinWeapon;
