import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { gameConfig, initialZone, map, spawnPoints, walls } from './game.config';
import { itemConfig, itemSpawnConfig } from './items.config';
import { powerConfig, powerGameplay, rolePowers } from './powers.config';
import type {
  GameBullet,
  GameEvent,
  GameItem,
  GameOverPayload,
  GameState,
  ItemType,
  Player,
  PlayerInput,
  PlayerRole,
  PowerType,
  TemporaryWall,
  Wall,
} from './game.types';

@Injectable()
export class GameService {
  private state: GameState = this.createInitialState();
  private runnerSpawnIndex = 0;
  private nextHealSpawnAt = 0;
  private nextSpeedSpawnAt = 0;

  addPlayer(id: string): Player | null {
    const existingPlayer = this.state.players[id];
    if (existingPlayer) return existingPlayer;

    const players = Object.values(this.state.players);

    if (players.length >= gameConfig.maxPlayers) {
      return null;
    }

    if (this.state.status === 'finished' && players.length === 0) {
      this.resetGame();
    }

    const role = this.getNextRole();
    const spawn = this.getSpawnPoint(role);
    const availablePowers = rolePowers[role];

    const player: Player = {
      id,
      name: 'Joueur',
      x: spawn.x,
      y: spawn.y,
      r: gameConfig.playerRadius,
      hp: 100,
      maxHp: 100,
      color: role === 'hunter' ? gameConfig.hunterColor : gameConfig.runnerColor,
      role,
      isAlive: true,
      input: this.emptyInput(),
      powers: Object.fromEntries(
        availablePowers.map((power) => [power, { cooldownUntil: 0 }]),
      ) as Player['powers'],
      lastDirection: { x: 1, y: 0 },
      frozenUntil: 0,
      speedBoostUntil: 0,
      invisibleUntil: 0,
      hitUntil: 0,
      isInvisible: false,
    };

    this.state.players[id] = player;
    this.pushEvent('system', `${this.displayName(player)} rejoint en ${role === 'hunter' ? 'chasseur' : 'fuyard'}.`);
    this.tryStartGame();

    return player;
  }

  removePlayer(id: string): void {
    const removed = this.state.players[id];
    delete this.state.players[id];
    this.state.bullets = this.state.bullets.filter((bullet) => bullet.ownerId !== id);
    this.state.temporaryWalls = this.state.temporaryWalls.filter((wall) => wall.ownerId !== id);

    if (removed) {
      this.pushEvent('system', `${this.displayName(removed)} a quitté la partie.`);
    }

    const playerCount = Object.keys(this.state.players).length;
    if (playerCount === 0) {
      this.resetGame();
      return;
    }

    if (this.state.status === 'playing' && removed) {
      const remainingPlayer = Object.values(this.state.players).find((player) => player.isAlive);
      if (remainingPlayer) {
        this.finishGame(remainingPlayer.id, remainingPlayer.role, 'opponent-left');
      }
      return;
    }

    if (this.state.status === 'waiting') {
      this.tryStartGame();
    }
  }

  setPlayerName(id: string, name: string): void {
    const player = this.state.players[id];
    if (!player) return;

    const cleanName = name.trim().slice(0, 18);
    player.name = cleanName || 'Joueur';
  }

  setPlayerInput(id: string, input: Partial<PlayerInput>): void {
    const player = this.state.players[id];
    if (!player || !player.isAlive || this.state.status !== 'playing') return;

    player.input = {
      up: Boolean(input.up),
      down: Boolean(input.down),
      left: Boolean(input.left),
      right: Boolean(input.right),
    };
  }

  usePower(playerId: string, power: PowerType): void {
    const player = this.state.players[playerId];
    if (!player || !player.isAlive || this.state.status !== 'playing') return;
    if (!rolePowers[player.role].includes(power)) return;

    const now = Date.now();
    const powerState = player.powers[power];
    if (!powerState || powerState.cooldownUntil > now) return;

    let used = false;

    switch (power) {
      case 'dash':
        used = this.useDash(player, now);
        break;
      case 'radar':
        used = this.useRadar(player, now);
        break;
      case 'shot':
        used = this.useShot(player, now);
        break;
      case 'invisibility':
        used = this.useInvisibility(player, now);
        break;
      case 'freeze':
        used = this.useFreeze(player, now);
        break;
      case 'wall':
        used = this.useWall(player, now);
        break;
    }

    if (!used) return;

    const updatedPowerState = player.powers[power];
    if (updatedPowerState) {
      updatedPowerState.cooldownUntil = now + powerConfig[power].cooldown;
      updatedPowerState.lastUsedAt = now;
    }
  }

