import type { Camera, Wall } from './types';

export function drawWalls(ctx: CanvasRenderingContext2D, camera: Camera, walls: Wall[]) {
  ctx.save();

  walls.forEach((wall) => {
    ctx.fillStyle = '#050505';
    ctx.strokeStyle = '#e0f7ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#e0f7ff';
    ctx.shadowBlur = 12;

    ctx.fillRect(wall.x - camera.x, wall.y - camera.y, wall.width, wall.height);
    ctx.strokeRect(wall.x - camera.x, wall.y - camera.y, wall.width, wall.height);
  });

  ctx.restore();
}
