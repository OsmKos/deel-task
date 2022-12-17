const express = require('express');
const contractRoutes = require('./contracts');
const jobRoutes = require('./jobs');
const adminRoutes = require('./admin');
const balanceRoutes = require('./balances');

const router = express.Router();

router.use('/contracts', contractRoutes);
router.use('/jobs', jobRoutes);
router.use('/admin', adminRoutes);
router.use('/balances', balanceRoutes);

module.exports = router;