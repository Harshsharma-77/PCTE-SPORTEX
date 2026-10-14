import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { env } from './env';
import { SOCKET_EVENTS } from '../constants';

let ioInstance: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: (requestOrigin, callback) => {
        callback(null, true);
      },
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.on(SOCKET_EVENTS.CONNECT, (socket: Socket) => {
    console.log(`⚡ [Socket.IO] Client connected: ${socket.id}`);

    // Join Match Room
    socket.on(SOCKET_EVENTS.JOIN_MATCH, (fixtureId: string) => {
      const room = `match:${fixtureId}`;
      socket.join(room);
      console.log(`🏟️ Socket ${socket.id} joined room ${room}`);
      socket.emit('joined:room', { room, fixtureId });
    });

    // Leave Match Room
    socket.on(SOCKET_EVENTS.LEAVE_MATCH, (fixtureId: string) => {
      const room = `match:${fixtureId}`;
      socket.leave(room);
      console.log(`🏃 Socket ${socket.id} left room ${room}`);
    });

    // Join Tournament Room
    socket.on(SOCKET_EVENTS.JOIN_TOURNAMENT, (tournamentId: string) => {
      const room = `tournament:${tournamentId}`;
      socket.join(room);
      console.log(`🏆 Socket ${socket.id} joined room ${room}`);
    });

    // Leave Tournament Room
    socket.on(SOCKET_EVENTS.LEAVE_TOURNAMENT, (tournamentId: string) => {
      const room = `tournament:${tournamentId}`;
      socket.leave(room);
      console.log(`🏆 Socket ${socket.id} left room ${room}`);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): SocketIOServer {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized! Call initSocketServer first.');
  }
  return ioInstance;
}
