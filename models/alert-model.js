module.exports = (sequelize, Sequelize) => {
    const Alert = sequelize.define("Alert", {
        date: {
            type: Sequelize.DATE,
        },
        type: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.STRING,
        },
        idSales: {
            type: Sequelize.STRING,
        },
        idPurchase: {
            type: Sequelize.INTEGER,
        },
        status: {
            type: Sequelize.BOOLEAN,
        },
    });
    return Alert;
};