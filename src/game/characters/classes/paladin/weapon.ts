// @ts-nocheck
import * as THREE from 'three';
import { createWeaponKit } from '../../../render3d/weaponKit.js';

// 聖騎士：短柄黃金戰錘。以「握持」姿態斜舉（參考魔劍士的持武手感），
// 而非直挺挺垂直；聖騎士戰錘本身不長，故整體保持緊湊。
export function buildPaladinWeapon(hand, ctx) {
  const kit = createWeaponKit(hand, ctx);
  const { reg, mat, add } = kit;

  // 讓手掌握住武器並朝前上方斜舉。
  hand.rotation.set(0, 0, -0.7);
  hand.position.x += 2.5;
  hand.position.y -= 1.0;

  const goldTex = ctx.materialTex ? ctx.materialTex('metal', 'gold') : null;
  const steelTex = ctx.materialTex ? ctx.materialTex('steel', 'steel') : null;
  const goldMat = reg(mat('#caa63a', { map: goldTex, rough: 0.28, metal: 0.95 }));
  const steelMat = reg(mat('#c3c9d2', { map: steelTex, rough: 0.24, metal: 0.9 }));
  const gripMat = reg(mat('#3a2a18', { rough: 0.7, metal: 0.2 }));       // 皮革握把
  const gemMat = reg(mat('#e21b1b', { emissive: new THREE.Color('#e21b1b'), ei: 2.0, rough: 0.25, metal: 0.4 }));

  // 短皮革握把（沿 +Y，握於手中）
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 20, 8), gripMat), 0, 3, 0);
  // 金色防滑環
  for (let i = 0; i < 3; i++) add(new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.35, 6, 12), goldMat), 0, -3 + i * 4, 0, Math.PI / 2, 0, 0);
  // 底部金劍首
  add(new THREE.Mesh(new THREE.SphereGeometry(2.0, 10, 8), goldMat), 0, -8, 0);

  // 緊湊錘頭（位於握把上端）
  const hy = 15;
  add(new THREE.Mesh(new THREE.BoxGeometry(8.5, 10, 8.5), steelMat), 0, hy, 0);
  // 金箍十字（環繞錘頭）
  add(new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.2, 9.2), goldMat), 0, hy, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 10, 9.2), goldMat), 0, hy, 0);
  // 敲擊面紅寶石
  add(new THREE.Mesh(new THREE.OctahedronGeometry(1.9, 0), gemMat), 4.8, hy, 0);
  // 頂端金尖
  add(new THREE.Mesh(new THREE.ConeGeometry(1.7, 6, 6), goldMat), 0, hy + 8, 0);
}
