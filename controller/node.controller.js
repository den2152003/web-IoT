const md5 = require("md5");
const User = require('../model/user.model');
const Gateway = require("../model/gateway.model");
const Node = require("../model/node.model");
const Device = require("../model/device.model");
const Sensor = require("../model/sensor.model");
const Condition = require("../model/condition.model");

const filterHelper = require("../helper/filterStatus");
const filterSensorHelper = require("../helper/filterStatusSensor");
const filterChartHelper = require("../helper/filterStatusChart");
const paginationHelper = require("../helper/pagination");

const mqtt = require("mqtt");

const mqttClient = mqtt.connect("mqtts://42684cb82de64c2889b9699ce38e5c32.s1.eu.hivemq.cloud:8883", {
    username: "den215",
    password: "Nguyentandat2152003"
});

mqttClient.on("connect", () => { });

const getStartTime = (type) => {
    const now = new Date();
    switch (type) {
        case 'hour':
            // 24 giờ trước
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case 'day':
            // 7 ngày trước (cho biểu đồ 4 điểm/ngày trong 7 ngày)
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'month':
            // 30 ngày trước
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        default:
            return new Date(0);
    }
};

//[GET] /node/create
module.exports.nodeCreate = async (req, res) => {
    const wifiName = req.query.wifiName;
    const gatewayId = req.params.gatewayId;

    const node = await Node.find({ wifiName: wifiName }).sort({ position: "desc" });



    res.render("pages/projects/nodes/node-create", {
        pageTitle: "Tạo node ne",
        wifiName: wifiName,
        node: node,
        gatewayId: gatewayId
    });
}

//[GET] /node/create
module.exports.nodeCreatePost = async (req, res) => {
    const gatewayId = req.body.gatewayId;

    const gateway = await Gateway.findOne({ gatewayId: gatewayId });

    const tokenUser = req.cookies.tokenUser;

    const user = await User.findOne({ tokenUser });

    await Node.updateOne({ nodeId: req.body.nodeId },
        {
            userId: user._id,
            gatewayId: gatewayId,
            nodeName: req.body.nodeName,
            description: req.body.description,
            address: req.body.address,
            positionGateway: gateway.position
        })

    console.log(user);

    const updatedNode = await Node.findOne({ nodeId: req.body.nodeId });

    const message = {
        cmd: "rename",
        nodeName: updatedNode.nodeName,
        positionGateway: gateway.position,
        position: updatedNode.position
    };

    mqttClient.publish(`system/rename/node${updatedNode.nodeId}`, JSON.stringify(message), { qos: 1, retain: false });
    // retain: true để broker giữ lại gói tin, subcribe là sẽ nhận được
    // tạo thêm nút nhân reset, khi nhấn là sẽ gửi gói tin rỗng
    // gửi lại để reset
    // mqttClient.publish(`system/rename/gateway`, "", { qos: 1, retain: true });

    const countNode = await Node.countDocuments({ gatewayId: gatewayId });

    await Gateway.updateOne(
        {
            gatewayId: gatewayId,
            deleted: false
        }, // điều kiện tìm
        {
            nodeNumber: countNode,
        }
    );

    req.flash("success", "Đã tạo node thành công");

    //publish `system/rename/node/nodeId`
    //subcribe ``


    res.redirect(`/project/manage/${gatewayId}`);
}

//[DELETE] /node/delete/:_id
module.exports.nodeDelete = async (req, res) => {
    const id = req.params._id;
    await Node.updateOne(
        { _id: id },
        {
            deleted: true,
            deletedAt: new Date()
        }
    )
    req.flash("success", "Đã xóa node thành công");
    backURL = req.header('Referer') || '/';
    // do your thang
    res.redirect(backURL);
}

