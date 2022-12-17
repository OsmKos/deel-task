const { CONTRACT_STATUS } = require('../model');
const mainRepository = require('../repositories/mainRepository');

exports.getById = async (req, res) => {
    const contract = await mainRepository.getContractById(req.params.id);
    if (!contract) {
        return res.status(404).end('Not Found');
    }
    res.send(contract);
}

exports.getUserContracts = async (req, res) => {
    const contracts = await mainRepository.getUserContracts(
        req.profile.id,
        [CONTRACT_STATUS.in_progress, CONTRACT_STATUS.new]
    );
    res.send(contracts);
}
