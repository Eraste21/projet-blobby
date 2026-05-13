import type { Player } from '../game/types';

export function healthBar(ctx: CanvasRenderingContext2D, player: Player) {
  const width = 220;
  const height = 18;
  const x = 30;
  const y = 30;
  const hpRatio = Math.max(0, Math.min(player.hp / 100, 1));
  const roleLabel = player.role === 'hunter' ? 'Chasseur' : 'Fuyard';

  ctx.save();
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'white';
  ctx.font = '700 18px Orbitron, Arial';
  ctx.fillText(roleLabel, x, y - 10);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = player.role === 'hunter' ? '#ff2b2b' : '#00aaff';
  ctx.fillRect(x, y, width * hpRatio, height);

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}
