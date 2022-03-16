const router = require('express').Router();
const iotController = require('../../controllers').Iot;

router.post('/', iotController.saveIot);  
router.post('/update/:id', iotController.updateIot);  
router.get('/', iotController.getIot);  
router.get('/app-by-id/:id', iotController.appGetIotByIdDevice);  
router.get('/by-id/:id', iotController.getIotByIdDevice);  
router.put('/update/:id', iotController.updateFromApp);  
router.delete('/:id', iotController.deleteIot);  

module.exports = router;
