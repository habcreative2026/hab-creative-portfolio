// backend/controllers/license.controller.js

const License = require("../models/License");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ⭐ SỬA: Dùng Redis nếu có, không thì dùng Map nhưng có cleanup tự động
// Nếu có Redis, thay thế bằng Redis client
const qrSessions = new Map();

// ⭐ THÊM: Cleanup tự động mỗi phút
setInterval(() => {
  const now = Date.now();
  let deletedCount = 0;
  for (const [key, session] of qrSessions) {
    // Xóa session quá 2 phút
    if (now - session.createdAt > 120000) {
      qrSessions.delete(key);
      deletedCount++;
    }
  }
  if (deletedCount > 0) {
    console.log(`[QR Cleanup] Đã xóa ${deletedCount} session hết hạn`);
  }
}, 60000); // Chạy mỗi 60 giây

// ============= ADMIN FUNCTIONS =============

exports.generateLicenses = async (req, res) => {
  try {
    const { count = 1, expiresIn = 30, maxUses = 1, notes = "" } = req.body;
    const userId = req.user.id;

    if (count > 100) {
      return res.status(400).json({
        success: false,
        message: "Không thể tạo quá 100 license cùng lúc",
      });
    }

    const licenses = [];
    for (let i = 0; i < count; i++) {
      const key = await License.generateKey();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);

      const license = new License({
        key,
        expiresAt,
        maxUses,
        notes,
        status: "active",
        createdBy: userId,
      });

      await license.save();
      licenses.push(license);
    }

    // Log activity
    console.log(
      `[License] Admin ${req.user.email} đã tạo ${licenses.length} license(s)`,
    );

    res.json({
      success: true,
      message: `Đã tạo ${licenses.length} license(s) thành công`,
      licenses: licenses.map((l) => ({
        key: l.key,
        expiresAt: l.expiresAt,
        status: l.status,
      })),
    });
  } catch (error) {
    console.error("Generate license error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi tạo license",
    });
  }
};

exports.getLicenses = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await License.countDocuments(query);
    const licenses = await License.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("usedBy.userId", "email name")
      .populate("createdBy", "email name");

    res.json({
      success: true,
      data: licenses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get licenses error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách license",
    });
  }
};

exports.getLicenseStats = async (req, res) => {
  try {
    const [total, active, used, expired, revoked] = await Promise.all([
      License.countDocuments(),
      License.countDocuments({ status: "active" }),
      License.countDocuments({ status: "used" }),
      License.countDocuments({ status: "expired" }),
      License.countDocuments({ status: "revoked" }),
    ]);

    res.json({
      success: true,
      stats: { total, active, used, expired, revoked },
    });
  } catch (error) {
    console.error("Get license stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thống kê license",
    });
  }
};

exports.revokeLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const license = await License.findById(id);

    if (!license) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy license",
      });
    }

    if (license.status === "revoked") {
      return res.status(400).json({
        success: false,
        message: "License đã bị thu hồi trước đó",
      });
    }

    license.status = "revoked";
    await license.save();

    console.log(
      `[License] Admin ${req.user.email} đã thu hồi license ${license.key}`,
    );

    res.json({
      success: true,
      message: "Thu hồi license thành công",
      data: {
        key: license.key,
        status: license.status,
      },
    });
  } catch (error) {
    console.error("Revoke license error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi thu hồi license",
    });
  }
};

// ============= PUBLIC FUNCTIONS =============

