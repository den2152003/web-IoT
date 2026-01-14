// Delete Item Gateway
const buttonDelete = document.querySelectorAll("[button-delete-gateway]");

if (buttonDelete.length > 0) {
    const formDeleteItem = document.querySelector("#form-delete-item");
    const path = formDeleteItem.getAttribute("data-path-gateway");

    buttonDelete.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có muốn xóa không?");

            if (isConfirm) {
                const id = button.getAttribute("data-id-gateway");

                const action = `${path}/${id}?_method=DELETE`;

                formDeleteItem.action = action;

                formDeleteItem.submit();
            }

        })
    })
}
// End Delete Item Gateway

// Delete Item Node
const buttonDeleteNode = document.querySelectorAll("[button-delete-node]");
if (buttonDeleteNode.length > 0) {
    const formDeleteItem = document.querySelector("#form-delete-node");
    const pathNode = formDeleteItem.getAttribute("data-path-node");

    buttonDeleteNode.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có muốn xóa không?");

            if (isConfirm) {
                const idNode = button.getAttribute("data-id-node");

                const action = `${pathNode}/${idNode}?_method=DELETE`;

                formDeleteItem.action = action;

                formDeleteItem.submit();
            }

        })
    })
}
// End Delete Item Node

// Reset WiFi
const buttonsResetWifi = document.querySelectorAll("[button-reset-wifi]");
if (buttonsResetWifi.length > 0) {
    const formResetWifi = document.querySelector("#form-reset-wifi");
    const path = formResetWifi.getAttribute("data-path-reset-node");

    buttonsResetWifi.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có chắc chắn muốn xóa cấu hình WiFi và khởi động lại Node này không?");
            if (isConfirm) {
                const idNode = button.getAttribute("data-id-node");
                const action = `${path}/${idNode}?_method=PATCH`; // Hoặc POST tùy bạn thiết lập ở Backend
                formResetWifi.action = action;
                formResetWifi.submit();
            }
        });
    });
}
// End Reset WiFi

// Reset WiFi Gateway
const buttonResetWifiGateway = document.querySelectorAll("[button-reset-wifi-gateway]");

if (buttonResetWifiGateway.length > 0) {
  const formResetWifiGateway = document.querySelector("#form-reset-wifi-gateway");
  const path = formResetWifiGateway.getAttribute("data-path-reset-gateway");

  buttonResetWifiGateway.forEach((button) => {
    button.addEventListener("click", () => {
      const isConfirm = confirm("Bạn có chắc chắn muốn Reset cấu hình WiFi của Gateway này không? Thiết bị sẽ khởi động lại!");

      if (isConfirm) {
        const idGateway = button.getAttribute("data-id-gateway");
        const gatewayId = button.getAttribute("data-gateway-id");

        // Thêm ?_method=PATCH nếu bạn dùng middleware method-override ở Backend
        // Điều này giúp đồng bộ với cách bạn làm ở phần Reset WiFi Node bên trên
        const action = `${path}/${gatewayId}?_method=PATCH`;
        
        formResetWifiGateway.action = action;
        formResetWifiGateway.submit();
      }
    });
  });
}
// End Reset WiFi Gateway

// Delete Item device
const buttonDeleteDevice = document.querySelectorAll("[button-delete-device]");
console.log(buttonDeleteDevice);

if (buttonDeleteDevice.length > 0) {
    const formDeleteDevice = document.querySelector("#form-delete-device");
    const pathDevice = formDeleteDevice.getAttribute("data-path-device");
    console.log(pathDevice);
    buttonDeleteDevice.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có muốn xóa không?");

            if (isConfirm) {
                const idDevice = button.getAttribute("data-id-device");

                const action = `${pathDevice}/${idDevice}?_method=DELETE`;

                formDeleteDevice.action = action;

                formDeleteDevice.submit();
            }

        })
    })
}
// End Delete Item device

// Delete Item Condition
const buttonDeleteCondition= document.querySelectorAll("[button-delete-condition]");

if (buttonDeleteCondition.length > 0) {
    const formDeleteCondition = document.querySelector("#form-delete-condition");
    const pathCondition = formDeleteCondition.getAttribute("data-path-condition");
    
    buttonDeleteCondition.forEach(button => {
        button.addEventListener("click", () => {
            const isConfirm = confirm("Bạn có muốn xóa không?");

            if (isConfirm) {
                const idCondition = button.getAttribute("data-id-condition");

                const action = `${pathCondition}/${idCondition}?_method=DELETE`;

                formDeleteCondition.action = action;

                formDeleteCondition.submit();
            }

        })
    })
}
// End Delete Item Condition

const buttonsPagination = document.querySelectorAll("[button-pagination]");
if (buttonsPagination) {
    let url = new URL(window.location.href);
    buttonsPagination.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const page = button.getAttribute("button-pagination");
            url.searchParams.set("page", page);
            window.location.href = url.href;
        })
    })
}

// hidden gateway id
const selectElement = document.getElementById('selectGateway');
const hiddenInputElement = document.getElementById('hiddenGatewayId');

if (selectElement && hiddenInputElement) {
    // Lắng nghe sự kiện "change" trên thẻ select
    selectElement.addEventListener('change', (e) => {
        console.log(e);
        const selectedValue = e.target.value;

        // 3. Gán giá trị đã chọn vào trường ẩn
        hiddenInputElement.value = selectedValue;

        // (Tùy chọn) Log ra để kiểm tra
        console.log("Giá trị Gateway ID đã được truyền vào trường ẩn:", hiddenInputElement.value);
    });
}
// End hidden gateway id


