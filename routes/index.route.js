const homeRoutes = require("./home.route");
const usersRoutes = require("./user.route");
const projectsRoutes = require("./project.route");
const nodesRoutes = require("./node.route");


const userMiddleWare = require("../middlewares/user.middleware");


module.exports = (app) => {
    app.use(userMiddleWare.infoUser);
    
    app.use('/', homeRoutes);

    app.use("/user",  usersRoutes);

    app.use("/project",  projectsRoutes);

    app.use("/node",  nodesRoutes);

    
    
};