// ⭐ SỬA: Verify License - Thêm validation và logging
exports.verifyLicense = async (req, res) => {
  try {
    const { licenseKey, deviceId } = req.body;

    // Validate input
    if (!licenseKey || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ licenseKey và deviceId",
      });
    }

    // Kiểm tra format
    const isValidFormat =
      /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/.test(licenseKey);
    if (!isValidFormat) {
      return res.status(400).json({
        success: false,
        message: "License key không đúng định dạng (XXXX-XXXX-XXXX-XXXX)",
      });
    }

    // ⭐ THÊM: Kiểm tra device đã dùng license nào chưa
    const existingDeviceLicense = await License.findOne({
      "usedBy.deviceId": deviceId,
      status: { $in: ["active", "used"] },
    });

    if (existingDeviceLicense) {
      console.log(
        `[License] Device ${deviceId} đã được đăng ký với license ${existingDeviceLicense.key}`,
      );
      return res.status(400).json({
        success: false,
        message: "Device này đã được đăng ký với một license khác",
        data: {
          licenseKey: existingDeviceLicense.key,
          status: existingDeviceLicense.status,
        },
      });
    }

    // Tìm license
    const license = await License.findOne({ key: licenseKey });
    if (!license) {
      console.log(`[License] Không tìm thấy license: ${licenseKey}`);
      return res.status(404).json({
        success: false,
        message: "License key không tồn tại",
      });
    }

    // Kiểm tra hiệu lực
    if (!license.isValid()) {
      let message = "License không hợp lệ";
      if (license.status === "used") message = "License đã được sử dụng";
      else if (license.status === "expired") message = "License đã hết hạn";
      else if (license.status === "revoked") message = "License đã bị thu hồi";

      console.log(`[License] License ${licenseKey} không hợp lệ: ${message}`);
      return res.status(401).json({
        success: false,
        message,
        status: license.status,
      });
    }

    // Đánh dấu đã sử dụng
    license.usedCount += 1;
    license.usedBy = {
      deviceId,
      usedAt: new Date(),
      ip: req.ip || req.connection?.remoteAddress || "unknown",
    };

    if (license.usedCount >= license.maxUses) {
      license.status = "used";
    }

    await license.save();

    console.log(
      `[License] ✅ License ${licenseKey} được xác thực thành công bởi device ${deviceId}`,
    );

    // Tạo session cho QR
    const sessionId = crypto.randomBytes(16).toString("hex");
    const token = crypto.randomBytes(32).toString("hex");

    // Lưu session với thông tin đầy đủ
    qrSessions.set(sessionId, {
      sessionId,
      token,
      deviceId,
      licenseKey,
      timestamp: Date.now(),
      status: "pending",
      createdAt: Date.now(),
      type: "desktop_auth",
      version: "1.0.0",
    });

    res.json({
      success: true,
      valid: true,
      sessionId,
      token,
      deviceId,
      license: {
        key: license.key,
        expiresAt: license.expiresAt,
        maxUses: license.maxUses,
        usedCount: license.usedCount,
      },
    });
  } catch (error) {
    console.error("Verify license error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xác thực license",
    });
  }
};

// 👉 GENERATE QR - CHỈ TẠO SESSION, KHÔNG TẠO QR
exports.generateQR = async (req, res) => {
  try {
    const { deviceId } = req.body;
    
    console.log("[QR] Creating session for device:", deviceId || 'unknown');

    const sessionId = crypto.randomBytes(16).toString("hex");
    const token = crypto.randomBytes(32).toString("hex");

    // Lưu session
    qrSessions.set(sessionId, {
      sessionId,
      token,
      deviceId: deviceId || 'desktop-' + Date.now(),
      status: 'pending',
      createdAt: Date.now()
    });

    // Auto expire sau 2 phút
    setTimeout(() => {
      const session = qrSessions.get(sessionId);
      if (session && session.status === 'pending') {
        session.status = 'expired';
        qrSessions.set(sessionId, session);
      }
    }, 120000);

    console.log("[QR] ✅ Session created:", sessionId);

    // 👉 CHỈ TRẢ VỀ SESSION ID VÀ TOKEN
    res.json({
      success: true,
      sessionId,
      token,
      expiresIn: 120,
    });
  } catch (error) {
    console.error("Generate QR error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create session",
    });
  }
};

