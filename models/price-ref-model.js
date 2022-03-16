module.exports = (sequelize, Sequelize) => {
    const PriceRef = sequelize.define("PriceRef", {
        idPrice: {
            type: Sequelize.STRING,
        },
        locCode: {
            type: Sequelize.STRING,
        },
        barcode: {
            type: Sequelize.STRING,
        },
        priceUnit: {
            type: Sequelize.DOUBLE,
        },
        qty: {
            type: Sequelize.INTEGER,
        },
        qtyOut: {
            type: Sequelize.INTEGER,
        },
        typeDiskon: {
            type: Sequelize.STRING,
        },
        diskon: {
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
        idSupplier: {
            type: Sequelize.STRING,
        },

    });
    return PriceRef;
};