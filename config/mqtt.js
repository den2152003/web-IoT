module.exports = {
  brokerUrl: `mqtts://${process.env.MQTT_HOST}`,
  options: {
    port: 8883,
    protocol: 'mqtts',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  }
};
