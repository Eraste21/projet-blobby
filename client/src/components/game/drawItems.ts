import type { Camera, GameItem } from './types';
import type { Viewport } from './viewport';
import { isCircleVisible } from './viewport';
import { shadowBlur } from './renderQuality';

export function drawItems(ctx: CanvasRenderingContext2D, items: GameItem[], camera: Camera, viewport: Viewport) {
  items.forEach((item) => {
    if (!isCircleVisible(item.x, item.y, item.r, viewport, 90)) return;

    const screenX = item.x - camera.x;
    const screenY = item.y - camera.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(screenX, screenY, item.r, 0, Math.PI * 2);
    ctx.fillStyle = item.type === 'heal' ? '#39ff88' : '#ffe45c';
    ctx.shadowColor = item.type === 'heal' ? '#39ff88' : '#ffe45c';
    ctx.shadowBlur = shadowBlur(25, 0);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#050505';
    ctx.font = '700 15px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.type === 'heal' ? '+' : '⚡', screenX, screenY + 1);
    ctx.restore();
  });
}
