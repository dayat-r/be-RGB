const auth = require('./controller-auth');
const item = require('./controller-Item');
const supplier = require('./controller-supplier');
const customer = require('./controller-customer');
const user = require('./controller-user');
const locationCode = require('./controller-location-code');
const Income = require('./controller-income');
const Cost = require('./controller-cost');
const Merk = require('./controller-merk');
const ActualStock = require('./controller-actual-stock');
const Order = require('./controller-order');
const Purchase = require('./controller-purchase');
const Report = require('./controller-report');
const Coa = require('./controller-coa');
const Alert = require('./controller-alert');
const Pembayaran = require('./controller-pembayaran');
const Iot = require('./controller-iot');
module.exports = {
    auth,
    item,
    supplier,
    customer,
    user,
    locationCode,
    Income,
    Cost,
    Merk,
    ActualStock,
    Order,
    Purchase,
    Report,
    Coa,
    Alert,
    Pembayaran,
    Iot
}