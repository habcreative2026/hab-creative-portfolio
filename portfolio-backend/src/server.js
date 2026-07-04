// backend/src/server.js
require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

// ⭐ QUAN TRỌNG: Đọc PORT từ environment
const PORT = 5000;

console.log(`🚀 Starting server in ${process.env.NODE_ENV || "development"} mode`);
console.log(`📡 PORT: ${PORT}`);
console.log(`🔗 API_URL: ${process.env.API_URL}`);
console.log(`🔗 CLIENT_URL: ${process.env.CLIENT_URL}`);

// Kết nối Database
connectDB();

// ⭐ QUAN TRỌNG: Bind server với đúng PORT
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Server bound to 0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
