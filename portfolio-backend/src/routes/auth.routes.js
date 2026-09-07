const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const passport = require("passport");

// 👉 THÊM MIDDLEWARE VALIDATE (nếu chưa có)
const validateGoogleCallback = (req, res, next) => {
  console.log("[Auth] ====== CALLBACK RECEIVED ======");
  console.log("[Auth] Query params:", req.query);
  
  if (req.query.error) {
    console.log(`[Auth] ❌ Google error: ${req.query.error}`);
    return res.redirect(`${CLIENT_URL}/admin/login?error=${req.query.error}`);
  }
  
  if (req.query.code && req.query.code.length < 10) {
    console.log("[Auth] ❌ Malformed code detected");
    return res.redirect(`${CLIENT_URL}/admin/login?error=malformed_code`);
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

router.post("/verify-2fa", authController.verify2FA);
router.post("/logout", authController.logout);

router.get("/setup-2fa", authMiddleware, authController.setup2FA);
router.post("/activate-2fa", authMiddleware, authController.activate2FA);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
