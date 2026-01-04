module.exports.createProject =  (req, res, next) => { 
 
    if(!req.body.projectName){
        req.flash("error", "Vui lòng nhập tên dự án");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    if(!req.body.gatewayName){
        req.flash("error", "Vui lòng nhập tên gateway");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    if(!req.body.address){
        req.flash("error", "Vui lòng nhập địa chỉ");
        backURL=req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }
    // End Validate data
    next();
}

// module.exports.loginPost =  (req, res, next) => { 
//     if(!req.body.email){
//         req.flash("error", "Vui lòng nhập email");
//         backURL=req.header('Referer') || '/';
//         // do your thang
//         res.redirect(backURL);
//         return;
//     }

//     if(!req.body.password){
//         req.flash("error", "Vui lòng nhập mật khẩu");
//         backURL=req.header('Referer') || '/';
//         // do your thang
//         res.redirect(backURL);
//         return;
//     }
//     // End Validate data
//     next();
// }

// module.exports.forgotPassword =  (req, res, next) => { 
//     if(!req.body.email){
//         req.flash("error", "Vui lòng nhập email");
//         backURL=req.header('Referer') || '/';
//         // do your thang
//         res.redirect(backURL);
//         return;
//     }
//     // End Validate data
//     next();
// }

// module.exports.resetPassword =  (req, res, next) => { 
//     if(!req.body.password){
//         req.flash("error", "Mật khẩu k đc để trống");
//         backURL=req.header('Referer') || '/';
//         // do your thang
//         res.redirect(backURL);
//         return;
//     }
//     // End Validate data
    
//     if(!req.body.confirmPassword){
//         req.flash("error", "Vui lòng xác nhận mật khẩu");
//         backURL=req.header('Referer') || '/';
//         // do your thang
//         res.redirect(backURL);
//         return;
//     }
//     // End Validate data

//     if(req.body.password != req.body.confirmPassword){
//         req.flash("error", "Xác nhận mật khẩu k khớp");
//         backURL=req.header('Referer') || '/';
//         // do your thang
//         res.redirect(backURL);
//         return;
//     }
//     // End Validate data
//     next();
// }