import logoUrl from '../assets/logo.webp';

// Brand Colors (Primary = azul escuro, Secondary = azul claro)
const COLORS = {
  primaryDark: '#0F172A',
  primaryMid: '#1E293B',
  secondary: '#38BDF8',
  secondaryLight: '#7DD3FC',
  gold: '#F59E0B',
  silver: '#9CA3AF',
  bronze: '#D97706',
  white: '#FFFFFF',
  whiteAlpha: 'rgba(255,255,255,0.85)',
  textLight: 'rgba(255,255,255,0.6)',
};

export interface PodiumWinner {
  position: number;
  name: string;
  points: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, COLORS.primaryDark);
  grad.addColorStop(0.5, COLORS.primaryMid);
  grad.addColorStop(1, COLORS.primaryDark);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle dots pattern
  ctx.fillStyle = 'rgba(56, 189, 248, 0.03)';
  for (let i = 0; i < w; i += 30) {
    for (let j = 0; j < h; j += 30) {
      ctx.beginPath();
      ctx.arc(i, j, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Glow circles
  const glowGrad = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, w * 0.5);
  glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
  glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, w, h);
}

function drawPodiumBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, barW: number, barH: number,
  color: string, position: number, name: string, points: number,
  scale: number
) {
  // Bar shadow
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 20 * scale;
  ctx.shadowOffsetY = 8 * scale;

  // Bar
  const grad = ctx.createLinearGradient(x, y, x, y + barH);
  grad.addColorStop(0, color);
  grad.addColorStop(1, position === 1 ? '#B45309' : position === 2 ? '#6B7280' : '#92400E');
  ctx.fillStyle = grad;
  drawRoundedRect(ctx, x, y, barW, barH, 12 * scale);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Position number
  const posY = y + 35 * scale;
  ctx.fillStyle = COLORS.white;
  ctx.font = `bold ${32 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${position}º`, x + barW / 2, posY);

  // Medal emoji
  const medals = ['🥇', '🥈', '🥉'];
  ctx.font = `${28 * scale}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
  ctx.fillText(medals[position - 1], x + barW / 2, posY + 34 * scale);

  // Name on the bar
  ctx.fillStyle = COLORS.whiteAlpha;
  ctx.font = `bold ${16 * scale}px "Inter", "Segoe UI", sans-serif`;
  const displayName = name.length > 14 ? name.substring(0, 12) + '...' : name;
  ctx.fillText(displayName, x + barW / 2, y + barH - 35 * scale);

  // Points
  ctx.fillStyle = COLORS.textLight;
  ctx.font = `${14 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.fillText(`${points} XP`, x + barW / 2, y + barH - 14 * scale);
}

export async function generatePodiumImage(
  winners: PodiumWinner[],
  weekNumber: number,
  year: number,
  format: 'instagram' | 'linkedin'
): Promise<string> {
  const canvas = document.createElement('canvas');

  // Instagram 4:5 = 1080x1350, LinkedIn 1.91:1 = 1200x628
  const W = format === 'instagram' ? 1080 : 1200;
  const H = format === 'instagram' ? 1350 : 628;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d')!;
  const scale = format === 'instagram' ? 1 : 0.85;

  // 1. Background
  drawBackground(ctx, W, H);

  // 2. Logo
  try {
    const logo = await loadImage(logoUrl);
    const logoH = format === 'instagram' ? 80 : 50;
    const logoW = (logo.width / logo.height) * logoH;
    ctx.drawImage(logo, (W - logoW) / 2, format === 'instagram' ? 60 : 30, logoW, logoH);
  } catch (e) {
    // Fallback text logo
    ctx.fillStyle = COLORS.secondary;
    ctx.font = `bold ${36 * scale}px "Inter", "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('CONNECTA', W / 2, format === 'instagram' ? 100 : 60);
  }

  // 3. Title
  const titleY = format === 'instagram' ? 200 : 110;

  ctx.fillStyle = COLORS.secondary;
  ctx.font = `bold ${14 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '4px';
  ctx.fillText('GAMIFICATION', W / 2, titleY - 30 * scale);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = COLORS.white;
  ctx.font = `bold ${42 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.fillText('🏆 TOP 3 DA SEMANA', W / 2, titleY + 10 * scale);

  // Week number badge
  const badgeText = `SEMANA ${weekNumber}`;
  ctx.font = `bold ${20 * scale}px "Inter", "Segoe UI", sans-serif`;
  const badgeW = ctx.measureText(badgeText).width + 40 * scale;
  const badgeX = (W - badgeW) / 2;
  const badgeY = titleY + 28 * scale;

  ctx.fillStyle = COLORS.secondary;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, 36 * scale, 18 * scale);
  ctx.fill();

  ctx.fillStyle = COLORS.primaryDark;
  ctx.font = `bold ${18 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, W / 2, badgeY + 24 * scale);

  // 4. Podium bars
  const barW = format === 'instagram' ? 220 : 200;
  const podiumBaseY = format === 'instagram' ? H - 200 : H - 80;
  const gap = format === 'instagram' ? 40 : 30;
  const totalW = barW * 3 + gap * 2;
  const startX = (W - totalW) / 2;

  // Heights for positions (1st tallest in center, 2nd left, 3rd right)
  const heights = {
    1: format === 'instagram' ? 400 : 280,
    2: format === 'instagram' ? 300 : 210,
    3: format === 'instagram' ? 230 : 170,
  };

  // Draw order: 2nd, 1st, 3rd (for proper visual layering)
  const positions = [
    { pos: 2, x: startX },
    { pos: 1, x: startX + barW + gap },
    { pos: 3, x: startX + 2 * (barW + gap) },
  ];

  positions.forEach(({ pos, x }) => {
    const winner = winners.find(w => w.position === pos);
    if (winner) {
      const barH = heights[pos as 1 | 2 | 3];
      const barY = podiumBaseY - barH;
      const color = pos === 1 ? COLORS.gold : pos === 2 ? COLORS.silver : COLORS.bronze;
      drawPodiumBar(ctx, x, barY, barW, barH, color, pos, winner.name, winner.points, scale);
    }
  });

  // 5. Footer
  ctx.fillStyle = COLORS.textLight;
  ctx.font = `${13 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`Connecta Gamification • ${year}`, W / 2, H - (format === 'instagram' ? 50 : 20));

  // Decorative line
  ctx.strokeStyle = COLORS.secondary;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(W * 0.2, H - (format === 'instagram' ? 70 : 35));
  ctx.lineTo(W * 0.8, H - (format === 'instagram' ? 70 : 35));
  ctx.stroke();
  ctx.globalAlpha = 1;

  return canvas.toDataURL('image/png');
}
