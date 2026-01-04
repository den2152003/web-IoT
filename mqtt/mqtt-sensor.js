// Back-end lấy trên hiveMQ về rồi lưu vào Gateway, lúc esp khởi tạo ban đầu
const mqtt = require("mqtt");
const { brokerUrl, options } = require("../config/mqtt");
const Sensor = require("../model/sensor.model");
const Condition = require("../model/condition.model");

const initMqttClient = () => {
    const client = mqtt.connect(brokerUrl, options);

    client.on('connect', () => {
        client.subscribe('dataSensor/+/+', (err) => {
            if (!err) console.log(`Subscribed to topic: dataSensor`);
        });
    });

    client.on('message', async (topicReceived, message) => {
        if (topicReceived.startsWith('dataSensor/')) {
            try {
                const data = JSON.parse(message.toString());
                console.log(data);

                const { gatewayID, Id, t, h, l, q } = data;

                // Lưu dữ liệu
                const sensorRecords = [
                    { gatewayID, Id, sensorName: "temperature", data: t },
                    { gatewayID, Id, sensorName: "humidity", data: h },
                    { gatewayID, Id, sensorName: "light", data: l },
                    { gatewayID, Id, sensorName: "air", data: q },
                ];

                await Sensor.insertMany(sensorRecords);

                // Map đúng tên condition
                const sensorMap = { 
                    temperature: t, 
                    humidity: h, 
                    light: l, 
                    air: q 
                };

                const conditions = await Condition.find({
                    gatewayId: gatewayID,
                    nodeId: Id,
                    deleted: false
                });

                for (const cond of conditions) {

                    const value = sensorMap[cond.sensorName];
                    if (value === undefined) continue;

                    let trigger = false;

                    if (cond.valueMax != null && value >= cond.valueMax) trigger = true;
                    if (cond.valueMin != null && value <= cond.valueMin) trigger = true;

                    if (trigger) {
                        const topicDevice = `control/${gatewayID}`;
                        const payload = {
                            cmd: "control",
                            nodeId: Id,
                            nodePosition: cond.nodePosition,
                            pin: cond.pinDevice,
                            status: cond.status
                        };

                        client.publish(topicDevice, JSON.stringify(payload));
                        console.log("⚡ Điều khiển thiết bị:", payload);
                    }
                }

            } catch (err) {
                console.error(' MQTT message error:', err);
            }
        }
    });

    client.on('error', (err) => {
        console.error(' MQTT connection error:', err);
    });

};

module.exports = initMqttClient;
