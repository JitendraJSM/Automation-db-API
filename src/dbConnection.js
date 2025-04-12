require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");

const nodeEnv = process.env.NODE_ENV || "development";
const mongodbUri = process.env.LOCAL_DB_URI || "mongodb://localhost:27017/mydatabase";

console.log(`mongodbUri is : ${mongodbUri}`);
// Connection options
const options = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

// Handle initial connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongodbUri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected from MongoDB");
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("Mongoose connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
