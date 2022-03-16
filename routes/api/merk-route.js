const router = require('express').Router();
const MerkController = require('../../controllers').Merk;
const upload = require('../../middleware/upload-single-image').upload;

router.post('/',upload.single('image'), MerkController.saveMerk);  
router.post('/update/:kodeMerk', upload.single('image'), MerkController.updateMerk);  
router.get('/', MerkController.getMerk);  
router.get('/by-id/:kodeMerk', MerkController.getMerkById);  
router.delete('/:kodeMerk',  MerkController.deleteMerk);  

module.exports = router;
