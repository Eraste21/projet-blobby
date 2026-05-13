import type { ItemType } from './game.types';

export const itemConfig: Record<
  ItemType,
  {
    r: number;
    value: number;
    respawnDelay: number;
  }
> = {
  heal: {
    r: 16,
    value: 30,
    respawnDelay: 5000,
  },
  speed: {
    r: 14,
    value: 1.45,
    respawnDelay: 8000,
  },
};

export const itemSpawnConfig = {
  maxHealItems: 8,
  maxSpeedItems: 4,
};
