const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { createVehicleRules, updateVehicleRules, uuidParamRule, validate } = require('../middlewares/validate.middleware');

router.get('/', vehicleController.getAll);
router.get('/:id', uuidParamRule, validate, vehicleController.getOne);
router.post('/', authenticate, createVehicleRules, validate, vehicleController.create);
router.put('/:id', authenticate, updateVehicleRules, validate, vehicleController.update);
router.delete('/:id', authenticate, uuidParamRule, validate, vehicleController.remove);

module.exports = router;