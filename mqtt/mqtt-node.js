// Back-end lấy trên hiveMQ về rồi lưu vào Gateway, lúc esp khởi tạo ban đầu
const mqtt = require("mqtt");
const { brokerUrl, options } = require("../config/mqtt");
const Node = require("../model/node.model");

const topicNode = 'system/register/node'

const initMqttClient = () => {
  const client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log('✅ Connected to HiveMQ Cloud');

    client.subscribe(topicNode, (err) => {
      if (!err) console.log(`Subscribed to topic:${topicNode}`);
    });

  });

  client.on('message', async (topicReceived, message) => {
       if (topicReceived === topicNode) {
            try {
                const payload = JSON.parse(message.toString());
                const { wifiName, cmd, clientID, nodeName } = payload;

                if (cmd === 'register' && clientID && nodeName && wifiName) {

                const find = await Node.find({
                    nodeId: clientID,
                    deleted: false
                })

                if (find.length > 0) return;

                const countNode = await Node.countDocuments();

                const node = new Node({
                    wifiName: wifiName,
                    nodeId: clientID,
                    nodeName: nodeName,
                    position: countNode + 1
                });

                await node.save();

                console.log(` Saved node: ${wifiName} ${clientID} (${nodeName})`);
                } else {
                console.warn(' Invalid payload:', payload);
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