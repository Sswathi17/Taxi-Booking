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

//
// ✅ 1. ROOT ROUTE
//
app.get('/', (req, res) => {
  res.status(200).send('🚖 Taxi API is running');
});

//
// ✅ 2. CORS — MUST BE BEFORE HELMET AND ROUTES
//
const allowedOrigins = [
  'https://taxi-booking-gilt.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests for all routes
app.options('*', cors());

//
// ✅ 3. SECURITY
//
app.use(helmet());

//
// ✅ 4. BODY PARSER
//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//
// ✅ 5. LOGGER
//
app.use(
  config.nodeEnv === 'development'
    ? morgan('dev')
    : morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
      })
);

//
// ✅ 6. RATE LIMIT (GENERAL API)
//
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests' },
});

app.use('/api', apiLimiter);

//
// ✅ 7. LOGIN LIMITER
//
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts' },
});

app.use('/api/auth/login', loginLimiter);

//
// ✅ 8. ROUTES
//
app.use('/api', routes);

//
// ✅ 9. TEST ROUTE
//
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API working 🚀' });
});

//
// ✅ 10. ERROR HANDLING
//
app.use(notFound);
app.use(errorHandler);

module.exports = app;
