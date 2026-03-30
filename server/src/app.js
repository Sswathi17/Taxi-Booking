const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');
const routes = require('./routes/index');
const { errorHandler, notFound } = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const app = express();

// ✅ 1. ROOT ROUTE (for Render health check)
app.get('/', (req, res) => {
  res.status(200).send('🚖 Taxi API is running');
});

// ✅ 2. SECURITY
app.use(helmet());

// ✅ 3. CORS (IMPORTANT FIX)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ 4. BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 5. LOGGER
app.use(
  config.nodeEnv === 'development'
    ? morgan('dev')
    : morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
      })
);

// ✅ 6. RATE LIMIT (only for API)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests' },
});

app.use('/api', apiLimiter);

// ✅ 7. LOGIN LIMITER
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts' },
});

app.use('/api/auth/login', loginLimiter);

// ✅ 8. ROUTES
app.use('/api', routes);

// ✅ 9. TEST ROUTE (VERY IMPORTANT for debugging)
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API working 🚀' });
});

// ✅ 10. ERROR HANDLING (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;