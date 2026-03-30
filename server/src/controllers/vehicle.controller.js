const VehicleModel = require('../models/vehicle.model');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const logger = require('../utils/logger');

const getAll = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [vehicles, total] = await Promise.all([
      VehicleModel.findAll({ type, status, limit: parseInt(limit, 10), offset }),
      VehicleModel.count({ type, status }),
    ]);
    return sendPaginated(res, vehicles, total, page, limit, 'Vehicles fetched');
  } catch (err) {
    return sendError(res, 'Failed to fetch vehicles', 500);
  }
};

const getOne = async (req, res) => {
  try {
    const vehicle = await VehicleModel.findById(req.params.id);
    if (!vehicle) return sendError(res, 'Vehicle not found', 404);
    return sendSuccess(res, { vehicle }, 'Vehicle fetched');
  } catch (err) {
    return sendError(res, 'Failed to fetch vehicle', 500);
  }
};

const create = async (req, res) => {
  try {
    const { name, type, plate_number, capacity, base_fare, per_km_rate, image_url } = req.body;
    const existing = await VehicleModel.findByPlate(plate_number);
    if (existing) return sendError(res, `Plate ${plate_number} already exists`, 409);

    const vehicle = await VehicleModel.create({ name, type, plate_number, capacity, base_fare, per_km_rate, image_url });
    logger.info(`Vehicle created: ${vehicle.id}`);
    return sendSuccess(res, { vehicle }, 'Vehicle created', 201);
  } catch (err) {
    return sendError(res, 'Failed to create vehicle', 500);
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const exists = await VehicleModel.findById(id);
    if (!exists) return sendError(res, 'Vehicle not found', 404);

    if (req.body.plate_number && req.body.plate_number !== exists.plate_number) {
      const dup = await VehicleModel.findByPlate(req.body.plate_number);
      if (dup) return sendError(res, 'Plate already in use', 409);
    }

    const vehicle = await VehicleModel.update(id, req.body);
    return sendSuccess(res, { vehicle }, 'Vehicle updated');
  } catch (err) {
    return sendError(res, 'Failed to update vehicle', 500);
  }
};

const remove = async (req, res) => {
  try {
    const exists = await VehicleModel.findById(req.params.id);
    if (!exists) return sendError(res, 'Vehicle not found', 404);
    await VehicleModel.remove(req.params.id);
    return sendSuccess(res, {}, 'Vehicle deleted');
  } catch (err) {
    if (err.code === '23503') return sendError(res, 'Cannot delete vehicle with existing bookings', 409);
    return sendError(res, 'Failed to delete vehicle', 500);
  }
};

module.exports = { getAll, getOne, create, update, remove };