import logoUrl from '../assets/logo.webp';

// Brand Colors (Primary = azul escuro, Secondary = azul claro)
const COLORS = {
  primaryDark: '#0F172A',
  primaryMid: '#1E293B',
  secondary: '#38BDF8',
  secondaryLight: '#7DD3FC',
  gold: '#F59E0B',
  goldDark: '#B45309',
  silver: '#9CA3AF',
  silverDark: '#6B7280',
  bronze: '#D97706',
  bronzeDark: '#92400E',
  white: '#FFFFFF',
  whiteAlpha: 'rgba(255,255,255,0.9)',
  textLight: 'rgba(255,255,255,0.6)',
};

export interface PodiumWinner {
  position: number;
  name: string;
  points: number;
  avatarUrl?: string;
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

function drawCircleClip(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.closePath();
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
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

  // Glow
  const glowGrad = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, w * 0.5);
  glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
  glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, w, h);
}

async function drawAvatar(
  ctx: CanvasRenderingContext2D,
  avatarUrl: string | undefined,
  name: string,
  centerX: number,
  centerY: number,
  radius: number,
  borderColor: string
) {
  // Border circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 4, 0, Math.PI * 2);
  ctx.fillStyle = borderColor;
  ctx.fill();

  // White inner border
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.primaryDark;
  ctx.fill();

  if (avatarUrl) {
    try {
      const img = await loadImage(avatarUrl);
      ctx.save();
      drawCircleClip(ctx, centerX, centerY, radius);
      ctx.clip();
      ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2);
      ctx.restore();
      return;
    } catch (e) {
      // fallback to initials
    }
  }

  // Fallback: colored circle with initial
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.secondary;
  ctx.fill();

  ctx.fillStyle = COLORS.primaryDark;
  ctx.font = `bold ${radius}px "Inter", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name.charAt(0).toUpperCase(), centerX, centerY + 2);
  ctx.textBaseline = 'alphabetic';
}

async function drawPodiumBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, barW: number, barH: number,
  color: string, darkColor: string,
  position: number, winner: PodiumWinner,
  scale: number
) {
  const avatarRadius = 40 * scale;

  // Avatar above the bar
  const avatarCenterX = x + barW / 2;
  const avatarCenterY = y - avatarRadius - 12 * scale;
  await drawAvatar(ctx, winner.avatarUrl, winner.name, avatarCenterX, avatarCenterY, avatarRadius, color);

  // Bar shadow
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 25 * scale;
  ctx.shadowOffsetY = 10 * scale;

  // Bar gradient
  const grad = ctx.createLinearGradient(x, y, x, y + barH);
  grad.addColorStop(0, color);
  grad.addColorStop(1, darkColor);
  ctx.fillStyle = grad;
  drawRoundedRect(ctx, x, y, barW, barH, 14 * scale);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Position number & medal
  const posY = y + 45 * scale;
  ctx.fillStyle = COLORS.white;
  ctx.font = `bold ${38 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${position}º`, x + barW / 2, posY);

  const medals = ['🥇', '🥈', '🥉'];
  ctx.font = `${32 * scale}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
  ctx.fillText(medals[position - 1], x + barW / 2, posY + 40 * scale);

  // Name (GRANDE e destacado)
  ctx.fillStyle = COLORS.white;
  ctx.font = `bold ${22 * scale}px "Inter", "Segoe UI", sans-serif`;
  const firstName = winner.name.split(' ')[0];
  const displayName = firstName.length > 12 ? firstName.substring(0, 10) + '..' : firstName;
  ctx.fillText(displayName, x + barW / 2, y + barH - 50 * scale);

  // Points (GRANDE e destacado)
  ctx.fillStyle = COLORS.secondaryLight;
  ctx.font = `bold ${26 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.fillText(`${winner.points} XP`, x + barW / 2, y + barH - 18 * scale);
}

export async function generatePodiumImage(
  winners: PodiumWinner[],
  weekNumber: number,
  year: number,
  format: 'instagram' | 'linkedin'
): Promise<string> {
  const canvas = document.createElement('canvas');

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
    ctx.drawImage(logo, (W - logoW) / 2, format === 'instagram' ? 60 : 25, logoW, logoH);
  } catch (e) {
    ctx.fillStyle = COLORS.secondary;
    ctx.font = `bold ${36 * scale}px "Inter", "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('CONNECTA', W / 2, format === 'instagram' ? 100 : 55);
  }

  // 3. Title
  const titleY = format === 'instagram' ? 200 : 105;

  ctx.fillStyle = COLORS.secondary;
  ctx.font = `bold ${14 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('CONNECTHUB', W / 2, titleY - 30 * scale);

  ctx.fillStyle = COLORS.white;
  ctx.font = `bold ${46 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.fillText('🏆 TOP 3 DA SEMANA', W / 2, titleY + 14 * scale);

  // Week badge
  const badgeText = `SEMANA ${weekNumber}`;
  ctx.font = `bold ${22 * scale}px "Inter", "Segoe UI", sans-serif`;
  const badgeW = ctx.measureText(badgeText).width + 48 * scale;
  const badgeX = (W - badgeW) / 2;
  const badgeY = titleY + 34 * scale;

  ctx.fillStyle = COLORS.secondary;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, 40 * scale, 20 * scale);
  ctx.fill();

  ctx.fillStyle = COLORS.primaryDark;
  ctx.font = `bold ${20 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, W / 2, badgeY + 27 * scale);

  // 4. Podium bars
  const barW = format === 'instagram' ? 240 : 210;
  const podiumBaseY = format === 'instagram' ? H - 180 : H - 60;
  const gap = format === 'instagram' ? 35 : 25;
  const totalW = barW * 3 + gap * 2;
  const startX = (W - totalW) / 2;

  const heights: Record<number, number> = {
    1: format === 'instagram' ? 380 : 250,
    2: format === 'instagram' ? 280 : 190,
    3: format === 'instagram' ? 210 : 150,
  };

  // Draw order: 2nd, 3rd, 1st (1st on top / last)
  const drawOrder = [
    { pos: 2, x: startX, color: COLORS.silver, dark: COLORS.silverDark },
    { pos: 3, x: startX + 2 * (barW + gap), color: COLORS.bronze, dark: COLORS.bronzeDark },
    { pos: 1, x: startX + barW + gap, color: COLORS.gold, dark: COLORS.goldDark },
  ];

  for (const { pos, x, color, dark } of drawOrder) {
    const winner = winners.find(w => w.position === pos);
    if (winner) {
      const barH = heights[pos];
      const barY = podiumBaseY - barH;
      await drawPodiumBar(ctx, x, barY, barW, barH, color, dark, pos, winner, scale);
    }
  }

  // 5. Footer
  ctx.fillStyle = COLORS.textLight;
  ctx.font = `${14 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`ConnectHub • ${year}`, W / 2, H - (format === 'instagram' ? 45 : 15));

  // Footer decorative line
  ctx.strokeStyle = COLORS.secondary;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(W * 0.2, H - (format === 'instagram' ? 65 : 30));
  ctx.lineTo(W * 0.8, H - (format === 'instagram' ? 65 : 30));
  ctx.stroke();
  ctx.globalAlpha = 1;

  return canvas.toDataURL('image/png');
}
