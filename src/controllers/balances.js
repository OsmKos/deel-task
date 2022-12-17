const mainRepository = require('../repositories/mainRepository');

exports.deposit = async (req, res) => {
    await mainRepository.deposit(Number(req.params.userId), req.body.amount);
    res.status(200).end();
}
