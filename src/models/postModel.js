const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const engagementSchema = new mongoose.Schema({
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }]
});

const organicEngagementSchema = new mongoose.Schema({
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  views: { type: Number, default: 0 }
});

const postSchema = new mongoose.Schema({
  youtubeChannel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: [true, 'Post must belong to a channel']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Post must belong to a member']
  },
  url: {
    type: String,
    required: [true, 'Post must have a URL'],
  },
  postType: {
    type: String,
    required: [true, 'Post must have a type'],
    enum: {
      values: ['photo', 'shorts', 'video', 'article'],
      message: 'Type must be either: photo, shorts, video, or article'
    }
  },
  description: String,
  engagement: {
    automated: engagementSchema,
    organic: organicEngagementSchema
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  lastScrapedDate: Date,
  lastTaskPerformedDate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/*
//Note:- Will make queries after analysising the data accessing patterns indexes for faster queries
// postSchema.index({ channelId: 1, uploadDate: -1 });
// postSchema.index({ type: 1 });
// postSchema.index({ lastScrapedDate: 1 });

// Virtual for total engagement
postSchema.virtual('totalEngagement').get(function() {
  const organic = this.engagement.organic;
  return organic.likes + organic.comments + organic.shares + organic.views;
});

// Pre-save middleware to update lastTaskPerformedDate
postSchema.pre('save', function(next) {
  if (this.isModified('tasksPerformed')) {
    this.lastTaskPerformedDate = new Date();
  }
  next();
});

// Static method to find posts without recent engagement
postSchema.statics.findUnengagedPosts = async function(days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  return this.find({
    $or: [
      { lastTaskPerformedDate: { $lt: date } },
      { lastTaskPerformedDate: { $exists: false } }
    ]
  }).populate('channelId');
};

// Static method to find posts with pagination and filters
postSchema.statics.findAllWithFilters = async function(queryParams) {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (queryParams.type) query.type = queryParams.type;
  if (queryParams.channelId) query.channelId = queryParams.channelId;
  if (queryParams.dateRange) {
    query.uploadDate = {
      $gte: new Date(queryParams.dateRange.start),
      $lte: new Date(queryParams.dateRange.end)
    };
  }

  const [posts, total] = await Promise.all([
    this.find(query)
      .sort(queryParams.sort || '-uploadDate')
      .skip(skip)
      .limit(limit)
      .populate('channelId'),
    this.countDocuments(query)
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to get engagement analytics
postSchema.statics.getEngagementAnalytics = async function(queryParams) {
  const matchStage = {};
  if (queryParams.channelId) matchStage.channelId = mongoose.Types.ObjectId(queryParams.channelId);
  if (queryParams.timeframe) {
    matchStage.uploadDate = {
      $gte: new Date(Date.now() - parseInt(queryParams.timeframe) * 24 * 60 * 60 * 1000)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalPosts: { $sum: 1 },
        averageOrganicLikes: { $avg: '$engagement.organic.likes' },
        averageOrganicComments: { $avg: '$engagement.organic.comments' },
        averageOrganicShares: { $avg: '$engagement.organic.shares' },
        averageOrganicViews: { $avg: '$engagement.organic.views' },
        automatedTasksCount: { $sum: { $size: '$tasksPerformed' } }
      }
    },
    {
      $project: {
        _id: 0,
        type: '$_id',
        totalPosts: 1,
        averageOrganicLikes: { $round: ['$averageOrganicLikes', 2] },
        averageOrganicComments: { $round: ['$averageOrganicComments', 2] },
        averageOrganicShares: { $round: ['$averageOrganicShares', 2] },
        averageOrganicViews: { $round: ['$averageOrganicViews', 2] },
        automatedTasksCount: 1,
        engagementRate: {
          $round: [{
            $multiply: [{
              $divide: [
                { $add: ['$averageOrganicLikes', '$averageOrganicComments'] },
                { $add: ['$averageOrganicViews', 1] }
              ]
            }, 100]
          }, 2]
        }
      }
    }
  ]);
};

// Instance method to update engagement counts
postSchema.methods.updateEngagementCounts = async function(type, isAutomated = false) {
  const path = `engagement.${isAutomated ? 'automated' : 'organic'}.${type}`;
  const update = isAutomated ? { $push: { [path]: this._id } } : { $inc: { [path]: 1 } };
  
  return this.constructor.findByIdAndUpdate(
    this._id,
    update,
    { new: true, runValidators: true }
  );
};
*/

const Post = mongoose.model('Post', postSchema);
module.exports = Post;