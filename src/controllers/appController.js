const express = require("express");

// Start express appWithMiddlewares
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
appWithMiddlewares.use(express.json());
appWithMiddlewares.use(express.static(path.join(__dirname, "public")));

// 2) Development Middlewares
if (process.env.NODE_ENV === "development") {
  appWithMiddlewares.use(morgan("dev"));
  console.log(`Yes process.env.NODE_ENV: ${process.env.NODE_ENV}`);
}

// 3) Security Middlewares
appWithMiddlewares.use(cookieParser());
appWithMiddlewares.enable("trust proxy");
appWithMiddlewares.use(cors());
appWithMiddlewares.use(helmet());
appWithMiddlewares.use(mongoSanitize());
appWithMiddlewares.use(xss());
// Prevent parameter pollution
appWithMiddlewares.use(
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
appWithMiddlewares.use(express.json({ limit: "10kb" }));
appWithMiddlewares.use(express.urlencoded({ extended: true, limit: "10kb" }));
// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
if (process.env.NODE_ENV !== "development")
  appWithMiddlewares.use("/api", limiter);

module.exports = appWithMiddlewares;
