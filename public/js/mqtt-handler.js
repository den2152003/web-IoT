import { mqttClient } from './mqtt-client.js';

const UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 phút * 60 giây * 1000 mili giây
let lastUpdateTime = 0; // Mốc thời gian (timestamp) của lần cập nhật biểu đồ cuối cùng

const MAX_DATA_POINTS = 20; // Số lượng điểm dữ liệu tối đa hiển thị trên biểu đồ

const urlParams = new URLSearchParams(window.location.search);
const typeChart = urlParams.get("typeChart") || "now";
const typeSensor = urlParams.get("typeSensor");

// Ánh xạ Tên Cảm biến Ngắn sang Tiêu đề và ID Canvas
const SENSOR_MAP = {
    'temperature': { title: 'Biểu đồ Nhiệt độ', canvasId: 'temperatureChart', valueId: 'temperature-value', unit: '°C', type: 'temperature' },
    'humidity': { title: 'Biểu đồ Độ ẩm', canvasId: 'humidityChart', valueId: 'humidity-value', unit: '%', type: 'humidity' },
    'light': { title: 'Biểu đồ Ánh sáng', canvasId: 'lightChart', valueId: 'light-value', unit: 'Lux', type: 'light' },
    'air': { title: 'Biểu đồ AQI', canvasId: 'aqiChart', valueId: 'aqi-value', unit: 'µg/m³', type: 'airQuality' },
};

// Khởi tạo các đối tượng biểu đồ
let temperatureChartInstance = null;
let humidityChartInstance = null;
let lightChartInstance = null;
let aqiChartInstance = null;

function getIdsFromUrl() {
    // Lấy đường dẫn (ví dụ: /node/manage/ESP-GW:ID/ESP-NODE:ID?type=sensor)
    const path = window.location.pathname;
    const parts = path.split('/').filter(p => p); // Tách và loại bỏ các chuỗi rỗng

    // Lấy 2 phần tử cuối (trước query string)
    if (parts.length >= 3) {
        const nodePosition = parts[parts.length - 1];
        const nodeId = parts[parts.length - 2];
        const gatewayId = parts[parts.length - 3];

        // Kiểm tra tính hợp lệ cơ bản
        if (nodeId && nodeId.includes(':') &&
            gatewayId && gatewayId.includes(':') &&
            !isNaN(parseInt(nodePosition))) { // Đảm bảo nodePosition là số

            return { gatewayId, nodeId, nodePosition };
        }
    }

    return { gatewayId: null, nodeId: null, nodePosition: null };
}

// Lấy ID ngay khi script bắt đầu chạy
const { gatewayId, nodeId, nodePosition } = getIdsFromUrl();
let SENSOR_TOPIC = null;

if (gatewayId && nodeId) {
    // Xây dựng topic động: dataSensor/GATEWAY_ID/NODE_ID
    SENSOR_TOPIC = `dataSensor/${gatewayId}/${nodeId}`;
    console.log(`Đã xác định Topic cảm biến động: ${SENSOR_TOPIC}`);
}

// 1. Kết nối đến MQTT broker
mqttClient.connect()
    .then(() => {
        console.log('✅ Đã kết nối thành công');

        // initAllCharts();

        // 2. Đăng ký các topic cần lắng nghe
        if (SENSOR_TOPIC) {
            mqttClient.subscribeToTopic(SENSOR_TOPIC);
        }
        mqttClient.subscribeToTopic('system/register/gateway');

        // 3. Cài đặt callback xử lý tin nhắn
        mqttClient.setMessageCallback(masterMessageHandler);
    })
    .catch(err => {
        console.error('❌ Kết nối MQTT thất bại:', err);
    });

// 4. Hàm callback tổng để phân loại tin nhắn theo topic
function masterMessageHandler(message) {
    const topic = message.destinationName;
    const payload = message.payloadString;

    const data = JSON.parse(payload);

    switch (topic) {
        case SENSOR_TOPIC:
            console.log(payload);
            handleSensorData(data);
            break;
        default:
            console.log('Topic lạ, chưa xử lý:', topic);
    }

}
// --- HÀM VẼ BIỂU ĐỒ (CHARTING FUNCTIONS) ---

function getChartColor(sensorName, opacity = 1) {
    switch (sensorName) {
        case 'temperature': return `rgba(255, 99, 132, ${opacity})`; // Đỏ
        case 'humidity': return `rgba(54, 162, 235, ${opacity})`; // Xanh dương
        case 'light': return `rgba(255, 206, 86, ${opacity})`; // Vàng
        case 'air': return `rgba(75, 192, 192, ${opacity})`; // Xanh ngọc
        default: return `rgba(150, 150, 150, ${opacity})`;
    }
}

