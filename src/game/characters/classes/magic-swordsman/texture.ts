// @ts-nocheck
export function drawMagicSwordsmanTexture(x, S) {
  // Background/Base circle
  x.fillStyle = '#10112d';
  x.beginPath(); x.arc(S / 2, S / 2, 45, 0, Math.PI * 2); x.fill();
  
  // Outer gold rim
  x.strokeStyle = '#ffd700';
  x.lineWidth = 3;
  x.beginPath(); x.arc(S / 2, S / 2, 44, 0, Math.PI * 2); x.stroke();

  // Cyan inner ring
  x.strokeStyle = '#00d2ff';
  x.lineWidth = 2;
  x.beginPath(); x.arc(S / 2, S / 2, 34, 0, Math.PI * 2); x.stroke();

  // Draw 6 orbital runes (glowing cyan and gold dots)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const px = S / 2 + Math.cos(a) * 26;
    const py = S / 2 + Math.sin(a) * 26;
    x.fillStyle = i % 2 === 0 ? '#ffd700' : '#00d2ff';
    x.beginPath(); x.arc(px, py, 3.5, 0, Math.PI * 2); x.fill();
  }

  // Draw central cross/sword energy (from image theme)
  x.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  x.lineWidth = 4;
  x.beginPath(); x.moveTo(S / 2 - 12, S / 2); x.lineTo(S / 2 + 12, S / 2); x.stroke();
  x.beginPath(); x.moveTo(S / 2, S / 2 - 12); x.lineTo(S / 2, S / 2 + 12); x.stroke();

  // Central glowing core
  x.fillStyle = '#00f3ff';
  x.beginPath(); x.arc(S / 2, S / 2, 6, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#ffffff';
  x.beginPath(); x.arc(S / 2, S / 2, 3, 0, Math.PI * 2); x.fill();
}

