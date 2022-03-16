module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define("Order", {
        idSales: {
            type: Sequelize.STRING,
        },
        barcode: {
            type: Sequelize.STRING,
        },
        qty: {
            type: Sequelize.INTEGER,
        },
        price: {
            type: Sequelize.DOUBLE,
        },
        diskon: {
            type: Sequelize.DOUBLE,
        },
        typeDiscount: {
            type: Sequelize.STRING,
        },
        location: {
            type: Sequelize.STRING,
        },
        
    });
    return Order;
};