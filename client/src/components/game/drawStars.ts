import type { Camera, Star } from './types';
import type { Viewport } from './viewport';

const TILE_SIZE = 512;
const tileCache = new Map<string, HTMLCanvasElement>();
let cachedStars: Star[] | null = null;

function buildStarTiles(stars: Star[]) {
  tileCache.clear();
  cachedStars = stars;

  stars.forEach((star) => {
    const tileX = Math.floor(star.x / TILE_SIZE);
    const tileY = Math.floor(star.y / TILE_SIZE);
    const key = `${tileX}:${tileY}`;
    let tile = tileCache.get(key);

    if (!tile) {
      tile = document.createElement('canvas');
      tile.width = TILE_SIZE;
      tile.height = TILE_SIZE;
      tileCache.set(key, tile);
    }

    const tileCtx = tile.getContext('2d');
    if (!tileCtx) return;

    tileCtx.beginPath();
    tileCtx.fillStyle = 'white';
    tileCtx.shadowBlur = 0;
    tileCtx.arc(star.x - tileX * TILE_SIZE, star.y - tileY * TILE_SIZE, star.r, 0, 2 * Math.PI);
    tileCtx.fill();
  });
}

export function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], camera: Camera, viewport: Viewport) {
  if (cachedStars !== stars || tileCache.size === 0) {
    buildStarTiles(stars);
  }

  const firstTileX = Math.floor(viewport.x / TILE_SIZE);
  const lastTileX = Math.floor((viewport.x + viewport.width) / TILE_SIZE);
  const firstTileY = Math.floor(viewport.y / TILE_SIZE);
  const lastTileY = Math.floor((viewport.y + viewport.height) / TILE_SIZE);

  ctx.save();
  ctx.shadowBlur = 0;

  for (let tileY = firstTileY; tileY <= lastTileY; tileY += 1) {
    for (let tileX = firstTileX; tileX <= lastTileX; tileX += 1) {
      const tile = tileCache.get(`${tileX}:${tileY}`);
      if (!tile) continue;
      ctx.drawImage(tile, tileX * TILE_SIZE - camera.x, tileY * TILE_SIZE - camera.y);
    }
  }

  ctx.restore();
}
