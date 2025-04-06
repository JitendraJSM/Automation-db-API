const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const systemProfileSchema = new mongoose.Schema({
  systemName: { type: String, required: true },
  profileNumber: { type: String, required: true }
});

const memberSchema = new mongoose.Schema({
  gmail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  pwd: {
    type: String,
    required: true
  },
  recoveryMail: {
    type: String,
    trim: true,
    lowercase: true
  },
  recoveryMailVerified: {
    type: Boolean,
    default: false
  },
  gmailCreationDate: Date,
  youtubeChannelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel'
  },
  systemProfiles: [systemProfileSchema],
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
memberSchema.index({ gmail: 1 });
memberSchema.index({ youtubeChannelId: 1 });

// Pre-save middleware for data validation
memberSchema.pre('save', function(next) {
  if (this.recoveryMail && !this.recoveryMailVerified) {
    this.recoveryMailVerified = false;
  }
  next();
});

// Pre-save hook to validate email format
memberSchema.pre('save', function(next) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.gmail)) {
    next(new AppError('Invalid email format', 400));
  }
  if (this.recoveryMail && !emailRegex.test(this.recoveryMail)) {
    next(new AppError('Invalid recovery email format', 400));
  }
  next();
});

// Pre-find hook to exclude password by default
memberSchema.pre(/^find/, function(next) {
  this.select('-pwd');
  next();
});

// Static method for paginated find with optional filtering
memberSchema.statics.findAllWithPagination = async function(queryParams) {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const sort = queryParams.sort || '-createdAt';
  const skip = (page - 1) * limit;

  const query = this.find()
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const [members, total] = await Promise.all([
    query.exec(),
    this.countDocuments()
  ]);

  return {
    members,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to find member by ID with populated details
memberSchema.statics.findByIdWithDetails = function(id) {
  return this.findById(id)
    .populate({
      path: 'tasks',
      select: '-__v'
    })
    .populate({
      path: 'youtubeChannelId',
      select: '-__v'
    });
};

// Static method to create new member with validation
memberSchema.statics.createNew = async function(memberData) {
  const existingMember = await this.findOne({ gmail: memberData.gmail });
  if (existingMember) {
    throw new AppError('Gmail already registered', 409);
  }
  return this.create(memberData);
};

// Static method to update member with validation
memberSchema.statics.findByIdAndUpdateWithValidation = function(id, updateData) {
  return this.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
};

// Static method to delete member and cleanup related data
memberSchema.statics.findByIdAndDeleteWithCleanup = async function(id) {
  const member = await this.findById(id);
  if (!member) return null;

  // Remove associated tasks
  await Promise.all([
    mongoose.model('Task').deleteMany({ assignedTo: id }),
    mongoose.model('Channel').updateMany(
      { ownerId: id },
      { $unset: { ownerId: 1 } }
    )
  ]);

  return member.remove();
};

// Static method to find member's tasks
memberSchema.statics.findTasksByMemberId = async function(id, queryParams) {
  const member = await this.findById(id).populate({
    path: 'tasks',
    match: queryParams.status ? { status: queryParams.status } : {},
    options: { sort: queryParams.sort || '-createdAt' }
  });

  return member ? member.tasks : null;
};

// Static method to find member's channel
memberSchema.statics.findChannelByMemberId = async function(id) {
  const member = await this.findById(id).populate('youtubeChannelId');
  return member ? member.youtubeChannelId : null;
};

// Instance method to check if member has active tasks
memberSchema.methods.hasActiveTasks = async function() {
  const taskCount = await mongoose.model('Task').countDocuments({
    assignedTo: this._id,
    status: 'pending'
  });
  return taskCount > 0;
};

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;