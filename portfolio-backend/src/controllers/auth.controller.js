const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");
const User = require("../models/User");
const SystemSettings = require("../models/SystemSettings"); // ⭐ THÊM

const ALLOWED_ADMIN_EMAILS = [
  "buihaitrong.dev@gmail.com",
  "thehaters32@gmail.com",
  "buihaitronglop962018@gmail.com",
];

const OWNER_EMAIL = "buihaitrong.dev@gmail.com";

// Cookie options
const getCookieOptions = (maxAgeMs) => {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: maxAgeMs,
    path: "/",
  };
};

const clearAuthCookies = (res) => {
  const options = { path: "/" };
  res.clearCookie("auth_token", options);
  res.clearCookie("temp_auth_token", options);
  res.clearCookie("refresh_token", options);
};

// ===== GOOGLE SUCCESS =====
exports.googleSuccess = async (req, res) => {
  const user = req.user;
  const CLIENT_URL = process.env.CLIENT_URL;

  console.log("🔐 [Auth] ====== GOOGLE SUCCESS ======");
  console.log("🔐 [Auth] User email:", user?.email);

  if (!user) {
    return res.redirect(`${CLIENT_URL}/auth-denied?reason=no_user`);
  }

  const normalizedEmail = user.email?.toLowerCase();

  // ⭐ CHECK BLOCKED EMAIL — QUAN TRỌNG!
  try {
    const settings = await SystemSettings.findOne();
    if (
      settings?.blockedEmails?.includes(normalizedEmail) &&
      normalizedEmail !== OWNER_EMAIL.toLowerCase()
    ) {
      console.log(`❌ [Auth] Email bị khóa: ${normalizedEmail}`);
      return res.redirect(`${CLIENT_URL}/auth-denied?reason=blocked`);
    }
  } catch (error) {
    console.error("Error checking blockedEmails:", error);
    // Nếu lỗi, vẫn tiếp tục (không chặn user)
  }

  // Check whitelist
  if (user.isWhitelisted === false) {
    console.log(`❌ [Auth] User not whitelisted: ${user?.email}`);
    return res.redirect(`${CLIENT_URL}/auth-denied?reason=not_whitelisted`);
  }

  if (!ALLOWED_ADMIN_EMAILS.includes(normalizedEmail)) {
    console.log(`❌ [Auth] Email not allowed: ${user.email}`);
    return res.redirect(`${CLIENT_URL}/auth-denied?reason=not_allowed`);
  }

  let existingUser = await User.findOne({ email: normalizedEmail });

  if (!existingUser) {
    const role =
      normalizedEmail === OWNER_EMAIL.toLowerCase() ? "super_admin" : "admin";

    existingUser = await User.create({
      oauthId: user.oauthId || user.id,
      email: normalizedEmail,
      name: user.name || user.displayName || "Admin",
      avatar: user.avatar || user.photos?.[0]?.value || "",
      role: role,
    });
  } else {
    if (
      existingUser.email === OWNER_EMAIL &&
      existingUser.role !== "super_admin"
    ) {
      existingUser.role = "super_admin";
      await existingUser.save();
    }
  }

  console.log(`✅ [Auth] Cấp token trực tiếp cho: ${existingUser.email}`);

  const authToken = generateToken(existingUser);
  res.cookie(
    "auth_token",
    authToken,
    getCookieOptions(7 * 24 * 60 * 60 * 1000),
  );

  return res.redirect(`${CLIENT_URL}/admin/dashboard`);
};

// ===== LOGOUT =====
exports.logout = (req, res) => {
  console.log("🔐 [Auth] ====== LOGOUT ======");

  clearAuthCookies(res);

  if (req.session) {
    req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
    });
  }

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  return res.json({
    success: true,
    message: "Đăng xuất thành công!",
  });
};

module.exports = exports;
