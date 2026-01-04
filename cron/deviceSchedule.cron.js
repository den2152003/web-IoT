const cron = require("node-cron");
const Device = require("../model/device.model");
const Node = require("../model/node.model");

const moment = require("moment");

const mqtt = require("mqtt");

const mqttClient = mqtt.connect("mqtts://42684cb82de64c2889b9699ce38e5c32.s1.eu.hivemq.cloud:8883", {
    username: "den215",
    password: "Nguyentandat2152003"
});

mqttClient.on("connect", () => { });

cron.schedule("* * * * *", async () => {
    console.log("⏰ Kiểm tra lịch thiết bị...");

    const now = moment().format("YYYY-MM-DD HH:mm");
    console.log(now);

    const devices = await Device.find({
        deleted: false,
        $or: [
            { onScheduledAt: { $exists: true } },
            { offScheduledAt: { $exists: true } }
        ]
    });

    for (const device of devices) {
        const node = await Node.findOne({ nodeId: device.nodeId });
        // --- LỊCH BẬT LẶP LẠI MỖI NGÀY ---
        if (device.isEveryDayOn && device.onScheduledAt) {
            const scheduleTime = moment(device.onScheduledAt).utc().format("HH:mm");
            const nowTime = moment().format("HH:mm");

            if (scheduleTime === nowTime) {
                console.log(`🔁 ▶ Bật hằng ngày: ${device.deviceName}`);

                mqttClient.publish(`control/${device.gatewayId}`, JSON.stringify({
                    cmd: "control",
                    nodeId: device.nodeId,
                    nodePosition: node.position,
                    pin: device.pin,
                    status: "turnOn"
                }));

                await Device.updateOne(
                    { nodeId: device.nodeId, gatewayId: device.gatewayId, pin: device.pin },
                    { status: "active" }
                );
            }
        }

        // --- LỊCH TẮT LẶP LẠI MỖI NGÀY ---
        if (device.isEveryDayOff && device.offScheduledAt) {
            const scheduleTime = moment(device.offScheduledAt).utc().format("HH:mm");
            const nowTime = moment().format("HH:mm");

            if (scheduleTime === nowTime) {
                console.log(`🔁 ⏹ Tắt hằng ngày: ${device.deviceName}`);

                mqttClient.publish(`control/${device.gatewayId}`, JSON.stringify({
                    cmd: "control",
                    nodeId: device.nodeId,
                    nodePosition: node.position,
                    pin: device.pin,
                    status: "turnOff"
                }));

                await Device.updateOne(
                    { nodeId: device.nodeId, gatewayId: device.gatewayId, pin: device.pin },
                    { status: "unactive" }
                );
            }
        }
        else {
            if (device.onScheduledAt) {
                const onTime = moment(device.onScheduledAt).utc().format("YYYY-MM-DD HH:mm");
                if (now === onTime) {
                    console.log(`▶ turnOn cho thiết bị ${device.deviceName}`);
                    mqttClient.publish(`control/${device.gatewayId}`, JSON.stringify({
                        cmd: "control",
                        nodeId: device.nodeId,
                        nodePosition: node.position,
                        pin: device.pin,
                        status: "turnOn"
                    }));

                    console.log(JSON.stringify({
                        cmd: "control",
                        nodeId: device.nodeId,
                        nodePosition: node.position,
                        pin: device.pin,
                        status: "turnOn"
                    }));

                    await Device.updateOne(
                        { nodeId: device.nodeId, gatewayId: device.gatewayId, pin: device.pin },
                        { status: "active" }
                    );
                }
            }

            if (device.offScheduledAt) {
                const offTime = moment(device.offScheduledAt).utc().format("YYYY-MM-DD HH:mm");
                if (now === offTime) {
                    console.log(`⏹ turnOff cho thiết bị ${device.deviceName}`);
                    mqttClient.publish(`control/${device.gatewayId}`, JSON.stringify({
                        cmd: "control",
                        nodeId: device.nodeId,
                        nodePosition: node.position,
                        pin: device.pin,
                        status: "turnOff"
                    }));

                    console.log(JSON.stringify({
                        cmd: "control",
                        nodeId: device.nodeId,
                        nodePosition: node.position,
                        pin: device.pin,
                        status: "turnOff"
                    }));

                    await Device.updateOne(
                        { nodeId: device.nodeId, gatewayId: device.gatewayId, pin: device.pin },
                        { status: "unactive" }
                    );
                }
            }
        }

    };
});
