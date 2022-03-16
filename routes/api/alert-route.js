const router = require('express').Router();
const AlertController = require('../../controllers').Alert;

router.post('/', AlertController.saveAlert);  
router.post('/update/:id', AlertController.updateAlert);  
router.get('/', AlertController.getAlert);  
router.get('/active', AlertController.getAlertActive);  
router.get('/check-date', AlertController.checkDate);  
router.get('/by-id/:id', AlertController.getAlertById);  
router.delete('/:id', AlertController.deleteAlert);  

module.exports = router;
