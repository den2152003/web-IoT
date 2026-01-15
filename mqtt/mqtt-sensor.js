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

                // Hàm đảo trạng thái ON <-> OFF
                const reverseStatus = (status) => {
                    return status === "on" ? "off" : "on";
                };

                for (const cond of conditions) {

                    const value = sensorMap[cond.sensorName];
                    if (value === undefined) continue;

                    // Ép kiểu cho chắc
                    const max = cond.valueMax != null ? Number(cond.valueMax) : null;
                    const min = cond.valueMin != null ? Number(cond.valueMin) : null;

                    const overMax = max !== null && value >= max;
                    const belowMin = min !== null && value <= min;
                    const isOver = overMax || belowMin;

                    const topicDevice = `control/${gatewayID}`;

                    // 🔥 VƯỢT NGƯỠNG → DÙNG cond.status
                    if (isOver && !cond.isTriggered) {

                        const payloadOn = {
                            cmd: "control",
                            nodeId: Id,
                            nodePosition: cond.nodePosition,
                            pin: cond.pinDevice,
                            status: cond.status,
                            buzzer: "on"
                        };

                        client.publish(topicDevice, JSON.stringify(payloadOn));
                        console.log("🔔 DEVICE ON:", payloadOn);

                        cond.isTriggered = true;
                        await cond.save();
                    }

                    // 🧊 HẾT VƯỢT NGƯỠNG → STATUS NGƯỢC LẠI
                    if (!isOver && cond.isTriggered) {

                        const payloadOff = {
                            cmd: "control",
                            nodeId: Id,
                            nodePosition: cond.nodePosition,
                            pin: cond.pinDevice,
                            status: reverseStatus(cond.status),
                            buzzer: "off"
                        };

                        client.publish(topicDevice, JSON.stringify(payloadOff));
                        console.log("🔕 DEVICE OFF:", payloadOff);

                        cond.isTriggered = false;
                        await cond.save();
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
