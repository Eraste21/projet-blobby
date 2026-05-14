import { getCanvasTheme } from './canvasTheme';

export function drawTimer(
  serverStartedAt: number | null,
  duration: number,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
) {
  const isSmall = canvas.width < 700;
  const width = isSmall ? 82 : 104;
  const height = isSmall ? 30 : 34;
  const x = canvas.width / 2 - width / 2;
  const y = isSmall ? 12 : 18;

  const theme = getCanvasTheme();

  ctx.save();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = theme.panelBackground;
  ctx.strokeStyle = theme.panelBorder;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 13);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.panelText;
  ctx.font = `700 ${isSmall ? 14 : 16}px Orbitron, Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (!serverStartedAt) {
    ctx.fillText('WAIT', canvas.width / 2, y + height / 2 + 1);
    ctx.restore();
    return;
  }

  const elapsed = (Date.now() - serverStartedAt) / 1000;
  const remaining = Math.max(0, duration - elapsed);

  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60).toString().padStart(2, '0');

  ctx.fillText(`${minutes}:${seconds}`, canvas.width / 2, y + height / 2 + 1);
  ctx.restore();
}
