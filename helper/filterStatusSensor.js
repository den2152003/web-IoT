module.exports = (query) => {
    let filterStatusSensor = 
    [
        {
            name: "Tất cả",
            status: "allSensor",
            class: ""
        },
        {
            name: "Nhiệt độ",
            status: "temperature",
            class: ""
        },
        {
            name: "Độ ẩm",
            status: "humidity",
            class: ""
        },
        {
            name: "Ánh sáng",
            status: "light",
            class: ""
        },
        {
            name: "Chất lượng không khí",
            status: "airQuality",
            class: ""
        },
    ];    
    
    if(query.typeSensor) {
        const index = filterStatusSensor.findIndex(item => item.status == query.typeSensor);
        filterStatusSensor[index].class = "active";
    }
    else {
        filterStatusSensor[0].class = "active";
    }
    return filterStatusSensor;
}