//[GET] /node/manage/:gatewayId/:nodeId
module.exports.nodeManage = async (req, res) => {
    const gatewayId = req.params.gatewayId;

    const nodeId = req.params.nodeId;

    const typeChart = req.query.typeChart;

    const dateInput = req.query.date;

    let result = [];
    let dateCalender = "";
    let year, month, day;

    if (dateInput) {
        [year, month, day] = dateInput.split("-");

        dateCalender = year + "-" + month + "-" + day;
    }

    console.log(dateCalender);

    const node = await Node.findOne({
        nodeId: nodeId,
    });

    const gateway = await Gateway.findOne({ gatewayId: gatewayId });

    const filterStatus = filterHelper(req.query);

    const filterStatusSensor = filterSensorHelper(req.query);

    const filterStatusChart = filterChartHelper(req.query);

    let objectPagination = {
        currentPage: 1,
        limitItem: 4
    };
    const countDevice = await Device.countDocuments({
        gatewayId: gatewayId,
        nodeId: nodeId
    });

    paginationHelper(objectPagination, req.query, countDevice);

    const device = await Device.find({
        gatewayId: gatewayId,
        nodeId: nodeId,
        deleted: false
    }).sort({ position: "desc" }).limit(objectPagination.limitItem).skip(objectPagination.skip)

    const sensor = await Sensor.findOne({ gatewayId: gatewayId });

    switch (typeChart) {
        case "month":
            const start = new Date(year, month - 1, 1);   // đầu tháng

            const end = new Date(year, month, 1);

            result = await Sensor.aggregate([
                {
                    $match: {
                        gatewayID: gatewayId,
                        Id: nodeId,
                        createdAt: { $gte: start, $lt: end }
                    }
                },
                {
                    $group: {
                        _id: {
                            day: {
                                $dayOfMonth: {
                                    date: "$createdAt",
                                    timezone: "+07:00"
                                }
                            },
                            sensorName: "$sensorName"
                        },
                        avgData: { $avg: "$data" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            console.log(result)

            break;

        case "year":
            const yearStart = new Date(year, 0, 1);     // 1/1
            const yearEnd = new Date(year + 1, 0, 1); // 1/1 của năm sau

            result = await Sensor.aggregate([
                {
                    $match: {
                        gatewayID: gatewayId,
                        Id: nodeId,
                        createdAt: { $gte: yearStart, $lt: yearEnd }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: {
                                $month: {
                                    date: "$createdAt",
                                    timezone: "+07:00"
                                }
                            },
                            sensorName: "$sensorName"
                        },
                        avgData: { $avg: "$data" }
                    }
                },
                { $sort: { "_id.month": 1 } }
            ]);

            console.log(result);

            break;
        case "day":
            const dayStart = new Date(year, month - 1, day, 0, 0, 0);   // 00:00
            const dayEnd = new Date(year, month - 1, day + 1, 0, 0, 0); // ngày kế tiếp 00:00

            result = await Sensor.aggregate([
                {
                    $match: {
                        gatewayID: gatewayId,
                        Id: nodeId,
                        createdAt: { $gte: dayStart, $lt: dayEnd }
                    }
                },
                {
                    $group: {
                        _id: {
                            hour: {
                                $hour: {
                                    date: "$createdAt",
                                    timezone: "+07:00"
                                }
                            },
                            sensorName: "$sensorName"
                        },
                        avgData: { $avg: "$data" }
                    }
                },
                { $sort: { "_id.hour": 1 } }
            ]);

            console.log(result);
            break;
    }

    const condition = await Condition.find({ gatewayId: gatewayId, nodeId: nodeId, deleted: false }).sort({ position: "desc" });

    res.render("pages/projects/nodes/node-manage", {
        pageTitle: "Quản lý node",
        node: node,
        device: device,
        gatewayId: gatewayId,
        gateway: gateway,
        filterStatus: filterStatus,
        filterStatusSensor: filterStatusSensor,
        filterStatusChart: filterStatusChart,
        keyword: req.query,
        dataChart: result,
        pagination: objectPagination,
        dateCalender: dateCalender,
        condition: condition
    });
}

//[GET] /node/device/create
module.exports.deviceCreate = async (req, res) => {
    const gatewayId = req.params.gatewayId;

    const nodeId = req.params.nodeId;

    res.render("pages/projects/nodes/device-create", {
        pageTitle: "Thêm thiết bị",
        gatewayId: gatewayId,
        nodeId: nodeId
    });
}

//[POST] /node/device/create
module.exports.deviceCreatePost = async (req, res) => {
    const { gatewayId, nodeId, deviceName, description, pin } = req.body;

    const countDevice = await Device.countDocuments({
        gatewayId: gatewayId,
        nodeId: nodeId
    })

    const device = new Device({
        gatewayId: gatewayId,
        nodeId: nodeId,
        deviceName: deviceName,
        description: description,
        pin: pin,
        status: "turnOff",
        position: countDevice + 1
    });

    await device.save();

    const node = await Node.findOne({ nodeId: nodeId });


    req.flash('success', 'Thêm thiết bị thành công');
    res.redirect(`/node/manage/${gatewayId}/${nodeId}/${node.position}`);

}

//[GET] /node/device/schedule/:gatewayId/:nodeId/:deviceId
module.exports.schedule = async (req, res) => {
    const gatewayId = req.params.gatewayId;

    const nodeId = req.params.nodeId;

    const deviceId = req.params.deviceId;

    res.render("pages/projects/nodes/schedule", {
        pageTitle: "Thiết lập lịch",
        gatewayId: gatewayId,
        nodeId: nodeId,
        deviceId: deviceId
    });
}

//[POST] /node/device/schedule/:gatewayId/:nodeId/:deviceId
module.exports.schedulePost = async (req, res) => {
    const nodeId = req.params.nodeId;

    const gatewayId = req.params.gatewayId;

    const deviceId = req.params.deviceId;
    console.log(deviceId);

    const { startDate, startTime, status, isEveryDay } = req.body;

    const scheduledDateTimeString = `${startDate}T${startTime}:00.000Z`;

    // Chuyển đổi chuỗi thành đối tượng Date của JavaScript
    const scheduledAt = new Date(scheduledDateTimeString);

    if (isNaN(scheduledAt) || scheduledAt < new Date()) {
        req.flash('error', 'Thời gian lập lịch không hợp lệ hoặc đã ở trong quá khứ.');
        backURL = req.header('Referer') || '/';
        // do your thang
        return res.redirect(backURL);
    }

    const isRepeat = (isEveryDay === 'on');

    const updateObject = {
    };

    // 4. Phân loại Trạng thái và thiết lập lịch trình tương ứng
    if (status === 'active' && isRepeat === true) {
        updateObject.onScheduledAt = scheduledAt;

        updateObject.statusOnSchedule = 'active';

        updateObject.isEveryDayOn = true;
    } else if (status === 'unactive' && isRepeat === true) {
        updateObject.offScheduledAt = scheduledAt;

        updateObject.statusOffSchedule = 'unactive';

        updateObject.isEveryDayOff = true;
    } else if (status === 'active') {
        updateObject.onScheduledAt = scheduledAt;

        updateObject.statusOnSchedule = 'active';

        updateObject.isEveryDayOn = false;
    } else if (status === 'unactive') {
        updateObject.offScheduledAt = scheduledAt;

        updateObject.statusOffSchedule = 'unactive';

        updateObject.isEveryDayOff = false;
    } else {
        // Xử lý trường hợp status không hợp lệ nếu cần
    }

    await Device.updateOne({ gatewayId: gatewayId, nodeId: nodeId, _id: deviceId }, updateObject);

    const node = await Node.findOne({ nodeId: nodeId });

    req.flash('success', 'Tạo lịch thành công!');
    res.redirect(`/node/manage/${gatewayId}/${nodeId}/${node.position}`);
}

//[PATCH] /node/manage/change-multi/:gatewayId/:nodeId
module.exports.changeMultiPatch = async (req, res) => {
    const gatewayId = req.params.gatewayId;

    const nodeId = req.params.nodeId;

    const statusTurn = req.body.type;

    const node = await Node.findOne({ nodeId: nodeId });

    if (statusTurn === "turnOn" || statusTurn === "turnOff") {
        // Cập nhật trạng thái tất cả device của node này trong DB
        await Device.updateMany(
            { gatewayId: gatewayId, nodeId: nodeId },
            { status: statusTurn }
        );

        // 2. Gửi lệnh qua MQTT cho từng thiết bị
        // Lấy danh sách thiết bị để lấy mã PIN
        const devices = await Device.find({ gatewayId: gatewayId, nodeId: nodeId });

        const topic = `control/${gatewayId}`;

        for (const device of devices) {
            const payload = JSON.stringify({
                cmd: "control",
                nodeId: nodeId,
                nodePosition: node.position, // Lấy từ object node đã tìm thấy
                pin: device.pin,             // Pin của từng device
                status: statusTurn           // Trạng thái mới (turnOn/turnOff)
            });

            // Publish lệnh điều khiển
            mqttClient.publish(topic, payload, { qos: 1, retain: false });
            console.log(`Published to ${topic}: ${payload}`);
            await new Promise(resolve => setTimeout(resolve, 100));
        };

        req.flash('success', `${statusTurn === "turnOn" ? 'Bật' : 'Tắt'} tất cả thiết bị thành công!`);

    } else if (statusTurn === "delete-all") {
        await Device.deleteMany({ gatewayId: gatewayId, nodeId: nodeId });
        req.flash('success', 'Xóa tất cả thiết bị thành công!');
    }
    res.redirect(`/node/manage/${gatewayId}/${nodeId}/${node.position}`);
}

//[DELETE] /node/device/delete/:_id
module.exports.deviceDelete = async (req, res) => {
    const id = req.params._id;

    await Device.deleteOne({ _id: id });

    req.flash("success", "Đã xóa thiết bị thành công");
    backURL = req.header('Referer') || '/';
    // do your thang
    res.redirect(backURL);
}

//[GET] /node//device/delete/:_id
module.exports.sensorCreate = async (req, res) => {
    const gatewayId = req.params.gatewayId;

    const nodeId = req.params.nodeId;

    const device = await Device.find({ gatewayId: gatewayId, nodeId: nodeId });

    res.render("pages/projects/nodes/sensor-condition", {
        pageTitle: "Thiết lập điều kiện",
        gatewayId: gatewayId,
        nodeId: nodeId,
        device: device,
    });
}

//[POST] /node/device/delete/:_id
module.exports.sensorCreatePost = async (req, res) => {
    const { gatewayId, nodeId, sensorType, minValue, maxValue, deviceId, status } = req.body;

    const countCodition = await Condition.countDocuments({ gatewayId: gatewayId, nodeId: nodeId });

    const device = await Device.findOne({ _id: deviceId });

    const node = await Node.findOne({ nodeId: nodeId });


    const condition = new Condition({
        gatewayId: gatewayId,
        nodeId: nodeId,
        sensorName: sensorType,
        deviceId: deviceId,
        deviceName: device.deviceName,
        pinDevice: device.pin,
        nodePosition: node.position,
        valueMin: Number(minValue),
        valueMax: Number(maxValue),
        status: status,
        position: countCodition + 1
    });

    await condition.save();


    req.flash("success", "Thêm điều kiện thành công !");

    res.redirect(`/node/manage/${gatewayId}/${nodeId}/${node.position}?type=sensor`);
}
// {"gatewayId":"EC:E3:34:7B:67:8C","nodeId":"D4:8A:FC:A6:BC:5C","sensorType":"temperature","minValue":"0","maxValue":"30","device":"69342ad0f882e6c9c7b32631","status":"turnOn"}

//[DELETE] /node/condition/delete/:_id
module.exports.conditionDelete = async (req, res) => {
    const id = req.params._id;

    await Condition.deleteOne(
        { _id: id },
        {
            deleted: true,
            deletedAt: new Date()
        });

    req.flash("success", "Đã xóa điều kiện thành công");
    backURL = req.header('Referer') || '/';
    // do your thang
    res.redirect(backURL);
}

//[GET] /node/manage/edit/:id
module.exports.nodeEdit = async (req, res) => {
    const find = {
        deleted: false,
        nodeId: req.params.nodeId,
    };

    const node = await Node.findOne(find);

    res.render("pages/projects/nodes/node-edit.pug", {
        pageTitle: "Chỉnh sửa dự án",
        node: node,
        gatewayId: req.params.gatewayId
    });
}

//[GET] /node/manage/edit/:id
module.exports.nodeEditPatch = async (req, res) => {
    const gatewayId = req.params.gatewayId;
    const nodeId = req.params.nodeId;
    try {
        await Node.updateOne({ gatewayId: gatewayId, nodeId: nodeId }, req.body);
        req.flash("success", `Cập nhật thành công!`);
    } catch (error) {
        req.flash("error", `Cập nhật thất bại!`);
    }

    res.redirect(`/project/manage/${gatewayId}`);
}