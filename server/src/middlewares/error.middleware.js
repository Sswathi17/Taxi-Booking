const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} → ${err.message}`);

  if (err.code === '23505') return res.status(409).json({ success: false, error: 'Record already exists' });
  if (err.code === '23503') return res.status(409).json({ success: false, error: 'Referenced record not found' });
  if (err.code === '22P02') return res.status(400).json({ success: false, error: 'Invalid ID format' });
  if (err.name === 'JsonWebTokenError') return res.status(401).json({ success: false, error: 'Invalid token' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ success: false, error: 'Token expired' });
  if (err instanceof SyntaxError && err.status === 400) return res.status(400).json({ success: false, error: 'Malformed JSON' });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return res.status(statusCode).json({ success: false, error: message });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };