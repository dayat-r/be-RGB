module.exports = (sequelize, Sequelize) => {
    const LocationCode = sequelize.define("LocationCode", {
        locCode: {
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
    });
    return LocationCode;
};