//Select Node
const selectElementNode = document.getElementById('selectNode');
const hiddenInputElementNode = document.getElementById('hiddenNodeId');

if (selectElementNode && hiddenInputElementNode) {
    // Lắng nghe sự kiện "change" trên thẻ select
    selectElementNode.addEventListener('change', (e) => {
        console.log(e);
        const selectedValue = e.target.value;

        // 3. Gán giá trị đã chọn vào trường ẩn
        hiddenInputElementNode.value = selectedValue;

        // (Tùy chọn) Log ra để kiểm tra
        console.log("Giá trị Gateway ID đã được truyền vào trường ẩn:", hiddenInputElementNode.value);
    });
}
// End Select Node


// chọn vị trí/device/sensor
const buttonStatus = document.querySelectorAll("[button-status]");

if (buttonStatus.length > 0) {
    let url = new URL(window.location.href);

    buttonStatus.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status");

            if (status) {
                url.searchParams.set("type", status);
            }
            else
                url.searchParams.delete("type");

            window.location.href = url.href;
        })
    })
}
// End chọn vị trí/device/sensor

// chọn all/temp/humi/light/aq
const buttonStatusSensor = document.querySelectorAll("[button-status-sensor]");

if (buttonStatusSensor.length > 0) {
    let url = new URL(window.location.href);

    buttonStatusSensor.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status-sensor");

            if (status) {
                url.searchParams.set("typeSensor", status);
            }
            else
                url.searchParams.delete("typeSensor");

            window.location.href = url.href;
        })
    })
}
// End chọn all/temp/humi/light/aq

// chọn ngày/tháng/năm
const buttonStatusChart = document.querySelectorAll("[button-status-chart]");


if (buttonStatusChart.length > 0) {
    let url = new URL(window.location.href);

    const dateInput = document.querySelector("[historyDateInput]");
    buttonStatusChart.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status-chart");

            const pickedDate = dateInput ? dateInput.value : null;

            if (status) {
                url.searchParams.set("typeChart", status);
                url.searchParams.set("date", pickedDate);
            }
            else {
                url.searchParams.set("date", pickedDate);
            }

            if (pickedDate) {
                url.searchParams.set("date", pickedDate);
            } else {
                url.searchParams.delete("date");
            }

            window.location.href = url.href;
        })
    })
}
// End chọn all/temp/humi/light/aq

// modal project
$(document).ready(function () {
    // 1. Lắng nghe sự kiện Modal có ID là #projectDetail được hiển thị
    $('#projectDetail').on('show.bs.modal', function (event) {

        // Lấy nút "Chi tiết" đã kích hoạt Modal
        var button = $(event.relatedTarget);

        // 2. Lấy dữ liệu từ thuộc tính data-* của nút đó
        // Lưu ý: jQuery tự động chuyển tên thuộc tính từ kebab-case (data-project-name)
        // thành camelCase (projectName) khi dùng .data()
        var projectName = button.data('project-name');
        var address = button.data('address');
        var gatewayName = button.data('gateway-name');
        var description = button.data('description');
        var dateCreated = button.data('date-created'); // Lấy dữ liệu ngày tháng
        var nodeNumber = button.data('nodenumber');    // LƯU Ý: Chữ 'N' được chuyển thành thường (nodenumer)



        // 3. Cập nhật nội dung vào các thẻ trong Modal
        var modal = $(this);

        // Cập nhật các trường chi tiết bằng dữ liệu đã lấy
        modal.find('#projectName').text(projectName);
        modal.find('#address').text(address);
        modal.find('#gatewayName').text(gatewayName);
        modal.find('#description').text(description);
        modal.find('#dateCreated').text(dateCreated);
        modal.find('#numNode').text(nodeNumber);

    });
});
// end modal project

// modal node
$(document).ready(function () {
    // 1. Lắng nghe sự kiện Modal có ID là #nodeDetail được hiển thị
    $('#nodeDetail').on('show.bs.modal', function (event) {

        // Lấy nút "Chi tiết" đã kích hoạt Modal
        var button = $(event.relatedTarget);

        // 2. Lấy dữ liệu từ thuộc tính data-* của nút đó
        // Lưu ý: jQuery tự động chuyển tên thuộc tính từ kebab-case (data-project-name)
        // thành camelCase (projectName) khi dùng .data()
        var projectName = button.data('node-name');
        var address = button.data('address');
        var description = button.data('description');
        var dateCreated = button.data('date-created'); // Lấy dữ liệu ngày tháng

        // 3. Cập nhật nội dung vào các thẻ trong Modal
        var modal = $(this);

        // Cập nhật các trường chi tiết bằng dữ liệu đã lấy
        modal.find('#nodeName').text(projectName);
        modal.find('#address').text(address);
        modal.find('#description').text(description);
        modal.find('#dateCreated').text(dateCreated);
    });
});
// end modal node

// Xóa tất cả
const changeMulti = document.querySelector('[form-change-multi]');
// console.log(changeMulti);
if (changeMulti) {
    changeMulti.addEventListener('submit', function (e) {
        const type = document.querySelector('select[name="type"]').value;

        if (type === "delete-all") {
            const isConfirm = confirm("Bạn có chắc chắn muốn xóa TẤT CẢ thiết bị không?");
            if (!isConfirm) {
                e.preventDefault();  // Chặn submit
            }
        }
    });
}
// End Xóa tất cả
