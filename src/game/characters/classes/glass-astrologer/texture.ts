// @ts-nocheck
export function drawGlassAstrologerTexture(x, S) {
  const cx = S / 2;
  const cy = S / 2;

  x.strokeStyle = 'rgba(185, 245, 255, 0.62)';
  x.lineWidth = 2;
  for (let r = 18; r <= 52; r += 17) {
    x.beginPath();
    x.arc(cx, cy, r, 0, Math.PI * 2);
    x.stroke();
  }

  x.strokeStyle = 'rgba(255, 230, 167, 0.5)';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    x.beginPath();
    x.moveTo(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12);
    x.lineTo(cx + Math.cos(a) * 58, cy + Math.sin(a) * 58);
    x.stroke();
  }

  x.fillStyle = 'rgba(255, 255, 255, 0.68)';
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const r = 24 + (i % 3) * 12;
    x.beginPath();
    x.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.8 + (i % 2), 0, Math.PI * 2);
    x.fill();
  }

  x.strokeStyle = 'rgba(158, 232, 255, 0.42)';
  x.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const px = 18 + i * 15;
    x.beginPath();
    x.moveTo(px, 18 + (i % 2) * 16);
    x.lineTo(px + 12, 44 + (i % 3) * 15);
    x.lineTo(px - 4, 84 - (i % 2) * 12);
    x.stroke();
  }
}

