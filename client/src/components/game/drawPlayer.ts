import type { Camera, Player } from './types';
import type { Viewport } from './viewport';
import { isCircleVisible } from './viewport';
import { shadowBlur } from './renderQuality';
import { getCanvasTheme } from './canvasTheme';

function shouldBlink(player: Player, now: number) {
  const hitUntil = player.hitUntil ?? 0;
  if (hitUntil <= now) return false;

  // Clignotement rapide comme dans les jeux arcade après une perte de vie.
  return Math.floor(now / 95) % 2 === 0;
}

export function drawPlayers(
  ctx: CanvasRenderingContext2D,
  players: Record<string, Player>,
  camera: Camera,
  myPlayerId: string,
  viewport: Viewport,
) {
  const now = Date.now();
  const theme = getCanvasTheme();

  const myPlayer = players[myPlayerId];

  Object.values(players).forEach((player) => {
    if (!player.isAlive) return;

    const isMe = player.id === myPlayerId;
    const hiddenFromHunter = Boolean(myPlayer?.role === 'hunter' && player.role === 'runner' && player.isInvisible && !isMe);

    if (hiddenFromHunter) return;
    if (!isCircleVisible(player.x, player.y, player.r, viewport, 140)) return;

    const screenX = player.x - camera.x;
    const screenY = player.y - camera.y;
    const roleLabel = player.role === 'hunter' ? 'CHASSEUR' : 'FUYARD';
    const label = player.name ? `${player.name} - ${roleLabel}` : roleLabel;
    const blinking = shouldBlink(player, now);

    ctx.save();
    ctx.globalAlpha = player.isInvisible && isMe ? 0.35 : blinking ? 0.25 : 1;

    ctx.beginPath();
    ctx.arc(screenX, screenY, player.r, 0, Math.PI * 2);

    ctx.fillStyle = player.color || (player.role === 'hunter' ? '#ff2b2b' : '#00aaff');
    ctx.shadowColor = blinking ? '#ffffff' : player.color || (player.role === 'hunter' ? '#ff2b2b' : '#00aaff');
    ctx.shadowBlur = blinking ? shadowBlur(22, 8) : shadowBlur(50, 0);
    ctx.fill();

    ctx.shadowBlur = 0;

    if (blinking) {
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = theme.isLight ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(screenX, screenY, player.r + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = player.isInvisible && isMe ? 0.35 : 1;
    ctx.font = '700 12px Orbitron, Arial';
    ctx.fillStyle = theme.mapForeground;
    ctx.textAlign = 'center';
    ctx.fillText(label, screenX, screenY - player.r - 12);

    if (player.frozenUntil > now) {
      ctx.strokeStyle = '#9ee7ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(screenX, screenY, player.r + 7, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (player.speedBoostUntil > now) {
      ctx.strokeStyle = '#ffe45c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(screenX, screenY, player.r + 12, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  });
}
