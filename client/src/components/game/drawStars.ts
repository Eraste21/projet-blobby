import type { Camera, Star } from './types';

export function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], camera: Camera) {
  ctx.beginPath();
  ctx.fillStyle = 'white';
  ctx.shadowBlur = 0;

  stars.forEach((star) => {
    ctx.moveTo(star.x - camera.x + star.r, star.y - camera.y);
    ctx.arc(star.x - camera.x, star.y - camera.y, star.r, 0, 2 * Math.PI);
  });

  ctx.fill();
}
