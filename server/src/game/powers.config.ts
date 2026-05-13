import type { PlayerRole, PowerType } from './game.types';

export const rolePowers: Record<PlayerRole, PowerType[]> = {
  hunter: ['dash', 'radar', 'shot'],
  runner: ['invisibility', 'freeze', 'wall'],
};

export const powerConfig: Record<
  PowerType,
  {
    cooldown: number;
    duration?: number;
  }
> = {
  dash: {
    cooldown: 3500,
    duration: 350,
  },
  shot: {
    cooldown: 1200,
    duration: 180,
  },
  radar: {
    cooldown: 10000,
    duration: 3000,
  },
  invisibility: {
    cooldown: 9000,
    duration: 3000,
  },
  wall: {
    cooldown: 7000,
    duration: 5000,
  },
  freeze: {
    cooldown: 8500,
    duration: 1800,
  },
};

export const powerGameplay = {
  dashMultiplier: 2.8,
  freezeRange: 320,
  bulletRadius: 9,
  bulletSpeed: 44,
  bulletDamage: 10,
  bulletSlowDuration: 2200,
  bulletLifetime: 950,
  temporaryWallWidth: 160,
  temporaryWallHeight: 20,
  temporaryWallDistance: 120,
  speedBoostDuration: 3500,
};
