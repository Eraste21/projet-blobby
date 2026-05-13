export type Camera = {
  x: number;
  y: number;
};

export type MapConfig = {
  width: number;
  height: number;
};

export type Wall = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TemporaryWall = Wall & {
  id: string;
  ownerId: string;
  expiresAt: number;
};

export type PlayerRole = 'hunter' | 'runner';
export type WinnerTeam = PlayerRole | null;
export type ItemType = 'heal' | 'speed';
export type PowerType = 'dash' | 'shot' | 'radar' | 'invisibility' | 'wall' | 'freeze';

export type PlayerPowerState = {
  cooldownUntil: number;
  activeUntil?: number;
};

export type Player = {
  id: string;
  name: string;
  x: number;
  y: number;
  r: number;
  hp: number;
  maxHp: number;
  color: string;
  role: PlayerRole;
  isAlive: boolean;
  isInvisible: boolean;
  frozenUntil: number;
  speedBoostUntil: number;
  hitUntil: number;
  powers: Partial<Record<PowerType, PlayerPowerState>>;
  radarTarget?: {
    x: number;
    y: number;
  };
};

export type GameItem = {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  r: number;
  value: number;
};

export type GameBullet = {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  speed: number;
  damage: number;
  slowDuration: number;
  expiresAt: number;
};

export type GameEvent = {
  id: string;
  type: 'power' | 'item' | 'hit' | 'system' | 'zone';
  message: string;
  createdAt: number;
};

export type GameZone = {
  x: number;
  y: number;
  r: number;
  rMax: number;
  rMin: number;
  damagePerSecond: number;
};

export type GameState = {
  players: Record<string, Player>;
  items: GameItem[];
  bullets: GameBullet[];
  temporaryWalls: TemporaryWall[];
  events: GameEvent[];
  zone: GameZone;
  startedAt: number | null;
  duration: number;
  status: 'waiting' | 'playing' | 'finished';
  winnerId: string | null;
  winnerTeam: WinnerTeam;
};

export type GameOverPayload = {
  winnerId: string | null;
  winnerTeam: WinnerTeam;
  reason: string;
};

export type Keys = Record<string, boolean>;

export type Particle = {
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  life: number;
  color: string;
};

export type Star = {
  x: number;
  y: number;
  r: number;
};
