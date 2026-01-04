module.exports = (query) => {
    let filterStatusChart = 
    [
        {
            name: "Hiện tại",
            status: "now",
            class: ""
        },
        {
            name: "Ngày",
            status: "day",
            class: ""
        },
        {
            name: "Tháng",
            status: "month",
            class: ""
        },
        {
            name: "Năm",
            status: "year",
            class: ""
        },
    ];    
    
    if(query.typeChart) {
        const index = filterStatusChart.findIndex(item => item.status == query.typeChart);
        filterStatusChart[index].class = "active";
    }
    else {
        filterStatusChart[0].class = "active";
    }
    return filterStatusChart;
}