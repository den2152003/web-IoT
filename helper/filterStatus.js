module.exports = (query) => {
    let filterStatus = 
    [
        {
            name: "Thiết bị",
            status: "device",
            class: ""
        },
        {
            name: "Cảm biến",
            status: "sensor",
            class: ""
        }
    ];    
    
    if(query.type) {
        const index = filterStatus.findIndex(item => item.status == query.type);
        filterStatus[index].class = "active";
    }
    else {
        filterStatus[0].class = "active";
    }
    return filterStatus;
}