  update(deltaTime: number): GameOverPayload | null {
    if (this.state.status !== 'playing') return null;

    const now = Date.now();
    this.updateZone();
    this.cleanExpiredEntities(now);
    this.spawnItemsIfNeeded(now);
    this.updatePlayerEffects(now);
    this.moveBullets(deltaTime, now);

    Object.values(this.state.players).forEach((player) => {
      if (!player.isAlive) return;

      this.movePlayer(player, now);
      this.applyZoneDamage(player, deltaTime);
    });

    this.checkItemCollisions(now);
    this.checkBulletCollisions(now);
    this.handleHunterCatches();
    this.updateRadarTargets(now);
    this.cleanOldEvents(now);

    return this.checkEndGame();
  }

  getState(): GameState {
    return {
      ...this.state,
      players: { ...this.state.players },
      items: [...this.state.items],
      bullets: [...this.state.bullets],
      temporaryWalls: [...this.state.temporaryWalls],
      events: [...this.state.events],
      zone: { ...this.state.zone },
    };
  }

  getPublicState() {
    const {
      players,
      items,
      bullets,
      temporaryWalls,
      events,
      zone,
      duration,
      startedAt,
      status,
      winnerId,
      winnerTeam,
    } = this.getState();

    return { players, items, bullets, temporaryWalls, events, zone, duration, startedAt, status, winnerId, winnerTeam };
  }

  resetGame(): void {
    this.state = this.createInitialState();
    this.runnerSpawnIndex = 0;
    this.nextHealSpawnAt = 0;
    this.nextSpeedSpawnAt = 0;
  }

  private createInitialState(): GameState {
    return {
      players: {},
      items: [],
      bullets: [],
      temporaryWalls: [],
      events: [],
      zone: { ...initialZone },
      startedAt: null,
      duration: gameConfig.duration,
      status: 'waiting',
      winnerId: null,
      winnerTeam: null,
    };
  }

  private emptyInput(): PlayerInput {
    return { up: false, down: false, left: false, right: false };
  }

  private getNextRole(): PlayerRole {
    return this.hasHunter() ? 'runner' : 'hunter';
  }

  private getSpawnPoint(role: PlayerRole): { x: number; y: number } {
    if (role === 'hunter') return { ...spawnPoints.hunter };

    const spawn = spawnPoints.runners[this.runnerSpawnIndex % spawnPoints.runners.length];
    this.runnerSpawnIndex += 1;
    return { ...spawn };
  }

  private hasHunter(): boolean {
    return Object.values(this.state.players).some((player) => player.role === 'hunter');
  }

  private promoteFirstRunnerToHunter(): void {
    const runner = Object.values(this.state.players).find((player) => player.role === 'runner');
    if (!runner) return;

    runner.role = 'hunter';
    runner.color = gameConfig.hunterColor;
    runner.hp = runner.maxHp;
    runner.isAlive = true;
    runner.input = this.emptyInput();
    runner.x = spawnPoints.hunter.x;
    runner.y = spawnPoints.hunter.y;
    runner.powers = Object.fromEntries(rolePowers.hunter.map((power) => [power, { cooldownUntil: 0 }])) as Player['powers'];
    this.pushEvent('system', `${this.displayName(runner)} devient le nouveau chasseur.`);
  }

  private tryStartGame(): void {
    if (this.state.status !== 'waiting') return;

    const players = Object.values(this.state.players);
    const hunters = players.filter((player) => player.role === 'hunter');
    const runners = players.filter((player) => player.role === 'runner');

    if (
      players.length === gameConfig.maxPlayers &&
      players.length === gameConfig.minimumPlayersToStart &&
      hunters.length === 1 &&
      runners.length === 1
    ) {
      this.state.status = 'playing';
      this.state.startedAt = Date.now();
      this.spawnInitialItems();
      this.pushEvent('system', 'La partie commence : duel 1 chasseur contre 1 fuyard !');
    }
  }

  private updateZone(): void {
    if (!this.state.startedAt) return;

    const elapsed = (Date.now() - this.state.startedAt) / 1000;
    const progress = Math.min(elapsed / this.state.duration, 1);

    this.state.zone.r = this.state.zone.rMax - (this.state.zone.rMax - this.state.zone.rMin) * progress;
  }

