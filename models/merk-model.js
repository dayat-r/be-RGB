module.exports = (sequelize, Sequelize) => {
    const Merk = sequelize.define("Merk", {
        kodeMerk: {
            type: Sequelize.STRING,
        },
        name: {
            type: Sequelize.STRING,
        },
        path: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.BOOLEAN,
        },
    });
    return Merk;
};