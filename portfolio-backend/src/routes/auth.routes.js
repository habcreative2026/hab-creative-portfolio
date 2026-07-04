const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const passport = require("passport");

router.get(
  "/google",
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
