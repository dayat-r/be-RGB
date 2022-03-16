require("dotenv").config();
const {
    NODE_ENV,
    PG_HOST_DEVELOP,
    PG_USER_DEVELOP,
    PG_PASS_DEVELOP,
    PG_DB_DEVELOP,
    PG_HOST_PRODUCTION,
    PG_USER_PRODUCTION,
    PG_PASS_PRODUCTION,
    PG_DB_PRODUCTION,
} = process.env;

let HOST, USER, PASS, DB;

if (NODE_ENV === 'production') {
    HOST = PG_HOST_PRODUCTION
    USER = PG_USER_PRODUCTION
    PASS = PG_PASS_PRODUCTION
    DB = PG_DB_PRODUCTION
} else {
    HOST = PG_HOST_DEVELOP
    USER = PG_USER_DEVELOP
    PASS = PG_PASS_DEVELOP
    DB = PG_DB_DEVELOP
}

module.exports = {
    HOST: HOST,
    USER: USER,
    PASSWORD: PASS,
    DB: DB,
    dialect: "postgres",
    pool: {
        max: 100,
        min: 10,
        acquire: 30000,
        idle: 10000,
    },
};