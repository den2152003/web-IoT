// Lấy mảng chuỗi tọa độ từ Pug
const rawMapData = window.allMapData || [];

let cleanCoordinates = [];
let defaultLat = 10.86210779626738;
let defaultLng = 106.78038321369357;

// --- LOGIC TÁCH CHUỖI TỌA ĐỘ CỦA TẤT CẢ CÁC ĐIỂM ---
rawMapData.forEach((dataItem, index) => {
    const rawCoordString = dataItem.address;
    try {
        const parts = rawCoordString.split(',').map(part => part.trim());

        if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);

            if (!isNaN(lat) && !isNaN(lng)) {
                // Đẩy đối tượng hoàn chỉnh vào mảng
                cleanCoordinates.push({
                    lat,
                    lng,
                    isGateway: dataItem.isGateway,
                    name: dataItem.name // Lấy tên từ dữ liệu truyền vào
                });
            }
        }
    } catch (error) {
        console.error("Lỗi khi phân tích cú pháp tọa độ:", error);
    }
});
// --- KẾT THÚC LOGIC TÁCH CHUỖI ---


// --- ĐỊNH NGHĨA ICON ---
// Icon cho Gateway (Màu đỏ)
const gatewayIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Icon cho Node (Màu xanh)
const nodeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- KHỞI TẠO VÀ VẼ BẢN ĐỒ LEAFLET ---

const initialViewLat = cleanCoordinates.length > 0 ? cleanCoordinates[0].lat : defaultLat;
const initialViewLng = cleanCoordinates.length > 0 ? cleanCoordinates[0].lng : defaultLng;

if (document.getElementById("map-content")) {
    var map = L.map("map-content").setView([initialViewLat, initialViewLng], 17);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var featureGroup = L.featureGroup();

    cleanCoordinates.forEach((point) => {
        const isGateway = point.isGateway;
        const color = isGateway ? '#ff0000' : '#0000ff'; // Đỏ cho Gateway, Xanh cho Node
        const radius = isGateway ? 2000 : 2000; 
        const labelName = isGateway ? `Gateway: ${point.name}` : `Node: ${point.name}`;

        // 1. Tạo Marker với Icon tương ứng
        const marker = L.marker([point.lat, point.lng], {
            icon: isGateway ? gatewayIcon : nodeIcon
        })
        .bindPopup(`
            <div style="font-family: sans-serif;">
                <strong style="color: ${color};">${labelName}</strong><br>
                <b>Lat:</b> ${point.lat}<br>
                <b>Lng:</b> ${point.lng}
            </div>
        `);

        // 2. Tạo Circle (Vùng phủ sóng)
        const circle = L.circle([point.lat, point.lng], {
            color: color,
            fillColor: color,
            fillOpacity: isGateway ? 0.2 : 0.1, // Gateway đậm hơn tí
            radius: radius
        });

        // Thêm vào Group và Map
        featureGroup.addLayer(marker);
        featureGroup.addLayer(circle);
    });

    featureGroup.addTo(map);

    // Tự động căn chỉnh zoom để thấy tất cả các điểm
    if (cleanCoordinates.length > 0) {
        map.fitBounds(featureGroup.getBounds(), { padding: [50, 50] });
    }
}


// Show Alert
const showAlert = document.querySelector("[show-alert]");
if (showAlert) {
    const time = parseInt(showAlert.getAttribute("data-time"));
    const closeAlert = showAlert.querySelector("[close-alert]");

    setTimeout(() => {
        showAlert.classList.add("alert-hidden")
    }, time);

    closeAlert.addEventListener("click", () => {
        showAlert.classList.add("alert-hidden");
    })
}
// End Show Alert

// Search Wifi
const formSearch = document.querySelector("#form-search-wifiName");
if (formSearch) {
    let url = new URL(window.location.href);
    formSearch.addEventListener("submit", (e) => {
        e.preventDefault();
        const keyword = e.target.elements.wifiName.value
        if (keyword) {
            url.searchParams.set("wifiName", keyword);
        }
        else
            url.searchParams.delete("wifiName");
        window.location.href = url.href;
    });
}
// End Search Wifi

// web publish control to hiveMQ
import { mqttClient } from '/js/mqtt-client.js';

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

const switchInputs = document.querySelectorAll('[toggle-input]');

