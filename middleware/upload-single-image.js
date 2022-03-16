const multer = require('multer');

// upload merk
const storage = multer.diskStorage({
    destination : (req, file, callBack)=>{
        callBack(null,'uploads/merk')
    },
    filename :(req, file , callBack)=>{
        callBack(null,`${file.originalname}`)
    }
})
var upload = multer({storage : storage})

// upload Item
const storageItem = multer.diskStorage({
    destination : (req, file, callBack)=>{
        callBack(null,'uploads/item')
    },
    filename :(req, file , callBack)=>{
        callBack(null,`${file.originalname}`)
    }
})
var uploadItem = multer({storage : storageItem})


module.exports = {upload,uploadItem}