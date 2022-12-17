const express = require('express');
const { getProfile } = require('../middleware/getProfile');
const { authorize } = require('../middleware/authorize');
const adminController = require('../controllers/admin');

const router = express.Router();

router.get('/best-profession', getProfile, authorize('admin'), adminController.getBestProfession);

router.get('/best-clients', getProfile, authorize('admin'), adminController.getBestClients);

module.exports = router;