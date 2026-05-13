import type { Camera, MapConfig, Player } from './types';

export function updateCamera(
  player: Player,
  camera: Camera,
  map: MapConfig,
  canvas: HTMLCanvasElement,
) {
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;

  camera.x = Math.max(0, Math.min(camera.x, map.width - canvas.width));
  camera.y = Math.max(0, Math.min(camera.y, map.height - canvas.height));
}
