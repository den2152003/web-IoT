const express = require("express");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");


require("dotenv").config();

const route = require("./routes/index.route");

const database = require("./config/database");

const initMqttEspGateway = require("./mqtt/mqtt.js");
const initMqttEspNode = require("./mqtt/mqtt-node.js");
const initMqttSensor = require("./mqtt/mqtt-sensor.js");
const initMqttButtonControl = require("./mqtt/mqtt-button-control.js");

require("./cron/deviceSchedule.cron.js");

const app = express();

app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser('DEN215'));
app.use(session({ cookie: { maxAge: 60000 } }));
app.use(flash());

const port = process.env.PORT;

database.connect();

initMqttEspGateway();
initMqttEspNode();
initMqttSensor();
initMqttButtonControl();

app.set('views', `${__dirname}/views`); // specify the views directory
app.set('view engine', 'pug'); // register the template engine

app.use(express.static(`${__dirname}/public`));

route(app);

app.listen(port, () => {
    console.log("sucess sadsadsadsadsad");
})