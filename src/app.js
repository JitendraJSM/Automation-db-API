const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// Start express app
const app = express();

app.enable("trust proxy");

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
if (process.env.NODE_ENV !== "development") app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

/* Note for Er. Jitendra Nath - Check this given below code
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
app.use(compression());
*/

// 3) Import Routers
const memberRouter = require("./routes/memberRoutes.js");
const channelRouter = require("./routes/channelRoutes.js");
const postRouter = require("./routes/postRoutes.js");
const taskRouter = require("./routes/taskRoutes.js");
const analyticsRouter = require("./routes/analyticsRoutes.js");

// 4) ROUTES
router.use("/members", memberRouter);
router.use("/channels", channelRouter);
router.use("/posts", postRouter);
router.use("/tasks", taskRouter);
router.use("/analytics", analyticsRouter);

// 5) IMPORT ERROR-HANDLERS
const AppError = require("./utils/appError.js");
const globalErrorHandler = require("./controllers/errorController.js");

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
