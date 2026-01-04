const express = require("express");
const multer = require('multer');

const controller = require("../controller/user.controller")

const validate = require("../validates/user.validate");

const authMiddleWare = require("../middlewares/auth.middleware");

const upload = multer();

const uploadCloud = require("../middlewares/uploadCloud.middleware")

const router = express.Router();   
    
router.get('/register', controller.register);

router.post('/register', validate.registerPost, controller.registerPost);

router.get('/login', controller.login);

router.post('/login', validate.loginPost, controller.loginPost);

router.get('/logout', controller.logout);

router.get('/info', authMiddleWare.requireAuth, controller.info);

router.post('/info', controller.infoPost);

router.get('/password/forgot', controller.forgotPassword);

router.post('/password/forgot',validate.forgotPassword, controller.forgotPasswordPost);

router.get('/password/otp', controller.otpPassword);

router.post('/password/otp', controller.otpPasswordPost);

router.get('/password/reset', controller.resetPassword);

router.post('/password/reset',validate.resetPassword, controller.resetPasswordPost);

router.get('/edit/:_id', controller.edit);

router.patch('/edit/:_id',
    upload.single("avatar"), 
    uploadCloud.upload,
    validate.editPatch,
    controller.editPatch);


module.exports = router;