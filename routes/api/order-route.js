const router = require('express').Router();
const OrderController = require('../../controllers').Order;

router.post('/', OrderController.saveOrder);  
router.get('/sales-list', OrderController.getListSales);  
router.get('/sales-list/credit', OrderController.getListSalesCredit);  
router.get('/sales-detail/:id', OrderController.getSalesDetail);
router.put('/edit/:id', OrderController.editSales);
router.delete('/:id', OrderController.deleteSales);

module.exports = router;
