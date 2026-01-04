const express = require("express");
const controller = require("../controller/project.controller");

const authMiddleWare = require("../middlewares/auth.middleware");

const validate = require("../validates/project.validate");

const router = express.Router();   
    

router.use(authMiddleWare.requireAuth);

router.get('/',  controller.project);

router.get('/create', controller.create);

router.post('/create', validate.createProject, controller.createPost);

router.delete('/delete/:id', controller.delete);

router.get('/edit/:id', controller.edit);

router.patch('/edit/:id', controller.editPatch);

router.get('/manage/:id', controller.manage);


// router.get('/searchGateway', controller.searchGateway);

module.exports = router;