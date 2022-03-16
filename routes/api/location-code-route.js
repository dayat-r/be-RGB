const router = require('express').Router();
const LocationCodeController = require('../../controllers').locationCode;

router.post('/', LocationCodeController.saveLocation);  
router.post('/update/:locCode', LocationCodeController.updateLocation);  
router.get('/', LocationCodeController.getLocation);  
router.get('/by-id/:locCode', LocationCodeController.getLocationById);  
router.delete('/:locCode', LocationCodeController.deleteLocation);  

module.exports = router;
