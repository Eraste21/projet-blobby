export type PlayerRole = 'hunter' | 'runner';
export type WinnerTeam = PlayerRole | null;
export type ItemType = 'heal' | 'speed';
export type PowerType = 'dash' | 'shot' | 'radar' | 'invisibility' | 'wall' | 'freeze';

export type PlayerInput = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export type Wall = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PlayerPowerState = {
  cooldownUntil: number;
  activeUntil?: number;
  lastUsedAt?: number;
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

export type TemporaryWall = Wall & {
  id: string;
  ownerId: string;
  expiresAt: number;
};

export type RadarTarget = {
  x: number;
  y: number;
};

export type GameEventType = 'power' | 'item' | 'hit' | 'system' | 'zone';

export type GameEvent = {
  id: string;
  type: GameEventType;
  message: string;
  createdAt: number;
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
  input: PlayerInput;
  powers: Partial<Record<PowerType, PlayerPowerState>>;
  lastDirection: { x: number; y: number };
  frozenUntil: number;
  speedBoostUntil: number;
  invisibleUntil: number;
  hitUntil: number;
  isInvisible: boolean;
  radarTarget?: RadarTarget;
};

export type GameZone = {
  x: number;
  y: number;
  r: number;
  rMax: number;
  rMin: number;
  damagePerSecond: number;
};

export type GameStatus = 'waiting' | 'playing' | 'finished';

export type GameOverPayload = {
  winnerId: string | null;
  winnerTeam: WinnerTeam;
  reason: string;
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
  status: GameStatus;
  winnerId: string | null;
  winnerTeam: WinnerTeam;
};
