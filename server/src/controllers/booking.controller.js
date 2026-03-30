const BookingModel = require('../models/booking.model');
const VehicleModel = require('../models/vehicle.model');
const fareService = require('../services/fare.service');
const { generateBookingRef } = require('../utils/bookingRef');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

//
// ================= CREATE BOOKING =================
//
const create = async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      vehicle_id,
      pickup_location,
      pickup_lat,
      pickup_lng,
      drop_location,
      drop_lat,
      drop_lng,
      distance_km,
      scheduled_at,
      notes,
    } = req.body;

    const vehicle = await VehicleModel.findById(vehicle_id);

    if (!vehicle) {
      return sendError(res, 'Vehicle not found', 404);
    }

    if (vehicle.status !== 'available') {
      return sendError(res, `Vehicle is currently ${vehicle.status}`, 409);
    }

    const { fare, breakdown } = fareService.calculateFare({
      distanceKm: distance_km,
      baseFare: vehicle.base_fare,
      perKmRate: vehicle.per_km_rate,
      scheduledAt: scheduled_at || new Date(),
    });

    const booking_ref = generateBookingRef();

    const booking = await BookingModel.create({
      booking_ref,
      customer_name,
      customer_phone,
      customer_email,
      vehicle_id,
      pickup_location,
      pickup_lat,
      pickup_lng,
      drop_location,
      drop_lat,
      drop_lng,
      distance_km,
      fare,
      scheduled_at,
      notes,
    });

    logger.info(`Booking created: ${booking_ref} | Fare: ₹${fare}`);

    return sendSuccess(
      res,
      { booking: { ...booking, fare_breakdown: breakdown } },
      'Booking created',
      201
    );
  } catch (err) {
    console.error(err);
    return sendError(res, err.message || 'Failed to create booking', 500);
  }
};

//
// ================= GET ALL BOOKINGS =================
//
const getAll = async (req, res) => {
  try {
    const { status, vehicle_id } = req.query;

    const bookings = await BookingModel.findAll({
      status,
      vehicle_id,
    });

    // ✅ IMPORTANT FIX: return plain array
    return res.json(bookings);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Failed to fetch bookings',
    });
  }
};

//
// ================= GET ONE BOOKING =================
//
const getOne = async (req, res) => {
  try {
    const booking = await BookingModel.findById(req.params.id);

    if (!booking) {
      return sendError(res, 'Booking not found', 404);
    }

    return sendSuccess(res, { booking }, 'Booking fetched');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Failed to fetch booking', 500);
  }
};

//
// ================= UPDATE STATUS =================
//
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const exists = await BookingModel.findById(id);

    if (!exists) {
      return sendError(res, 'Booking not found', 404);
    }

    const booking = await BookingModel.updateStatus(id, status);

    return sendSuccess(res, { booking }, 'Status updated');
  } catch (err) {
    console.error(err);
    return sendError(res, 'Failed to update status', 500);
  }
};

//
// ================= ESTIMATE FARE =================
//
const estimateFare = async (req, res) => {
  try {
    const { distance_km, scheduled_at } = req.query;

    if (!distance_km || isNaN(distance_km)) {
      return sendError(res, 'Valid distance_km required', 400);
    }

    const estimates = fareService.estimateByType(
      parseFloat(distance_km),
      scheduled_at ? new Date(scheduled_at) : new Date()
    );

    return sendSuccess(
      res,
      { estimates, distance_km: parseFloat(distance_km) },
      'Fare estimated'
    );
  } catch (err) {
    console.error(err);
    return sendError(res, 'Failed to estimate fare', 500);
  }
};

//
// ================= EXPORT =================
//
module.exports = {
  create,
  getAll,
  getOne,
  updateStatus,
  estimateFare,
};