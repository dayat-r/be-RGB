const dbConfig = require("../configs/database");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorAliases: 0,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user-model.js")(sequelize, Sequelize);
db.item = require("./item-model.js")(sequelize, Sequelize);
db.supplier = require("./supplier-model.js")(sequelize, Sequelize);
db.customer = require("./customer-model")(sequelize, Sequelize);
db.locationCode = require("./location-code-model")(sequelize, Sequelize);
db.priceRef = require("./price-ref-model")(sequelize, Sequelize);
db.actualStock = require("./actual-stock-model")(sequelize, Sequelize);
db.income = require("./income-model")(sequelize, Sequelize);
db.cost = require("./cost-model")(sequelize, Sequelize);
db.merk = require("./merk-model")(sequelize, Sequelize);
db.purchase = require("./purchase-model")(sequelize, Sequelize);
db.order = require("./order-model")(sequelize, Sequelize);
db.sales = require("./sales-model")(sequelize, Sequelize);
db.PriceUse = require("./price-use-model")(sequelize, Sequelize);
db.TransferItem = require("./transfer-item")(sequelize, Sequelize);
db.coa = require("./coa-model.js")(sequelize, Sequelize);
db.alert = require("./alert-model")(sequelize, Sequelize);
db.pembayaran = require("./pembayaran-model")(sequelize, Sequelize);
db.iot = require("./iot-model")(sequelize, Sequelize);

module.exports = db;
