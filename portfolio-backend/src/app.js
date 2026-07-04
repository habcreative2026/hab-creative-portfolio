// backend/app.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const licenseRoutes = require("./routes/license.routes");

require("./config/passport");

const app = express();

// ⭐ SỬA: CORS với allowed headers đầy đủ
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Set-Cookie"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

// ⭐ SỬA: Helmet - Cấu hình an toàn hơn
app.use(
  helmet({
    frameguard: {
      action: "sameorigin", // Chỉ cho phép frame cùng origin
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", process.env.CLIENT_URL],
      },
    },
  }),
);

app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" })); // ⭐ Thêm limit cho file upload
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(passport.initialize());

// ⭐ THÊM: Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/translations", require("./routes/translation.routes"));
app.use("/api/links", require("./routes/link.routes"));
app.use("/api/audio", require("./routes/audio.routes"));
app.use("/api/video", require("./routes/video.routes"));
app.use("/api/marquee", require("./routes/marquee.route"));
app.use("/api/cards", require("./routes/card.route"));
app.use("/api/projects", require("./routes/project.route"));
app.use("/api/about", require("./routes/about.route"));
app.use("/api/contact", require("./routes/contact.route"));
app.use("/api/settings", require("./routes/settings.routes"));
app.use("/api/license", licenseRoutes);

// ⭐ THÊM: Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    message: "Đã xảy ra lỗi server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
