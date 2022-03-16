module.exports = (sequelize, Sequelize) => {
    const Customer = sequelize.define("Customer", {
        idCustomer: {
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
        deptCode: {
            type: Sequelize.STRING,
        },
        piutang: {
            type: Sequelize.DOUBLE,
        },
    });
    return Customer;
};