require("dotenv").config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err);
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require("./app");
const connectDB = require("./dbConnection.js");

// Connect to MongoDB
connectDB();

const port = process.env.PORT || 3000;

// Start server
const server = app.listen(port, () => {
  console.log(`App running on http://localhost:${port}...`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
