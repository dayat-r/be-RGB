
const router = require('express').Router();

require("./../configs/auth/passport");
const passport = require("passport");
const passportSion = passport.authenticate("SION", { session: false });
require("dotenv").config();
const Item = require('./api/item-route');
const Supplier = require('./api/supplier-route');
const Customer = require('./api/customer-route');
const User = require('./api/user-route');
const LocationCode = require('./api/location-code-route');
const Income = require('./api/income-route');
const Cost = require('./api/cost-route');
const Merk = require('./api/merk-route');
const Actual = require('./api/actual-stock-route');
const Order = require('./api/order-route');
const Purchase = require('./api/purchase-route');
const Report = require('./api/report-route');
const Coa = require('./api/coa-route');
const Alert = require('./api/alert-route');
const Pembayaran = require('./api/pembayaran-route');
const Iot = require('./api/iot-route');


const { NODE_ENV, URL_ALLOW_DEVELOP, URL_ALLOW_PRODUCTION } = process.env;
if (NODE_ENV === "production") {
    ALLOWED = URL_ALLOW_PRODUCTION
} else {
    ALLOWED = URL_ALLOW_DEVELOP
}

router.use(passportSion, (req, res, next) => {
    let origin = req.headers.origin;
    if (ALLOWED.indexOf(origin) < 0) {
        res.setHeader("Access-Control-Allow-Origin", ALLOWED);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With", "Content-Type", "Authorization", "Accept");
    req.decoded = req.user;
    next();
});

router.use("/api-item",Item);
router.use("/api-supplier",Supplier);
router.use("/api-customer",Customer);
router.use("/api-user",User);
router.use("/api-location-code",LocationCode);
router.use("/api-income",Income);
router.use("/api-cost",Cost);
router.use("/api-merk",Merk);
router.use("/api-actual-stock",Actual);
router.use("/api-order",Order);
router.use("/api-purchase",Purchase);
router.use("/api-report",Report);
router.use("/api-coa",Coa);
router.use("/api-alert",Alert);
router.use("/api-pembayaran",Pembayaran);
router.use("/api-iot",Iot);

module.exports = router;