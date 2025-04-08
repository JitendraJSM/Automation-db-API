const mongoose = require("mongoose");

// Database connection
const connectDB = async () => {
  try {
    let DB;
    if (process.env.DB_TYPE === "LOCAL") DB = process.env.LOCAL_DB_URI;
    else
      DB = process.env.DATABASE.replace(
        "<PASSWORD>",
        process.env.MONGO_DB_URI_PASSWORD
      );

    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", err);
  }
};
module.exports = connectDB;
