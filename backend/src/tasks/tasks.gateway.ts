import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/jwt.strategy';
import { Task } from '@prisma/client';

export type TaskEventName = 'task:created' | 'task:updated' | 'task:deleted';

export interface TaskEventPayload {
  id: string;
  status: Task['status'];
  timestamp: string;
}

/// События приходят только тем, кто залогинен в тот же аккаунт, а не всем подряд

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TasksGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
      client.data.userId = payload.sub;
      client.join(this.roomFor(payload.sub));
      this.logger.log(`Client ${client.id} authenticated as user ${payload.sub}`);
    } catch (err) {
      this.logger.warn(`Rejecting unauthenticated socket ${client.id}: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  // Вызывается из TasksService после каждого изменения задачи
  emitToUser(userId: string, event: TaskEventName, payload: TaskEventPayload) {
    this.server.to(this.roomFor(userId)).emit(event, payload);
  }

  private roomFor(userId: string): string {
    return `user:${userId}`;
  }

  private extractToken(client: Socket): string {
    const fromAuth = client.handshake.auth?.token as string | undefined;
    const fromHeader = client.handshake.headers?.authorization?.replace('Bearer ', '');
    const token = fromAuth ?? fromHeader;
    if (!token) {
      throw new Error('Missing auth token');
    }
    return token;
  }
}
