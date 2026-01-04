module.exports.createCondition = (req, res, next) => {
    // 1. Kiểm tra loại cảm biến
    if (!req.body.sensorType) {
        req.flash("error", "Vui lòng chọn loại cảm biến");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    // 2. Kiểm tra giá trị Min/Max có trống không và có phải là số không
    if (req.body.minValue === "" || req.body.maxValue === "") {
        req.flash("error", "Vui lòng nhập đầy đủ ngưỡng giá trị");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    const min = parseFloat(req.body.minValue);
    const max = parseFloat(req.body.maxValue);

    // 3. Logic: Ngưỡng dưới không được lớn hơn hoặc bằng ngưỡng trên
    if (min >= max) {
        req.flash("error", "Ngưỡng dưới phải nhỏ hơn ngưỡng trên");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    // 4. Kiểm tra thiết bị thực thi (deviceId)
    if (!req.body.deviceId) {
        req.flash("error", "Vui lòng chọn thiết bị điều khiển");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    // 5. Kiểm tra trạng thái (Bật/Tắt)
    if (!req.body.status) {
        req.flash("error", "Vui lòng chọn trạng thái hành động (Bật/Tắt)");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    // Nếu mọi thứ ổn, đi tiếp sang controller
    next();
};