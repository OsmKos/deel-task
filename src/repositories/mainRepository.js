const { Op, fn, col } = require('sequelize');
const {
    Contract,
    Job,
    Profile,
    CONTRACT_STATUS,
    PROFILE_TYPE,
    sequelize
} = require('../model');

class MainRepository {

    async getProfileById (id) {
        const profile = await Profile.findByPk(id, { raw: true });
        return profile;
    }

    async getContractById (id) {
        const contract = await Contract.findByPk(id, { raw: true });
        return contract;
    }

    async getUserJobs (profileId, paid) {
        const paidFilter = paid === true ? [true] : paid === false ? [false, null] : [];
        const contracts = await this.getUserContracts(profileId, [CONTRACT_STATUS.in_progress]);
        const jobs = await Job.findAll({
            where: {
                ContractId: {
                    [Op.in]: contracts.map(c => c.id)
                },
                paid: {
                    [Op.or]: paidFilter
                }
            },
            raw: true
        });
        return jobs;
    }

    async getUserContracts (profileId, statuses) {
        const whereOptions = {
            [Op.or]: [
                {
                    ContractorId: profileId
                },
                {
                    ClientId: profileId
                }
            ]
        };
        if (Array.isArray(statuses) && statuses.length) {
            whereOptions.status = statuses;
        }
        return this.findContracts(whereOptions);
    }

    async findContracts (whereOptions) {
        return Contract.findAll({
            where: whereOptions,
            raw: true
        });
    }

    async getBestProfession (start, end) {
        const topProfession = await Job.findOne({
            where: {
                paymentDate: {
                    [Op.between]: [start, end]
                },
                paid: true
            },
            attributes: [[fn('sum', col('price')), 'totalEarned'], 'Contract.Contractor.profession'],
            include: [{
                model: Contract,
                include: [{
                    model: Profile,
                    as: 'Contractor'
                }]
            }],
            group: ['Contract.Contractor.profession'],
            raw: true,
            nest: true,
            order: sequelize.literal('totalEarned DESC')
        });
        return topProfession.profession;
    }

    async getBestClients (start, end, limit) {
        const groupedByBestClients = await Job.findAll({
            where: {
                paymentDate: {
                    [Op.between]: [start, end]
                },
                paid: true
            },
            include: [{ 
                model: Contract, 
                include: [{
                    model: Profile,
                    as: 'Client'
                }] 
            }],
            group: ['Contract.Client.id'],
            attributes: [
                [fn('sum', col('price')), 'totalPaid'],
                'Contract.Client.id',
                'Contract.Client.firstName',
                'Contract.Client.lastName'
            ],
            raw: true,
            nest: true,
            order: sequelize.literal('totalPaid DESC'),
            limit
        });
        return groupedByBestClients;
    }

    async deposit (clientId, amount) {
        await sequelize.transaction(async t => {
            const [client, groupedRes] = await Promise.all([
                Profile.findByPk(
                    clientId,
                    {
                        transaction: t,
                        lock: true,
                        raw: true
                    }
                ),
                Job.findOne({
                    where: {
                        paid: {
                            [Op.or]: [null, false]
                        }
                    },
                    attributes: [[fn('sum', col('price')), 'totalToPay']],
                    include: [{
                        model: Contract,
                        where: {
                            ClientId: clientId,
                            status: {
                                [Op.ne]: 'terminated'
                            }
                        },
                        required: true
                    }],
                    transaction: t,
                    lock: true,
                    raw: true,
                    nest: true
                })
            ]);
            if (client.type !== PROFILE_TYPE.client) {
                throw new Error('Deposit only to a client account');
            }
            if (amount > (groupedRes.totalToPay || 0 / 4)) {
                throw new Error('Too much for deposit');
            }
            await Profile.update(
                { balance: client.balance + amount },
                { where: { id: clientId }, transaction: t }
            );
        })
    }

    async payForJob (profileId, jobId) {
        await sequelize.transaction(async t => {
            const [job, profile] = await Promise.all([
                Job.findByPk(
                    jobId,
                    { 
                        transaction: t,
                        lock: true,
                        raw: true,
                        nest: true,
                        include: [{
                            model: Contract,
                            include: { model: Profile, as: 'Contractor' }
                        }]
                    }
                ),
                Profile.findByPk(
                    profileId,
                    { transaction: t, lock: true, raw: true }
                )
            ]);
            
            if (profile.balance <= job.price) {
                throw new Error('Insufficient funds');
            }
            if (job.paid) {
                throw new Error('Job is already paid');
            }

            await Promise.all([
                Profile.update(
                    { balance: profile.balance - job.price },
                    { where: { id: profileId }, transaction: t }
                ),
                Profile.update(
                    { balance: job.Contract.Contractor.balance + job.price },
                    { where: { id: job.Contract.ContractorId }, transaction: t }
                ),
                Job.update(
                    { paid: true, paymentDate: Date.now() },
                    { where: { id: jobId }, transaction: t }
                )
            ]);
        });
    }
}

module.exports = new MainRepository();