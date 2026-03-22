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
      
      // Crop centralizado
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.drawImage(img, sx, sy, minDim, minDim, centerX - radius, centerY - radius, radius * 2, radius * 2);
      
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
  const avatarRadius = 80 * scale; // 2x maior
  const avatarGap = 30 * scale; // espaçamento entre avatar e barra

  // Avatar above the bar (com gap)
  const avatarCenterX = x + barW / 2;
  const avatarCenterY = y - avatarGap - avatarRadius;
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

  // --- Nome: primeiro nome + primeiro sobrenome (em 2 linhas, fonte dinâmica) ---
  const nameParts = winner.name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const surname = nameParts.length > 1 ? nameParts[1] : '';
  const centerX = x + barW / 2;
  const maxTextWidth = barW - 20 * scale;

  // Função helper: calcula tamanho de fonte que cabe na largura
  function fitFontSize(text: string, maxW: number, idealSize: number, minSize: number): number {
    let size = idealSize;
    ctx.font = `bold ${size}px "Inter", "Segoe UI", sans-serif`;
    while (ctx.measureText(text).width > maxW && size > minSize) {
      size -= 1;
      ctx.font = `bold ${size}px "Inter", "Segoe UI", sans-serif`;
    }
    return size;
  }

  // Primeiro nome
  ctx.fillStyle = COLORS.white;
  const firstNameSize = fitFontSize(firstName, maxTextWidth, 26 * scale, 16 * scale);
  ctx.font = `bold ${firstNameSize}px "Inter", "Segoe UI", sans-serif`;
  ctx.fillText(firstName, centerX, y + barH - 75 * scale);

  // Sobrenome (abaixo)
  if (surname) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    const surnameSize = fitFontSize(surname, maxTextWidth, 22 * scale, 14 * scale);
    ctx.font = `bold ${surnameSize}px "Inter", "Segoe UI", sans-serif`;
    ctx.fillText(surname, centerX, y + barH - 48 * scale);
  }

  // Points (GRANDE e destacado)
  ctx.fillStyle = COLORS.secondaryLight;
  ctx.font = `bold ${28 * scale}px "Inter", "Segoe UI", sans-serif`;
  ctx.fillText(`${winner.points} XP`, centerX, y + barH - 14 * scale);
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

  // 2 & 3. Header (Logo + Title + Badge)
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage(logoUrl);
  } catch (e) {
    // fallback text handled below
  }

  const badgeText = `SEMANA ${weekNumber}`;

  if (format === 'instagram') {
    // --- Layout Empilhado (Vertical) do Instagram ---
    if (logoImg) {
      const logoH = 80;
      const logoW = (logoImg.width / logoImg.height) * logoH;
      ctx.drawImage(logoImg, (W - logoW) / 2, 60, logoW, logoH);
    } else {
      ctx.fillStyle = COLORS.secondary;
      ctx.font = `bold 36px "Inter", "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('CONNECTHUB', W / 2, 100);
    }

    const titleY = 200;
    ctx.fillStyle = COLORS.white;
    ctx.font = `bold 46px "Inter", "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🏆 TOP 3 DA SEMANA', W / 2, titleY + 14);

    ctx.font = `bold 22px "Inter", "Segoe UI", sans-serif`;
    const badgeW = ctx.measureText(badgeText).width + 48;
    const badgeX = (W - badgeW) / 2;
    const badgeY = titleY + 34;

    ctx.fillStyle = COLORS.secondary;
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, 40, 20);
    ctx.fill();

    ctx.fillStyle = COLORS.primaryDark;
    ctx.font = `bold 20px "Inter", "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, W / 2, badgeY + 27);

  } else {
    // --- Layout na mesma linha (Horizontal) do LinkedIn ---
    const titleText = '🏆 TOP 3 DA SEMANA';
    ctx.font = `bold ${36 * scale}px "Inter", "Segoe UI", sans-serif`; 
    const titleW = ctx.measureText(titleText).width;

    ctx.font = `bold ${22 * scale}px "Inter", "Segoe UI", sans-serif`;
    const badgeW = ctx.measureText(badgeText).width + 48 * scale;
    
    const logoH = 45 * scale;
    const logoW = logoImg ? (logoImg.width / logoImg.height) * logoH : 220 * scale;

    const gap = 40 * scale;
    const totalHeaderW = logoW + gap + titleW + gap + badgeW;
    let currentX = (W - totalHeaderW) / 2;
    const centerY = 75 * scale; // Y center for the header elements

    // Draw logo
    if (logoImg) {
      ctx.drawImage(logoImg, currentX, centerY - logoH / 2, logoW, logoH);
    } else {
      ctx.fillStyle = COLORS.secondary;
      ctx.font = `bold ${28 * scale}px "Inter", "Segoe UI", sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('CONNECTHUB', currentX, centerY);
      ctx.textBaseline = 'alphabetic'; // reset
    }
    currentX += logoW + gap;

    // Draw Title
    ctx.fillStyle = COLORS.white;
    ctx.font = `bold ${36 * scale}px "Inter", "Segoe UI", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleText, currentX, centerY);
    ctx.textBaseline = 'alphabetic'; // reset
    currentX += titleW + gap;

    // Draw Badge
    const badgeY = centerY - (40 * scale) / 2;
    ctx.fillStyle = COLORS.secondary;
    drawRoundedRect(ctx, currentX, badgeY, badgeW, 40 * scale, 20 * scale);
    ctx.fill();

    ctx.fillStyle = COLORS.primaryDark;
    ctx.font = `bold ${20 * scale}px "Inter", "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, currentX + badgeW / 2, centerY + 2 * scale);
    ctx.textBaseline = 'alphabetic'; // reset
  }

  // 4. Podium bars
  const barW = format === 'instagram' ? 240 : 210;
  const podiumBaseY = format === 'instagram' ? H - 180 : H - 60;
  const gap = format === 'instagram' ? 35 : 25;
  const totalW = barW * 3 + gap * 2;
  const startX = (W - totalW) / 2;

  const heights: Record<number, number> = {
    1: format === 'instagram' ? 520 : 250,
    2: format === 'instagram' ? 380 : 190,
    3: format === 'instagram' ? 260 : 150,
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
