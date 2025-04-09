const Channel = require("../models/channelModel.js");
const AppError = require("../utils/appError.js");
const catchAsync = require("../utils/catchAsync.js");
const factory = require("./handlerFactory.js");

exports.getAllChannels = factory.getAll(Channel);
exports.getChannel = factory.getOne(Channel);
exports.createChannel = factory.createOne(Channel);
exports.updateChannel = factory.updateOne(Channel);
exports.deleteChannel = factory.deleteOne(Channel);

/*
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
*/
