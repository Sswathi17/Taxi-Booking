require('dotenv').config();

const app = require('./app');
const config = require('./config/config');
const { pool } = require('./db/pool');
const logger = require('./utils/logger');

// ✅ Graceful shutdown function
const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down...`);
  try {
    await pool.end();
    logger.info('✅ Database pool closed.');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// ✅ Handle system signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ✅ Handle unexpected errors
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});

// ✅ Start server
app.listen(config.port, () => {
  logger.info(`🚖 Taxi API running on port ${config.port} (${config.nodeEnv})`);
});