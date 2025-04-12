const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const systemProfileSchema = new mongoose.Schema({
  systemName: { type: String, required: true },
  profileNumber: { type: String, required: true },
});

const memberSchema = new mongoose.Schema(
  {
    gmail: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    pwd: {
      type: String,
      required: true,
      set: (value) =>
        !value
          ? value
          : value
              .split("")
              .map((c, i) => (i > 0 && i < value.length - 1 ? "*" : c))
              .join(""),
    },
    recoveryMail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    recoveryMailVerified: {
      type: Boolean,
      default: false,
    },
    gmailCreationDate: Date,
    youtubeChannel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      // required: true,
      // unique: true,
    },
    systemProfiles: [systemProfileSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-find hook to exclude password by default
memberSchema.pre(/^find/, function (next) {
  this.select("-__v -createdAt -updatedAt -pwd -recoveryMail");
  next();
});

/*

// Indexes for faster queries
// NOTE:- Which one of given below is better check course and ask deepseek ai
memberSchema.index({ gmail: 1 });
// memberSchema.index({ youtubeChannelId: 1 });
// memberSchema.index({ gmail: 1, youtubeChannelId: 1 });

// Pre-save middleware for data validation
memberSchema.pre("save", async function (next) {
  //Put your pre save functionality here if any
//   this.youtubeChannel = await mongoose
//     .model("Channel")
//     .findById(this.youtubeChannel );
  next();
});

// Pre-save hook to validate email format
memberSchema.pre("save", function (next) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.gmail)) {
    next(new AppError("Invalid email format", 400));
  }
  if (this.recoveryMail && !emailRegex.test(this.recoveryMail)) {
    next(new AppError("Invalid recovery email format", 400));
  }
  next();
});

// Pre-find hook to exclude password by default
memberSchema.pre(/^find/, function (next) {
  // this.select("-pwd");  <-- Doesn't needed as password is already hidden due to setter in schema options
  next();
});

// Static method to delete member and cleanup related data
memberSchema.statics.findByIdAndDeleteWithCleanup = async function (id) {
  const member = await this.findById(id);
  if (!member) return null;

  // Remove associated tasks
  await Promise.all([
    mongoose.model("Task").deleteMany({ assignedTo: id }),
    mongoose
      .model("Channel")
      .updateMany({ ownerId: id }, { $unset: { ownerId: 1 } }),
  ]);

  return member.remove();
};

// Remove this below static method as tasks collections is parent referenced
memberSchema.statics.findTasksByMemberId = async function (id, queryParams) {
   const member = await this.findById(id).populate({
     path: "tasks",
     match: queryParams.status ? { status: queryParams.status } : {},
     options: { sort: queryParams.sort || "-createdAt" },
   });
   return member ? member.tasks : null;
 };

// Static method to find member's channel
memberSchema.statics.findChannelByMemberId = async function (id) {
  const member = await this.findById(id).populate("youtubeChannelId");
  return member ? member.youtubeChannelId : null;
};

// Instance method to check if member has active tasks
memberSchema.methods.hasActiveTasks = async function () {
  const taskCount = await mongoose.model("Task").countDocuments({
    assignedTo: this._id,
    status: "pending",
  });
  return taskCount > 0;
};
*/

const Member = mongoose.model("Member", memberSchema);
module.exports = Member;
