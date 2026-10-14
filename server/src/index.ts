import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { initSocketServer } from './config/socket';

async function bootstrap() {
  const app = createApp();
  const httpServer = http.createServer(app);

  // Initialize WebSockets (Socket.IO)
  const io = initSocketServer(httpServer);
  console.log('⚡ Socket.IO initialized with real-time broadcast capabilities.');

  // Connect to Database
  await connectDatabase();

  // Start HTTP & WebSocket Server
  httpServer.listen(env.PORT, env.HOST, () => {
    console.log(`
============================================================
🏆 PCTE SPORTEX — College Sports Management Platform
🚀 Server listening on: http://${env.HOST}:${env.PORT}
🌐 API Endpoint:       http://localhost:${env.PORT}/api/v1
🩺 Health Check:       http://localhost:${env.PORT}/api/v1/health
📱 Client Origin:      ${env.CLIENT_URL}
⚙️  Environment:        ${env.NODE_ENV}
============================================================
    `);
  });

  // Graceful Shutdown Handlers
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    io.close(() => {
      console.log('🔌 Socket.IO connections closed.');
    });
    httpServer.close(async () => {
      console.log('🛑 HTTP server closed.');
      await disconnectDatabase();
      console.log('✅ Server gracefully terminated.');
      process.exit(0);
    });

    // Force close if graceful shutdown hangs
    setTimeout(() => {
      console.error('⚠️ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('❌ Fatal error during application bootstrap:');
  console.error(error);
  process.exit(1);
});