// Hàm chuẩn bị dữ liệu lịch sử cho biểu đồ
function prepareHistoricalData(dataChart, chartType, targetSensorName) {
    const groupedData = dataChart.reduce((acc, item) => {
        const sensorName = item._id.sensorName;

        // Chỉ xử lý dữ liệu của sensor đang được yêu cầu
        if (sensorName !== targetSensorName) return acc;

        let label = item._id.hour || item._id.day || item._id.month;
        if (chartType === 'month') {
            label = `Ngày ${label}`;
        } else if (chartType === 'year') {
            label = `Tháng ${label}`;
        } else if (chartType === 'day') {
            label = `${label}:00`;
        }

        if (!acc[sensorName]) {
            acc[sensorName] = {
                labels: [],
                data: []
            };
        }
        acc[sensorName].labels.push(label);

        const dataValue = parseFloat(item.avgData);
        if (!isNaN(dataValue)) {
            acc[sensorName].data.push(dataValue.toFixed(2));
        } else {
            acc[sensorName].data.push(null);
        }

        return acc;
    }, {});

    const datasets = [];
    const labels = [];

    if (targetSensorName && groupedData[targetSensorName]) {
        labels.push(...groupedData[targetSensorName].labels);
        datasets.push({
            label: SENSOR_MAP[targetSensorName] ? SENSOR_MAP[targetSensorName].title.replace('Biểu đồ ', '') : targetSensorName,
            data: groupedData[targetSensorName].data,
            borderColor: getChartColor(targetSensorName),
            backgroundColor: getChartColor(targetSensorName, 0.2),
            tension: 0.1,
            fill: true
        });
    }

    return { labels: labels, datasets: datasets };
}
function showNoDataMessage(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Tìm thẻ cha bao quanh cả canvas và thông báo (là khối mixin của bạn)
    const cardBody = canvas.closest('.chart-card') || canvas.parentElement.parentElement;
    if (!cardBody) return;

    const noDataCard = cardBody.querySelector('.no-data-card');
    if (noDataCard) {
        noDataCard.style.display = 'block';
    }

    // Ẩn wrapper của chart đi
    const wrapper = canvas.closest('.chart-wrapper');
    if (wrapper) wrapper.style.display = 'none';
}

function hideNoDataMessage(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const cardBody = canvas.closest('.chart-card') || canvas.parentElement.parentElement;
    if (!cardBody) return;

    const noDataCard = cardBody.querySelector('.no-data-card');
    if (noDataCard) {
        noDataCard.style.display = 'none';
    }

    const wrapper = canvas.closest('.chart-wrapper');
    if (wrapper) wrapper.style.display = 'block';
}

