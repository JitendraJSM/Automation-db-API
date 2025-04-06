const Member = require('../models/memberModel');
const Channel = require('../models/channelModel');
const Post = require('../models/postModel');
const Task = require('../models/taskModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getMemberPerformance = catchAsync(async (req, res, next) => {
  const tasks = await Task.getMemberPerformanceAnalytics(req.params.id);

  if (!tasks.length) {
    return next(new AppError('No tasks found for this member', 404));
  }

  res.status(200).json({
    status: 'success',
    data: tasks
  });
});

exports.getChannelGrowth = catchAsync(async (req, res, next) => {
  const timeframe = req.query.timeframe || 30; // Default to 30 days
  const stats = await Channel.getEngagementStats(req.params.id, timeframe);

  if (!stats) {
    return next(new AppError('No channel found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

exports.getPostsEngagement = catchAsync(async (req, res, next) => {
  const analytics = await Post.getEngagementAnalytics(req.query);

  if (!analytics) {
    return next(new AppError('No posts found for the given criteria', 404));
  }

  res.status(200).json({
    status: 'success',
    data: analytics
  });
});

exports.getTasksDistribution = catchAsync(async (req, res, next) => {
  const distribution = await Task.getTaskDistribution(req.query.timeframe);

  if (!distribution) {
    return next(new AppError('No tasks found for the given timeframe', 404));
  }

  res.status(200).json({
    status: 'success',
    data: distribution
  });
});