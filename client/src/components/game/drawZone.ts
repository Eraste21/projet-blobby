import type { Camera, GameZone } from './types';
import type { Viewport } from './viewport';
import { isCircleVisible } from './viewport';
import { shadowBlur } from './renderQuality';

export function drawDangerZone(
  ctx: CanvasRenderingContext2D,
  zone: GameZone,
  camera: Camera,
  canvas: HTMLCanvasElement,
  viewport?: Viewport,
) {
  ctx.save();

  const zoneScreenX = zone.x - camera.x;
  const zoneScreenY = zone.y - camera.y;

  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.arc(zoneScreenX, zoneScreenY, zone.r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(224, 247, 255, 0.12)';
  ctx.fill('evenodd');
  ctx.restore();

  if (viewport && !isCircleVisible(zone.x, zone.y, zone.r, viewport, 30)) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(zoneScreenX, zoneScreenY, zone.r, 0, Math.PI * 2);
  ctx.strokeStyle = '#e0f7ff';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#e0f7ff';
  ctx.shadowBlur = shadowBlur(25 + Math.sin(performance.now() * 0.006) * 10, 0);
  ctx.stroke();
  ctx.restore();
}
