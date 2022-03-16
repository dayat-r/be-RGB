const router = require('express').Router();
const IncomeController = require('../../controllers').Income;

router.post('/', IncomeController.saveIncome);  
router.post('/update/:id', IncomeController.updateIncome);  
router.get('/', IncomeController.getIncome);  
router.get('/dashboard', IncomeController.getDashboard);  
router.get('/by-id/:id', IncomeController.getIncomeById);  
router.delete('/:id', IncomeController.deleteIncome);  

module.exports = router;
