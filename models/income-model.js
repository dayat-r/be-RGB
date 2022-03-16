module.exports = (sequelize, Sequelize) => {
    const Income = sequelize.define("Income", {
        noCoa: {
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING,
        },
        date: {
            type: Sequelize.STRING,
        },
        amount: {
            type: Sequelize.DOUBLE,
        },
        description: {
            type: Sequelize.STRING,
        },
    });
    return Income;
};