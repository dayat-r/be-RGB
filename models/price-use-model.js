module.exports = (sequelize, Sequelize) => {
    const PriceUse = sequelize.define("PriceUse", {
        idOrder: {
            type: Sequelize.INTEGER,
        },
        idPrice: {
            type: Sequelize.STRING,
        },
        qty: {
            type: Sequelize.INTEGER,
        },
    });
    return PriceUse;
};