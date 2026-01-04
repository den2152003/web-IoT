// Back-end lấy trên hiveMQ về rồi lưu vào Gateway, lúc esp khởi tạo ban đầu
const mqtt = require("mqtt");
const { brokerUrl, options } = require("../config/mqtt");
const Gateway = require("../model/gateway.model");

const topic = 'system/register/gateway';

const initMqttClient = () => {
  const client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log('✅ Connected to HiveMQ Cloud');
    client.subscribe(topic, (err) => {
      if (!err) console.log(` Subscribed to topic: ${topic}`);
    });
  });

  client.on('message', async (topicReceived, message) => {
    if (topicReceived === topic) {
      try {
        const payload = JSON.parse(message.toString());
        const { wifiName, cmd, clientID, gatewayName } = payload;

        if (cmd === 'register' && clientID && gatewayName && wifiName) {
          const countGateway = await Gateway.countDocuments();

          await Gateway.findOneAndUpdate(
            {
              gatewayId: clientID,
              deleted: false
            }, // Tìm kiếm dựa trên ID duy nhất
            {
              $set: {
                wifiName: wifiName, // Cập nhật wifiName mỗi khi Gateway đăng ký lại
              },
              // $setOnInsert: Các trường này chỉ được thiết lập khi MongoDB thực hiện INSERT (tạo mới)
              $setOnInsert: {
                gatewayName: gatewayName,
                position: countGateway + 1 // Đảm bảo position chỉ được tính khi mới tạo
              }
            },
            {
              upsert: true, // Nếu không tìm thấy, tạo mới (INSERT)
              new: true,   // Trả về tài liệu đã cập nhật/tạo mới
              setDefaultsOnInsert: true
            }
          );
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