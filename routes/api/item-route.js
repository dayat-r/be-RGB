const router = require('express').Router();
const ItemController = require('../../controllers').item;
const upload = require('../../middleware/upload-single-image').uploadItem;

router.post('/', upload.single("image"), ItemController.saveItem);  
router.get('/', ItemController.getItem);  
router.post('/update/:barcode', upload.single("image"), ItemController.updateItem);  
router.get('/by-id/:barcode', ItemController.getItemById);  
router.delete('/:barcode',  ItemController.deleteItem);  

module.exports = router;
