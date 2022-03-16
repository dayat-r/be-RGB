module.exports = (sequelize, Sequelize) => {
    const Coa = sequelize.define("Coa", {
        noCoa: {
            type: Sequelize.INTEGER,
            unique: true
        },
        description: {
            type: Sequelize.STRING,
        },
    });
    return Coa;
};