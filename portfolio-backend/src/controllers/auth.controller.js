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

const DESKTOP_SCHEME = 'portfolio://';

const getCookieOptions = (maxAgeMs) => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: true,        // ⭐ LUÔN TRUE
    sameSite: "none",    // ⭐ LUÔN NONE (quan trọng)
    maxAge: maxAgeMs,
    path: '/',
  };
};

// SỬA clearAuthCookies
const clearAuthCookies = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  const options = {
    path: '/',
  };
  res.clearCookie("auth_token", options);
  res.clearCookie("temp_auth_token", options);
  res.clearCookie("refresh_token", options);
};

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

    // 👉 REDIRECT VỀ DESKTOP APP VỚI TOKEN 2FA
    const redirectUrl = `${DESKTOP_SCHEME}auth/2fa?token=${tempToken}&email=${existingUser.email}`;
    
    // 👉 HIỂN THỊ TRANG "ACCESS GRANTED" TRÊN TRÌNH DUYỆT
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Access Granted</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0B0F19;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            color: white;
          }
          .container {
            text-align: center;
            max-width: 400px;
            padding: 40px;
            background: #131A2C;
            border-radius: 24px;
            border: 1px solid #1E293B;
          }
          .icon { font-size: 72px; margin-bottom: 20px; }
          .title { font-size: 28px; font-weight: 700; color: #34D399; margin-bottom: 10px; }
          .subtitle { color: #94A3B8; font-size: 14px; margin-bottom: 30px; line-height: 1.6; }
          .loading {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 3px solid #1E293B;
            border-top: 3px solid #34D399;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .info { margin-top: 20px; font-size: 12px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">Access Granted</div>
          <div class="subtitle">
            Xác thực thành công!<br>
            Vui lòng quay lại ứng dụng desktop để nhập mã OTP.
          </div>
          <div class="loading"></div>
          <div class="info">Email: ${existingUser.email}</div>
          <button onclick="openApp()" style="margin-top:20px;padding:12px 30px;background:#3B82F6;border:none;border-radius:12px;color:white;font-weight:600;cursor:pointer;font-size:14px;">
            Mở ứng dụng
          </button>
        </div>
        
        <script>
          function openApp() {
            window.location.href = '${redirectUrl}';
          }
          
          // Tự động mở sau 2s
          setTimeout(openApp, 2000);
        </script>
      </body>
      </html>
    `);
  }

  // 👉 KHÔNG 2FA
  const authToken = generateToken(existingUser);

  res.cookie(
    "auth_token",
    authToken,
    getCookieOptions(7 * 24 * 60 * 60 * 1000),
  );

  // 👉 REDIRECT VỀ DESKTOP APP
  const redirectUrl = `${DESKTOP_SCHEME}auth/success?token=${authToken}`;
  
  return res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Access Granted</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0B0F19;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          color: white;
        }
        .container {
          text-align: center;
          max-width: 400px;
          padding: 40px;
          background: #131A2C;
          border-radius: 24px;
          border: 1px solid #1E293B;
        }
        .icon { font-size: 72px; margin-bottom: 20px; }
        .title { font-size: 28px; font-weight: 700; color: #34D399; margin-bottom: 10px; }
        .subtitle { color: #94A3B8; font-size: 14px; margin-bottom: 30px; line-height: 1.6; }
        .loading {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 3px solid #1E293B;
          border-top: 3px solid #34D399;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .info { margin-top: 20px; font-size: 12px; color: #475569; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="title">Access Granted</div>
        <div class="subtitle">
          Xác thực thành công!<br>
          Đang chuyển hướng về ứng dụng desktop...
        </div>
        <div class="loading"></div>
        <div class="info">Email: ${existingUser.email}</div>
      </div>
      
      <script>
        setTimeout(() => {
          window.location.href = '${redirectUrl}';
        }, 1500);
      </script>
    </body>
    </html>
  `);
};

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

    // ⭐ SỬA: Clear temp token và tạo auth token mới
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

// ⭐ SỬA: Logout - Clear tất cả cookies
exports.logout = (req, res) => {
  clearAuthCookies(res);
  return res.json({
    success: true,
    message: "Đăng xuất thành công!",
  });
};

exports.setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `HAB CREATIVE (${req.user.email})`, // ⭐ Thêm email để phân biệt
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

exports.refreshToken = async (req, res) => {
  try {
    // ⭐ SỬA: Lấy auth_token từ cookie
    const token = req.cookies.auth_token;

    if (!token) {
      console.log(`❌ [Refresh] No auth_token in cookies`);
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token.",
      });
    }

    // ⭐ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User không tồn tại.",
      });
    }

    // ⭐ Tạo token mới
    const newAuthToken = generateToken(user);

    // ⭐ Set cookie mới
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
