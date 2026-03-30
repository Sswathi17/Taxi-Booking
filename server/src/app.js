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

// ✅ 1. ROOT ROUTE FIRST (NO LIMITER)
app.get('/', (req, res) => {
  res.send('🚖 Taxi API is running');
});

// ✅ 2. SECURITY
app.use(helmet());

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  credentials: true,
}));

// ✅ 3. BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 4. LOGGER
app.use(
  config.isDev
    ? morgan('dev')
    : morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
      })
);

// ✅ 5. APPLY RATE LIMIT ONLY TO /api (NOT ROOT)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests' },
});

app.use('/api', apiLimiter);

// ✅ 6. LOGIN LIMITER ONLY
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts' },
});

app.use('/api/auth/login', loginLimiter);

// ✅ 7. ROUTES
app.use('/api', routes);

// ✅ 8. ERROR HANDLING
app.use(notFound);
app.use(errorHandler);

module.exports = app;