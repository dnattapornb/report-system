import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class ReportGateway {
  @WebSocketServer()
  server: Server;

  broadcastReportUpdate(data: any) {
    this.server.emit('update:report', data);
  }
}
