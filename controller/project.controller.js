const md5 = require("md5");
const User = require('../model/user.model');
const Gateway = require("../model/gateway.model");
const Node = require("../model/node.model");

const searchHelper = require("../helper/search");
const paginationHelper = require("../helper/pagination");

const mqtt = require("mqtt");

const mqttClient = mqtt.connect("mqtts://42684cb82de64c2889b9699ce38e5c32.s1.eu.hivemq.cloud:8883", {
    username: "den215",
    password: "Nguyentandat2152003"
});

mqttClient.on("connect", () => { });


//[GET] /project
module.exports.project = async (req, res) => {
    const tokenUser = req.cookies.tokenUser;

    const user = await User.findOne({ tokenUser });

    let find = {
        userId: user._id,
        deleted: false,
    };

    const objectSearch = searchHelper(req.query);

    if (objectSearch.reg) {
        find.projectName = objectSearch.reg;
    }

    let objectPagination = {
        currentPage: 1,
        limitItem: 5
    };
    const countProduct = await Gateway.countDocuments(find);

    paginationHelper(objectPagination, req.query, countProduct);

    const gateway = await Gateway.find(find).sort({ position: "desc" }).limit(objectPagination.limitItem).skip(objectPagination.skip);

    res.render("pages/projects/projects", {
        pageTitle: "Dự án",
        gateway: gateway,
        keyword: objectSearch.keyword,
        pagination: objectPagination,
        totalProject: countProduct
    });
}

//[GET] /project/create
module.exports.create = async (req, res) => {
    const wifiName = req.query.wifiName;

    const gateway = await Gateway.find({ wifiName }).sort({ position: "desc" });

    res.render("pages/projects/projectCreate", {
        pageTitle: "Thêm mới dự án",
        gateway: gateway,
        wifiName: wifiName,
    });
}

//[POST] /project/create
module.exports.createPost = async (req, res) => {
    console.log(req.body);

    const tokenUser = req.cookies.tokenUser;

    const user = await User.findOne({ tokenUser });
    console.log(user);

    const { gatewayId, projectName, gatewayName, description, address } = req.body;

    const countNode = await Node.countDocuments({ gatewayId: gatewayId });

    await Gateway.updateOne(
        {
            gatewayId: gatewayId,
        }, // điều kiện tìm
        {
            userId: user._id,
            projectName: projectName,
            gatewayName: gatewayName,
            description: description,
            address: address,
            nodeNumber: countNode,
            deleted: false,
            updatedAt: new Date() // có thể thêm thời gian cập nhật
            // position: countGateways + 1
        }
    );

    // Lấy dữ liệu các gateway vừa update
    const updatedGateways = await Gateway.findOne({ gatewayId: gatewayId });

    const message = {
        cmd: "rename",
        gatewayName: updatedGateways.gatewayName,
        position: updatedGateways.position
    };

    mqttClient.publish(`system/rename/gateway/${updatedGateways.gatewayId}`, JSON.stringify(message), { qos: 1, retain: false });
    // retain: true để broker giữ lại gói tin, subcribe là sẽ nhận được
    // tạo thêm nút nhân reset, khi nhấn là sẽ gửi gói tin rỗng
    // gửi lại để reset
    // mqttClient.publish(`system/rename/gateway`, "", { qos: 1, retain: true });


    req.flash("success", "Đã tạo dự án thành công");

    res.redirect("/project");
}

//[DELETE] /project/delete/:id
module.exports.delete = async (req, res) => {
    const id = req.params.id;
    await Gateway.updateOne(
        { _id: id },
        {
            deleted: true,
            deletedAt: new Date()
        }
    )
    req.flash("success", "Đã xóa gateway thành công");
    backURL = req.header('Referer') || '/';
    // do your thang
    res.redirect(backURL);
}

//[GET] /project/edit
module.exports.edit = async (req, res) => {
    const find = {
        deleted: false,
        gatewayId: req.params.id
    };

    const gateway = await Gateway.findOne(find);

    res.render("pages/projects/edit.pug", {
        pageTitle: "Chỉnh sửa dự án",
        gateway: gateway
    });
}

//[PATCH] /project/edit
module.exports.editPatch = async (req, res) => {
    console.log(req.body);
    try {
        await Gateway.updateOne({ gatewayId: req.params.id }, req.body);
        req.flash("success", `Cập nhật thành công!`);
    } catch (error) {
        req.flash("error", `Cập nhật thất bại!`);
    }

    res.redirect("/project");
    // res.send("ok");
}

//[GET] /project/manage/:id
module.exports.manage = async (req, res) => {
    const idGateway = req.params.id;
    const tokenUser = req.cookies.tokenUser;

    const user = await User.findOne({ tokenUser });
    const gateway = await Gateway.findOne({ gatewayId: idGateway });

    if (!gateway) return res.redirect("back");

    // ĐIỀU KIỆN CHUNG: Thuộc gateway này VÀ chưa bị xóa
    const find = {
        gatewayId: gateway.gatewayId,
        deleted: false
    };

    // Hỗ trợ tìm kiếm theo tên node
    const objectSearch = searchHelper(req.query);
    if (objectSearch.reg) {
        find.nodeName = objectSearch.reg;
    }

    // --- XỬ LÝ DỮ LIỆU BẢN ĐỒ (mapData) ---
    let mapData = [];

    // 1. Thêm Gateway vào map (Gateway luôn hiển thị)
    if (gateway.address) {
        mapData.push({
            name: gateway.projectName,
            address: gateway.address,
            isGateway: true
        });
    }

    // 2. Chỉ lấy các Node ACTIVE (deleted: false) để vẽ lên map
    const allActiveNodes = await Node.find(find).select("nodeName address");

    allActiveNodes.forEach(node => {
        if (node.address) {
            mapData.push({
                name: node.nodeName,
                address: node.address,
                isGateway: false
            });
        }
    });

    // --- XỬ LÝ PHÂN TRANG CHO DANH SÁCH BÊN DƯỚI ---
    let objectPagination = { currentPage: 1, limitItem: 4 };
    const countNodes = await Node.countDocuments(find); // Chỉ đếm node chưa xóa
    paginationHelper(objectPagination, req.query, countNodes);

    const nodes = await Node.find(find)
        .sort({ position: "desc" })
        .limit(objectPagination.limitItem)
        .skip(objectPagination.skip);

    res.render("pages/projects/manage", {
        pageTitle: "Quản lý dự án",
        gateway: gateway,
        keyword: objectSearch.keyword,
        node: nodes,
        mapData: mapData, // Dữ liệu sạch, không chứa node deleted
        pagination: objectPagination
    });
}

//[PATCH] /gateway/reset-wifi/:gatewayId
module.exports.resetWifi = async (req, res) => {


    const topic = `gateway/resetwifi/${req.params.gatewayId}`;
    const message = JSON.stringify({
        cmd: "RESET_WIFI",
        gatewayId: req.params.gatewayId
    });

    // Publish lệnh tới Broker
    mqttClient.publish(topic, message);

    req.flash("success", `Đã reset thành công node ${req.params.gatewayId}`);
    backURL = req.header('Referer') || '/';
    // do your thang
    res.redirect(backURL);
};