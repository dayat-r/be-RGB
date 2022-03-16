const router = require('express').Router();
const ActualStockController = require('../../controllers').ActualStock;

router.post('/restock/:id', ActualStockController.reStockProduct);  
router.get('/by-id/:barcode', ActualStockController.getActualByBarcode);  
router.post('/transfer/:barcode', ActualStockController.tranferProduct);  

module.exports = router;
