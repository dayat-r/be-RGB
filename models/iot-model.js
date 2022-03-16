module.exports = (sequelize, Sequelize) => {
    const Iot = sequelize.define("Iot", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey : true
        },
        idDevice: {
            type: Sequelize.INTEGER
        },
        name: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.BOOLEAN,
        },
        value: {
            type: Sequelize.INTEGER,
        },
    });
    return Iot;
};