import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UAParser } from 'ua-parser-js'; // ✨ แก้ไขการ import

const allowedOrigin = process.env.WEBSOCKET_ORIGIN || 'http://localhost:5173';

interface OnlineUser {
  id: string;
  ip: string;
  browser: string;
  os: string;
  device: string;
  connectedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
  },
})
export class ReportGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ReportGateway.name);

  @WebSocketServer()
  server: Server;

  // Store online users in memory (Use Redis for production scaling)
  private onlineUsers: Map<string, OnlineUser> = new Map();

  handleConnection(client: Socket) {
    const headers = client.handshake.headers;
    const ip =
      headers['x-forwarded-for'] || client.handshake.address || 'unknown';
    const userAgent = headers['user-agent'] || '';

    // Parse User Agent
    const parser = new UAParser(userAgent); // ✨ การเรียกใช้เหมือนเดิม แต่ตอนนี้ถูกต้องแล้ว
    const result = parser.getResult();

    const user: OnlineUser = {
      id: client.id,
      ip: Array.isArray(ip) ? ip[0] : ip,
      browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`,
      os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`,
      device: result.device.type || 'Desktop',
      connectedAt: new Date(),
    };

    this.onlineUsers.set(client.id, user);

    this.logger.log(
      `Client connected: ${client.id} (${user.browser} on ${user.os})`,
    );
    this.broadcastOnlineUsers();
  }

  handleDisconnect(client: Socket) {
    this.onlineUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
    this.broadcastOnlineUsers();
  }

  private broadcastOnlineUsers() {
    const users = Array.from(this.onlineUsers.values());
    this.server.emit('update:online-users', {
      count: users.length,
      users: users,
    });
  }

  broadcastSaaSMetricsUpdate(data: any) {
    this.logger.log(
      '[Broadcast] Real-time signal report saas metrics via WebSocket',
    );
    this.server.emit('update:saas-metrics', data);
  }
}
