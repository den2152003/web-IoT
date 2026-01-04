const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema(
    {
        gatewayID:{ 
            type: String, 
            default: ""
        },
        Id: { 
            type: String, 
            default: ""
        },
        sensorName: String,
        data: Number,
    },
    {
        timestamps: true,
    }
);

const Sensor = mongoose.model("Sensor", sensorSchema, "sensors");

module.exports = Sensor;