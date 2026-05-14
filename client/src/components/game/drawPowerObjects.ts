import type { Camera, GameBullet, GameEvent, Player, TemporaryWall } from './types';
import type { Viewport } from './viewport';
import { isCircleVisible, isRectVisible } from './viewport';
import { shadowBlur } from './renderQuality';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function drawTemporaryWalls(ctx: CanvasRenderingContext2D, temporaryWalls: TemporaryWall[], camera: Camera, viewport: Viewport) {
  temporaryWalls.forEach((wall) => {
    if (!isRectVisible(wall.x, wall.y, wall.width, wall.height, viewport, 120)) return;

    ctx.save();
    ctx.fillStyle = 'rgba(80, 180, 255, 0.75)';
    ctx.shadowColor = '#50b4ff';
    ctx.shadowBlur = shadowBlur(12, 0);
    ctx.fillRect(wall.x - camera.x, wall.y - camera.y, wall.width, wall.height);
    ctx.restore();
  });
}

export function drawBullets(ctx: CanvasRenderingContext2D, bullets: GameBullet[], camera: Camera, viewport: Viewport) {
  bullets.forEach((bullet) => {
    if (!isCircleVisible(bullet.x, bullet.y, bullet.r, viewport, 120)) return;

    const screenX = bullet.x - camera.x;
    const screenY = bullet.y - camera.y;

    ctx.save();
    ctx.beginPath();
    ctx.arc(screenX, screenY, bullet.r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffef6e';
    ctx.strokeStyle = '#ff7a00';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ffef6e';
    ctx.shadowBlur = shadowBlur(14, 0);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 239, 110, 0.35)';
    ctx.lineWidth = 3;
    ctx.moveTo(screenX - bullet.dx * 24, screenY - bullet.dy * 24);
    ctx.lineTo(screenX, screenY);
    ctx.stroke();
    ctx.restore();
  });
}

export function drawRadarArrow(ctx: CanvasRenderingContext2D, player: Player | undefined, camera: Camera, viewport?: Viewport) {
  if (!player?.radarTarget) return;
  if (viewport && !isCircleVisible(player.x, player.y, player.r, viewport, 140)) return;

  const startX = player.x - camera.x;
  const startY = player.y - camera.y;
  const dx = player.radarTarget.x - player.x;
  const dy = player.radarTarget.y - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance === 0) return;

  const nx = dx / distance;
  const ny = dy / distance;
  const endX = startX + nx * 70;
  const endY = startY + ny * 70;

  ctx.save();
  ctx.globalAlpha = 0.82;
  ctx.strokeStyle = '#ffea00';
  ctx.fillStyle = '#ffea00';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ffea00';
  ctx.shadowBlur = shadowBlur(12, 0);

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - nx * 16 - ny * 8, endY - ny * 16 + nx * 8);
  ctx.lineTo(endX - nx * 16 + ny * 8, endY - ny * 16 - nx * 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawPowerHud(ctx: CanvasRenderingContext2D, player: Player | undefined, canvas: HTMLCanvasElement) {
  if (!player) return;

  const powers = player.role === 'hunter'
    ? [
        ['A', 'Dash', player.powers.dash],
        ['E', 'Radar', player.powers.radar],
        ['R', 'Tir', player.powers.shot],
      ]
    : [
        ['A', 'Invisible', player.powers.invisibility],
        ['E', 'Freeze', player.powers.freeze],
        ['R', 'Mur', player.powers.wall],
      ];

  const now = Date.now();
  const isSmall = canvas.width < 700;
  const cardW = isSmall ? 88 : 120;
  const cardH = isSmall ? 42 : 48;
  const gap = isSmall ? 7 : 10;
  const totalW = powers.length * cardW + (powers.length - 1) * gap;
  const startX = canvas.width / 2 - totalW / 2;
  const startY = canvas.height - cardH - (isSmall ? 90 : 26);

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  powers.forEach(([key, label, state], index) => {
    const x = startX + index * (cardW + gap);
    const cooldownUntil = typeof state === 'object' && state ? state.cooldownUntil : 0;
    const activeUntil = typeof state === 'object' && state ? state.activeUntil ?? 0 : 0;
    const activeRemaining = Math.max(0, activeUntil - now);
    const cooldownRemaining = Math.max(0, cooldownUntil - now);
    const ready = cooldownRemaining === 0;
    const active = activeRemaining > 0;

    ctx.globalAlpha = 0.72;
    ctx.fillStyle = active ? 'rgba(14,165,233,0.25)' : ready ? 'rgba(15,23,42,0.55)' : 'rgba(15,23,42,0.40)';
    ctx.strokeStyle = active ? 'rgba(125,211,252,0.75)' : ready ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, startY, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = active ? '#7dd3fc' : ready ? '#ffffff' : '#94a3b8';
    ctx.font = `700 ${isSmall ? 11 : 12}px Orbitron, Arial`;
    ctx.fillText(`${key} · ${label}`, x + 10, startY + 16);

    ctx.font = `500 ${isSmall ? 10 : 11}px Orbitron, Arial`;
    const status = active
      ? `Actif ${Math.ceil(activeRemaining / 1000)}s`
      : ready
        ? 'Prêt'
        : `${Math.ceil(cooldownRemaining / 1000)}s`;
    ctx.fillText(status, x + 10, startY + 32);
  });

  ctx.restore();
}

function drawMiniHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  label: string,
  hp: number,
  maxHp: number,
  color: string,
) {
  const ratio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
  const compact = width < 220;

  ctx.save();
  ctx.globalAlpha = 0.76;
  ctx.fillStyle = 'rgba(2, 6, 23, 0.56)';
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, width, compact ? 48 : 54, 14);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.font = `700 ${compact ? 10 : 12}px Orbitron, Arial`;
  ctx.textAlign = 'left';
  ctx.fillText(label, x + 12, y + 18);

  ctx.fillStyle = 'rgba(255,255,255,0.11)';
  roundRect(ctx, x + 12, y + (compact ? 28 : 32), width - 24, 8, 6);
  ctx.fill();

  ctx.fillStyle = color;
  roundRect(ctx, x + 12, y + (compact ? 28 : 32), (width - 24) * ratio, 8, 6);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `700 ${compact ? 9 : 10}px Orbitron, Arial`;
  ctx.textAlign = 'right';
  ctx.fillText(`${Math.ceil(hp)}/${maxHp}`, x + width - 12, y + 18);
  ctx.restore();
}

