// backend/app.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const licenseRoutes = require("./routes/license.routes");

require("./config/passport");

const app = express();

// ⭐ 1. TRUST PROXY
app.set('trust proxy', 1);

// ⭐ 2. CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://hab-creative-portfolio.vercel.app",
  "https://hab-creative-portfolio.onrender.com",
  "http://localhost:3000",
  "http://localhost:5000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`🚫 Blocked CORS request from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-Desktop-App",
    ],
    exposedHeaders: ["Set-Cookie"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ⭐ 3. RATE LIMIT - ĐƠN GIẢN HÓA (FIX IPv6 ERROR)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 500 : 9999,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  // ⭐ THÊM: standard headers để tương thích
  standardHeaders: true,
  legacyHeaders: false,
  // ⭐ BỎ: keyGenerator, skip, validate
});

// Áp dụng rate limit cho tất cả API routes
app.use("/api/", limiter);

// ⭐ Rate limit riêng cho auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 9999,
  message: {
    success: false,
    message: "Too many authentication requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/", authLimiter);

// ⭐ 4. HELMET
app.use(
  helmet({
    frameguard: {
      action: "sameorigin",
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: false,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(passport.initialize());

// ⭐ 5. HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ⭐ 6. DEBUG COOKIES
app.get("/api/debug/cookies", (req, res) => {
  res.json({
    cookies: req.cookies,
    hasAuthToken: !!req.cookies.auth_token,
    cookieNames: Object.keys(req.cookies),
  });
});

// ⭐ 7. ROUTES
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
app.use("/upload-image", require("./routes/about.route"));
app.use("/upload-avatar", require("./routes/contact.route"));

// ⭐ 8. ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    message: "Đã xảy ra lỗi server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
