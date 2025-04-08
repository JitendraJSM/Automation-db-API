const Post = require('../models/postModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require("./handlerFactory");

exports.getAllPosts = factory.getAll(Post);
exports.getPost = factory.getOne(Post, [
  { path: 'channelId', select: '-__v' },
  { path: 'tasksPerformed', select: '-__v' }
]);
exports.createPost = factory.createOne(Post);
exports.updatePost = factory.updateOne(Post);
exports.deletePost = factory.deleteOne(Post);

exports.getPostTasks = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('tasksPerformed');

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: post.tasksPerformed
  });
});

exports.getUnengagedPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.findUnengagedPosts(req.query.days);

  res.status(200).json({
    status: 'success',
    data: posts
  });
});

exports.getPostEngagementAnalytics = catchAsync(async (req, res, next) => {
  const analytics = await Post.getEngagementAnalytics(req.query);

  res.status(200).json({
    status: 'success',
    data: analytics
  });
});

exports.updatePostEngagement = catchAsync(async (req, res, next) => {
  const { type, isAutomated } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  const updatedPost = await post.updateEngagementCounts(type, isAutomated);

  res.status(200).json({
    status: 'success',
    data: updatedPost
  });
});