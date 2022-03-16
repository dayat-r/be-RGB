const router = require('express').Router();
const CostController = require('../../controllers').Cost;

router.post('/', CostController.saveCost);  
router.post('/update/:id', CostController.updateCost);  
router.get('/', CostController.getCost);  
router.get('/by-id/:id', CostController.getCostById);  
router.delete('/:id', CostController.deleteCost);  

module.exports = router;
