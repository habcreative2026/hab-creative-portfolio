// backend/app.js

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const licenseRoutes = require("./routes/license.routes");

require("./config/passport");

const app = express();

// ============================================
// 1. CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://habcreative-portfolio.vercel.app",
  "https://habcreative-cms.onrender.com",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Development: allow all origins
      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      // Production: check against allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`🚫 Blocked CORS request from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ⭐ QUAN TRỌNG: Cho phép gửi cookie
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Credentials",
    ],
    exposedHeaders: ["Set-Cookie", "X-Debug-Token-Set"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// ============================================
// 2. RATE LIMITING
// ============================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 9999,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// ============================================
// 3. COMPRESSION
// ============================================
app.use(compression());

// ============================================
// 4. HELMET (Security)
// ============================================
app.use(
  helmet({
    frameguard: {
      action: "sameorigin",
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // ⭐ TẮT CSP để tránh lỗi
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: "no-referrer" },
  })
);

// ============================================
// 5. LOGGING
// ============================================
app.use(morgan("dev"));

// ============================================
// 6. BODY PARSERS
// ============================================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ============================================
// 7. COOKIE PARSER
// ============================================
app.use(cookieParser());

// ============================================
// 8. PASSPORT INITIALIZATION
// ============================================
app.use(passport.initialize());

// ============================================
// 9. HEALTH CHECK
// ============================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
  });
});

// ============================================
// 10. DEBUG ENDPOINT (Kiểm tra cookie)
// ============================================
app.get("/api/debug/cookies", (req, res) => {
  res.json({
    cookies: req.cookies,
    hasAuthToken: !!req.cookies.auth_token,
    hasTempToken: !!req.cookies.temp_auth_token,
    cookieNames: Object.keys(req.cookies),
    headers: {
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer,
      userAgent: req.headers["user-agent"],
    },
    ip: req.ip || req.connection.remoteAddress,
  });
});

// ============================================
// 11. API ROUTES
// ============================================
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

// ============================================
// 12. 404 HANDLER
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.path}`,
    path: req.path,
    method: req.method,
  });
});

// ============================================
// 13. GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ Global error handler:");
  console.error("  - Error:", err.message);
  console.error("  - Stack:", err.stack);
  console.error("  - Path:", req.path);
  console.error("  - Method:", req.method);
  console.error("  - Body:", req.body);
  console.error("  - Cookies:", req.cookies);

  // Xử lý lỗi cụ thể
  let statusCode = 500;
  let message = "Đã xảy ra lỗi server";

  if (err.code === "invalid_grant") {
    statusCode = 400;
    message = "Mã xác thực Google không hợp lệ. Vui lòng thử lại.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token đã hết hạn. Vui lòng đăng nhập lại.";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Token không hợp lệ. Vui lòng đăng nhập lại.";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.code === 11000) {
    statusCode = 400;
    message = "Dữ liệu đã tồn tại trong hệ thống.";
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
    code: err.code,
    name: err.name,
  });
});

// ============================================
// 14. STARTUP LOG
// ============================================
console.log("✅ App initialized with:");
console.log(`   - Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`   - Client URL: ${process.env.CLIENT_URL}`);
console.log(`   - API URL: ${process.env.API_URL}`);
console.log(`   - CORS allowed origins:`, allowedOrigins);

module.exports = app;
