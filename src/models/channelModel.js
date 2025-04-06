const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const socialMediaLinkSchema = new mongoose.Schema({
  platform: String,
  url: String
});

const engagementStatsSchema = new mongoose.Schema({
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  subscribers: { type: Number, default: 0 }
});

const channelSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  channelName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'cricket', 'song', 'movie', 'failCompilation', 'model', 'cartoon',
      'devotional', 'serial', 'meme', 'knowledge', 'diy', 'gaming',
      'education', 'fitness', 'technology', 'cooking', 'travel',
      'lifestyle', 'news', 'comedy'
    ]
  },
  type: {
    type: String,
    required: true,
    enum: ['aiGenerated', 'copyrightEdited', 'directCopied']
  },
  metadata: {
    creationDate: Date,
    dpImageLink: String,
    bannerImageLink: String,
    keywords: [String],
    handle: String,
    description: String,
    socialMediaLinks: [socialMediaLinkSchema],
    videoWaterMark: String
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  engagementStats: {
    automated: engagementStatsSchema,
    organic: engagementStatsSchema
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
channelSchema.index({ channelName: 1 });
channelSchema.index({ category: 1 });
channelSchema.index({ type: 1 });
channelSchema.index({ 'metadata.keywords': 1 });

// Virtual populate posts
channelSchema.virtual('postCount').get(function() {
  return this.posts.length;
});

// Pre-find hook to populate owner details
channelSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'ownerId',
    select: 'gmail systemProfiles'
  });
  next();
});

// Static method to find channels with filters and pagination
channelSchema.statics.findAllWithFilters = async function(queryParams) {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (queryParams.category) query.category = queryParams.category;
  if (queryParams.type) query.type = queryParams.type;
  if (queryParams.keyword) query['metadata.keywords'] = queryParams.keyword;

  const [channels, total] = await Promise.all([
    this.find(query)
      .sort(queryParams.sort || '-createdAt')
      .skip(skip)
      .limit(limit),
    this.countDocuments(query)
  ]);

  return {
    channels,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to find channel by ID with details
channelSchema.statics.findByIdWithDetails = function(id) {
  return this.findById(id).populate('posts');
};

// Static method to create new channel with validation
channelSchema.statics.createNew = async function(channelData) {
  const existingChannel = await this.findOne({ channelName: channelData.channelName });
  if (existingChannel) {
    throw new AppError('Channel name already exists', 409);
  }
  return this.create(channelData);
};

// Static method to update channel with validation
channelSchema.statics.findByIdAndUpdateWithValidation = function(id, updateData) {
  return this.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
};

// Static method to delete channel and cleanup related data
channelSchema.statics.findByIdAndDeleteWithCleanup = async function(id) {
  const channel = await this.findById(id);
  if (!channel) return null;

  // Remove associated posts
  await mongoose.model('Post').deleteMany({ _id: { $in: channel.posts } });
  
  return channel.remove();
};

// Static method to find channel's posts with filtering
channelSchema.statics.findPostsByChannelId = async function(id, queryParams) {
  const channel = await this.findById(id).populate({
    path: 'posts',
    match: queryParams.type ? { type: queryParams.type } : {},
    options: { sort: queryParams.sort || '-uploadDate' }
  });

  return channel ? channel.posts : null;
};

// Static method to get channel engagement statistics
channelSchema.statics.getEngagementStats = async function(id, timeframe) {
  const channel = await this.findById(id);
  if (!channel) return null;

  const aggregationPipeline = [
    { $match: { _id: mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'posts',
        localField: 'posts',
        foreignField: '_id',
        as: 'postDetails'
      }
    },
    {
      $project: {
        totalPosts: { $size: '$postDetails' },
        automatedEngagement: '$engagementStats.automated',
        organicEngagement: '$engagementStats.organic',
        engagementRate: {
          $divide: [
            { $add: ['$engagementStats.organic.likes', '$engagementStats.organic.comments'] },
            { $add: ['$engagementStats.organic.views', 1] }
          ]
        }
      }
    }
  ];

  if (timeframe) {
    const timeframeFilter = {
      $match: {
        'postDetails.uploadDate': {
          $gte: new Date(Date.now() - parseInt(timeframe) * 24 * 60 * 60 * 1000)
        }
      }
    };
    aggregationPipeline.splice(1, 0, timeframeFilter);
  }

  const stats = await this.aggregate(aggregationPipeline);
  return stats[0];
};

// Instance method to check if channel has recent activity
channelSchema.methods.hasRecentActivity = async function(days = 7) {
  const recentDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const recentPosts = await mongoose.model('Post').countDocuments({
    _id: { $in: this.posts },
    uploadDate: { $gte: recentDate }
  });
  return recentPosts > 0;
};

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;