module.exports = (sequelize, Sequelize) => {
    const TransferItem = sequelize.define("TransferItem", {
        date: {
            type: Sequelize.DATE,
        },
        idPriceGo: {
            type: Sequelize.STRING,
        },
        idPriceTo: {
            type: Sequelize.STRING,
        },
        qty: {
            type: Sequelize.INTEGER,
        },
    });
    return TransferItem;
};