require('dotenv').config();

const app = require('./app');
const config = require('./config/config');
const { pool } = require('./db/pool');
const logger = require('./utils/logger');

// ✅ Graceful shutdown
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

// ✅ Handle signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});

// ✅ IMPORTANT: Use Render PORT
const PORT = process.env.PORT || config.port || 4000;

// ✅ Start server
app.listen(PORT, () => {
  logger.info(`🚖 Taxi API running on port ${PORT} (${config.nodeEnv})`);
});