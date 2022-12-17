const { PROFILE_TYPE } = require('../model');
const mainRepository = require('../repositories/mainRepository');

exports.getUnpaidJobs = async (req, res) => {
    const jobs = await mainRepository.getUserJobs(req.profile.id, false);
    res.send(jobs);
}

exports.payForJob = async (req, res) => {
    if (req.profile.type !== PROFILE_TYPE.client) {
        return res.status(422).end();
    }
    await mainRepository.payForJob(req.profile.id, req.params.job_id);
    res.status(200).end();
}
