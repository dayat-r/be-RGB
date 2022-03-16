const router = require('express').Router();
const UserController = require('../../controllers').user;

router.post('/', UserController.saveUser);  
router.post('/update/:idUser', UserController.updateUser);  
router.post('/update-password/:idUser', UserController.updateUserPassword);  
router.get('/', UserController.getUser);  
router.get('/by-id/:idUser', UserController.getUserById);  
router.delete('/:idUser', UserController.deleteUser);  

module.exports = router;
