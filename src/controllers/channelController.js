const Channel = require('../models/channelModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllChannels = catchAsync(async (req, res, next) => {
  const channels = await Channel.findAllWithFilters(req.query);

  res.status(200).json({
    status: 'success',
    data: channels
  });
});

exports.getChannel = catchAsync(async (req, res, next) => {
  const channel = await Channel.findByIdWithDetails(req.params.id);

  if (!channel) {
    return next(new AppError('No channel found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: channel
  });
});

exports.createChannel = catchAsync(async (req, res, next) => {
  const channel = await Channel.createNew(req.body);

  res.status(201).json({
    status: 'success',
    data: channel
  });
});

exports.updateChannel = catchAsync(async (req, res, next) => {
  const channel = await Channel.findByIdAndUpdateWithValidation(req.params.id, req.body);

  if (!channel) {
    return next(new AppError('No channel found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: channel
  });
});

exports.deleteChannel = catchAsync(async (req, res, next) => {
  const channel = await Channel.findByIdAndDeleteWithCleanup(req.params.id);

  if (!channel) {
    return next(new AppError('No channel found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getChannelPosts = catchAsync(async (req, res, next) => {
  const posts = await Channel.findPostsByChannelId(req.params.id, req.query);

  if (!posts) {
    return next(new AppError('No channel found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: posts
  });
});

exports.getChannelStats = catchAsync(async (req, res, next) => {
  const stats = await Channel.getEngagementStats(req.params.id, req.query.timeframe);

  if (!stats) {
    return next(new AppError('No channel found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: stats
  });
});