import type { Camera, GameItem } from './types';

export function drawItems(ctx: CanvasRenderingContext2D, items: GameItem[], camera: Camera) {
  items.forEach((item) => {
    const screenX = item.x - camera.x;
    const screenY = item.y - camera.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(screenX, screenY, item.r, 0, Math.PI * 2);
    ctx.fillStyle = item.type === 'heal' ? '#39ff88' : '#ffe45c';
    ctx.shadowColor = item.type === 'heal' ? '#39ff88' : '#ffe45c';
    ctx.shadowBlur = 25;
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
