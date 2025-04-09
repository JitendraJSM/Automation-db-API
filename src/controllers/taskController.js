const Task = require("../models/taskModel.js");
const AppError = require("../utils/appError.js");
const catchAsync = require("../utils/catchAsync.js");
const factory = require("./handlerFactory.js");

exports.getAllTasks = factory.getAll(Task);
exports.getTask = factory.getOne(Task);
exports.createTask = factory.createOne(Task);
exports.updateTask = factory.updateOne(Task);
exports.deleteTask = factory.deleteOne(Task);

/*
exports.createTask = catchAsync(async (req, res, next) => {
  const task = await Task.create(req.body);

  // Add task to post's tasksPerformed array
  await task.populate("targetPost");
  await task.targetPost.updateOne({ $push: { tasksPerformed: task._id } });

  res.status(201).json({
    status: "success",
    data: task,
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  // Handle status updates
  if (req.body.status) {
    if (req.body.status === "completed") {
      await task.complete();
    } else if (req.body.status === "failed") {
      await task.fail(req.body.failureReason);
    }
  }

  // Update other fields
  Object.keys(req.body).forEach((key) => {
    if (key !== "status" && key !== "failureReason") {
      task[key] = req.body[key];
    }
  });

  await task.save();

  res.status(200).json({
    status: "success",
    data: task,
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  // Remove task reference from post
  await task.targetPost.updateOne({ $pull: { tasksPerformed: task._id } });

  await task.remove();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.autoAssignTasks = catchAsync(async (req, res, next) => {
  const tasks = await Task.autoAssignTasks(req.body);

  res.status(201).json({
    status: "success",
    data: tasks,
  });
});

exports.getTaskDistribution = catchAsync(async (req, res, next) => {
  const distribution = await Task.getTaskDistribution(req.query.timeframe);

  res.status(200).json({
    status: "success",
    data: distribution,
  });
});

exports.completeTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  if (task.status !== "pending") {
    return next(new AppError("Task is not in pending status", 400));
  }

  await task.complete();

  res.status(200).json({
    status: "success",
    data: task,
  });
});

exports.getTask = factory.getOne(Task, [
  { path: "assignedTo", select: "-__v" },
  { path: "targetPost", select: "-__v" },
]);

exports.failTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError("No task found with that ID", 404));
  }

  if (task.status !== "pending") {
    return next(new AppError("Task is not in pending status", 400));
  }

  await task.fail(req.body.failureReason);

  res.status(200).json({
    status: "success",
    data: task,
  });
});
*/
