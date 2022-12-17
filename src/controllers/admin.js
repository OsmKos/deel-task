const mainRepository = require('../repositories/mainRepository');
const DAY_IN_MS = 24 * 60 * 60 + 1000;

exports.getBestProfession = async (req, res) => {
    const { start, end } = extractDateFromReq(req);
    const profession = await mainRepository.getBestProfession(start, end);
    res.send(profession);
}

exports.getBestClients = async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 2;
    const { start, end } = extractDateFromReq(req);
    const bestClients = await mainRepository.getBestClients(start, end, limit);
    res.send(bestClients.map(mapClientToPresentation));
}

function mapClientToPresentation (client) {
    return {
        id: client.id,
        paid: client.totalPaid,
        fullName: `${client.firstName} ${client.lastName}`
    }
}

function extractDateFromReq (req) {
    return {
        start: req.query.start ? Number(req.query.start) : Date.now() - DAY_IN_MS,
        end: req.query.end ? Number(req.query.end) : Date.now()
    }
}
