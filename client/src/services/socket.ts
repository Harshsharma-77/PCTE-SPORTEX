import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socket.on('connect', () => {
      console.log('⚡ [Client Socket] Connected to SPORTEX Real-Time Gateway, ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [Client Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ [Client Socket] Connection Error:', error.message);
    });
  }
  return socket;
};
