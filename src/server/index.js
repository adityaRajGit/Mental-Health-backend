import Express from "express";
// import Raven from 'raven';
import compression from "compression";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import chalk from "../server/chalk";
import cors from "cors";
// import nodeCron from 'node-cron';
// import axios from 'axios';
// import passport from "../util/passport";
import session from "express-session";
import serverConfig from "../server/config";
import mainRoutes from "../server/routes/main.routes";
import userRoutes from "../server/routes/user.routes";
import authRoutes from "../server/routes/auth.routes";
import postRoutes from "../server/routes/post.routes";
import commentRoutes from "../server/routes/comment.routes";
import shareRoutes from "../server/routes/share.routes";
import therapistRoutes from "../server/routes/therapist.routes";
import appointmentRoutes from "../server/routes/appointment.routes";
import blogRoutes from "../server/routes/blog.routes";
// import {fetchMessageForGroup} from '../common/lib/message/messageHandler'

// Initialize the Express App
const app = new Express();
const http = require("http").Server(app);

// const io = require('socket.io')(http);
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  credentials: true,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Access-Control-Allow-Credentials",
  ],
};

// make connection with user from server side
var room = 1;
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
app.use(cors(corsOptions));
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


// routes for main application

app.use("/", mainRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/share", shareRoutes);
app.use("/api/v1/therapist",therapistRoutes);
app.use("/api/v1/appointment", appointmentRoutes);
app.use("/api/v1/blog", blogRoutes);
app.use(session({ secret: "your-session-secret", resave: false, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

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
