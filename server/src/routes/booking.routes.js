const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/booking.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  createBookingRules,
  bookingStatusRules,
  uuidParamRule,
  validate,
} = require('../middlewares/validate.middleware');

//
// ✅ ROUTES (ORDER IS VERY IMPORTANT)
//

// Fare estimate (public)
router.get('/estimate', bookingController.estimateFare);

// Create booking (public)
router.post('/', createBookingRules, validate, bookingController.create);

// ✅ GET ALL BOOKINGS (ADMIN)
router.get('/', authenticate, bookingController.getAll);

// Get single booking (keep AFTER /)
router.get('/:id', uuidParamRule, validate, bookingController.getOne);

// Update booking status
router.patch(
  '/:id/status',
  authenticate,
  bookingStatusRules,
  validate,
  bookingController.updateStatus
);

module.exports = router;