const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const passport = require("passport");

// Middleware validate Google callback
const validateGoogleCallback = (req, res, next) => {
  console.log("[Auth] ====== CALLBACK RECEIVED ======");
  console.log("[Auth] Query params:", req.query);

  if (req.query.error) {
    console.log(`[Auth] ❌ Google error: ${req.query.error}`);
    return res.redirect(
      `${process.env.CLIENT_URL}/admin/login?error=${req.query.error}`,
    );
  }

  if (req.query.code && req.query.code.length < 10) {
    console.log("[Auth] ❌ Malformed code detected");
    return res.redirect(
      `${process.env.CLIENT_URL}/admin/login?error=malformed_code`,
    );
  }

  next();
};

router.get(
  "/google",
  validateGoogleCallback,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/admin/login",
  }),
  authController.googleSuccess,
);

router.post("/logout", authController.logout);

// ❌ ĐÃ XÓA ROUTE REFRESH TOKEN
// router.post("/refresh-token", authController.refreshToken);

module.exports = router;
