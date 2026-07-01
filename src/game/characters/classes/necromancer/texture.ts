// @ts-nocheck
export function drawNecromancerTexture(x, S) {
  // 死靈法師：枯骨裂紋與幽綠死氣
  x.fillStyle = 'rgba(0, 0, 0, 0.4)';
  x.fillRect(0, 0, S, S);
  x.strokeStyle = 'rgba(120, 200, 140, 0.45)';
  x.lineWidth = 2;
  for (let i = 0; i < 8; i++) { const px = Math.random() * S, py = Math.random() * S; x.beginPath(); x.moveTo(px, py); for (let j = 0; j < 3; j++) x.lineTo(px + (Math.random() - 0.5) * 40, py + j * 18); x.stroke(); }
}

export function drawNecromancerMaterialTexture(x, S, meta = {}) {
  const variant = meta.variant || 'body';
  const cx = S / 2;
  const cy = S / 2;

  if (variant === 'hair' || variant === 'horn') {
    // 骸骨/牛角：象牙白到幽暗綠、深紫灰
    const grad = x.createLinearGradient(0, S, 0, 0);
    grad.addColorStop(0, '#1c102b'); // 底部深紫死氣
    grad.addColorStop(0.3, '#2a302e'); // 暗灰
    grad.addColorStop(0.7, '#d3cbba'); // 骸骨白
    grad.addColorStop(1, '#e8e2d0'); // 亮骨白
    x.fillStyle = grad;
    x.fillRect(0, 0, S, S);

    // 骨裂縫線
    x.strokeStyle = 'rgba(28, 20, 36, 0.5)';
    x.lineWidth = Math.max(1, S / 100);
    for (let i = 0; i < 6; i++) {
      const px = Math.random() * S, py = Math.random() * S;
      x.beginPath();
      x.moveTo(px, py);
      for (let j = 0; j < 3; j++) x.lineTo(px + (Math.random() - 0.5) * (S / 6), py + j * (S / 8));
      x.stroke();
    }

    // 幽綠發光脈絡
    x.strokeStyle = 'rgba(46, 204, 113, 0.4)';
    x.lineWidth = Math.max(1, S / 120);
    for (let i = 0; i < 4; i++) {
      const px = Math.random() * S, py = Math.random() * S;
      x.beginPath();
      x.moveTo(px, py);
      for (let j = 0; j < 3; j++) x.lineTo(px + (Math.random() - 0.5) * (S / 8), py + j * (S / 6));
      x.stroke();
    }
    return;
  }

  if (variant === 'robe' || variant === 'cloth' || variant === 'body') {
    // 冥界法袍布料 (深邃暗紫搭配墨綠/幽綠底蘊)
    const bg = x.createLinearGradient(0, 0, S, S);
    bg.addColorStop(0, '#1c102e'); // 深暗紫
    bg.addColorStop(0.5, '#2e1b4a'); // 幽冥紫
    bg.addColorStop(1, '#112920'); // 暗墨綠
    x.fillStyle = bg;
    x.fillRect(0, 0, S, S);

    // 織物紋理與褶皺
    x.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    x.lineWidth = Math.max(1.5, S / 60);
    for (let i = 0; i < S; i += S / 10) {
      x.beginPath();
      x.moveTo(0, i); x.lineTo(S, i + (Math.random() - 0.5) * (S / 5));
      x.stroke();
    }

    // 幽綠與冷銀色交織的死亡符文紋路
    x.strokeStyle = 'rgba(39, 174, 96, 0.28)';
    x.lineWidth = Math.max(1.5, S / 80);
    for (let i = 0; i < 2; i++) {
      x.beginPath();
      x.arc(cx + (Math.random() - 0.5) * (S / 3), cy + (Math.random() - 0.5) * (S / 3), S * 0.2, 0, Math.PI * 2);
      x.stroke();
    }

    x.strokeStyle = 'rgba(189, 195, 199, 0.15)'; // 冷銀色織線
    for (let i = 0; i < 2; i++) {
      x.beginPath();
      x.moveTo(Math.random() * S, 0); x.lineTo(Math.random() * S, S);
      x.stroke();
    }

    // 破舊金屬/銀絲滾邊線
    x.strokeStyle = '#bdc3c7'; // 冷銀滾邊
    x.lineWidth = Math.max(2, S / 60);
    x.setLineDash([Math.max(4, S / 30), Math.max(4, S / 30)]);
    x.strokeRect(4, 4, S - 8, S - 8);
    x.setLineDash([]);
    return;
  }

  if (variant === 'steel' || variant === 'armor' || variant === 'metal') {
    // 亮鋼/暗鐵交錯 (Steel/Iron with emerald verdigris)
    const bg = x.createLinearGradient(0, 0, S, S);
    bg.addColorStop(0, '#2c3e50'); // 帶藍的暗鐵
    bg.addColorStop(0.5, '#7f8c8d'); // 冷灰鋼
    bg.addColorStop(1, '#1a252f'); // 深暗鐵
    x.fillStyle = bg;
    x.fillRect(0, 0, S, S);

    // 綠色銅鏽/魔能侵蝕
    x.fillStyle = 'rgba(39, 174, 96, 0.12)';
    for (let i = 0; i < 40; i++) {
      x.fillRect(Math.random() * S, Math.random() * S, 3 + Math.random() * 3, 3 + Math.random() * 3);
    }

    // 亮鋼倒角高光線
    x.strokeStyle = '#bdc3c7'; // 冷銀白
    x.lineWidth = Math.max(2, S / 60);
    x.strokeRect(3, 3, S - 6, S - 6);
    return;
  }

  if (variant === 'gem' || variant === 'glass') {
    // 發光幽綠水晶
    const bg = x.createRadialGradient(cx, cy, 2, cx, cy, S * 0.55);
    bg.addColorStop(0, '#a3e4d7'); // 發光核心
    bg.addColorStop(0.4, '#2ecc71'); // 幽綠
    bg.addColorStop(0.8, '#1e8449'); // 深綠
    bg.addColorStop(1, '#0e3d24'); // 邊緣陰影
    x.fillStyle = bg;
    x.fillRect(0, 0, S, S);

    // 水晶切割稜面
    x.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    x.lineWidth = Math.max(1, S / 120);
    const facets = [
      [0, 0, cx, cy],
      [S, 0, cx, cy],
      [S, S, cx, cy],
      [0, S, cx, cy],
      [cx, 0, cx, cy],
      [cx, S, cx, cy],
      [0, cy, cx, cy],
      [S, cy, cx, cy]
    ];
    facets.forEach(([x1, y1, x2, y2]) => {
      x.beginPath();
      x.moveTo(x1, y1);
      x.lineTo(x2, y2);
      x.stroke();
    });
    return;
  }

  // Fallback
  x.fillStyle = 'rgba(0, 0, 0, 0.5)';
  x.fillRect(0, 0, S, S);
}
