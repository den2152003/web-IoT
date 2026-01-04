// Front-end, dùng để lấy data từ hiveMQ về web
const mqttClient = (function () {
    // Kiểm tra xem Paho.MQTT có sẵn không
    if (typeof Paho === 'undefined' || !Paho.MQTT) {
        throw new Error('Paho MQTT library is not loaded. Please include mqttws31.min.js');
    }

    // Cấu hình client MQTT
    const clientId = 'client_' + Math.random().toString(16).substr(2, 8);
    // const client = new Paho.MQTT.Client('broker.hivemq.com', 8884, clientId);
     const client = new Paho.MQTT.Client('42684cb82de64c2889b9699ce38e5c32.s1.eu.hivemq.cloud', 8884, clientId);

    // Callback mặc định cho onMessageArrived
    let messageCallback = (message) => {
        console.log('Nhận được tin nhắn:', message.payloadString, 
                    'từ topic:', message.destinationName);
    };

    // Cấu hình callback cho các sự kiện
    client.onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) {
            console.log('Kết nối bị mất:', responseObject.errorMessage);
        }
    };

    client.onMessageArrived = (message) => {
        messageCallback(message); // Gọi callback tùy chỉnh
    };

    // Hàm cài đặt callback cho onMessageArrived
    function setMessageCallback(callback) {
        messageCallback = callback;
    }

    // Hàm kiểm tra trạng thái kết nối
    function isConnected() {
        return client.isConnected();
    }

    // Hàm kết nối đến broker
    function connect() {
        return new Promise((resolve, reject) => {
            client.connect({
                useSSL: true,
                userName: 'den215', // Username từ HiveMQ Cloud
                password: 'Nguyentandat2152003', // Password từ HiveMQ Cloud
                onSuccess: () => {
                    console.log('Kết nối thành công đến MQTT broker');
                    resolve();
                },
                onFailure: (err) => {
                    console.error('Kết nối thất bại:', err.errorMessage);
                    reject(err);
                }
            });
        });
    }
    // Hàm đăng ký topic
    function subscribeToTopic(topic) {
        if (!client.isConnected()) {
            throw new Error('MQTT client chưa kết nối. Vui lòng gọi connect() trước.');
        }
        client.subscribe(topic);
        console.log('Đã đăng ký vào topic:', topic);
    }

    // Hàm gửi message
    function publishMessage(topic, messageText) {
        if (!client.isConnected()) {
            throw new Error('MQTT client chưa kết nối. Vui lòng gọi connect() trước.');
        }
        const message = new Paho.MQTT.Message(messageText);
        message.destinationName = topic;
        client.send(message);
        console.log(`Đã gửi message "${messageText}" lên topic:`, topic);
    }

    // Thêm hàm gửi tin nhắn
    function publish(topic, payload, qos = 0, retained = false) {
        if (client.isConnected()) {
            const message = new Paho.MQTT.Message(payload);
            message.destinationName = topic;
            message.qos = qos;
            message.retained = retained;
            client.send(message);
            console.log(`[MQTT] Published to ${topic}: ${payload}`);
            return true;
        }
        console.error('[MQTT] Failed to publish: Not connected.');
        return false;
    }

    // Xuất các hàm để sử dụng ở file khác
    return {
        connect,
        subscribeToTopic,
        publish,
        isConnected,
        setMessageCallback
    };
})();

export { mqttClient };