// @ts-nocheck
import * as THREE from 'three';
import { createWeaponKit } from '../../../render3d/weaponKit.js';

// 聖騎士：黃金戰錘。錘頭厚重顯眼，以明顯斜握姿態舉起（參考魔劍士的持武手感），
// 讓錘子從各角度都看得出來。柄短、頭大。
export function buildPaladinWeapon(hand, ctx) {
  const kit = createWeaponKit(hand, ctx);
  const { reg, mat, add } = kit;

  // 明顯斜舉：錘頭朝右側上方揚起、突出於身形輪廓外，讓錘子從背後視角也看得到。
  hand.rotation.set(0.95, 0, -0.35);
  hand.position.x += 2.0;
  hand.position.y += 3.0;

  const goldTex = ctx.materialTex ? ctx.materialTex('metal', 'gold') : null;
  const steelTex = ctx.materialTex ? ctx.materialTex('steel', 'steel') : null;
  const goldMat = reg(mat('#caa63a', { map: goldTex, rough: 0.28, metal: 0.95 }));
  const steelMat = reg(mat('#c3c9d2', { map: steelTex, rough: 0.24, metal: 0.9 }));
  const gripMat = reg(mat('#3a2a18', { rough: 0.7, metal: 0.2 }));
  const gemMat = reg(mat('#e21b1b', { emissive: new THREE.Color('#e21b1b'), ei: 2.0, rough: 0.25, metal: 0.4 }));

  // 皮革握把（短，沿 +Y）
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.9, 22, 8), gripMat), 0, 4, 0);
  for (let i = 0; i < 3; i++) add(new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.4, 6, 12), goldMat), 0, -2 + i * 4, 0, Math.PI / 2, 0, 0);
  // 底部金劍首
  add(new THREE.Mesh(new THREE.SphereGeometry(2.6, 10, 8), goldMat), 0, -8, 0);

  // ── 厚重錘頭（明顯放大）──
  const hy = 20;
  add(new THREE.Mesh(new THREE.BoxGeometry(14, 13, 13), steelMat), 0, hy, 0);        // 主體
  add(new THREE.Mesh(new THREE.BoxGeometry(15, 4.2, 15), goldMat), 0, hy, 0);        // 金箍（橫）
  add(new THREE.Mesh(new THREE.BoxGeometry(4.6, 13.4, 15), goldMat), 0, hy, 0);      // 金箍（縱）
  add(new THREE.Mesh(new THREE.BoxGeometry(2.6, 11, 11), goldMat), 7.6, hy, 0);      // 前敲擊面
  add(new THREE.Mesh(new THREE.OctahedronGeometry(2.6, 0), gemMat), 9.2, hy, 0);     // 敲擊面紅寶石
  add(new THREE.Mesh(new THREE.ConeGeometry(2.6, 9, 6), goldMat), 0, hy + 9, 0);     // 頂尖
  add(new THREE.Mesh(new THREE.ConeGeometry(2.2, 8, 4), goldMat), -8.5, hy, 0, 0, 0, Math.PI / 2); // 背面尖爪
}
