const express = require("express");
const controller = require("../controller/node.controller");

const validate = require("../validates/node.validate");

const router = express.Router();   
    

router.get('/create/:gatewayId',  controller.nodeCreate);

router.post('/create/',  controller.nodeCreatePost);

router.get('/manage/:gatewayId/:nodeId/:nodePosition',  controller.nodeManage);

// router.get('/manage/:gatewayId/:nodeId',  controller.nodeManage);

router.delete('/delete/:_id',  controller.nodeDelete);

router.get('/device/create/:gatewayId/:nodeId',  controller.deviceCreate);

router.post('/device/create',  controller.deviceCreatePost);

router.get('/device/schedule/:gatewayId/:nodeId/:deviceId',  controller.schedule);

router.post('/device/schedule/:gatewayId/:nodeId/:deviceId',  controller.schedulePost);

router.patch('/manage/change-multi/:gatewayId/:nodeId',  controller.changeMultiPatch);

router.delete('/device/delete/:_id',  controller.deviceDelete);

router.get('/sensor/create/:gatewayId/:nodeId',  controller.sensorCreate);

router.post('/sensor/create/:gatewayId/:nodeId',  validate.createCondition, controller.sensorCreatePost);

router.delete('/condition/delete/:_id',  controller.conditionDelete);

router.get('/edit/:gatewayId/:nodeId', controller.nodeEdit);

router.patch('/edit/:gatewayId/:nodeId', controller.nodeEditPatch);


module.exports = router;