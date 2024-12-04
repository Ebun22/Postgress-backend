import multer from "multer";

const storage = multer.diskStorage({
    filename: function (req, file, cb){
        cb(null, `${file.originalname}_${Date.now()}`)
    }
});

export const upload = multer({storage: storage});
