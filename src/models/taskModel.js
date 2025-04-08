const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const taskSchema = new mongoose.Schema({
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Task must be assigned to a member']
  },
  targetPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Task must be associated with a post']
  },
  taskType: {
    type: String,
    required: [true, 'Task must have a type'],
    enum: {
      values: ['like', 'comment', 'share', 'view'],
      message: 'Type must be either: like, comment, share, or view'
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'completed', 'failed'],
      message: 'Status must be either: pending, completed, or failed'
    },
    default: 'pending'
  },
  completedAt: Date,
  failureReason: String,
  priority: {
    type: Number,
    default: 1,
    min: [1, 'Priority must be at least 1'],
    max: [5, 'Priority cannot be more than 5']
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

//Note:- Will make queries after analysising the data accessing patterns indexes for faster queries
// taskSchema.index({ assignedTo: 1, status: 1 });
// taskSchema.index({ targetPost: 1 });
// taskSchema.index({ status: 1, priority: -1 });

// Pre-save middleware for status updates
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
  next();
});

// Pre-save middleware for attempt tracking
taskSchema.pre('save', function(next) {
  if (this.attempts >= this.maxAttempts && this.status === 'pending') {
    this.status = 'failed';
    this.failureReason = 'Maximum attempts reached';
  }
  next();
});

// Static method to find tasks with filters and pagination
taskSchema.statics.findAllWithFilters = async function(queryParams) {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (queryParams.status) query.status = queryParams.status;
  if (queryParams.type) query.type = queryParams.type;
  if (queryParams.assignedTo) query.assignedTo = queryParams.assignedTo;

  const [tasks, total] = await Promise.all([
    this.find(query)
      .sort(queryParams.sort || '-priority -createdAt')
      .skip(skip)
      .limit(limit)
      .populate('assignedTo')
      .populate('targetPost'),
    this.countDocuments(query)
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to auto-assign tasks
taskSchema.statics.autoAssignTasks = async function(options = {}) {
  const { memberIds, postTypes, maxTasksPerMember = 5 } = options;

  // Find eligible members
  const memberQuery = memberIds ? { _id: { $in: memberIds } } : {};
  const members = await mongoose.model('Member').find(memberQuery);

  // Find posts needing engagement
  const postQuery = postTypes ? { type: { $in: postTypes } } : {};
  const posts = await mongoose.model('Post').findUnengagedPosts();

  const tasks = [];
  for (const member of members) {
    // Check member's current pending tasks
    const pendingTasks = await this.countDocuments({
      assignedTo: member._id,
      status: 'pending'
    });

    if (pendingTasks >= maxTasksPerMember) continue;

    // Assign new tasks up to the maximum
    const tasksToAssign = maxTasksPerMember - pendingTasks;
    const eligiblePosts = posts.slice(0, tasksToAssign);

    for (const post of eligiblePosts) {
      const taskTypes = ['like', 'comment', 'share', 'view'];
      const randomType = taskTypes[Math.floor(Math.random() * taskTypes.length)];

      tasks.push({
        assignedTo: member._id,
        targetPost: post._id,
        type: randomType,
        priority: Math.floor(Math.random() * 3) + 1
      });
    }
  }

  return this.create(tasks);
};

// Static method to get task distribution analytics
taskSchema.statics.getTaskDistribution = async function(timeframe) {
  const matchStage = {};
  if (timeframe) {
    matchStage.createdAt = {
      $gte: new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: '$type',
          status: '$status'
        },
        count: { $sum: 1 },
        avgCompletionTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              { $subtract: ['$completedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        statusDistribution: {
          $push: {
            status: '$_id.status',
            count: '$count',
            avgCompletionTime: {
              $round: [{ $divide: ['$avgCompletionTime', 1000 * 60] }, 2]
            }
          }
        },
        totalTasks: { $sum: '$count' }
      }
    },
    {
      $project: {
        _id: 0,
        type: '$_id',
        statusDistribution: 1,
        totalTasks: 1,
        completionRate: {
          $round: [{
            $multiply: [{
              $divide: [
                { $sum: {
                  $map: {
                    input: {
                      $filter: {
                        input: '$statusDistribution',
                        as: 'sd',
                        cond: { $eq: ['$$sd.status', 'completed'] }
                      }
                    },
                    as: 'completed',
                    in: '$$completed.count'
                  }
                } },
                '$totalTasks'
              ]
            }, 100]
          }, 2]
        }
      }
    }
  ]);
};

// Instance method to mark task as completed
taskSchema.methods.complete = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  await this.save();

  // Update post's engagement
  const post = await mongoose.model('Post').findById(this.targetPost);
  await post.updateEngagementCounts(this.type, true);

  return this;
};

// Instance method to mark task as failed
taskSchema.methods.fail = async function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.attempts += 1;
  return this.save();
};

// Static method to get member performance analytics
taskSchema.statics.getMemberPerformanceAnalytics = async function(memberId) {
  return this.aggregate([
    { $match: { assignedTo: new mongoose.Types.ObjectId(memberId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgCompletionTime: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'completed'] },
              { $subtract: ['$completedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        avgCompletionTime: {
          $round: [{ $divide: ['$avgCompletionTime', 1000 * 60] }, 2]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Task', taskSchema);