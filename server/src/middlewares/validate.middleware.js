const { body, param, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, errors.array()[0].msg, 422);
  }
  next();
};

const adminLoginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Min 6 characters'),
];

const createVehicleRules = [
  body('name').trim().notEmpty().withMessage('Vehicle name is required'),
  body('type').isIn(['sedan','suv','hatchback','luxury','auto','bike']).withMessage('Invalid vehicle type'),
  body('plate_number').trim().notEmpty().withMessage('Plate number is required'),
  body('capacity').isInt({ min: 1, max: 20 }).withMessage('Capacity must be 1–20'),
  body('base_fare').isFloat({ min: 0 }).withMessage('Invalid base fare'),
  body('per_km_rate').isFloat({ min: 0 }).withMessage('Invalid per km rate'),
];

const updateVehicleRules = [
  param('id').isUUID().withMessage('Invalid vehicle ID'),
  body('type').optional().isIn(['sedan','suv','hatchback','luxury','auto','bike']).withMessage('Invalid type'),
  body('capacity').optional().isInt({ min: 1, max: 20 }).withMessage('Invalid capacity'),
  body('base_fare').optional().isFloat({ min: 0 }).withMessage('Invalid base fare'),
  body('per_km_rate').optional().isFloat({ min: 0 }).withMessage('Invalid per km rate'),
  body('status').optional().isIn(['available','booked','maintenance']).withMessage('Invalid status'),
];

const createBookingRules = [
  body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
  body('customer_phone').trim().notEmpty().withMessage('Phone is required').matches(/^[+\d\s\-()]{7,20}$/).withMessage('Invalid phone'),
  body('customer_email').optional().isEmail().withMessage('Invalid email').normalizeEmail(),
  body('vehicle_id').isUUID().withMessage('Valid vehicle ID required'),
  body('pickup_location').trim().notEmpty().withMessage('Pickup location required'),
  body('drop_location').trim().notEmpty().withMessage('Drop location required'),
  body('distance_km').isFloat({ min: 0.1 }).withMessage('Distance must be > 0'),
  body('pickup_lat').optional().isFloat({ min: -90, max: 90 }),
  body('pickup_lng').optional().isFloat({ min: -180, max: 180 }),
  body('drop_lat').optional().isFloat({ min: -90, max: 90 }),
  body('drop_lng').optional().isFloat({ min: -180, max: 180 }),
  body('scheduled_at').optional().isISO8601().withMessage('Invalid date format'),
];

const bookingStatusRules = [
  param('id').isUUID().withMessage('Invalid booking ID'),
  body('status').isIn(['pending','confirmed','in_progress','completed','cancelled']).withMessage('Invalid status'),
];

const uuidParamRule = [param('id').isUUID().withMessage('Invalid ID format')];

module.exports = {
  validate, adminLoginRules, createVehicleRules, updateVehicleRules,
  createBookingRules, bookingStatusRules, uuidParamRule,
};