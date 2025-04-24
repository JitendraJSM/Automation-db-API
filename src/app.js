const express = require("express");
const app = require("./controllers/appController.js");

// 1) Import Routers
const memberRouter = require("./routes/memberRoutes.js");
const channelRouter = require("./routes/channelRoutes.js");
const postRouter = require("./routes/postRoutes.js");
const taskRouter = require("./routes/taskRoutes.js");
const analyticsRouter = require("./routes/analyticsRoutes.js");

// 2) ROUTES
const router = express.Router();
app.use("/api/v1", router);
router.use("/members", memberRouter);
router.use("/channels", channelRouter);
router.use("/posts", postRouter);
router.use("/tasks", taskRouter);
router.use("/analytics", analyticsRouter);

// 3) IMPORT ERROR-HANDLERS
const AppError = require("./utils/appError.js");
const globalErrorHandler = require("./controllers/errorController.js");

// 4) API Server Check
app.use("/", (req, res) =>
  res.status(200).json({
    status: "success",
    message: "Automation-db-API is running",
  })
);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
