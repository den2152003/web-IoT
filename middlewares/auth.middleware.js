const User = require("../model/user.model");

module.exports.requireAuth = async (req, res, next) => {
    if(!req.cookies.tokenUser){
        req.flash("error", `Hãy đăng nhập!`);
        res.redirect("/user/login");
        return;
    }

    const user = await User.findOne({
        tokenUser: req.cookies.tokenUser
    });

    if(!user){
        req.flash("error", `Hãy đăng nhập!`);
        res.redirect("/user/login");
        return;
    }
    next();
}