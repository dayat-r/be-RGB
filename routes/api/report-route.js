const router = require('express').Router();
const ReportController = require('../../controllers').Report;

router.get('/dashboard', ReportController.getDashboardReport);  
router.get('/sales', ReportController.getSalesReport);  
router.get('/purchase', ReportController.getPurchaseReport);  
router.get('/item-sales', ReportController.getItemSalesReport);  
router.get('/debt', ReportController.getDebtReport);  
router.get('/ar', ReportController.getArReport);  
router.get('/is', ReportController.getIsReport);  

module.exports = router;
