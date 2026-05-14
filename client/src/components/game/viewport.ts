import type { Camera } from './types';

export type Viewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getViewport(camera: Camera, width: number, height: number): Viewport {
  return {
    x: camera.x,
    y: camera.y,
    width,
    height,
  };
}

export function isCircleVisible(
  x: number,
  y: number,
  radius: number,
  viewport: Viewport,
  margin = 80,
) {
  return !(
    x + radius < viewport.x - margin
    || x - radius > viewport.x + viewport.width + margin
    || y + radius < viewport.y - margin
    || y - radius > viewport.y + viewport.height + margin
  );
}

export function isRectVisible(
  x: number,
  y: number,
  width: number,
  height: number,
  viewport: Viewport,
  margin = 80,
) {
  return !(
    x + width < viewport.x - margin
    || x > viewport.x + viewport.width + margin
    || y + height < viewport.y - margin
    || y > viewport.y + viewport.height + margin
  );
}
