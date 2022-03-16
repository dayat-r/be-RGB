const router = require('express').Router();
const CustomerController = require('../../controllers').customer;

router.post('/', CustomerController.saveCustomer);  
router.post('/update/:idCustomer', CustomerController.updateCustomer);  
router.get('/', CustomerController.getCustomer);  
router.get('/by-id/:idCustomer', CustomerController.getCustomerById);  
router.delete('/:idCustomer', CustomerController.deleteCustomer);  

module.exports = router;
