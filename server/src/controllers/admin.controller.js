const AdminModel = require('../models/admin.model');
const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminModel.findByEmail(email);
    if (!admin) return sendError(res, 'Invalid email or password', 401);

    const isMatch = await authService.comparePassword(password, admin.password);
    if (!isMatch) return sendError(res, 'Invalid email or password', 401);

    const token = authService.signToken({ id: admin.id, email: admin.email, role: 'admin' });
    logger.info(`Admin logged in: ${admin.email}`);

    return sendSuccess(res, { token, admin: { id: admin.id, name: admin.name, email: admin.email } }, 'Login successful');
  } catch (err) {
    logger.error('Login error:', err);
    return sendError(res, 'Internal server error', 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.admin.id);
    if (!admin) return sendError(res, 'Admin not found', 404);
    return sendSuccess(res, { admin }, 'Profile fetched');
  } catch (err) {
    return sendError(res, 'Internal server error', 500);
  }
};

module.exports = { login, getProfile };