const express = require('express');
const { getProfile } = require('../middleware/getProfile');
const balancesController = require('../controllers/balances');

const router = express.Router();

router.post('/deposit/:userId', getProfile, balancesController.deposit);

module.exports = router;