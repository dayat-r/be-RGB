const router = require('express').Router();
const PurchaseController = require('../../controllers').Purchase;

router.get('/', PurchaseController.getListPurchase);  
router.get('/credit', PurchaseController.getListPurchaseCredit);  
router.get('/by-id/:id', PurchaseController.getPurchaseById);  
router.delete('/:id', PurchaseController.deletePurchase);  

module.exports = router;
