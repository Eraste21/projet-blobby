import type { Wall } from './game.types';

export const map = {
  width: 5000,
  height: 3500,
};

export const gameConfig = {
  duration: 150,
  tickRate: 60,
  runnerSpeed: 13,
  hunterSpeed: 14.5,
  playerRadius: 25,
  hunterColor: '#ff2b2b',
  runnerColor: '#00aaff',
  hunterDamageOnCatch: 100,
  minimumPlayersToStart: 2,
};

export const spawnPoints = {
  hunter: { x: map.width / 2, y: map.height / 2 },
  runners: [
    { x: 350, y: 350 },
    { x: map.width - 350, y: 350 },
    { x: 350, y: map.height - 350 },
    { x: map.width - 350, y: map.height - 350 },
    { x: map.width / 2, y: 350 },
    { x: map.width / 2, y: map.height - 350 },
  ],
};

export const initialZone = {
  x: map.width / 2,
  y: map.height / 2,
  r: 4000,
  rMax: 4000,
  rMin: 800,
  damagePerSecond: 10,
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
