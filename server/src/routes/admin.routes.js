const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { adminLoginRules, validate } = require('../middlewares/validate.middleware');

router.post('/login', adminLoginRules, validate, adminController.login);
router.get('/me', authenticate, adminController.getProfile);

module.exports = router;