const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
    {
        gatewayId:{ 
            type: String, 
            default: ""
        },

        nodeId: { 
            type: String, 
            default: ""
        },

        deviceName: String,

        description: { // Mô tả chi tiết (ví dụ: Đèn phòng khách tầng 1)
            type: String,
            default: ""
        },

        pin: { 
            type: Number,
            required: true
        },

        status: String,

        onScheduledAt: {
            type: Date  
        },

        offScheduledAt: {
            type: Date  
        },

        statusOnSchedule: String,

        statusOffSchedule: String,

        isEveryDayOn: { // Nếu không có repeatDays, đây là lịch chạy 1 lần
            type: Boolean,
            default: false
        },

        isEveryDayOff: { // Nếu không có repeatDays, đây là lịch chạy 1 lần
            type: Boolean,
            default: false
        },

        position : Number,

        deleted: {
            type: Boolean,
            default: false,
        },

        deletedAt: Date,
    },
    {
        timestamps: true,
        toObject: { virtuals: true }, 
        toJSON: { virtuals: true },
    }
);
// --- THÊM VIRTUAL FIELDS ---
const formatScheduleDate = function(dateField) {
    if (this[dateField]) {
        return this[dateField].toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'UTC'
            // timeZoneName: 'short' // Có thể thêm nếu muốn hiển thị GMT+7
        }).replace(',', ''); // Loại bỏ dấu phẩy ngăn cách giờ và ngày
    }
    return 'Chưa thiết lập';
};

// 1. Virtual cho Lịch mở (ON)
deviceSchema.virtual('formattedOnScheduledAt').get(function() {
    return formatScheduleDate.call(this, 'onScheduledAt');
});

// 2. Virtual cho Lịch tắt (OFF)
deviceSchema.virtual('formattedOffScheduledAt').get(function() {
    return formatScheduleDate.call(this, 'offScheduledAt');
});
// ----------------------------

const Device = mongoose.model("Device", deviceSchema, "devices");

module.exports = Device;