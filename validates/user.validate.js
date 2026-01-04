module.exports.registerPost =  (req, res, next) => { 
    if(!req.body.fullName){
        req.flash("error", "Vui lòng nhập họ tên");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }
    if(!req.body.email){
        req.flash("error", "Vui lòng nhập email");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        req.flash("error", "Email không đúng định dạng!");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    if(!req.body.password){
        req.flash("error", "Vui lòng nhập mật khẩu");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }
    // End Validate data
    next();
}

module.exports.loginPost =  (req, res, next) => { 
    if(!req.body.email){
        req.flash("error", "Vui lòng nhập email");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    if(!req.body.password){
        req.flash("error", "Vui lòng nhập mật khẩu");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }
    // End Validate data
    next();
}

module.exports.forgotPassword =  (req, res, next) => { 
    if(!req.body.email){
        req.flash("error", "Vui lòng nhập email");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }
    // End Validate data
    next();
}

module.exports.resetPassword =  (req, res, next) => { 
    if(!req.body.password){
        req.flash("error", "Mật khẩu k đc để trống");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }
    // End Validate data
    
    if(!req.body.confirmPassword){
        req.flash("error", "Vui lòng xác nhận mật khẩu");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }
    // End Validate data

    if(req.body.password != req.body.confirmPassword){
        req.flash("error", "Xác nhận mật khẩu k khớp");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }
    // End Validate data
    next();
}

module.exports.editPatch = (req, res, next) => {
    // Kiểm tra Họ tên
    if (!req.body.fullName) {
        req.flash("error", "Họ tên không được để trống!");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    if (req.body.fullName.length < 5) {
        req.flash("error", "Họ tên phải có ít nhất 5 ký tự!");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    // Kiểm tra Email
    if (!req.body.email) {
        req.flash("error", "Email không được để trống!");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    // Regex kiểm tra định dạng email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
        req.flash("error", "Email không đúng định dạng!");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    next();
};