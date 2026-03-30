require('dotenv').config();

const app = require('./app');
const config = require('./config/config');
const { pool } = require('./db/pool');
const logger = require('./utils/logger');

//
// ✅ 1. START SERVER
//
const PORT = process.env.PORT || config.port || 4000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} (${config.nodeEnv})`);
});

//
// ✅ 2. GRACEFUL SHUTDOWN (FIXED)
//
const shutdown = async (signal) => {
  logger.info(`⚠️ ${signal} received. Closing server...`);

  try {
    // Stop accepting new requests
    server.close(async () => {
      logger.info('🛑 HTTP server closed.');

      try {
        // Close DB pool
        await pool.end();
        logger.info('✅ Database pool closed.');

        process.exit(0);
      } catch (dbError) {
        logger.error('❌ Error closing DB pool:', dbError);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('❌ Shutdown error:', error);
    process.exit(1);
  }
};

//
// ✅ 3. HANDLE SIGNALS
//
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

//
// ✅ 4. HANDLE ERRORS (IMPORTANT)
//
process.on('unhandledRejection', (reason) => {
  logger.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
});

//
// ✅ 5. KEEP RENDER ALIVE (OPTIONAL BUT USEFUL)
//
setInterval(() => {
  logger.info('🔄 Server heartbeat alive');
}, 1000 * 60 * 10); // every 10 mins
