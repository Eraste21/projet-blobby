import { useEffect, useRef, useState, type CanvasHTMLAttributes } from 'react';
import { camera, game, keys, map, particles, stars, walls } from './game/config';
import { drawWalls } from './game/drawWalls';
import { drawItems } from './game/drawItems';
import { drawBullets, drawEventFeed, drawMatchHud, drawPowerHud, drawRadarArrow, drawTemporaryWalls } from './game/drawPowerObjects';
import { drawPlayers } from './game/drawPlayer';
import { drawStars } from './game/drawStars';
import { drawParticles, createExplosion } from './game/drawParticles';
import { drawDangerZone } from './game/drawZone';
import { updateCamera } from './game/camera';
import { endScreen } from './game/endGame';
import { drawTimer } from './game/drawTimer';
import { configMap } from './game/drawMap';
import { socket } from '../socket';
import { playBackgroundMusic, playSound, stopBackgroundMusic } from '../utils/sound';
import type { GameOverPayload, GameState, Player, PlayerRole, PowerType } from './game/types';

const MOBILE_CONTROL_KEYS = {
  up: 'z',
  left: 'q',
  down: 's',
  right: 'd',
} as const;

type GameCanvasProps = CanvasHTMLAttributes<HTMLCanvasElement> & {
  playerName: string;
  paused?: boolean;
  onPause?: () => void;
  onGameOver?: (result: string) => void;
};

const defaultGameState: GameState = {
  players: {},
  items: [],
  bullets: [],
  temporaryWalls: [],
  events: [],
  zone: {
    x: map.width / 2,
    y: map.height / 2,
    r: 4000,
    rMax: 4000,
    rMin: 800,
    damagePerSecond: 10,
  },
  startedAt: null,
  duration: 150,
  status: 'waiting',
  winnerId: null,
  winnerTeam: null,
};

function getResultText(state: GameState, mySocketId: string) {
  const myPlayer = state.players[mySocketId];

  if (!state.winnerTeam || !myPlayer) return 'Fin de partie';

  const hasWon = myPlayer.role === state.winnerTeam;
  const teamLabel = state.winnerTeam === 'hunter' ? 'Le chasseur gagne' : 'Les fuyards gagnent';

  return hasWon ? `Victoire - ${teamLabel}` : `Défaite - ${teamLabel}`;
}


function playSoundForGameEvent(event: GameState['events'][number]) {
  const message = event.message.toLowerCase();

  if (event.type === 'hit') {
    playSound('hit', 0.9);
    return;
  }

  if (event.type === 'item') {
    if (message.includes('soin')) playSound('heal', 0.85);
    else if (message.includes('boost')) playSound('speed', 0.85);
    return;
  }

  if (event.type === 'power') {
    if (message.includes('dash')) playSound('dash', 0.8);
    else if (message.includes('radar')) playSound('radar', 0.75);
    else if (message.includes('tire') || message.includes('projectile')) playSound('shoot', 0.85);
    else if (message.includes('invisible')) playSound('invisibility', 0.75);
    else if (message.includes('freeze') || message.includes('gèle')) playSound('freeze', 0.8);
    else if (message.includes('mur')) playSound('wall', 0.75);
  }
}

function getPowerForKey(player: Player | undefined, key: string): PowerType | null {
  if (!player) return null;

  const lowerKey = key.toLowerCase();

  if (player.role === 'hunter') {
    if (lowerKey === 'a') return 'dash';
    if (lowerKey === 'e') return 'radar';
    if (lowerKey === 'r') return 'shot';
  }

  if (player.role === 'runner') {
    if (lowerKey === 'a') return 'invisibility';
    if (lowerKey === 'e') return 'freeze';
    if (lowerKey === 'r') return 'wall';
  }

  return null;
}

function getMobilePowerLabels(role: PlayerRole | null) {
  if (role === 'hunter') {
    return [
      { keyLabel: 'A', label: 'Dash', power: 'dash' as PowerType },
      { keyLabel: 'E', label: 'Radar', power: 'radar' as PowerType },
      { keyLabel: 'R', label: 'Tir', power: 'shot' as PowerType },
    ];
  }

  return [
    { keyLabel: 'A', label: 'Invis.', power: 'invisibility' as PowerType },
    { keyLabel: 'E', label: 'Freeze', power: 'freeze' as PowerType },
    { keyLabel: 'R', label: 'Mur', power: 'wall' as PowerType },
  ];
}