switchInputs.forEach(switchElement => {
    switchElement.addEventListener('change', () => {
        const pinValue = switchElement.getAttribute('data-pin');


        const newStatus = switchElement.checked ? 'turnOn' : 'turnOff';

        const payload = JSON.stringify({
            cmd: "control",
            nodeId: nodeId,
            nodePosition: nodePosition,
            pin: pinValue,
            status: newStatus
        });

        console.log(payload);

        const topic = `control/${gatewayId}`;

        const success = mqttClient.publish(topic, payload);

        if (success) {
            console.log(`Đã gửi lệnh MQTT cho sản phẩm `);
        } else {
            // Nếu gửi thất bại, hoàn tác trạng thái switch và cảnh báo
            switchElement.checked = !switchElement.checked;
            alert('Mất kết nối MQTT hoặc lỗi, không thể gửi lệnh.');
        }
    })
});


// Lợi ích khách hàng
document.addEventListener('DOMContentLoaded', function () {
    const scrollWrapper = document.querySelector('.benefits-track-wrapper'); // Thêm wrapper mới
    const scrollContainer = document.querySelector('.horizontal-scroll-container');
    const benefitsTrack = document.querySelector('.benefits-track');

    if (scrollWrapper && scrollContainer && benefitsTrack) {

        // 1. Tính toán Chiều dài cuộn ngang (Total Width)
        // Đây là tổng chiều rộng của tất cả các card + khoảng cách
        const totalContentWidth = benefitsTrack.scrollWidth;

        // 2. Tính toán Chiều dài di chuyển tối đa
        // Là tổng chiều rộng nội dung trừ đi chiều rộng màn hình (viewport)
        const maxTranslateX = totalContentWidth - window.innerWidth;

        // Nếu nội dung không đủ dài để cuộn ngang, thoát
        if (maxTranslateX <= 0) return;

        // 3. Thiết lập Chiều dài cuộn dọc cần thiết
        // Chiều dài cuộn dọc = Chiều dài di chuyển ngang + Một khoảng bù (ví dụ: 500px)
        const scrollLength = maxTranslateX + 400;

        // 4. Cập nhật chiều cao của wrapper để tạo không gian cuộn dọc
        scrollWrapper.style.height = `${scrollLength + scrollContainer.offsetHeight - 200}px`;


        window.addEventListener('scroll', function () {
            // Lấy vị trí top của Wrapper (điểm bắt đầu ghim)
            const wrapperTop = scrollWrapper.getBoundingClientRect().top;

            // Tính toán khoảng cách đã cuộn qua điểm ghim (top = 0)
            // Khi wrapperTop chuyển từ 0 (ghim) xuống âm, tức là ta đang cuộn
            let scrollOffset = -wrapperTop;

            // Giới hạn offset trong phạm vi cuộn ngang
            let limitedOffset = Math.max(0, Math.min(scrollLength, scrollOffset));

            // Tính toán tiến trình (từ 0 đến 1)
            const progress = limitedOffset / scrollLength;

            // Tính toán giá trị di chuyển ngang (transformX)
            // Chuyển động từ 0 đến -maxTranslateX
            const transformX = -progress * maxTranslateX;

            benefitsTrack.style.transform = `translateX(${transformX}px)`;
        });
    }
});
// End Lợi ích khách hàng


// GG Map

// End GG Map


// node-management.js

const selectElement = document.getElementById("selectDeviceSensor");
const deviceContent = document.getElementById("device-content");
const sensorContent = document.getElementById("sensor-content");


// Hàm để ẩn tất cả các khu vực và chỉ hiển thị khu vực được chọn
function toggleContent(selectedType) {
    // Ẩn tất cả trước
    deviceContent.classList.add("d-none");
    sensorContent.classList.add("d-none");

    // Hiện khu vực được chọn
    if (selectedType === "device") {
        deviceContent.classList.remove("d-none");
    } else if (selectedType === "sensor") {
        sensorContent.classList.remove("d-none");
    }
}

if (selectElement) {
    // 1. Xử lý khi giá trị trong select thay đổi
    selectElement.addEventListener("change", (e) => {
        const selectedType = e.target.value;
        toggleContent(selectedType);
    });
}

// password eye
document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');
    const eyeIcon = document.querySelector('#eyeIcon');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            // Kiểm tra kiểu hiện tại của input
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Thay đổi icon con mắt (eye / eye-slash)
            eyeIcon.classList.toggle('fa-eye');
            eyeIcon.classList.toggle('fa-eye-slash');

            // Thêm hiệu ứng nhấn nhẹ (optional)
            this.style.transform = 'scale(0.9)';
            setTimeout(() => this.style.transform = 'scale(1)', 100);
        });
    }
});
// end password eye
