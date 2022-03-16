module.exports = (sequelize, Sequelize) => {
    const Pembayaran = sequelize.define("Pembayaran", {
        date: {
            type: Sequelize.DATE,
        },
        nextDate: {
            type: Sequelize.DATE,
        },
        type: {
            type: Sequelize.STRING,
        },
        idSales: {
            type: Sequelize.STRING,
        },
        idPurchase: {
            type: Sequelize.STRING,
        },
        sumCredit: {
            type: Sequelize.DOUBLE,
        },
        amount: {
            type: Sequelize.DOUBLE,
        },
        remainingCredit: {
            type: Sequelize.DOUBLE,
        },
        note: {
            type: Sequelize.STRING,
        },
    });
    return Pembayaran;
};