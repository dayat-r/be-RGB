module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("User", {
        idUser: {
            type: Sequelize.STRING,
        },
        name: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.TEXT,
        },
        status: {
            type: Sequelize.BOOLEAN,
        },
        role: {
            type: Sequelize.STRING,
        },
        deptCode:{
            type: Sequelize.STRING
        }
    });
    return User;
};