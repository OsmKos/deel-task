const express = require('express');
const { getProfile } = require('../middleware/getProfile');
const { authorize } = require('../middleware/authorize');
const jobController = require('../controllers/jobs');

const router = express.Router();

router.get('/unpaid', getProfile, jobController.getUnpaidJobs);

router.post('/:job_id/pay', [getProfile, authorize('job')], jobController.payForJob);

module.exports = router;