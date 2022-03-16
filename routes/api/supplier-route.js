const router = require('express').Router();
const SupplierController = require('../../controllers').supplier;

router.post('/', SupplierController.saveSupplier);  
router.post('/update/:idSupplier', SupplierController.updateSupplier);  
router.get('/', SupplierController.getSupplier);  
router.get('/by-id/:idSupplier', SupplierController.getSupplierById);  
router.delete('/:idSupplier', SupplierController.deleteSupplier);  

module.exports = router;
