const Member = require('../models/memberModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllMembers = catchAsync(async (req, res, next) => {
  const members = await Member.findAllWithPagination(req.query);
  
  res.status(200).json({
    status: 'success',
    data: members
  });
});

exports.getMember = catchAsync(async (req, res, next) => {
  const member = await Member.findByIdWithDetails(req.params.id);
  
  if (!member) {
    return next(new AppError('No member found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: member
  });
});

exports.createMember = catchAsync(async (req, res, next) => {
  const member = await Member.createNew(req.body);

  res.status(201).json({
    status: 'success',
    data: member
  });
});

exports.updateMember = catchAsync(async (req, res, next) => {
  const member = await Member.findByIdAndUpdateWithValidation(req.params.id, req.body);

  if (!member) {
    return next(new AppError('No member found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: member
  });
});

exports.deleteMember = catchAsync(async (req, res, next) => {
  const member = await Member.findByIdAndDeleteWithCleanup(req.params.id);

  if (!member) {
    return next(new AppError('No member found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getMemberTasks = catchAsync(async (req, res, next) => {
  const tasks = await Member.findTasksByMemberId(req.params.id, req.query);

  if (!tasks) {
    return next(new AppError('No member found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: tasks
  });
});

exports.getMemberChannel = catchAsync(async (req, res, next) => {
  const channel = await Member.findChannelByMemberId(req.params.id);

  if (!channel) {
    return next(new AppError('No channel found for this member', 404));
  }

  res.status(200).json({
    status: 'success',
    data: channel
  });
});