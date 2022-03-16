module.exports = (sequelize, Sequelize) => {
    const Item = sequelize.define("Item", {
        barcode: {
            type: Sequelize.STRING,
        },
        idSupplier: {
            type: Sequelize.STRING,
        },
        merkMobil: {
            type: Sequelize.STRING,
        },
        tipeMobil: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.STRING,
        },
        description2: {
            type: Sequelize.STRING,
        },
        merk: {
            type: Sequelize.STRING,
        },
        path: {
            type: Sequelize.STRING,
        },
        price: {
            type: Sequelize.DOUBLE,
        }
    });
    return Item;
};