// Hàm khởi tạo biểu đồ Chart.js
function initChart(canvasId, chartData, chartTitle) {
    const hasData = chartData.datasets
        && chartData.datasets.length > 0
        && chartData.datasets[0].data
        && chartData.datasets[0].data.length > 0;

    if (!hasData) {
        showNoDataMessage(canvasId);
        return null;
    } else {
        hideNoDataMessage(canvasId);
    }

    const ctx = document.getElementById(canvasId);
    let existingChart = Chart.getChart(canvasId);
    if (existingChart) {
        existingChart.destroy();
    }

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: chartData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: chartTitle
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: (typeChart === 'day' ? 'Giờ' : (typeChart === 'month' ? 'Ngày' : 'Tháng'))
                    },
                    ticks: {
                        maxRotation: 0, // Không cho phép xoay nhãn quá 0 độ
                        minRotation: 0, // Ép nhãn luôn nằm ngang
                        autoSkip: true, // Tự động ẩn bớt nhãn nếu quá dày để tránh đè nhau
                        maxTicksLimit: 20 // Giới hạn số lượng nhãn hiển thị (ví dụ 10 cái)
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Giá trị trung bình'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}

// --- Sửa đổi trong hàm initAllCharts ---

function initAllCharts() {
    const dataChart = window.dataChart || [];
    const chartType = urlParams.get("typeChart") || "now";

    // Danh sách các khóa cảm biến (t, h, l, q)
    const allSensorKeys = ['temperature', 'humidity', 'light', 'air'];

    // Nếu đang ở chế độ NOW, chúng ta chỉ cần khởi tạo biểu đồ trống
    if (chartType === 'now') {

        allSensorKeys.forEach(key => { // Lặp qua các khóa
            const sensorInfo = SENSOR_MAP[key]; // Lấy thông tin từ map
            if (!sensorInfo) return;

            // Kiểm tra điều kiện hiển thị
            const shouldRender = (typeSensor === sensorInfo.type) || // So sánh với type trong SENSOR_MAP
                (typeSensor === 'allSensor') ||
                (!typeSensor);

            if (shouldRender) {
                // TẠO emptyData MỚI CHO TỪNG CẢM BIẾN, KHÔNG DÙNG CHUNG BIẾN EMPTYDATA
                const sensorData = {
                    labels: Array(MAX_DATA_POINTS).fill(''),
                    datasets: [{
                        // 🚨 SỬA LỖI NHÃN: Gán nhãn chính xác cho từng cảm biến
                        label: sensorInfo.title.replace('Biểu đồ ', ''),
                        data: Array(MAX_DATA_POINTS).fill(null),
                        tension: 0.1,
                        fill: true,
                        // 🚨 SỬA LỖI MÀU: Gán màu chính xác
                        borderColor: getChartColor(key),
                        backgroundColor: getChartColor(key, 0.2),
                    }]
                };

                const newChartInstance = initChart(sensorInfo.canvasId, sensorData, sensorInfo.title);

                // Gán instance cho biến toàn cục
                if (key === 'temperature') temperatureChartInstance = newChartInstance;
                else if (key === 'humidity') humidityChartInstance = newChartInstance;
                else if (key === 'light') lightChartInstance = newChartInstance;
                else if (key === 'air') aqiChartInstance = newChartInstance;
            }
        });

    } else {
        // --- LOGIC XỬ LÝ DỮ LIỆU LỊCH SỬ (Giữ nguyên) ---
        allSensorKeys.forEach(key => {
            const sensorInfo = SENSOR_MAP[key];
            if (!sensorInfo) return;

            const shouldRender = (typeSensor === sensorInfo.type) || // So sánh với type trong SENSOR_MAP
                (typeSensor === 'allSensor') ||
                (!typeSensor);

            if (shouldRender) {
                const chartData = prepareHistoricalData(dataChart, chartType, key); // Dùng key
                const newChartInstance = initChart(sensorInfo.canvasId, chartData, sensorInfo.title);

                if (key === 't') temperatureChartInstance = newChartInstance;
                else if (key === 'h') humidityChartInstance = newChartInstance;
                else if (key === 'l') lightChartInstance = newChartInstance;
                else if (key === 'q') aqiChartInstance = newChartInstance;
            }
        });
    }
}

// Chạy khởi tạo biểu đồ sau khi toàn bộ tài liệu đã tải
window.addEventListener('load', initAllCharts);


// --- XỬ LÝ DỮ LIỆU THỜI GIAN THỰC (REAL-TIME) ---

function updateRealtimeValue(sensorKey, value) {
    const sensorInfo = SENSOR_MAP[sensorKey];
    if (!sensorInfo) return;

    const element = document.getElementById(sensorInfo.valueId);
    if (element && value !== undefined) {
        element.textContent = parseFloat(value).toFixed(1);
    }
}

function updateChartData(chartInstance, label, dataValue, maxPoints) {
    if (!chartInstance) return;

    // Canvas chưa tồn tại trong DOM
    if (!chartInstance.canvas || !document.body.contains(chartInstance.canvas)) {
        console.warn("Chart canvas không còn tồn tại, bỏ qua update");
        return;
    }

    if (chartInstance && chartInstance.data.datasets.length > 0) {

        chartInstance.data.labels.push(label);
        const value = parseFloat(dataValue);
        chartInstance.data.datasets[0].data.push(value);

        if (chartInstance.data.labels.length > maxPoints) {
            chartInstance.data.labels.shift();
            chartInstance.data.datasets[0].data.shift();
        }

        chartInstance.update('quiet');
    }
}

function handleSensorData(data) {
    const currentTime = Date.now();

    // 1. Cập nhật giá trị hiện tại trên giao diện (sử dụng các khóa: t, h, l, q)
    updateRealtimeValue('t', data.t);
    updateRealtimeValue('h', data.h);
    updateRealtimeValue('l', data.l);
    updateRealtimeValue('q', data.q);

    // Kiểm tra tính hợp lệ của ID (Dù đã được kiểm tra ở backend, vẫn tốt khi có)
    if (data.gatewayID !== gatewayId || data.Id !== nodeId) {
        // Bỏ qua gói tin không dành cho Node/Gateway hiện tại
        return;
    }

    // 2. Kích hoạt cập nhật biểu đồ chỉ khi typeChart === "now"
    const isRealTimeMode = typeChart === 'now';

    // Chỉ cập nhật nếu đang ở chế độ real-time VÀ đã qua khoảng thời gian cập nhật tối thiểu
    if (isRealTimeMode && (currentTime - lastUpdateTime > UPDATE_INTERVAL_MS || lastUpdateTime === 0)) {

        lastUpdateTime = currentTime;
        // Dùng moment để lấy thời gian hiện tại
        const formattedTime = moment(currentTime).format('HH:mm');

        // Cấu trúc dữ liệu MQTT cho real-time 
        const mqttDataMap = [
            { key: 't', instance: temperatureChartInstance, value: data.t, type: 'temperature' },
            { key: 'h', instance: humidityChartInstance, value: data.h, type: 'humidity' },
            { key: 'l', instance: lightChartInstance, value: data.l, type: 'light' },
            { key: 'q', instance: aqiChartInstance, value: data.q, type: 'airQuality' }, // Dùng key 'q' và value data.q
        ];

        mqttDataMap.forEach(({ key, instance, value, type }) => {
            // Cập nhật nếu instance tồn tại VÀ đang xem tất cả HOẶC đang xem loại cảm biến này
            if (instance) {
                // SỬA TẠI ĐÂY: Nếu không có typeSensor trên URL, mặc định cập nhật tất cả các biểu đồ đang hiển thị
                const isSelected = !typeSensor || typeSensor === 'allSensor' || typeSensor === type;

                if (isSelected) {
                    updateChartData(instance, formattedTime, value, MAX_DATA_POINTS);
                }
            }
        });
    }
}