export function drawMagicSwordsmanMaterialTexture(x, S, meta = {}) {
  const variant = meta.variant || 'body';
  const cx = S / 2;
  const cy = S / 2;

  if (variant === 'hair') {
    // 髮根深靛藍到髮梢白金/亮藍漸層
    const grad = x.createLinearGradient(0, S, 0, 0);
    grad.addColorStop(0, '#0c0d2e');    // 髮根深靛藍
    grad.addColorStop(0.3, '#1d2260');  // 星空藍
    grad.addColorStop(0.7, '#64b6e7');  // 星塵藍
    grad.addColorStop(1, '#ffffff');    // 白金高光
    x.fillStyle = grad;
    x.fillRect(0, 0, S, S);

    // 髮絲紋理：暗色髮絲陰影
    x.strokeStyle = 'rgba(12, 13, 46, 0.35)';
    x.lineWidth = Math.max(1.5, S / 30);
    for (let u = S / 8; u < S; u += S / 4) {
      x.beginPath();
      x.moveTo(u, S);
      x.lineTo(cx + (u - cx) * 0.2, 0);
      x.stroke();
    }

    // 髮絲亮線
    x.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    x.lineWidth = Math.max(1, S / 45);
    for (let u = S / 3; u < S; u += S / 3) {
      x.beginPath();
      x.moveTo(u - S / 12, S);
      x.lineTo(cx + (u - S / 12 - cx) * 0.1, 0);
      x.stroke();
    }
    return;
  }

  if (variant === 'robe') {
    // 披風外側：精緻深黑/炭灰星空漸層 (Do not use purple, make it extremely deep black)
    const grad = x.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, '#010102');   // 極深黑
    grad.addColorStop(0.4, '#030405'); // 暗夜黑
    grad.addColorStop(0.8, '#080a0c'); // 炭黑
    grad.addColorStop(1, '#020203');   // 純黑
    x.fillStyle = grad;
    x.fillRect(0, 0, S, S);

    // 繪製手繪金色鑲邊線條 (Gold trim border)
    x.strokeStyle = '#ffd700';
    x.lineWidth = Math.max(2.5, S / 40);
    x.strokeRect(3, 3, S - 6, S - 6);

    // 繪製白金/星藍星座連接線
    x.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(S * 0.2, S * 0.3);
    x.lineTo(S * 0.45, S * 0.2);
    x.lineTo(S * 0.6, S * 0.5);
    x.lineTo(S * 0.8, S * 0.75);
    x.stroke();

    // 星座節點 (Glowing stars)
    x.fillStyle = '#ffffff';
    const stars = [
      [S * 0.2, S * 0.3],
      [S * 0.45, S * 0.2],
      [S * 0.6, S * 0.5],
      [S * 0.8, S * 0.75]
    ];
    for (const [sx, sy] of stars) {
      x.beginPath();
      x.arc(sx, sy, 2, 0, Math.PI * 2);
      x.fill();
      // 外發光
      x.fillStyle = 'rgba(0, 240, 255, 0.4)';
      x.beginPath();
      x.arc(sx, sy, 4.5, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = '#ffffff';
    }
    return;
  }

  if (variant === 'cape-inner') {
    // 披風內側：深海星軌魔能發光 (深藍到霓虹發光青藍，取代紫色)
    const grad = x.createLinearGradient(0, S, S, 0);
    grad.addColorStop(0, '#01030d');   // 深海藍黑
    grad.addColorStop(0.35, '#050a1c'); // 暗夜藍
    grad.addColorStop(0.75, '#00d2ff'); // 發光青藍
    grad.addColorStop(1, '#ffffff');    // 核心耀白
    x.fillStyle = grad;
    x.fillRect(0, 0, S, S);

    // 流光紋理 (Nebula swooshes)
    x.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    x.lineWidth = Math.max(4, S / 20);
    x.beginPath();
    x.arc(0, S, S * 0.8, Math.PI * 1.5, Math.PI * 2);
    x.stroke();
    x.beginPath();
    x.arc(0, S, S * 0.5, Math.PI * 1.5, Math.PI * 2);
    x.stroke();

    x.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    x.lineWidth = 1.5;
    x.strokeRect(4, 4, S - 8, S - 8);
    return;
  }

  if (variant === 'armor' || variant === 'cloth' || variant === 'body' || variant === 'humanoid') {
    // 身體與肢體裝甲（包含預設身體與 GLB 外觀皮）：精緻黑鐵/炭黑色彩
    const bg = x.createLinearGradient(0, 0, S, S);
    bg.addColorStop(0, '#010101');   // 極深黑
    bg.addColorStop(0.4, '#030304'); // 炭黑
    bg.addColorStop(0.8, '#060709'); // 鐵灰黑
    bg.addColorStop(1, '#020202');   // 純黑
    x.fillStyle = bg;
    x.fillRect(0, 0, S, S);

    // 1. 滿版微光背景細格線 (Background fine grid lines to decorate every facet)
    x.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    x.lineWidth = 1;
    for (let i = 0; i <= S; i += 16) {
      x.beginPath(); x.moveTo(i, 0); x.lineTo(i, S); x.stroke();
      x.beginPath(); x.moveTo(0, i); x.lineTo(S, i); x.stroke();
    }

    // 2. 密集青藍發光符文電路 (Glowing cyan circuitry arcs & lines)
    x.strokeStyle = 'rgba(0, 240, 255, 0.42)';
    x.lineWidth = 1.8;
    x.beginPath();
    x.arc(S * 0.25, S * 0.25, S * 0.15, 0, Math.PI * 1.5);
    x.stroke();
    x.beginPath();
    x.arc(S * 0.75, S * 0.75, S * 0.15, 0, Math.PI * 1.5);
    x.stroke();
    x.beginPath();
    x.arc(cx, cy, S * 0.35, 0, Math.PI * 2);
    x.stroke();

    // 電子連接折線
    x.beginPath();
    x.moveTo(10, 10); x.lineTo(S * 0.3, 10); x.lineTo(S * 0.4, S * 0.2);
    x.moveTo(S - 10, S - 10); x.lineTo(S * 0.7, S - 10); x.lineTo(S * 0.6, S * 0.8);
    x.stroke();

    // 3. 散落多處的黃金十字星徽章 (Gold star symbols on all 4 quadrants + center for complete UV coverage)
    x.fillStyle = 'rgba(255, 215, 0, 0.85)';
    const drawStar = (sx, sy, r) => {
      x.beginPath();
      x.moveTo(sx, sy - r);
      x.quadraticCurveTo(sx, sy, sx + r, sy);
      x.quadraticCurveTo(sx, sy, sx, sy + r);
      x.quadraticCurveTo(sx, sy, sx - r, sy);
      x.quadraticCurveTo(sx, sy, sx, sy - r);
      x.fill();
    };
    drawStar(cx, cy, 7.0); // Center star
    drawStar(cx - S * 0.3, cy - S * 0.3, 4.5); // Top-left
    drawStar(cx + S * 0.3, cy - S * 0.3, 4.5); // Top-right
    drawStar(cx - S * 0.3, cy + S * 0.3, 4.5); // Bottom-left
    drawStar(cx + S * 0.3, cy + S * 0.3, 4.5); // Bottom-right

    // 4. 連接星軌的星座虚線
    x.strokeStyle = 'rgba(255, 215, 0, 0.35)';
    x.lineWidth = 1.0;
    x.setLineDash([4, 4]);
    x.beginPath();
    x.moveTo(cx - S * 0.3, cy - S * 0.3);
    x.lineTo(cx, cy);
    x.lineTo(cx + S * 0.3, cy + S * 0.3);
    x.moveTo(cx + S * 0.3, cy - S * 0.3);
    x.lineTo(cx, cy);
    x.lineTo(cx - S * 0.3, cy + S * 0.3);
    x.stroke();
    x.setLineDash([]); // Restore solid lines

    // 倒角暗溝與高光邊線
    x.strokeStyle = 'rgba(0, 0, 0, 0.65)'; // 溝槽陰影
    x.lineWidth = 2.5;
    x.strokeRect(3, 3, S - 6, S - 6);

    x.strokeStyle = '#cbd5e1'; // 冷銀高光邊緣反光
    x.lineWidth = 1.2;
    x.strokeRect(5, 5, S - 10, S - 10);

    // 星海微弱碎星點綴
    x.fillStyle = 'rgba(0, 243, 255, 0.6)';
    for (let i = 0; i < 12; i++) {
      const px = Math.sin(i * 7.7) * cx + cx;
      const py = Math.cos(i * 3.3) * cy + cy;
      x.beginPath();
      x.arc(px, py, 1.3, 0, Math.PI * 2);
      x.fill();
    }
    return;
  }

  if (variant === 'steel' || variant === 'metal' || variant === 'gold') {
    // 雙色冷銀與暗金拼接 (多色彩搭配，提升精緻感)
    const bg = x.createLinearGradient(0, 0, S, S);
    bg.addColorStop(0, '#f8fafc');   // 亮白銀
    bg.addColorStop(0.3, '#cbd5e1'); // 冷銀
    bg.addColorStop(0.7, '#f59e0b'); // 裝飾金
    bg.addColorStop(1, '#b45309');   // 深金/古銅
    x.fillStyle = bg;
    x.fillRect(0, 0, S, S);

    // 雕刻暗影線
    x.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    x.lineWidth = 2;
    x.strokeRect(3, 3, S - 6, S - 6);

    // Specular highlight
    x.strokeStyle = '#ffffff';
    x.lineWidth = 1.2;
    x.beginPath();
    x.moveTo(4, 4); x.lineTo(S - 4, 4); x.lineTo(4, S - 4);
    x.stroke();
    return;
  }

  if (variant === 'glass' || variant === 'gem') {
    // 碎星折射水晶 (青藍寶石/發光晶體)
    const bg = x.createRadialGradient(cx, cy, 2, cx, cy, S * 0.7);
    bg.addColorStop(0, '#a5f3fc');      // 亮青藍
    bg.addColorStop(0.5, '#00d2ff');    // 魔能青藍
    bg.addColorStop(1, '#0033aa');      // 深海藍寶石
    x.fillStyle = bg;
    x.fillRect(0, 0, S, S);

    // 三角折射面 (Faceted patterns)
    x.fillStyle = 'rgba(255, 255, 255, 0.16)';
    x.beginPath();
    x.moveTo(cx, cy); x.lineTo(0, 0); x.lineTo(cx, 0);
    x.closePath(); x.fill();

    x.fillStyle = 'rgba(0, 80, 200, 0.35)';
    x.beginPath();
    x.moveTo(cx, cy); x.lineTo(S, 0); x.lineTo(S, cy);
    x.closePath(); x.fill();

    x.fillStyle = 'rgba(255, 255, 255, 0.22)';
    x.beginPath();
    x.moveTo(cx, cy); x.lineTo(0, S); x.lineTo(0, cy);
    x.closePath(); x.fill();

    // 晶格線條
    x.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    x.lineWidth = 1;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(S, S); x.stroke();
    x.beginPath(); x.moveTo(S, 0); x.lineTo(0, S); x.stroke();
    x.beginPath(); x.moveTo(cx, 0); x.lineTo(cx, S); x.stroke();
    x.beginPath(); x.moveTo(0, cy); x.lineTo(S, cy); x.stroke();
    return;
  }

  if (variant === 'face') {
    // 面具底色：炭灰黑鐵色 (Do not use purple, make it pitch black)
    x.fillStyle = '#010102';
    x.fillRect(0, 0, S, S);

    // 繪製冷銀裝甲邊界與格線 (Silver trim borders)
    x.strokeStyle = '#d2d5db';
    x.lineWidth = Math.max(2.5, S / 30);
    x.strokeRect(4, 4, S - 8, S - 8);

    // 繪製 V 形頰甲金屬刻線 (Cheek details)
    x.beginPath();
    x.moveTo(4, S * 0.7);
    x.lineTo(S * 0.35, S * 0.9);
    x.lineTo(S * 0.5, S * 0.75);
    x.lineTo(S * 0.65, S * 0.9);
    x.lineTo(S - 4, S * 0.7);
    x.stroke();

    // 繪製生氣的冷銀眉棱裝甲線 (Angled eyebrows)
    x.beginPath();
    x.moveTo(S * 0.15, S * 0.25);
    x.lineTo(S * 0.4, S * 0.35);
    x.lineTo(S * 0.5, S * 0.3);
    x.lineTo(S * 0.6, S * 0.35);
    x.lineTo(S * 0.85, S * 0.25);
    x.stroke();

    // ── 繪製發光眼神 (Piercing Glowing Eyes) ──
    x.fillStyle = '#00f0ff'; // 青藍魔能眼光
    // 左眼 (Slanted Left Eye)
    x.beginPath();
    x.moveTo(S * 0.22, S * 0.40);
    x.lineTo(S * 0.42, S * 0.46);
    x.lineTo(S * 0.38, S * 0.51);
    x.lineTo(S * 0.22, S * 0.45);
    x.closePath();
    x.fill();

    // 右眼 (Slanted Right Eye)
    x.beginPath();
    x.moveTo(S * 0.78, S * 0.40);
    x.lineTo(S * 0.58, S * 0.46);
    x.lineTo(S * 0.62, S * 0.51);
    x.lineTo(S * 0.78, S * 0.45);
    x.closePath();
    x.fill();

    // 耀白瞳孔光芒 (White pupil core points)
    x.fillStyle = '#ffffff';
    x.beginPath();
    x.arc(S * 0.30, S * 0.44, 2, 0, Math.PI * 2);
    x.arc(S * 0.70, S * 0.44, 2, 0, Math.PI * 2);
    x.fill();

    // 額頭星徽雕紋 (Forehead gold/cyan star brooch)
    x.fillStyle = '#ffd700';
    x.beginPath();
    x.arc(cx, cy - S * 0.3, 4.5, 0, Math.PI * 2);
    x.fill();

    x.strokeStyle = '#00f3ff';
    x.lineWidth = 1.2;
    x.beginPath();
    x.moveTo(cx, cy - S * 0.4); x.lineTo(cx, cy - S * 0.2);
    x.moveTo(cx - 8, cy - S * 0.3); x.lineTo(cx + 8, cy - S * 0.3);
    x.stroke();
    return;
  }

  // Fallback
  x.fillStyle = '#0c0d24';
  x.fillRect(0, 0, S, S);
}
