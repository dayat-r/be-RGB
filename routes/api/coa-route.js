const router = require('express').Router();
const CoaController = require('../../controllers').Coa;

router.post('/', CoaController.saveCoa);  
router.post('/update/:id', CoaController.updateCoa);  
router.get('/', CoaController.getCoa);  
router.get('/by-id/:id', CoaController.getCoaById);  
router.get('/by-no', CoaController.getCoabyNo);  
router.delete('/:id', CoaController.deleteCoa);  

module.exports = router;
