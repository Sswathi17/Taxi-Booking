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
// ✅ 2. GRACEFUL SHUTDOWN
//
const shutdown = async (signal) => {
  logger.info(`⚠️ ${signal} received. Closing server...`);
  try {
    server.close(async () => {
      logger.info('🛑 HTTP server closed.');
      try {
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
// ✅ 4. HANDLE ERRORS
//
process.on('unhandledRejection', (reason) => {
  logger.error('❌ Unhandled Rejection:', reason);
});
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1); // ✅ exit on uncaught exception (best practice)
});

//
// ✅ 5. KEEP RENDER ALIVE — pings itself every 10 mins
//
const https = require('https');
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || null;

if (RENDER_URL) {
  setInterval(() => {
    https.get(RENDER_URL, (res) => {
      logger.info(`🔄 Keep-alive ping sent → ${res.statusCode}`);
    }).on('error', (err) => {
      logger.warn(`⚠️ Keep-alive ping failed: ${err.message}`);
    });
  }, 1000 * 60 * 10); // every 10 mins
} else {
  setInterval(() => {
    logger.info('🔄 Server heartbeat alive');
  }, 1000 * 60 * 10);
}