  private movePlayer(player: Player, now: number): void {
    if (player.frozenUntil > now) return;

    const { input } = player;
    let dx = 0;
    let dy = 0;

    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;

    if (dx === 0 && dy === 0) return;

    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;
    player.lastDirection = { x: dx, y: dy };

    let speed = player.role === 'hunter' ? gameConfig.hunterSpeed : gameConfig.runnerSpeed;

    if (player.powers.dash?.activeUntil && player.powers.dash.activeUntil > now) {
      speed *= powerGameplay.dashMultiplier;
    }

    if (player.speedBoostUntil > now) {
      speed *= itemConfig.speed.value;
    }

    const steps = Math.ceil(speed);
    const stepDistance = speed / steps;

    for (let i = 0; i < steps; i += 1) {
      const oldX = player.x;
      const oldY = player.y;

      player.x += dx * stepDistance;
      player.y += dy * stepDistance;

      if (this.isOutsideMap(player) || this.getAllWalls().some((wall) => this.wallCollisionDetected(player, wall))) {
        player.x = oldX;
        player.y = oldY;
        return;
      }
    }
  }

  private moveBullets(deltaTime: number, now: number): void {
    this.state.bullets.forEach((bullet) => {
      bullet.x += bullet.dx * bullet.speed * deltaTime * 60;
      bullet.y += bullet.dy * bullet.speed * deltaTime * 60;
    });

    this.state.bullets = this.state.bullets.filter((bullet) => {
      if (bullet.expiresAt <= now) return false;
      if (bullet.x - bullet.r < 0 || bullet.y - bullet.r < 0 || bullet.x + bullet.r > map.width || bullet.y + bullet.r > map.height) return false;
      return !this.getAllWalls().some((wall) => this.circleWallCollision(bullet, wall));
    });
  }

  private getAllWalls(): Wall[] {
    return [...walls, ...this.state.temporaryWalls];
  }

  private wallCollisionDetected(player: Player, wall: Wall): boolean {
    const borderX = Math.max(wall.x, Math.min(player.x, wall.x + wall.width));
    const borderY = Math.max(wall.y, Math.min(player.y, wall.y + wall.height));

    const dx = player.x - borderX;
    const dy = player.y - borderY;

    return dx * dx + dy * dy < player.r * player.r;
  }

  private circleWallCollision(circle: { x: number; y: number; r: number }, wall: Wall): boolean {
    const borderX = Math.max(wall.x, Math.min(circle.x, wall.x + wall.width));
    const borderY = Math.max(wall.y, Math.min(circle.y, wall.y + wall.height));
    const dx = circle.x - borderX;
    const dy = circle.y - borderY;
    return dx * dx + dy * dy <= circle.r * circle.r;
  }

  private isOutsideMap(player: Player): boolean {
    return (
      player.x - player.r < 0 ||
      player.y - player.r < 0 ||
      player.x + player.r > map.width ||
      player.y + player.r > map.height
    );
  }

  private applyZoneDamage(player: Player, deltaTime: number): void {
    const dx = player.x - this.state.zone.x;
    const dy = player.y - this.state.zone.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.state.zone.r) return;

