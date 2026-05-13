import { wallCollisionDetected } from './collisions';
import type { Keys, MapConfig, Player, Wall } from './types';

export function movement(
  keys: Keys,
  speed: number,
  player: Player,
  walls: Wall[],
  map: MapConfig,
) {
  let dx = 0;
  let dy = 0;

  if (keys.z || keys.Z) dy -= 1;
  if (keys.s || keys.S) dy += 1;
  if (keys.q || keys.Q) dx -= 1;
  if (keys.d || keys.D) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;
  }

  for (let i = 0; i < speed; i += 1) {
    const oldX = player.x;
    const oldY = player.y;

    player.x += dx;
    player.y += dy;

    for (const wall of walls) {
      if (wallCollisionDetected(player, wall)) {
        player.x = oldX;
        player.y = oldY;
        return;
      }
    }

    player.x = Math.max(player.r, Math.min(player.x, map.width - player.r));
    player.y = Math.max(player.r, Math.min(player.y, map.height - player.r));
  }
}
