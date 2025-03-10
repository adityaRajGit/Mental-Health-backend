import Express from "express";
// import Raven from 'raven';
import compression from "compression";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import chalk from "../server/chalk";
// import nodeCron from 'node-cron';
// import axios from 'axios';

import serverConfig from "../server/config";
import mainRoutes from "../server/routes/main.routes";
import userRoutes from "../server/routes/user.routes";
import authRoutes from "../server/routes/auth.routes";

// import {fetchMessageForGroup} from '../common/lib/message/messageHandler'

// Initialize the Express App
const app = new Express();
const http = require("http").Server(app);

// const io = require('socket.io')(http);

// make connection with user from server side
var room = 1;
// io.on('connection', async (socket) => {

//     console.log('New user connected');
//     socket.on('chatMessage', async (resp) => {
//         console.log('chatMessage', resp);
//         let msgResp = {
//             'group_id': '6394474dc7e9b33ec276e096'
//         }
//         let res = await fetchMessageForGroup(msgResp);
//         console.log(res)
//         socket.broadcast.emit('userMsg', res);
//     })

//     socket.on("disconnecting", () => {
//         console.log(socket.rooms); // the Set contains at least the socket ID
//     });

//     // when server disconnects from user
//     socket.on('disconnect', () => {
//         console.log('disconnected from user');
//     });

// });

// import formData from 'express-form-data'
// const formidable = require('express-formidable');

// Raven.config(serverConfig.SENTRY).install();

// Swagger API documentation
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("../../swagger/swagger-output.json");

mongoose.Promise = global.Promise;

const dbOptions = {
  reconnectTries: 300, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 50, // Maintain up to 10 socket connections
};

// MongoDB Connection
mongoose.connect(serverConfig.mongoURL);

mongoose.set("debug", false);

// Swagger UI generation
const swaggerOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "RBAC Docs",
  customfavIcon: "https://spyne-test.s3.amazonaws.com/spyne-logo.png",
};

// Apply body Parser and server public assets and routes
// app.use(Raven.requestHandler());
// app.use(Raven.errorHandler());
// app.use(cors(corsOptions));
app.use(compression());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: false }));
app.use(cookieParser());
app.enable("trust proxy");
// app.use(formData.parse());
// app.use(formidable());

app.use("*", (req, res, next) => {
  const { hostname, originalUrl, protocol, method } = req;
  console.log(
    `${
      method === "GET" ? chalk.getReq(method) : chalk.postReq(method)
    }  ${protocol}://${hostname}:${serverConfig.PORT}${originalUrl}`
  );
  next();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// routes for main application

app.use("/", mainRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", authRoutes);

// Swagger API documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, swaggerOptions)
);

http.listen(serverConfig.PORT, (error) => {
  console.log(process.env.NODE_ENV);
  console.log(`Core API is running on port: ${serverConfig.PORT}!`); // eslint-disable-line
});

export default app;
