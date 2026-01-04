const mqtt = require("mqtt");
const { brokerUrl, options } = require("../config/mqtt");
const Device = require("../model/device.model");

const initMqttClient = () => {
    const client = mqtt.connect(brokerUrl, options);

    client.on("connect", () => {
        // Nhận tất cả lệnh control/*
        client.subscribe("control/+", (err) => {
            if (!err) console.log("📡 Subscribed: control/+");
        });
    });

    client.on("message", async (topic, message) => {
        if (!topic.startsWith("control/")) return;

        const gatewayId = topic.split("/")[1]; // control/{gatewayId}

        let payload = JSON.parse(message.toString());

        const { nodeId, pin, status } = payload;

        const updated = await Device.findOneAndUpdate(
        {
            gatewayId: gatewayId,
            nodeId: nodeId,
            pin: pin
        },
        { status: status },
        { new: true }
        );

        if (updated) {
            console.log("💾 Đã cập nhật Device:", updated);
        } else {
            console.log("⚠ Không tìm thấy device để cập nhật!");
        }

    });

    client.on("error", err => {
        console.error("❌ MQTT Error:", err);
    });

    return client;
};

module.exports = initMqttClient;
