import app from './app.js';
import env from './config/env.js';
import connectDB, { disconnectDatabase } from './config/db.js';

const start = async () => {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`\n  Portfolio API ready`);
      console.log(`  -> http://localhost:${env.port}/api`);
      console.log(`  -> environment: ${env.nodeEnv}\n`);
    });

    const shutdown = (signal) => {
      console.log(`\n${signal} received, shutting down...`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      console.error('[unhandledRejection]', reason);
    });
  } catch (error) {
    console.error('[fatal] Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
