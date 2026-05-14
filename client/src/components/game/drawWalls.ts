import type { Camera, Wall } from './types';
import type { Viewport } from './viewport';
import { isRectVisible } from './viewport';
import { shadowBlur } from './renderQuality';
import { getCanvasTheme } from './canvasTheme';

export function drawWalls(ctx: CanvasRenderingContext2D, camera: Camera, walls: Wall[], viewport: Viewport) {
  const theme = getCanvasTheme();

  ctx.save();
  ctx.fillStyle = theme.isLight ? '#ffffff' : '#050505';
  ctx.strokeStyle = theme.mapForegroundSoft;
  ctx.lineWidth = 2;
  ctx.shadowColor = theme.mapForegroundSoft;
  ctx.shadowBlur = shadowBlur(12, 0);

  walls.forEach((wall) => {
    if (!isRectVisible(wall.x, wall.y, wall.width, wall.height, viewport, 120)) return;

    ctx.fillRect(wall.x - camera.x, wall.y - camera.y, wall.width, wall.height);
    ctx.strokeRect(wall.x - camera.x, wall.y - camera.y, wall.width, wall.height);
  });

  ctx.restore();
}
