const md5 = require("md5");
const User = require('../model/user.model');
const ForgotPassword = require("../model/forgot-password.model");
const generateHelper = require("../helper/generate");
const sendMailHelper = require("../helper/sendMail");

//[GET] /user/register
module.exports.register = (req, res) => {
    res.render("pages/users/register", {
        pageTitle: "Đăng ký tài khoản",
    });
}

//[POST] /user/register
module.exports.registerPost = async (req, res) => {

    req.body.password = md5(req.body.password);

    const emailExits = await User.findOne({
        deleted: false,
        email: req.body.email
    })

    if (emailExits) {
        req.flash("error", "Email đã tồn tại");
        backURL = req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    const user = new User(req.body);

    await user.save();

    console.log(user);

    res.cookie("tokenUser", user.tokenUser);

    res.redirect("/user/info");
}

//[GET] /user/login
module.exports.login = (req, res) => {
    res.render("pages/users/login", {
        pageTitle: "Đăng nhập",
    });
}

//[POST] /user/login
module.exports.loginPost = async (req, res) => {
    const { email, password, rememberMe } = req.body; // Lấy thêm biến rememberMe từ form

    // 1. Kiểm tra Email
    const user = await User.findOne({
        deleted: false,
        email: email
    });

    if (!user) {
        req.flash("error", "Email không tồn tại");
        backURL = req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    // 2. Kiểm tra Mật khẩu
    if (md5(password) !== user.password) {
        req.flash("error", "Sai mật khẩu");
        backURL = req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    // 3. Xử lý "Ghi nhớ tôi" (Remember Me)
    // Nếu có tích chọn (rememberMe = "on"), đặt thời gian sống 30 ngày
    // Nếu không tích chọn, để null (Cookie sẽ mất khi đóng trình duyệt)
    const milisecondsIn30Days = 30 * 24 * 60 * 60 * 1000;
    const cookieConfig = {
        expires: rememberMe ? new Date(Date.now() + milisecondsIn30Days) : null,
        httpOnly: true, // Bảo mật: Ngăn chặn JavaScript (XSS) đọc Cookie này
        secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS khi đã deploy
    };

    // 4. Lưu Cookie và điều hướng
    res.cookie("tokenUser", user.tokenUser, cookieConfig);

    req.flash("success", `Chào mừng ${user.fullName} quay trở lại!`);
    res.redirect("/");
}

//[GET] /user/logout
module.exports.logout = async (req, res) => {
    res.clearCookie("tokenUser");

    res.redirect("/");
}

//[GET] /user/info
module.exports.info = async (req, res) => {
    res.render("pages/users/info", {
        pageTitle: "Thông tin cá nhân"
    });
}

//[POST] /user/info
module.exports.infoPost = async (req, res) => {
    const password = req.body.newPassword;
    const confirmPassword = req.body.verifyNewPassword;

    const tokenUser = req.cookies.tokenUser;

    if (!password || !confirmPassword) {
        req.flash("error", "Vui lòng nhập đầy đủ mật khẩu!");
        backURL = req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    // 2. Kiểm tra nếu 2 mật khẩu khác nhau
    if (password !== confirmPassword) {
        req.flash("error", "Mật khẩu không khớp!");
        backURL = req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    await User.updateOne(
        { tokenUser: tokenUser },
        {
            password: md5(password)
        }
    );

    req.flash("success", "Đổi mật khẩu thành công");
    backURL = req.header('Referer') || '/';
    // do your thang
    res.redirect(backURL);
}

//[GET] /user/password/forgot
module.exports.forgotPassword = async (req, res) => {
    res.render("pages/users/forgot-password", {
        pageTitle: "Lấy lại mật khẩu"
    });
}

//[POST] /user/password/forgot
module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({
        deleted: false,
        email: email
    })

    if (!user) {
        req.flash("error", "Email không tồn tại");
        backURL = req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    // OTP
    const otp = generateHelper.generateRandomNumber(8);

    const forgotPasswordSchema = {
        email: email,
        otp: otp,
        expireAt: Date.now()
    }

    console.log(forgotPasswordSchema);

    const forgotPassword = new ForgotPassword(forgotPasswordSchema);

    await forgotPassword.save();
    // End OTP
    const subject = "Mã OTP xác minh lấy lại mật khẩu";
    const html = `
        Mã OTP xác minh lấy lại mật khẩu là <b>${otp}. Thời hạn sử dụng là 5 phút. Lưu ý không được để lộ mã OTP.
    `;

    await sendMailHelper.sendMail(email, subject, html);

    res.redirect(`/user/password/otp?email=${email}`)
}

//[GET] /user/password/otp?email=
module.exports.otpPassword = async (req, res) => {
    const email = req.query.email;
    console.log(email);
    res.render("pages/users/otp-password", {
        pageTitle: "Lấy lại mật khẩu",
        email: email
    });
}

//[POST] /user/password/otp?email=
module.exports.otpPasswordPost = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp
    });

    if (!result) {
        req.flash("error", "OTP k hợp lệ");
        backURL = req.header('Referer') || '/';
        // do your thang
        res.redirect(backURL);
        return;
    }

    const user = await User.findOne({
        email: email
    })

    res.cookie("tokenUser", user.tokenUser);
    res.redirect("/user/password/reset");
}

//[GET] /user/password/reset
module.exports.resetPassword = async (req, res) => {
    res.render("pages/users/reset-password", {
        pageTitle: "Đổi mật khẩu"
    });
}

//[POST] /user/password/reset
module.exports.resetPasswordPost = async (req, res) => {
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const tokenUser = req.cookies.tokenUser;

    await User.updateOne(
        { tokenUser: tokenUser },
        {
            password: md5(password)
        }
    )
    req.flash("success", "Lấy lại mật khẩu thành công");
    res.redirect("/");
}

//[GET] /user/edit/:_id
module.exports.edit = async (req, res) => {
    const user = await User.findOne({ _id: req.params._id });

    res.render("pages/users/edit", {
        pageTitle: "Đổi mật khẩu",
        user: user
    });
}

//[PATCH] /user/edit/:_id
module.exports.editPatch = async (req, res) => {
    const userId = req.params._id;

    try {
        const existingUser = await User.findOne({
            email: req.body.email,
            _id: { $ne: userId }
        });

        if (existingUser) {
            req.flash("error", `Email đã được người dùng khác sử dụng. Vui lòng chọn Email khác!`);
            return res.redirect(`/user/edit/${userId}`);
        }
        await User.updateOne({ _id: userId }, req.body);
        req.flash("success", `Cập nhật thành công!`);
    } catch (error) {
        req.flash("error", `Cập nhật thất bại!`);
    }

    res.redirect("/user/info");
}