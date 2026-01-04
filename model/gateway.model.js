const mongoose = require("mongoose");
const generate = require("../helper/generate");
const gatewaySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            default: ""
        },
        projectName: {
            type: String,
            default: ""
        },
        wifiName: String,
        gatewayId:{
            type: String,
            unique: true
        },
        gatewayName: String,
        address: {
            type: String,
            default: ""
        },
        description: {
            type: String,
            default: ""
        },
        position: {
            type: Number,
            default: 0,
        },
        nodeNumber: {
            type: Number,
            default: 0
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

const Gateway = mongoose.model("Gateway", gatewaySchema, "gateways");

module.exports = Gateway;