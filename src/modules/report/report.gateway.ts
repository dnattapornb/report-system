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
  @WebSocketServer()
  server: Server;

  broadcastReportUpdate(data: any) {
    this.server.emit('update:report', data);
  }
}
