module.exports = (sequelize, Sequelize) => {
    const Supplier = sequelize.define("Supplier", {
        idSupplier: {
            type: Sequelize.STRING,
        },
        name: {
            type: Sequelize.STRING,
        },
        address: {
            type: Sequelize.STRING,
        },
        telp: {
            type: Sequelize.STRING,
        },
        hutang: {
            type: Sequelize.DOUBLE,
        },
    });
    return Supplier;
};