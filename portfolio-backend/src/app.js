const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const subscriberRoutes = require("./routes/subscriber.route");

require("./config/passport");

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://hab-creative-portfolio.vercel.app",
  "https://hab-creative-portfolio.onrender.com",
  "https://hab-creative.com",
  "https://www.hab-creative.com",
  "https://api.hab-creative.com",
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
        console.log(`Blocked CORS request from: ${origin}`);
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
  }),
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 500 : 9999,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

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
app.use(
  helmet({
    frameguard: {
      action: "sameorigin",
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: false,
  }),
);

app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(passport.initialize());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.get("/api/debug/cookies", (req, res) => {
  res.json({
    cookies: req.cookies,
    hasAuthToken: !!req.cookies.auth_token,
    cookieNames: Object.keys(req.cookies),
  });
});

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
app.use("/api/upload", require("./routes/upload.routes"));
app.use("/api/logo", require("./routes/logo.route"));
app.use("/api/generated-links", require("./routes/generatedLink.routes"));
app.use("/api/subscribers", subscriberRoutes);

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    message: "Đã xảy ra lỗi server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;
