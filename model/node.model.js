const mongoose = require("mongoose");
const generate = require("../helper/generate");
const nodeSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            default: ""
        },
        gatewayId:{
            type: String,
            default: ""
        },
        projectName: {
            type: String,
            default: ""
        },
        wifiName: String,

        nodeId: String,

        nodeName: String,

        address: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },
        deviceNumber: Number,

        sensorNumber: Number,
        
        position: {
            type: Number,
            default: 0,
        },
        positionGateway: {
            type: Number,
            default: 0,
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

const Node = mongoose.model("Node", nodeSchema, "nodes");

module.exports = Node;