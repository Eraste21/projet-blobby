import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { gameConfig } from './game.config';
import { GameService } from './game.service';
import type { PlayerInput, PowerType } from './game.types';

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL?.replace(/\/$/, ''),
  'http://localhost:5173',
].filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private lastUpdate = Date.now();
  private gameLoop?: NodeJS.Timeout;

  constructor(private readonly gameService: GameService) { }

  afterInit(): void {
    const interval = 1000 / gameConfig.tickRate;

    this.gameLoop = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - this.lastUpdate) / 1000;
      this.lastUpdate = now;

      const gameOvers = this.gameService.updateAll(deltaTime);

      for (const roomId of this.gameService.getRoomIds()) {
        this.server.to(roomId).emit('game:state', this.gameService.getPublicState(roomId));
      }

      for (const { roomId, gameOver } of gameOvers) {
        this.server.to(roomId).emit('game:over', gameOver);
      }
    }, interval);
  }

  handleConnection(client: Socket): void {
    const player = this.gameService.addPlayer(client.id);

    if (!player) {
      client.emit('game:joinRejected', {
        reason: 'Impossible de rejoindre une partie pour le moment. Réessaie dans quelques secondes.',
      });
      client.disconnect(true);
      return;
    }

    const roomId = this.gameService.getPlayerRoomId(client.id);

    if (!roomId) {
      client.emit('game:joinRejected', {
        reason: 'Erreur de matchmaking. Réessaie dans quelques secondes.',
      });
      client.disconnect(true);
      return;
    }

    client.join(roomId);

    client.emit('connected', {
      id: client.id,
      roomId,
      role: player.role,
      message: 'Connexion au serveur Blobby réussie',
    });

    this.server.to(roomId).emit('game:state', this.gameService.getPublicState(roomId));
  }

  handleDisconnect(client: Socket): void {
    const roomId = this.gameService.getPlayerRoomId(client.id);
    this.gameService.removePlayer(client.id);

    if (roomId) {
      this.server.to(roomId).emit('game:state', this.gameService.getPublicState(roomId));
    }
  }

  @SubscribeMessage('player:profile')
  handlePlayerProfile(
    @MessageBody() profile: { name?: string },
    @ConnectedSocket() client: Socket,
  ): void {
    this.gameService.setPlayerName(client.id, profile.name ?? 'Joueur');
    this.emitPlayerRoomState(client);
  }

  @SubscribeMessage('player:input')
  handlePlayerInput(
    @MessageBody() input: Partial<PlayerInput>,
    @ConnectedSocket() client: Socket,
  ): void {
    this.gameService.setPlayerInput(client.id, input);
  }

  @SubscribeMessage('player:usePower')
  handleUsePower(
    @MessageBody() data: { power?: PowerType },
    @ConnectedSocket() client: Socket,
  ): void {
    if (!data.power) return;
    this.gameService.usePower(client.id, data.power);
    this.emitPlayerRoomState(client);
  }

  @SubscribeMessage('game:restart')
  handleGameRestart(@ConnectedSocket() client: Socket): void {
    const roomId = this.gameService.getPlayerRoomId(client.id);
    if (!roomId) return;

    this.gameService.resetRoom(roomId);
    this.server.to(roomId).emit('game:state', this.gameService.getPublicState(roomId));
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: unknown, @ConnectedSocket() client: Socket): void {
    client.emit('pong', {
      message: 'Réponse du serveur',
      received: data,
    });
  }

  private emitPlayerRoomState(client: Socket): void {
    const roomId = this.gameService.getPlayerRoomId(client.id);
    if (!roomId) return;
    this.server.to(roomId).emit('game:state', this.gameService.getPublicState(roomId));
  }
}
