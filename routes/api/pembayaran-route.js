const router = require('express').Router();
const pembayaranController = require('../../controllers').Pembayaran;

router.post('/', pembayaranController.savePembayaran);  
router.post('/payment-purchase', pembayaranController.onBayarPurchase);  
router.post('/payment-sales', pembayaranController.onBayarSales);  
router.post('/update/:id', pembayaranController.updatePembayaran);  
router.get('/', pembayaranController.getPembayaran);  
router.get('/by-id/:id', pembayaranController.getPembayaranById);
router.delete('/:id', pembayaranController.deletePembayaran);  

module.exports = router;