    player.hp = Math.max(0, player.hp - this.state.zone.damagePerSecond * deltaTime);
    this.killPlayerIfNeeded(player);
  }

  private handleHunterCatches(): void {
    const hunter = Object.values(this.state.players).find(
      (player) => player.role === 'hunter' && player.isAlive,
    );
    if (!hunter || hunter.frozenUntil > Date.now()) return;

    const aliveRunners = Object.values(this.state.players).filter(
      (player) => player.role === 'runner' && player.isAlive,
    );

    aliveRunners.forEach((runner) => {
      if (runner.isInvisible) return;
      if (!this.playersCollide(hunter, runner)) return;

      runner.hp = Math.max(0, runner.hp - gameConfig.hunterDamageOnCatch);
      runner.hitUntil = Date.now() + 900;
      this.pushEvent('hit', `${this.displayName(hunter)} touche ${this.displayName(runner)} au contact.`);
      this.killPlayerIfNeeded(runner);
    });
  }

  private playersCollide(first: Player, second: Player): boolean {
    const dx = first.x - second.x;
    const dy = first.y - second.y;
    const minDistance = first.r + second.r;

    return dx * dx + dy * dy <= minDistance * minDistance;
  }

  private spawnInitialItems(): void {
    while (this.countItems('heal') < itemSpawnConfig.maxHealItems) this.spawnItem('heal');
    while (this.countItems('speed') < itemSpawnConfig.maxSpeedItems) this.spawnItem('speed');
  }

  private spawnItemsIfNeeded(now: number): void {
    if (this.countItems('heal') < itemSpawnConfig.maxHealItems && now >= this.nextHealSpawnAt) {
      this.spawnItem('heal');
      this.nextHealSpawnAt = now + itemConfig.heal.respawnDelay;
    }

    if (this.countItems('speed') < itemSpawnConfig.maxSpeedItems && now >= this.nextSpeedSpawnAt) {
      this.spawnItem('speed');
      this.nextSpeedSpawnAt = now + itemConfig.speed.respawnDelay;
    }
  }

  private countItems(type: ItemType): number {
    return this.state.items.filter((item) => item.type === type).length;
  }

  private spawnItem(type: ItemType): void {
    const config = itemConfig[type];
    const point = this.getRandomFreePoint(config.r);

    this.state.items.push({
      id: randomUUID(),
      type,
      x: point.x,
      y: point.y,
      r: config.r,
      value: config.value,
    });
  }

  private getRandomFreePoint(radius: number): { x: number; y: number } {
    for (let i = 0; i < 80; i += 1) {
      const point = {
        x: radius + Math.random() * (map.width - radius * 2),
        y: radius + Math.random() * (map.height - radius * 2),
      };
      const fakePlayer = { x: point.x, y: point.y, r: radius } as Player;
      if (!this.getAllWalls().some((wall) => this.wallCollisionDetected(fakePlayer, wall))) return point;
    }

    return { x: map.width / 2, y: map.height / 2 };
  }

  private checkItemCollisions(now: number): void {
    for (const player of Object.values(this.state.players)) {
      if (!player.isAlive) continue;

      const collectedItem = this.state.items.find((item) => this.circleCollision(player, item));
      if (!collectedItem) continue;

      this.applyItemEffect(player, collectedItem, now);
      this.state.items = this.state.items.filter((item) => item.id !== collectedItem.id);
    }
  }

  private applyItemEffect(player: Player, item: GameItem, now: number): void {
    if (item.type === 'heal') {
      const oldHp = player.hp;
      player.hp = Math.min(player.maxHp, player.hp + item.value);
      this.pushEvent('item', `${this.displayName(player)} récupère un soin (+${Math.round(player.hp - oldHp)} HP).`);
      return;
    }

    if (item.type === 'speed') {
      player.speedBoostUntil = now + powerGameplay.speedBoostDuration;
      this.pushEvent('item', `${this.displayName(player)} récupère un boost de vitesse.`);
    }
  }

  private checkBulletCollisions(now: number): void {
    for (const bullet of [...this.state.bullets]) {
      const owner = this.state.players[bullet.ownerId];
      if (!owner) continue;

      const target = Object.values(this.state.players).find(
        (player) => player.role === 'runner' && player.isAlive && !player.isInvisible && this.circleCollision(player, bullet),
      );

      if (!target) continue;

      target.hp = Math.max(0, target.hp - bullet.damage);
      target.hitUntil = now + 1100;
      target.frozenUntil = Math.max(target.frozenUntil, now + bullet.slowDuration);
      this.pushEvent('hit', `${this.displayName(owner)} ralentit ${this.displayName(target)} avec un tir.`);
      this.killPlayerIfNeeded(target);
      this.state.bullets = this.state.bullets.filter((currentBullet) => currentBullet.id !== bullet.id);
    }
  }

  private circleCollision(first: { x: number; y: number; r: number }, second: { x: number; y: number; r: number }): boolean {
    const dx = first.x - second.x;
    const dy = first.y - second.y;
    const minDistance = first.r + second.r;

    return dx * dx + dy * dy <= minDistance * minDistance;
  }

  private useDash(player: Player, now: number): boolean {
    const duration = powerConfig.dash.duration ?? 350;
    player.powers.dash = {
      cooldownUntil: player.powers.dash?.cooldownUntil ?? 0,
      activeUntil: now + duration,
      lastUsedAt: now,
    };
    this.pushEvent('power', `${this.displayName(player)} utilise Dash.`);
    return true;
  }

  private useRadar(player: Player, now: number): boolean {
    const duration = powerConfig.radar.duration ?? 3000;
    player.powers.radar = {
      cooldownUntil: player.powers.radar?.cooldownUntil ?? 0,
      activeUntil: now + duration,
      lastUsedAt: now,
    };
    this.updateRadarTargets(now);
    this.pushEvent('power', `${this.displayName(player)} active le radar.`);
    return true;
  }

  private useShot(player: Player, now: number): boolean {
    const direction = this.getSafeDirection(player);
    const spawnDistance = player.r + powerGameplay.bulletRadius + 14;

    const bullet: GameBullet = {
      id: randomUUID(),
      ownerId: player.id,
      x: player.x + direction.x * spawnDistance,
      y: player.y + direction.y * spawnDistance,
      r: powerGameplay.bulletRadius,
      dx: direction.x,
      dy: direction.y,
      speed: powerGameplay.bulletSpeed,
      damage: powerGameplay.bulletDamage,
      slowDuration: powerGameplay.bulletSlowDuration,
      expiresAt: now + powerGameplay.bulletLifetime,
    };

    if (this.getAllWalls().some((wall) => this.circleWallCollision(bullet, wall))) return false;

    this.state.bullets.push(bullet);
    player.powers.shot = {
      cooldownUntil: player.powers.shot?.cooldownUntil ?? 0,
      activeUntil: now + (powerConfig.shot.duration ?? 180),
      lastUsedAt: now,
    };
    this.pushEvent('power', `${this.displayName(player)} tire un projectile ralentissant.`);
    return true;
  }

  private useInvisibility(player: Player, now: number): boolean {
    const duration = powerConfig.invisibility.duration ?? 3000;
    player.invisibleUntil = now + duration;
    player.isInvisible = true;
    player.powers.invisibility = {
      cooldownUntil: player.powers.invisibility?.cooldownUntil ?? 0,
      activeUntil: now + duration,
      lastUsedAt: now,
    };
    this.pushEvent('power', `${this.displayName(player)} devient invisible.`);
    return true;
  }

  private useFreeze(player: Player, now: number): boolean {
    const hunter = Object.values(this.state.players).find(
      (currentPlayer) => currentPlayer.role === 'hunter' && currentPlayer.isAlive,
    );
    if (!hunter) return false;

    const dx = hunter.x - player.x;
    const dy = hunter.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > powerGameplay.freezeRange) return false;

    const duration = powerConfig.freeze.duration ?? 1800;
    hunter.frozenUntil = Math.max(hunter.frozenUntil, now + duration);
    player.powers.freeze = {
      cooldownUntil: player.powers.freeze?.cooldownUntil ?? 0,
      activeUntil: now + duration,
      lastUsedAt: now,
    };
    this.pushEvent('power', `${this.displayName(player)} freeze le chasseur.`);
    return true;
  }

  private useWall(player: Player, now: number): boolean {
    const duration = powerConfig.wall.duration ?? 5000;
    const direction = this.getSafeDirection(player);
    const horizontalMove = Math.abs(direction.x) > Math.abs(direction.y);
    const width = horizontalMove ? powerGameplay.temporaryWallHeight : powerGameplay.temporaryWallWidth;
    const height = horizontalMove ? powerGameplay.temporaryWallWidth : powerGameplay.temporaryWallHeight;

    // Le mur du fuyard se pose derrière lui, dans la direction opposée au dernier déplacement.
    const x = player.x - direction.x * powerGameplay.temporaryWallDistance - width / 2;
    const y = player.y - direction.y * powerGameplay.temporaryWallDistance - height / 2;

    const wall: TemporaryWall = {
      id: randomUUID(),
      ownerId: player.id,
      x: Math.max(0, Math.min(map.width - width, x)),
      y: Math.max(0, Math.min(map.height - height, y)),
      width,
      height,
      expiresAt: now + duration,
    };

    const fakePlayer = { x: wall.x + wall.width / 2, y: wall.y + wall.height / 2, r: Math.max(width, height) / 2 } as Player;
    if (this.getAllWalls().some((currentWall) => this.wallCollisionDetected(fakePlayer, currentWall))) {
      return false;
    }

    this.state.temporaryWalls.push(wall);
    player.powers.wall = {
      cooldownUntil: player.powers.wall?.cooldownUntil ?? 0,
      activeUntil: now + duration,
      lastUsedAt: now,
    };
    this.pushEvent('power', `${this.displayName(player)} place un mur derrière lui.`);
    return true;
  }

  private updatePlayerEffects(now: number): void {
    Object.values(this.state.players).forEach((player) => {
      Object.values(player.powers).forEach((powerState) => {
        if (!powerState?.activeUntil) return;
        if (powerState.activeUntil <= now) {
          delete powerState.activeUntil;
        }
      });

      if (player.invisibleUntil <= now) {
        player.invisibleUntil = 0;
      }

      if (player.frozenUntil <= now) {
        player.frozenUntil = 0;
      }

      if (player.speedBoostUntil <= now) {
        player.speedBoostUntil = 0;
      }

      if (player.hitUntil <= now) {
        player.hitUntil = 0;
      }

      player.isInvisible = player.invisibleUntil > now;
    });
  }

  private getSafeDirection(player: Player): { x: number; y: number } {
    const direction = player.lastDirection;
    if (!direction || (direction.x === 0 && direction.y === 0)) {
      return { x: 1, y: 0 };
    }

    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y) || 1;
    return { x: direction.x / length, y: direction.y / length };
  }

  private updateRadarTargets(now: number): void {
    const hunter = Object.values(this.state.players).find(
      (player) => player.role === 'hunter' && player.isAlive,
    );
    if (!hunter) return;

    const radarActive = (hunter.powers.radar?.activeUntil ?? 0) > now;
    if (!radarActive) {
      hunter.radarTarget = undefined;
      return;
    }

    const target = Object.values(this.state.players)
      .filter((player) => player.role === 'runner' && player.isAlive && !player.isInvisible)
      .sort((a, b) => this.distanceSquared(hunter, a) - this.distanceSquared(hunter, b))[0];

    hunter.radarTarget = target ? { x: target.x, y: target.y } : undefined;
  }

  private distanceSquared(first: { x: number; y: number }, second: { x: number; y: number }): number {
    const dx = first.x - second.x;
    const dy = first.y - second.y;
    return dx * dx + dy * dy;
  }

  private cleanExpiredEntities(now: number): void {
    this.state.bullets = this.state.bullets.filter((bullet) => bullet.expiresAt > now);
    this.state.temporaryWalls = this.state.temporaryWalls.filter((wall) => wall.expiresAt > now);
  }

  private killPlayerIfNeeded(player: Player): void {
    if (player.hp > 0 || !player.isAlive) return;

    player.hitUntil = Date.now() + 1200;
    player.isAlive = false;
    player.input = this.emptyInput();
    this.pushEvent('hit', `${this.displayName(player)} est éliminé.`);
  }

  private checkEndGame(): GameOverPayload | null {
    if (this.state.status !== 'playing') return null;
    if (!this.state.startedAt) return null;

    const players = Object.values(this.state.players);
    const hunter = players.find((player) => player.role === 'hunter');
    const runner = players.find((player) => player.role === 'runner');
    const elapsed = (Date.now() - this.state.startedAt) / 1000;

    if (!hunter || !runner) return null;

    if (!hunter.isAlive) {
      return this.finishGame(runner.id, 'runner', 'hunter-dead');
    }

    if (!runner.isAlive) {
      return this.finishGame(hunter.id, 'hunter', 'runner-caught');
    }

    if (elapsed >= this.state.duration) {
      return this.finishGame(runner.id, 'runner', 'timer-ended');
    }

    return null;
  }

  private finishGame(winnerId: string | null, winnerTeam: PlayerRole, reason: string): GameOverPayload {
    this.state.status = 'finished';
    this.state.winnerId = winnerId;
    this.state.winnerTeam = winnerTeam;

    Object.values(this.state.players).forEach((player) => {
      player.input = this.emptyInput();
    });

    this.pushEvent('system', winnerTeam === 'hunter' ? 'Victoire du chasseur !' : 'Victoire du fuyard !');
    return { winnerId, winnerTeam, reason };
  }

  private pushEvent(type: GameEvent['type'], message: string): void {
    this.state.events.unshift({
      id: randomUUID(),
      type,
      message,
      createdAt: Date.now(),
    });
    this.state.events = this.state.events.slice(0, 8);
  }

  private cleanOldEvents(now: number): void {
    this.state.events = this.state.events.filter((event) => now - event.createdAt < 6500).slice(0, 8);
  }

  private displayName(player: Player): string {
    const role = player.role === 'hunter' ? 'Chasseur' : 'Fuyard';
    return `${player.name || 'Joueur'} (${role})`;
  }
}
