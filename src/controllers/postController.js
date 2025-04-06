const Post = require('../models/postModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const result = await Post.findAllWithFilters(req.query);

  res.status(200).json({
    status: 'success',
    data: result
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('channelId')
    .populate('tasksPerformed');

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: post
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const post = await Post.create(req.body);

  // Update channel's posts array
  await post.populate('channelId');
  await post.channelId.updateOne({ $push: { posts: post._id } });

  res.status(201).json({
    status: 'success',
    data: post
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('channelId');

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: post
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID', 404));
  }

  // Remove post reference from channel
  await post.channelId.updateOne({ $pull: { posts: post._id } });
  
  // Delete associated tasks
  await Promise.all([
    post.remove(),
    ...post.tasksPerformed.map(taskId =>
      mongoose.model('Task').findByIdAndDelete(taskId)
    )
  ]);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

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