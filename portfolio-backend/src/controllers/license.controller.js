const License = require("../models/License");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// QR Sessions
const qrSessions = new Map();

// Cleanup sessions
setInterval(() => {
  const now = Date.now();
  let deletedCount = 0;
  for (const [key, session] of qrSessions) {
    if (now - session.createdAt > 120000) {
      qrSessions.delete(key);
      deletedCount++;
    }
  }
  if (deletedCount > 0) {
    console.log(`[QR Cleanup] Đã xóa ${deletedCount} session hết hạn`);
  }
}, 60000);

// ============= ADMIN FUNCTIONS =============

// 👉 TẠO LICENSE - THÊM THỜI HẠN
exports.generateLicenses = async (req, res) => {
  try {
    const { 
      count = 1, 
      expiresIn = 30, 
      maxUses = 1, 
      notes = "",
      licenseDuration = "30d" // 3d, 5d, 7d, 30d, forever
    } = req.body;
    const userId = req.user.id;

    if (count > 100) {
      return res.status(400).json({
        success: false,
        message: "Không thể tạo quá 100 license cùng lúc",
      });
    }

    // 👉 TÍNH TOÁN THỜI HẠN
    const getLicenseExpiresAt = (duration) => {
      const date = new Date();
      if (duration === 'forever') {
        date.setFullYear(date.getFullYear() + 100);
        return date;
      }
      const days = parseInt(duration);
      if (isNaN(days)) {
        date.setDate(date.getDate() + 30);
        return date;
      }
      date.setDate(date.getDate() + days);
      return date;
    };

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
        licenseExpiresAt: getLicenseExpiresAt(licenseDuration),
      });

      await license.save();
      licenses.push(license);
    }

    console.log(
      `[License] Admin đã tạo ${licenses.length} license(s) với hạn ${licenseDuration}`,
    );

    res.json({
      success: true,
      message: `Đã tạo ${licenses.length} license(s) thành công`,
      licenses: licenses.map((l) => ({
        key: l.key,
        expiresAt: l.expiresAt,
        licenseExpiresAt: l.licenseExpiresAt,
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

// 👉 LẤY DANH SÁCH LICENSE
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

// 👉 THỐNG KÊ LICENSE
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

// 👉 THU HỒI LICENSE
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

    license.status = "revoked";
    await license.save();

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

// 👉 VERIFY LICENSE - CHO GIẢI NÉN ZIP
exports.verifyLicense = async (req, res) => {
  try {
    const { licenseKey, deviceId, deviceInfo } = req.body;

    if (!licenseKey || !deviceId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp licenseKey và deviceId",
      });
    }

    const isValidFormat = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/.test(licenseKey);
    if (!isValidFormat) {
      return res.status(400).json({
        success: false,
        message: "License key không đúng định dạng",
      });
    }

    const license = await License.findOne({ key: licenseKey });
    if (!license) {
      return res.status(404).json({
        success: false,
        message: "License key không tồn tại",
      });
    }

    // 👉 KIỂM TRA HIỆU LỰC
    if (!license.isValid()) {
      let message = "License không hợp lệ";
      if (license.status === "used") message = "License đã được sử dụng";
      else if (license.status === "expired") message = "License đã hết hạn";
      else if (license.status === "revoked") message = "License đã bị thu hồi";
      return res.status(401).json({
        success: false,
        message,
        status: license.status,
      });
    }

    // 👉 KIỂM TRA THỜI HẠN SỬ DỤNG
    if (!license.isLicenseValid()) {
      return res.status(401).json({
        success: false,
        message: "License đã hết hạn sử dụng",
        status: "expired",
      });
    }

    // 👉 ĐÁNH DẤU ĐÃ SỬ DỤNG
    license.usedCount += 1;
    license.usedBy = {
      deviceId,
      usedAt: new Date(),
      ip: req.ip || req.connection?.remoteAddress || "unknown",
    };
    license.deviceInfo = deviceInfo || {};

    if (license.usedCount >= license.maxUses) {
      license.status = "used";
    }

    await license.save();

    console.log(`[License] ✅ License ${licenseKey} được xác thực thành công`);

    // 👉 TẠO SESSION CHO QR
    const sessionId = crypto.randomBytes(16).toString("hex");
    const token = crypto.randomBytes(32).toString("hex");

    qrSessions.set(sessionId, {
      sessionId,
      token,
      deviceId,
      licenseKey,
      licenseExpiresAt: license.licenseExpiresAt,
      timestamp: Date.now(),
      status: "pending",
      createdAt: Date.now(),
      type: "desktop_auth",
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
        licenseExpiresAt: license.licenseExpiresAt,
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

// 👉 GENERATE QR
exports.generateQR = async (req, res) => {
  try {
    const { deviceId } = req.body;
    
    console.log("[QR] Generating QR for device:", deviceId || 'unknown');

    const sessionId = crypto.randomBytes(16).toString("hex");
    const token = crypto.randomBytes(32).toString("hex");

    qrSessions.set(sessionId, {
      sessionId,
      token,
      deviceId: deviceId || 'desktop-' + Date.now(),
      status: 'pending',
      createdAt: Date.now()
    });

    setTimeout(() => {
      const session = qrSessions.get(sessionId);
      if (session && session.status === 'pending') {
        session.status = 'expired';
        qrSessions.set(sessionId, session);
      }
    }, 120000);

    console.log("[QR] ✅ QR generated for session:", sessionId);

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
      message: "Failed to generate QR",
    });
  }
};

// 👉 CHECK QR STATUS
exports.checkQRStatus = (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = qrSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session không tồn tại hoặc đã hết hạn",
      });
    }

    if (Date.now() - session.createdAt > 120000) {
      session.status = "expired";
      qrSessions.set(sessionId, session);
      return res.json({
        success: true,
        status: "expired",
        message: "QR code đã hết hạn",
      });
    }

    if (session.status === "verified") {
      const webToken = jwt.sign(
        {
          sessionId,
          deviceId: session.deviceId,
          licenseKey: session.licenseKey,
          licenseExpiresAt: session.licenseExpiresAt,
          type: "qr_auth",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
      );

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

// 👉 VERIFY QR SCAN
exports.verifyQRScan = (req, res) => {
  try {
    const { sessionId, token } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    console.log("[QR Verify] User email:", userEmail);

    if (!sessionId || !token) {
      return res.status(400).json({
        success: false,
        message: "Thiếu sessionId hoặc token",
      });
    }

    if (!userId || !userEmail) {
      return res.status(401).json({
        success: false,
        message: "User chưa đăng nhập",
      });
    }

    // 👉 KIỂM TRA WHITELIST
    const ALLOWED_ADMIN_EMAILS = [
      "buihaitrong.dev@gmail.com",
      "thehaters32@gmail.com",
      "buihaitronglop962018@gmail.com",
    ];

    if (!ALLOWED_ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      console.log(`[QR Verify] ❌ User không trong whitelist: ${userEmail}`);
      return res.status(403).json({
        success: false,
        message: "🚫 Bạn không có quyền truy cập. Vui lòng liên hệ quản trị viên.",
      });
    }

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

    if (Date.now() - session.createdAt > 120000) {
      session.status = "expired";
      qrSessions.set(sessionId, session);
      return res.status(400).json({
        success: false,
        message: "QR code đã hết hạn",
      });
    }

    session.status = "verified";
    session.userId = userId;
    session.userEmail = userEmail;
    session.verifiedAt = Date.now();
    qrSessions.set(sessionId, session);

    console.log(`[QR] ✅ User ${userEmail} đã xác thực QR thành công`);

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

module.exports = exports;