export const GameCanvas = ({
  playerName,
  paused = false,
  onPause,
  onGameOver,
  ...props
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(paused);
  const onPauseRef = useRef(onPause);
  const onGameOverRef = useRef(onGameOver);
  const playerNameRef = useRef(playerName);
  const serverStateRef = useRef<GameState>(defaultGameState);
  const mySocketIdRef = useRef('');
  const knownEventIdsRef = useRef<Set<string>>(new Set());
  const firstStateReceivedRef = useRef(false);
  const [mobileRole, setMobileRole] = useState<PlayerRole | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onPauseRef.current = onPause;
  }, [onPause]);

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);

  useEffect(() => {
    let animationId = 0;
    let mySocketId = '';
    let serverState: GameState = defaultGameState;
    let result = '';
    let gameOverNotified = false;

    const currentCanvas = canvasRef.current;
    if (!currentCanvas) return;

    const currentCtx = currentCanvas.getContext('2d');
    if (!currentCtx) return;

    const canvas: HTMLCanvasElement = currentCanvas;
    const ctx: CanvasRenderingContext2D = currentCtx;

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resizeCanvas();

    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onPauseRef.current?.();
        return;
      }

      const myPlayer = serverState.players[mySocketId];
      const power = getPowerForKey(myPlayer, event.key);

      if (power && !event.repeat && !pausedRef.current && socket.connected) {
        socket.emit('player:usePower', { power });
      }

      keys[event.key] = true;
    };

    const keyUp = (event: KeyboardEvent) => {
      keys[event.key] = false;
    };

    const sendInput = () => {
      if (pausedRef.current || !socket.connected) return;

      socket.emit('player:input', {
        up: keys.z || keys.Z || false,
        down: keys.s || keys.S || false,
        left: keys.q || keys.Q || false,
        right: keys.d || keys.D || false,
      });
    };

    const handleConnected = (data: { id: string }) => {
      mySocketId = data.id;
      mySocketIdRef.current = data.id;
      game.isOver = false;
      game.explosion = false;
      game.result = '';
      result = '';
      particles.length = 0;
      knownEventIdsRef.current.clear();
      firstStateReceivedRef.current = false;
      playBackgroundMusic();
      socket.emit('player:profile', { name: playerNameRef.current });
    };

    const handleGameState = (state: GameState) => {
      serverState = state;
      serverStateRef.current = state;

      if (!firstStateReceivedRef.current) {
        state.events.forEach((event) => knownEventIdsRef.current.add(event.id));
        firstStateReceivedRef.current = true;
      } else {
        [...state.events].reverse().forEach((event) => {
          if (knownEventIdsRef.current.has(event.id)) return;
          knownEventIdsRef.current.add(event.id);
          playSoundForGameEvent(event);
        });
      }

      const myPlayer = state.players[mySocketId];
      if (myPlayer?.role) {
        setMobileRole((currentRole) => (currentRole === myPlayer.role ? currentRole : myPlayer.role));
      }

      if (state.status === 'finished') {
        game.isOver = true;
        result = getResultText(state, mySocketId);
        game.result = result;

        if (!gameOverNotified) {
          gameOverNotified = true;
          const myPlayer = state.players[mySocketId];
          playSound(myPlayer?.role === state.winnerTeam ? 'victory' : 'defeat', 0.9);
          stopBackgroundMusic();
          onGameOverRef.current?.(result);
        }
      }
    };

    const handleGameOver = (payload: GameOverPayload) => {
      serverState = {
        ...serverState,
        status: 'finished',
        winnerId: payload.winnerId,
        winnerTeam: payload.winnerTeam,
      };
      serverStateRef.current = serverState;
      game.isOver = true;
      result = getResultText(serverState, mySocketId);
      game.result = result;

      if (!gameOverNotified) {
        gameOverNotified = true;
        const myPlayer = serverState.players[mySocketId];
        playSound(myPlayer?.role === payload.winnerTeam ? 'victory' : 'defeat', 0.9);
        stopBackgroundMusic();
        onGameOverRef.current?.(result);
      }
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connected', handleConnected);
    socket.on('game:state', handleGameState);
    socket.on('game:over', handleGameOver);

    function screen() {
      const myPlayer = serverState.players[mySocketId];

      sendInput();

      if (myPlayer) {
        updateCamera(myPlayer, camera, map, { width: window.innerWidth, height: window.innerHeight } as HTMLCanvasElement);
      }

      configMap(ctx, { width: window.innerWidth, height: window.innerHeight } as HTMLCanvasElement);
      drawStars(ctx, stars, camera);
      drawWalls(ctx, camera, walls);
      drawTemporaryWalls(ctx, serverState.temporaryWalls, camera);
      drawDangerZone(ctx, serverState.zone, camera, { width: window.innerWidth, height: window.innerHeight } as HTMLCanvasElement);
      drawItems(ctx, serverState.items, camera);
      drawBullets(ctx, serverState.bullets, camera);
      drawRadarArrow(ctx, myPlayer, camera);
      drawPlayers(ctx, serverState.players, camera, mySocketId);
      drawParticles(ctx, particles, camera);
      drawMatchHud(ctx, serverState.players, { width: window.innerWidth, height: window.innerHeight } as HTMLCanvasElement);
      drawEventFeed(ctx, serverState.events, { width: window.innerWidth, height: window.innerHeight } as HTMLCanvasElement);

      if (myPlayer) {
        drawPowerHud(ctx, myPlayer, { width: window.innerWidth, height: window.innerHeight } as HTMLCanvasElement);
      }

      drawTimer(serverState.startedAt, serverState.duration, ctx, { width: window.innerWidth, height: window.innerHeight } as HTMLCanvasElement);

      if (serverState.status === 'waiting') {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fillStyle = 'white';
        ctx.font = `700 ${window.innerWidth < 700 ? 22 : 32}px Orbitron, Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('En attente d’au moins 2 joueurs', window.innerWidth / 2, window.innerHeight / 2);
        ctx.font = `500 ${window.innerWidth < 700 ? 12 : 18}px Orbitron, Arial`;
        ctx.fillText('1 chasseur rouge contre 1 ou plusieurs fuyards bleus', window.innerWidth / 2, window.innerHeight / 2 + 38);
        ctx.restore();
      }

      if (game.isOver) {
        if (myPlayer && !game.explosion) {
          createExplosion(myPlayer.x, myPlayer.y, particles, myPlayer.color);
          game.explosion = true;
        }

        if (particles.length === 0) {
          endScreen(ctx, { width: window.innerWidth, height: window.innerHeight } as HTMLCanvasElement, result || game.result || 'Fin de partie');
        }
      }

      animationId = requestAnimationFrame(screen);
    }

    animationId = requestAnimationFrame(screen);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      socket.off('connected', handleConnected);
      socket.off('game:state', handleGameState);
      socket.off('game:over', handleGameOver);
      stopBackgroundMusic();
      socket.disconnect();
      cancelAnimationFrame(animationId);
      Object.keys(keys).forEach((key) => {
        keys[key] = false;
      });
      setMobileRole(null);
    };
  }, []);

  const setMoveKey = (direction: keyof typeof MOBILE_CONTROL_KEYS, active: boolean) => {
    keys[MOBILE_CONTROL_KEYS[direction]] = active;
  };

  const useMobilePower = (power: PowerType) => {
    if (!pausedRef.current && socket.connected) {
      socket.emit('player:usePower', { power });
    }
  };

  const stopAllMobileMovement = () => {
    Object.values(MOBILE_CONTROL_KEYS).forEach((key) => {
      keys[key] = false;
    });
  };

  return (
    <div className="game-shell">
      <canvas ref={canvasRef} {...props} />

      <button className="mobile-pause-button" type="button" onClick={() => onPauseRef.current?.()} aria-label="Mettre en pause">
        II
      </button>

      <div className="mobile-controls" onPointerLeave={stopAllMobileMovement}>
        <div className="mobile-dpad" aria-label="Contrôles de déplacement mobile">
          <button type="button" className="mobile-control up" onPointerDown={() => setMoveKey('up', true)} onPointerUp={() => setMoveKey('up', false)} onPointerCancel={() => setMoveKey('up', false)}>Z</button>
          <button type="button" className="mobile-control left" onPointerDown={() => setMoveKey('left', true)} onPointerUp={() => setMoveKey('left', false)} onPointerCancel={() => setMoveKey('left', false)}>Q</button>
          <button type="button" className="mobile-control down" onPointerDown={() => setMoveKey('down', true)} onPointerUp={() => setMoveKey('down', false)} onPointerCancel={() => setMoveKey('down', false)}>S</button>
          <button type="button" className="mobile-control right" onPointerDown={() => setMoveKey('right', true)} onPointerUp={() => setMoveKey('right', false)} onPointerCancel={() => setMoveKey('right', false)}>D</button>
        </div>

        <div className="mobile-powers" aria-label="Pouvoirs mobile">
          {getMobilePowerLabels(mobileRole).map((power) => (
            <button key={power.power} type="button" onClick={() => useMobilePower(power.power)}>
              <strong>{power.keyLabel}</strong>
              <span>{power.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
