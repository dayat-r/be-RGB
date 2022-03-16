module.exports = (sequelize, Sequelize) => {
    const Cost = sequelize.define("Cost", {
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
    return Cost;
};