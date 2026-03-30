const authService = require('../services/auth.service');
const AdminModel = require('../models/admin.model');
const { sendError } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authorization token missing or malformed', 401);
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = authService.verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') return sendError(res, 'Token has expired', 401);
      return sendError(res, 'Invalid token', 401);
    }
    const admin = await AdminModel.findById(decoded.id);
    if (!admin) return sendError(res, 'Admin account not found', 401);
    req.admin = admin;
    next();
  } catch (err) {
    return sendError(res, 'Authentication failed', 500);
  }
};

module.exports = { authenticate };