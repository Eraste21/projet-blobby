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

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL ?? '*',
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

      const gameOver = this.gameService.update(deltaTime);
      this.server.emit('game:state', this.gameService.getPublicState());

      if (gameOver) {
        this.server.emit('game:over', gameOver);
      }
    }, interval);
  }

  handleConnection(client: Socket): void {
    const player = this.gameService.addPlayer(client.id);

    client.emit('connected', {
      id: client.id,
      message: 'Connexion au serveur Blobby réussie',
    });

    if (!player) {
      client.emit('game:joinRejected', {
        reason: 'La partie est déjà complète : Blobby se joue en duel, 1 chasseur contre 1 fuyard.',
      });
      client.disconnect(true);
      return;
    }

    this.server.emit('game:state', this.gameService.getPublicState());
  }

  handleDisconnect(client: Socket): void {
    this.gameService.removePlayer(client.id);
    this.server.emit('game:state', this.gameService.getPublicState());
  }


  @SubscribeMessage('player:profile')
  handlePlayerProfile(
    @MessageBody() profile: { name?: string },
    @ConnectedSocket() client: Socket,
  ): void {
    this.gameService.setPlayerName(client.id, profile.name ?? 'Joueur');
    this.server.emit('game:state', this.gameService.getPublicState());
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
    this.server.emit('game:state', this.gameService.getPublicState());
  }

  @SubscribeMessage('game:restart')
  handleGameRestart(): void {
    this.gameService.resetGame();
    this.server.emit('game:state', this.gameService.getPublicState());
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: unknown, @ConnectedSocket() client: Socket): void {
    client.emit('pong', {
      message: 'Réponse du serveur',
      received: data,
    });
  }
}
