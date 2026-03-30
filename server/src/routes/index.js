const express = require('express');
const router = express.Router();
const adminRoutes   = require('./admin.routes');
const vehicleRoutes = require('./vehicle.routes');
const bookingRoutes = require('./booking.routes');

router.use('/admin',    adminRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/bookings', bookingRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Taxi Booking API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

module.exports = router;