const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const socialMediaLinkSchema = new mongoose.Schema({
  platform: String,
  url: String,
});

const engagementStatsSchema = new mongoose.Schema({
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  subscribers: { type: Number, default: 0 },
});

const channelSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    channelName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "cricket",
        "song",
        "movie",
        "failCompilation",
        "model",
        "cartoon",
        "devotional",
        "serial",
        "meme",
        "knowledge",
        "diy",
        "gaming",
        "education",
        "fitness",
        "technology",
        "cooking",
        "travel",
        "lifestyle",
        "news",
        "comedy",
        "none",
      ],
    },
    channelContentType: {
      type: String,
      required: true,
      enum: ["aiGenerated", "copyrightEdited", "directCopied", "none"],
    },
    metadata: {
      creationDate: Date,
      dpImageLink: String,
      bannerImageLink: String,
      keywords: [String],
      handle: String,
      description: String,
      socialMediaLinks: [socialMediaLinkSchema],
      videoWaterMark: String,
    },
    engagementStats: {
      automated: engagementStatsSchema,
      organic: engagementStatsSchema,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/*
// Indexes for faster queries
channelSchema.index({ channelName: 1 });

// Note:- When the posts are contected using parent referencing how we could count 
// // Virtual populate posts
// channelSchema.virtual('postCount').get(function() {
//   return this.posts.length;
// });

// Note- Check in which format ownerId is populated
// Pre-find hook to populate owner details
channelSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'ownerId',
  //   select: 'gmail systemProfiles'
  // });
  next();
});

// Note:- As Posts are contected using parent referencing how this is going to populated and in which format
// Static method to find channel by ID with details
channelSchema.statics.findByIdWithDetails = function(id) {
  return this.findById(id).populate('posts');
};

// Note:- Check the given below code
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
*/

const Channel = mongoose.model("Channel", channelSchema);
module.exports = Channel;
