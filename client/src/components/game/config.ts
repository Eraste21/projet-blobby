import type { Camera, Keys, MapConfig, Particle, Star, Wall } from './types';

export const game = {
  isOver: false,
  result: '',
  explosion: false,
};

export const map: MapConfig = {
  width: 5000,
  height: 3500,
};

export const camera: Camera = {
  x: 0,
  y: 0,
};

export const walls: Wall[] = [
  { x: 450, y: 320, width: 180, height: 8 },
  { x: 900, y: 780, width: 8, height: 170 },
  { x: 1450, y: 420, width: 220, height: 8 },
  { x: 2100, y: 950, width: 8, height: 190 },
  { x: 2750, y: 520, width: 200, height: 8 },
  { x: 600, y: 1650, width: 240, height: 8 },
  { x: 1250, y: 1350, width: 8, height: 180 },
  { x: 1900, y: 1750, width: 220, height: 8 },
  { x: 2550, y: 1450, width: 8, height: 200 },
  { x: 3300, y: 1900, width: 260, height: 8 },
  { x: 3800, y: 700, width: 8, height: 180 },
  { x: 4200, y: 1300, width: 230, height: 8 },
];

export const stars: Star[] = [];
for (let i = 0; i < 320; i += 1) {
  stars.push({
    x: Math.random() * map.width,
    y: Math.random() * map.height,
    r: Math.random() * 2,
  });
}

export const particles: Particle[] = [];
export const keys: Keys = {};
