const Member = require("../models/memberModel.js");
const AppError = require("../utils/appError.js");
const catchAsync = require("../utils/catchAsync.js");
const factory = require("./handlerFactory.js");

exports.getAllMembers = factory.getAll(Member);
exports.getMember = factory.getOne(Member);
exports.deleteAllMembers = factory.deleteAll(Member);
exports.createMember = factory.createOne(Member);
exports.updateMember = factory.updateOne(Member);
exports.deleteMember = factory.deleteOne(Member);

//  Below Code needs refactoring
exports.addSystemProfile = catchAsync(async (req, res, next) => {
  const { systemName, profileNumber } = req.body;

  if (!systemName || !profileNumber) {
    return next(new AppError("Both systemName and profileNumber are required", 400));
  }

  const member = await Member.findById(req.params.id);
  if (!member) {
    return next(new AppError("No member found with that ID", 404));
  }

  // Check for duplicate system profile
  const existingProfile = member.systemProfiles.find((profile) => profile.systemName === systemName);
  if (existingProfile) {
    return next(new AppError(`A profile with this system name already exists for the member: ${JSON.stringify(existingProfile)}`, 400));
  }

  member.systemProfiles.push({ systemName, profileNumber });
  await member.save();

  res.status(200).json({
    status: "success",
    data: member,
  });
});

exports.updateSystemProfile = catchAsync(async (req, res, next) => {
  const { systemName, profileNumber } = req.body;

  if (!systemName || !profileNumber) {
    return next(new AppError("Both systemName and profileNumber are required", 400));
  }

  const member = await Member.findById(req.params.id);
  if (!member) {
    return next(new AppError("No member found with that ID", 404));
  }

  const oldProfileDetails = member.systemProfiles.find((profile) => profile.systemName === systemName);
  if (!oldProfileDetails) {
    return next(new AppError("No profile with this system name exists to update for the member", 400));
  }

  member.systemProfiles = member.systemProfiles.map((profile) => (profile.systemName === systemName ? { systemName, profileNumber } : profile));

  await member.save();

  res.status(200).json({
    status: "success",
    data: member,
  });
});

exports.deleteSystemProfile = catchAsync(async (req, res, next) => {
  const { systemName } = req.body;

  if (!systemName) {
    return next(new AppError("systemName is required", 400));
  }

  const member = await Member.findById(req.params.id);
  if (!member) {
    return next(new AppError("No member found with that ID", 404));
  }

  const oldProfileDetails = member.systemProfiles.find((profile) => profile.systemName === systemName);
  if (!oldProfileDetails) {
    return next(new AppError("No profile with this system name exists to delete", 400));
  }

  member.systemProfiles = member.systemProfiles.filter((profile) => profile.systemName !== systemName);
  await member.save();

  res.status(200).json({
    status: "success",
    data: member,
  });
});

/*
exports.getMemberTasks = catchAsync(async (req, res, next) => {
  const tasks = await Member.findTasksByMemberId(req.params.id, req.query);

  if (!tasks) {
    return next(new AppError("No member found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: tasks,
  });
});

exports.getMemberChannel = catchAsync(async (req, res, next) => {
  const channel = await Member.findChannelByMemberId(req.params.id);

  if (!channel) {
    return next(new AppError("No channel found for this member", 404));
  }

  res.status(200).json({
    status: "success",
    data: channel,
  });
});
*/
