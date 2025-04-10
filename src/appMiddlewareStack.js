const express = require("express");

const app = express();

// Start express app
const appWithMiddlewares = express();

const path = require("path");
const cors = require("cors");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

// 1) Built-in Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 2) Development Middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 3) Security Middlewares
app.use(cookieParser());
app.enable("trust proxy");
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "status",
      "priority",
      "assignedTo",
      "createdBy",
      "channelId",
      "postType",
      "engagement",
    ],
  })
);
// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
if (process.env.NODE_ENV !== "development") app.use("/api", limiter);

module.exports = appWithMiddlewares;
