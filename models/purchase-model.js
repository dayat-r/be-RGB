module.exports = (sequelize, Sequelize) => {
    const purchase = sequelize.define("purchase", {
        noCoa: {
            type: Sequelize.INTEGER,
        },
        idPrice: {
            type: Sequelize.STRING,
        },
        paymentMethod: {
            type: Sequelize.STRING,
        },
        date: {
            type: Sequelize.DATE,
        },
        limitDate: {
            type: Sequelize.STRING,
        },
        total: {
            type: Sequelize.DOUBLE,
        },
        dp: {
            type: Sequelize.DOUBLE,
        },
        credit: {
            type: Sequelize.DOUBLE,
        },
    });
    return purchase;
};