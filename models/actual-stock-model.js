module.exports = (sequelize, Sequelize) => {
    const ActualStock = sequelize.define("ActualStock", {
        barcode: {
            type: Sequelize.STRING,
        },
        locCode: {
            type: Sequelize.STRING,
        },
        qty: {
            type: Sequelize.INTEGER,
        },
    });
    return ActualStock;
};