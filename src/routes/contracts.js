const express = require('express');
const { getProfile } = require('../middleware/getProfile');
const { authorize } = require('../middleware/authorize');
const contractController = require('../controllers/contracts');

const router = express.Router();

router.get('/', getProfile, contractController.getUserContracts);

router.get('/:id', [getProfile, authorize('contract')], contractController.getById);

module.exports = router;