// ⭐ SỬA: Check QR Status - Thêm logging
exports.checkQRStatus = (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu sessionId",
      });
    }

    const session = qrSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session không tồn tại hoặc đã hết hạn",
      });
    }

    // Kiểm tra hết hạn
    if (Date.now() - session.createdAt > 120000) {
      session.status = "expired";
      qrSessions.set(sessionId, session);
      return res.json({
        success: true,
        status: "expired",
        message: "QR code đã hết hạn (2 phút)",
      });
    }

    if (session.status === "verified") {
      // Tạo JWT để truy cập admin
      const webToken = jwt.sign(
        {
          sessionId,
          deviceId: session.deviceId,
          licenseKey: session.licenseKey,
          type: "qr_auth",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

      console.log(`[QR] ✅ Session ${sessionId} verified thành công`);

      return res.json({
        success: true,
        status: "verified",
        redirectUrl: `${process.env.CLIENT_URL}/admin/dashboard?token=${webToken}&session=${sessionId}`,
        token: webToken,
      });
    }

    res.json({
      success: true,
      status: session.status || "pending",
    });
  } catch (error) {
    console.error("Check QR status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra trạng thái QR",
    });
  }
};

// ===== VERIFY QR SCAN - Mobile gọi, kiểm tra WHITELIST =====
exports.verifyQRScan = (req, res) => {
  try {
    const { sessionId, token } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    console.log("[QR Verify] User email from phone:", userEmail);
    console.log("[QR Verify] User ID from phone:", userId);

    // Validate input
    if (!sessionId || !token) {
      return res.status(400).json({
        success: false,
        message: "Thiếu sessionId hoặc token",
      });
    }

    if (!userId || !userEmail) {
      return res.status(401).json({
        success: false,
        message: "User chưa đăng nhập trên điện thoại",
      });
    }

    // 👉 KIỂM TRA WHITELIST (QUAN TRỌNG)
    const ALLOWED_ADMIN_EMAILS = [
      "buihaitrong.dev@gmail.com",
      "thehaters32@gmail.com",
      "buihaitronglop962018@gmail.com",
    ];

    if (!ALLOWED_ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      console.log(`[QR Verify] ❌ User không trong whitelist: ${userEmail}`);
      return res.status(403).json({
        success: false,
        message:
          "🚫 Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên.",
      });
    }

    console.log(`[QR Verify] ✅ User trong whitelist: ${userEmail}`);

    // Kiểm tra session
    const session = qrSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session không tồn tại",
      });
    }

    if (session.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Session đã ${session.status === "verified" ? "được xác thực" : "hết hạn"}`,
      });
    }

    if (session.token !== token) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    // Kiểm tra session chưa hết hạn
    if (Date.now() - session.createdAt > 120000) {
      session.status = "expired";
      qrSessions.set(sessionId, session);
      return res.status(400).json({
        success: false,
        message: "QR code đã hết hạn",
      });
    }

    // Update session
    session.status = "verified";
    session.userId = userId;
    session.userEmail = userEmail;
    session.verifiedAt = Date.now();
    qrSessions.set(sessionId, session);

    console.log(
      `[QR] ✅ User ${userEmail} đã xác thực QR session ${sessionId} thành công`,
    );

    res.json({
      success: true,
      message: "Xác thực QR thành công!",
      data: {
        sessionId,
        verifiedAt: session.verifiedAt,
      },
    });
  } catch (error) {
    console.error("Verify QR scan error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi xác thực QR",
    });
  }
};


// ⭐ THÊM: Lấy thông tin session (debug)
exports.getSessionInfo = (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = qrSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session không tồn tại",
      });
    }

    // Không trả về token để bảo mật
    const { token, ...safeSession } = session;
    res.json({
      success: true,
      data: safeSession,
    });
  } catch (error) {
    console.error("Get session info error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin session",
    });
  }
};

// Export cleanup function để có thể gọi từ ngoài
exports.cleanupSessions = () => {
  const now = Date.now();
  let deletedCount = 0;
  for (const [key, session] of qrSessions) {
    if (now - session.createdAt > 120000) {
      qrSessions.delete(key);
      deletedCount++;
    }
  }
  return deletedCount;
};

module.exports = exports;
