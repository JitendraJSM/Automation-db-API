const catchAsync = require("../utils/catchAsync.js");
const AppError = require("../utils/appError.js");
const APIFeatures = require("../utils/apiFeatures.js");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    if (process.env.NODE_ENV === "development")
      return res.status(200).json({
        status: "success",
        message: "This is not safe here",
        data: doc,
      });
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.deleteAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.deleteMany({});

    if (!doc) {
      return next(new AppError("Failed to delete documents", 404));
    }

    if (process.env.NODE_ENV === "development")
      return res.status(200).json({
        status: "success",
        message: `Successfully deleted ${doc.deletedCount} documents`,
        data: doc,
      });

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    console.log(doc); // Add this line to log the created document t

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    // Handle array of population options
    if (popOptions) {
      if (Array.isArray(popOptions)) {
        popOptions.forEach((option) => (query = query.populate(option)));
      } else {
        // Single population option (backward compatibility)
        query = query.populate(popOptions);
      }
    }

    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // BUILD QUERY
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();

    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
