const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema(
    {
        gatewayId: String,

        nodeId: String,

        sensorName: String,

        nodePosition: Number,

        deviceId: String,

        deviceName: String,

        pinDevice: Number,

        valueMax: Number,

        valueMin: Number,

        status: String,

        position: Number,

        isTriggered: {
            type: Boolean,
            default: false
        },

        deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

const Condition = mongoose.model("Condition", conditionSchema, "conditions");

module.exports = Condition;