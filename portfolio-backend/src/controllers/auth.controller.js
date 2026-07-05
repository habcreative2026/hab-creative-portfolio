// backend/controllers/auth.controller.js

const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const generateToken = require("../utils/generateToken");
const User = require("../models/User");

const ALLOWED_ADMIN_EMAILS = [
  "buihaitrong.dev@gmail.com",
  "thehaters32@gmail.com",
  "buihaitronglop962018@gmail.com",
];

// ⭐ SỬA: Cookie options - domain frontend
const getCookieOptions = (maxAgeMs) => {
  const isProd = process.env.NODE_ENV === "production";
  
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: maxAgeMs,
    path: "/",
    // ⭐ Set domain cho frontend
    domain: isProd ? ".habcreative-portfolio.vercel.app" : undefined,
  };
};

// ⭐ SỬA: Clear auth cookies
const clearAuthCookies = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  const domain = isProd ? ".habcreative-portfolio.vercel.app" : undefined;
  
  const options = {
    path: "/",
    domain: domain,
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };
  
  res.clearCookie("auth_token", options);
  res.clearCookie("temp_auth_token", options);
  res.clearCookie("refresh_token", options);
  
  console.log("✅ All auth cookies cleared");
};

// ===== GOOGLE SUCCESS =====
exports.googleSuccess = async (req, res) => {
  const user = req.user;
  const CLIENT_URL = process.env.CLIENT_URL;

  console.log("🔐 [Auth] ====== GOOGLE SUCCESS ======");
  console.log("🔐 [Auth] User email:", user?.email);

  if (!user || user.isWhitelisted === false) {
    console.log(`❌ [Auth] User not whitelisted: ${user?.email}`);
    return res.redirect(`${CLIENT_URL}/auth-denied`);
  }

  if (!ALLOWED_ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
    console.log(`❌ [Auth] Email not allowed: ${user.email}`);
    return res.redirect(`${CLIENT_URL}/auth-denied`);
  }

  let existingUser = await User.findOne({ email: user.email.toLowerCase() });

  if (!existingUser) {
    const role =
      user.email.toLowerCase() === "buihaitrong.dev@gmail.com"
        ? "super_admin"
        : "admin";

    existingUser = await User.create({
      oauthId: user.oauthId || user.id,
      email: user.email.toLowerCase(),
      name: user.name || user.displayName || "Admin",
      avatar: user.avatar || user.photos?.[0]?.value || "",
      role: role,
    });
  } else {
    if (
      existingUser.email === "buihaitrong.dev@gmail.com" &&
      existingUser.role !== "super_admin"
    ) {
      existingUser.role = "super_admin";
      await existingUser.save();
    }
  }

  // 👉 CHECK 2FA
  if (existingUser.twoFactorSecret) {
    console.log(`🔐 [Auth] 2FA ENABLED for ${existingUser.email}`);

    res.clearCookie("auth_token", getCookieOptions(0));

    const tempToken = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
        isPending2FA: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: "5m" },
    );

    res.cookie("temp_auth_token", tempToken, getCookieOptions(5 * 60 * 1000));
    return res.redirect(`${CLIENT_URL}/admin/login?status=require2fa`);
  }

  // 👉 KHÔNG 2FA
  const authToken = generateToken(existingUser);
  res.cookie(
    "auth_token",
    authToken,
    getCookieOptions(7 * 24 * 60 * 60 * 1000),
  );

  console.log(`✅ [Auth] Token set for: ${existingUser.email}`);
  return res.redirect(`${CLIENT_URL}/admin/dashboard`);
};

// ===== VERIFY 2FA =====
exports.verify2FA = async (req, res) => {
  try {
    const token = String(req.body.token).trim();
    const tempToken = req.cookies.temp_auth_token;

    if (!tempToken) {
      return res.status(401).json({
        success: false,
        message:
          "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại với Google.",
      });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.isPending2FA) {
      return res.status(401).json({
        success: false,
        message: "Yêu cầu không hợp lệ.",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.twoFactorSecret) {
      return res.status(404).json({
        success: false,
        message: "Tài khoản chưa kích hoạt bảo mật 2FA.",
      });
    }

    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token,
      window: 2,
    });

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: "Mã bảo mật OTP không chính xác hoặc đã hết hạn.",
      });
    }

    res.clearCookie("temp_auth_token", getCookieOptions(0));
    const authToken = generateToken(user);

    res.cookie(
      "auth_token",
      authToken,
      getCookieOptions(7 * 24 * 60 * 60 * 1000),
    );

    return res.json({
      success: true,
      message: "Xác thực hai lớp thành công!",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("2FA Verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Mã phiên xác thực không hợp lệ.",
    });
  }
};

// ===== LOGOUT =====
exports.logout = (req, res) => {
  console.log("🔓 Logout called");
  clearAuthCookies(res);
  return res.json({
    success: true,
    message: "Đăng xuất thành công!",
  });
};

// ===== SETUP 2FA =====
exports.setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `HAB CREATIVE (${req.user.email})`,
    });

    QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) {
        console.error("QR Generate error:", err);
        return res.status(500).json({
          success: false,
          message: "Lỗi sinh mã QR Code.",
        });
      }

      return res.json({
        success: true,
        secret: secret.base32,
        qrCode: data_url,
      });
    });
  } catch (error) {
    console.error("Setup 2FA error:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi hệ thống.",
    });
  }
};

// ===== ACTIVATE 2FA =====
exports.activate2FA = async (req, res) => {
  try {
    const { token, secret } = req.body;

    if (!token || !secret) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ mã OTP và Secret.",
      });
    }

    const isVerified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 1,
    });

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: "Mã OTP xác nhận không hợp lệ.",
      });
    }

    await User.findByIdAndUpdate(req.user.id, { twoFactorSecret: secret });

    return res.json({
      success: true,
      message: "Kích hoạt bảo mật 2FA thành công!",
    });
  } catch (error) {
    console.error("Activate 2FA error:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể kích hoạt bảo mật.",
    });
  }
};

// ===== REFRESH TOKEN =====
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      console.log(`❌ [Refresh] No auth_token in cookies`);
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User không tồn tại.",
      });
    }

    const newAuthToken = generateToken(user);

    res.cookie(
      "auth_token",
      newAuthToken,
      getCookieOptions(7 * 24 * 60 * 60 * 1000),
    );

    console.log(`✅ [Refresh] New token issued for: ${user.email}`);

    return res.json({
      success: true,
      message: "Refresh token thành công!",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(401).json({
      success: false,
      message: "Refresh token không hợp lệ hoặc đã hết hạn.",
    });
  }
};

module.exports = exports;
