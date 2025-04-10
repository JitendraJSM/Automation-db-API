const express = require("express");
const app = require("./appMiddlewareStack.js");

// 1) API Server Check
app.use("/", (req, res) => res.send("Hello! Your API Server is running...."));

// 2) Import Routers
const memberRouter = require("./routes/memberRoutes.js");
// const channelRouter = require("./routes/channelRoutes.js");
// const postRouter = require("./routes/postRoutes.js");
// const taskRouter = require("./routes/taskRoutes.js");
// const analyticsRouter = require("./routes/analyticsRoutes.js");

// 4) ROUTES
const router = express.Router();
app.use("/api/v1", router);
router.use("/api/v1/members", memberRouter);
// router.use("/api/v1/channels", channelRouter);
// router.use("/api/v1/posts", postRouter);
// router.use("/api/v1/tasks", taskRouter);
// router.use("/api/v1/analytics", analyticsRouter);

// 5) IMPORT ERROR-HANDLERS
const AppError = require("./utils/appError.js");
const globalErrorHandler = require("./controllers/errorController.js");

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
