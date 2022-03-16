module.exports = (sequelize, Sequelize) => {
    const Sales = sequelize.define("Sales", {
        noCoa: {
            type: Sequelize.INTEGER,
        },
        idSales: {
            type: Sequelize.STRING,
        },
        date: {
            type: Sequelize.DATE,
        },
        idCustomer: {
            type: Sequelize.STRING,
        },
        paymentMethod: {
            type: Sequelize.STRING,
        },
        note: {
            type: Sequelize.STRING,
        },
        limitDate: {
            type: Sequelize.STRING,
        },
        total: {
            type: Sequelize.DOUBLE,
        },
        ppn: {
            type: Sequelize.DOUBLE,
        },
        ppnStatus: {
            type: Sequelize.STRING,
        },
        ppnCheck: {
            type: Sequelize.BOOLEAN,
        },
        credit: {
            type: Sequelize.DOUBLE,
        },
        dp: {
            type: Sequelize.DOUBLE,
        },
        pay: {
            type: Sequelize.DOUBLE,
        },
        cashback: {
            type: Sequelize.DOUBLE,
        },
        userSales: {
            type: Sequelize.STRING,
        },
    });
    return Sales;
};