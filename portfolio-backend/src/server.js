// backend/src/server.js
require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

console.log(
  `🚀 Starting server in ${process.env.NODE_ENV || "development"} mode`,
);
console.log(`📡 PORT: ${PORT}`);
console.log(`🔗 API_URL: ${process.env.API_URL}`);
console.log(`🔗 CLIENT_URL: ${process.env.CLIENT_URL}`);

// Kết nối Database
connectDB();

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
