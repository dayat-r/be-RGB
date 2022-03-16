const authController = require('../controllers').auth;
const iotController = require('../controllers').Iot;
const router = require('express').Router();


router.post('/login', authController.login);
router.post('/register', authController.saveRegister);


//  for device
router.get('/api-iot/by-id/:id', iotController.getIotByIdDevice);  
router.get('/api-iot/update/:id', iotController.updateFromBrowser);  




module.exports = router;