export function drawGlassAstrologerMaterialTexture(x, S, meta = {}) {
  const variant = meta.variant || 'body';
  const cx = S / 2;
  const cy = S / 2;

  if (variant === 'hair') {
    // Paint vertical gradient: deep dark at base (bottom, y=S) to bright white at tip (top, y=0)
    const grad = x.createLinearGradient(0, S, 0, 0);
    grad.addColorStop(0, '#0a0f14');    // Deepest shadow at base
    grad.addColorStop(0.2, '#202a35');  // Dark shadow
    grad.addColorStop(0.5, '#687b8c');  // Midtone shading
    grad.addColorStop(0.85, '#e2e7ec'); // Highlights transition
    grad.addColorStop(1, '#ffffff');    // Pure white tip
    x.fillStyle = grad;
    x.fillRect(0, 0, S, S);

    // Draw dark vertical strand shadow lines tapering towards tip (heavy shadows)
    x.strokeStyle = 'rgba(10, 15, 20, 0.72)';
    x.lineWidth = Math.max(3, S / 15);
    for (let u = S / 8; u < S; u += S / 4) {
      x.beginPath();
      x.moveTo(u, S);
      x.lineTo(cx + (u - cx) * 0.1, 0);
      x.stroke();
    }

    // Draw secondary thinner shadow lines for extra depth/texture
    x.strokeStyle = 'rgba(15, 25, 35, 0.52)';
    x.lineWidth = Math.max(1.5, S / 30);
    for (let u = S / 6; u < S; u += S / 3) {
      x.beginPath();
      x.moveTo(u, S);
      x.lineTo(cx + (u - cx) * 0.2, 0);
      x.stroke();
    }

    // Draw bright highlight fine lines
    x.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    x.lineWidth = Math.max(2, S / 35);
    for (let u = S / 3; u < S; u += S / 3) {
      x.beginPath();
      x.moveTo(u - S / 12, S);
      x.lineTo(cx + (u - S / 12 - cx) * 0.1, 0);
      x.stroke();
    }
    return;
  }

  if (variant === 'robe') {
    // Fabric gradient
    const bg = x.createLinearGradient(0, 0, S, S);
    bg.addColorStop(0, '#040914');
    bg.addColorStop(0.5, '#0e1a33');
    bg.addColorStop(1, '#050a14');
    x.fillStyle = bg;
    x.fillRect(0, 0, S, S);

    // Fabric fold shading (diagonal dark and light folds)
    x.lineWidth = Math.max(12, S / 40);
    for (let i = 0; i < S * 2; i += S / 4) {
      const grad = x.createLinearGradient(i - S/2, 0, i + S/2, S);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
      x.strokeStyle = grad;
      x.beginPath();
      x.moveTo(i, 0); x.lineTo(i - S, S);
      x.stroke();
    }

    // Border trim inner shadow (for 3D depth)
    x.strokeStyle = 'rgba(0, 0, 0, 0.72)';
    x.lineWidth = Math.max(6, S / 50);
    x.strokeRect(6, 6, S - 12, S - 12);

    // Gold borders on top of the shadow
    x.strokeStyle = '#ffd700';
    x.lineWidth = Math.max(4, S / 60);
    x.strokeRect(4, 4, S - 8, S - 8);

    // Celestial star links
    x.strokeStyle = 'rgba(158, 232, 255, 0.6)';
    x.lineWidth = Math.max(1, S / 200);
    x.beginPath();
    x.moveTo(S * 0.2, S * 0.3);
    x.lineTo(S * 0.5, S * 0.2);
    x.lineTo(S * 0.8, S * 0.4);
    x.lineTo(S * 0.6, S * 0.7);
    x.lineTo(S * 0.3, S * 0.8);
    x.closePath();
    x.stroke();

    // Star dots with soft outer glow
    for (const [px, py] of [[0.2, 0.3], [0.5, 0.2], [0.8, 0.4], [0.6, 0.7], [0.3, 0.8]]) {
      const r = Math.max(2, S / 100);
      x.fillStyle = 'rgba(0, 240, 255, 0.4)';
      x.beginPath(); x.arc(px * S, py * S, r * 2.2, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#ffffff';
      x.beginPath(); x.arc(px * S, py * S, r, 0, Math.PI * 2); x.fill();
    }
    return;
  }

  if (variant === 'armor') {
    // Base metal plates
    const bg = x.createLinearGradient(0, 0, S, S);
    bg.addColorStop(0, '#10141e');
    bg.addColorStop(0.5, '#181e2b');
    bg.addColorStop(1, '#0a0d14');
    x.fillStyle = bg;
    x.fillRect(0, 0, S, S);

    // Cell plate shading (each 4x4 cell has a rounded plate gradient)
    const cellSize = S / 4;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const px = c * cellSize;
        const py = r * cellSize;
        const cellGrad = x.createRadialGradient(px + cellSize * 0.3, py + cellSize * 0.3, 2, px + cellSize/2, py + cellSize/2, cellSize * 0.7);
        cellGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
        cellGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        cellGrad.addColorStop(1, 'rgba(0, 0, 0, 0.42)');
        x.fillStyle = cellGrad;
        x.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
      }
    }

    // Glowing cyan circuitry / rune lines
    x.strokeStyle = '#00f0ff';
    x.lineWidth = Math.max(2.2, S / 110);
    x.shadowColor = '#00f0ff';
    x.shadowBlur = 12;
    x.beginPath();
    for (let i = S / 4; i < S; i += S / 4) {
      x.moveTo(i, 0); x.lineTo(i, S);
      x.moveTo(0, i); x.lineTo(S, i);
    }
    x.stroke();
    x.shadowBlur = 0; // Reset shadow

    // 3D Bevel/Groove shading (drop shadow and highlight on the joints)
    x.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    x.lineWidth = Math.max(2, S / 120);
    x.beginPath();
    for (let i = S / 4; i < S; i += S / 4) {
      x.moveTo(i - 1, 0); x.lineTo(i - 1, S);
      x.moveTo(0, i - 1); x.lineTo(S, i - 1);
    }
    x.stroke();

    x.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    x.lineWidth = Math.max(1, S / 200);
    x.beginPath();
    for (let i = S / 4; i < S; i += S / 4) {
      x.moveTo(i + 1.5, 0); x.lineTo(i + 1.5, S);
      x.moveTo(0, i + 1.5); x.lineTo(S, i + 1.5);
    }
    x.stroke();
    return;
  }

  if (variant === 'gold') {
    // Rich golden base gradient
    const bg = x.createLinearGradient(0, 0, 0, S);
    bg.addColorStop(0, '#ffe875');
    bg.addColorStop(0.3, '#ffd700');
    bg.addColorStop(0.7, '#b38600');
    bg.addColorStop(1, '#664d00');
    x.fillStyle = bg;
    x.fillRect(0, 0, S, S);

    // Decorative swirl carving shadow (offset by +1.5px)
    x.strokeStyle = '#332600';
    x.lineWidth = Math.max(2.5, S / 90);
    x.beginPath();
    x.arc(cx + 1.5, cy + 1.5, S * 0.35, 0, Math.PI * 1.5);
    x.arc(cx + 1.5, cy + 1.5, S * 0.2, Math.PI * 0.5, Math.PI * 2);
    x.stroke();

    // Specular highlight (offset by -1.5px)
    x.strokeStyle = '#ffffff';
    x.lineWidth = Math.max(1.5, S / 150);
    x.beginPath();
    x.arc(cx - 1.5, cy - 1.5, S * 0.35, 0, Math.PI * 1.5);
    x.arc(cx - 1.5, cy - 1.5, S * 0.2, Math.PI * 0.5, Math.PI * 2);
    x.stroke();

    // Central jewel socket outline shadow
    x.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    x.lineWidth = Math.max(3, S / 80);
    x.beginPath();
    x.arc(cx, cy, S * 0.1, 0, Math.PI * 2);
    x.stroke();
    return;
  }

  if (variant === 'glass') {
    // Deep crystal cyan-blue gradient
    const bg = x.createLinearGradient(0, 0, S, 0);
    bg.addColorStop(0, '#5effff');
    bg.addColorStop(0.35, '#00b4d8');
    bg.addColorStop(0.7, '#0077b6');
    bg.addColorStop(1, '#001830');
    x.fillStyle = bg;
    x.fillRect(0, 0, S, S);

    // Shading facets (filling triangles with darker/lighter colors for refraction)
    const fillFacet = (p1, p2, p3, fillStyle) => {
      x.fillStyle = fillStyle;
      x.beginPath();
      x.moveTo(p1[0], p1[1]);
      x.lineTo(p2[0], p2[1]);
      x.lineTo(p3[0], p3[1]);
      x.closePath();
      x.fill();
    };

    // Dark facet overlays
    fillFacet([0, 0], [cx, cy], [S, 0], 'rgba(0, 20, 60, 0.32)');
    fillFacet([S, S], [cx, cy], [0, S], 'rgba(0, 10, 40, 0.24)');

    // Bright facet overlays
    fillFacet([S, 0], [cx, cy], [S, S], 'rgba(255, 255, 255, 0.08)');
    fillFacet([0, S], [cx, cy], [0, 0], 'rgba(255, 255, 255, 0.16)');

    // Draw geometric facet border shadows (dark blue)
    x.strokeStyle = 'rgba(0, 24, 48, 0.72)';
    x.lineWidth = Math.max(3, S / 90);
    x.beginPath();
    x.moveTo(0, 0); x.lineTo(cx, cy); x.lineTo(S, 0);
    x.moveTo(S, 0); x.lineTo(cx, cy); x.lineTo(S, S);
    x.moveTo(S, S); x.lineTo(cx, cy); x.lineTo(0, S);
    x.moveTo(0, S); x.lineTo(cx, cy); x.lineTo(0, 0);
    x.stroke();

    // Draw bright facet refraction highlight lines (white)
    x.strokeStyle = 'rgba(255, 255, 255, 0.82)';
    x.lineWidth = Math.max(1.8, S / 150);
    x.strokeRect(4, 4, S - 8, S - 8);

    // Diagonal bright gleam line
    x.beginPath();
    x.moveTo(S * 0.1, 0); x.lineTo(S, S * 0.9);
    x.stroke();
    return;
  }

  const bg = x.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, '#10293a');
  bg.addColorStop(0.45, '#153f56');
  bg.addColorStop(1, '#07131f');
  x.fillStyle = bg;
  x.fillRect(0, 0, S, S);

  x.globalAlpha = 0.22;
  x.strokeStyle = '#9ee8ff';
  x.lineWidth = Math.max(1, S / 160);
  for (let i = -S; i < S * 2; i += S / 12) {
    x.beginPath();
    x.moveTo(i, 0);
    x.lineTo(i + S * 0.42, S);
    x.stroke();
  }
  x.globalAlpha = 1;

  x.globalAlpha = 0.18;
  x.strokeStyle = '#ffffff';
  x.lineWidth = Math.max(1, S / 260);
  for (let i = 0; i < S; i += S / 18) {
    x.beginPath();
    x.moveTo(0, i);
    x.bezierCurveTo(S * 0.28, i + S * 0.08, S * 0.68, i - S * 0.08, S, i + S * 0.03);
    x.stroke();
  }
  x.globalAlpha = 1;

  x.strokeStyle = 'rgba(255, 230, 167, 0.68)';
  x.lineWidth = Math.max(2, S / 96);
  for (let r = S * 0.16; r <= S * 0.42; r += S * 0.085) {
    x.beginPath();
    x.arc(cx, cy, r, 0, Math.PI * 2);
    x.stroke();
  }

  x.strokeStyle = 'rgba(255, 230, 167, 0.38)';
  x.lineWidth = Math.max(1.4, S / 180);
  for (let i = 0; i < 4; i++) {
    const inset = S * (0.055 + i * 0.035);
    x.strokeRect(inset, inset, S - inset * 2, S - inset * 2);
  }

  x.strokeStyle = 'rgba(185, 245, 255, 0.62)';
  x.lineWidth = Math.max(1.4, S / 180);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    x.beginPath();
    x.moveTo(cx + Math.cos(a) * S * 0.08, cy + Math.sin(a) * S * 0.08);
    x.lineTo(cx + Math.cos(a) * S * 0.46, cy + Math.sin(a) * S * 0.46);
    x.stroke();
  }

  const stars = [
    [0.18, 0.24], [0.32, 0.18], [0.46, 0.3], [0.62, 0.22], [0.78, 0.34],
    [0.24, 0.58], [0.38, 0.68], [0.54, 0.57], [0.7, 0.72], [0.84, 0.62],
    [0.12, 0.82], [0.28, 0.9], [0.44, 0.78], [0.61, 0.88], [0.9, 0.86],
  ];
  x.strokeStyle = 'rgba(158, 232, 255, 0.46)';
  x.lineWidth = Math.max(1, S / 220);
  for (let i = 0; i < stars.length - 1; i++) {
    x.beginPath();
    x.moveTo(stars[i][0] * S, stars[i][1] * S);
    x.lineTo(stars[i + 1][0] * S, stars[i + 1][1] * S);
    x.stroke();
  }
  for (let i = 0; i < stars.length; i++) {
    const [sx, sy] = stars[i];
    x.fillStyle = i % 3 === 0 ? 'rgba(255, 230, 167, 0.9)' : 'rgba(255, 255, 255, 0.86)';
    x.beginPath();
    x.arc(sx * S, sy * S, S * (i % 3 === 0 ? 0.012 : 0.009), 0, Math.PI * 2);
    x.fill();
  }

  x.globalAlpha = variant === 'robe' ? 0.42 : 0.28;
  x.strokeStyle = 'rgba(255, 230, 167, 0.72)';
  x.lineWidth = Math.max(1.5, S / 150);
  for (const px of [0.18, 0.5, 0.82]) {
    x.beginPath();
    x.moveTo(px * S, S * 0.04);
    x.lineTo((px - 0.06) * S, S * 0.46);
    x.lineTo((px + 0.04) * S, S * 0.96);
    x.stroke();
  }
  x.globalAlpha = 1;

  x.globalAlpha = variant === 'robe' ? 0.36 : 0.22;
  x.strokeStyle = '#ffffff';
  x.lineWidth = Math.max(1, S / 256);
  for (let i = 0; i < 8; i++) {
    const px = (0.08 + i * 0.12) * S;
    x.beginPath();
    x.moveTo(px, S * 0.05);
    x.lineTo(px + S * 0.08, S * 0.36);
    x.lineTo(px - S * 0.04, S * 0.82);
    x.stroke();
  }
  x.globalAlpha = 1;
}
