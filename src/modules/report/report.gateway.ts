import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

const allowedOrigin = process.env.WEBSOCKET_ORIGIN || 'http://localhost:5173';

@WebSocketGateway({
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
  },
})
export class ReportGateway {
  private readonly logger = new Logger(ReportGateway.name);
  @WebSocketServer()
  server: Server;

  broadcastSaaSMetricsUpdate(data: any) {
    this.logger.log(
      '[Broadcast] Real-time signal report saas metrics via WebSocket',
    );
    this.server.emit('update:saas:metrics', data);
  }
}
