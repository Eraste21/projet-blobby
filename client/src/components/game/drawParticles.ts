import type { Camera, Particle } from './types';
import type { Viewport } from './viewport';
import { isCircleVisible } from './viewport';
import { shadowBlur } from './renderQuality';

export function createExplosion(x: number, y: number, particles: Particle[], color = '#00eaff') {
  for (let i = 0; i < 40; i += 1) {
    particles.push({
      x,
      y,
      r: Math.random() * 4 + 2,
      dx: (Math.random() - 0.5) * 12,
      dy: (Math.random() - 0.5) * 12,
      life: 60,
      color,
    });
  }
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], camera: Camera, viewport: Viewport) {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];

    particle.x += particle.dx;
    particle.y += particle.dy;
    particle.life -= 1;
    particle.r *= 0.97;

    if (particle.life <= 0 || particle.r < 0.5) {
      particles.splice(i, 1);
      continue;
    }

    if (!isCircleVisible(particle.x, particle.y, particle.r, viewport, 80)) continue;

    ctx.beginPath();
    ctx.arc(particle.x - camera.x, particle.y - camera.y, particle.r, 0, Math.PI * 2);

    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = shadowBlur(15, 0);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
}
