const mainRepository = require('../repositories/mainRepository');

const authorize = (strategy) => {
    return async(req, res, next) => {
        const isAuthorized = await authorizeByStrategy(req, strategy);
        if(!isAuthorized) return res.status(403).send('Not Authorized');
        next();
    }
}

async function authorizeByStrategy (req, strategy) {
    switch (strategy) {
        case 'contract': {
            return authorizeContract(req.profile.id, Number(req.params.id));
        }
        case 'job': {
            return authorizeJob(req.profile.id, Number(req.params.job_id));
        }
        case 'admin': {
            //admin permissions should be checked
            return true;
        }
        default: {
            return false;
        }
    }
}

async function authorizeContract (userId, contractId) {
    const contracts = await mainRepository.getUserContracts(userId);
    return !!contracts.find(c => c.id === contractId);
}

async function authorizeJob (userId, jobId) {
    const jobs = await mainRepository.getUserJobs(userId);
    return !!jobs.find(j => j.id === jobId);
}

module.exports = { authorize };