export function drawMatchHud(ctx: CanvasRenderingContext2D, players: Record<string, Player>, canvas: HTMLCanvasElement) {
  const allPlayers = Object.values(players);
  const hunter = allPlayers.find((player) => player.role === 'hunter');
  const runners = allPlayers.filter((player) => player.role === 'runner');
  const aliveRunners = runners.filter((runner) => runner.isAlive).length;
  const isSmall = canvas.width < 700;
  const margin = isSmall ? 10 : 18;
  const width = isSmall ? Math.min(176, canvas.width * 0.43) : 230;

  if (hunter) {
    drawMiniHealthBar(ctx, margin, margin, width, `CHASSEUR`, hunter.hp, hunter.maxHp, '#ff3b3b');
  }

  const runnerHp = runners.reduce((sum, runner) => sum + Math.max(0, runner.hp), 0);
  const runnerMaxHp = runners.reduce((sum, runner) => sum + runner.maxHp, 0) || 100;
  drawMiniHealthBar(ctx, canvas.width - width - margin, margin, width, `FUYARDS ${aliveRunners}/${runners.length}`, runnerHp, runnerMaxHp, '#38bdf8');

  if (!isSmall) {
    ctx.save();
    ctx.globalAlpha = 0.62;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.48)';
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    roundRect(ctx, canvas.width / 2 - 110, margin, 220, 38, 14);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.font = '700 11px Orbitron, Arial';
    ctx.fillText('Éliminer ou survivre', canvas.width / 2, margin + 24);
    ctx.restore();
  }
}

export function drawEventFeed(ctx: CanvasRenderingContext2D, events: GameEvent[], canvas: HTMLCanvasElement) {
  const now = Date.now();
  const visibleEvents = events.filter((event) => now - event.createdAt < 4200).slice(0, 3);
  if (visibleEvents.length === 0) return;

  const isSmall = canvas.width < 700;
  const width = isSmall ? Math.min(canvas.width - 28, 360) : 420;
  const x = canvas.width / 2 - width / 2;
  let y = isSmall ? 68 : 78;

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  visibleEvents.forEach((event) => {
    const age = now - event.createdAt;
    const alpha = age > 3000 ? Math.max(0, 1 - (age - 3000) / 1200) : 0.72;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = event.type === 'hit'
      ? 'rgba(127, 29, 29, 0.56)'
      : event.type === 'item'
        ? 'rgba(20, 83, 45, 0.50)'
        : event.type === 'power'
          ? 'rgba(12, 74, 110, 0.52)'
          : 'rgba(15, 23, 42, 0.50)';
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    roundRect(ctx, x, y, width, isSmall ? 25 : 28, 11);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.86)';
    ctx.font = `700 ${isSmall ? 10 : 11}px Orbitron, Arial`;
    ctx.fillText(event.message, canvas.width / 2, y + (isSmall ? 13 : 15));
    y += isSmall ? 29 : 33;
  });

  ctx.restore();
}
