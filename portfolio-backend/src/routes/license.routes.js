// backend/routes/license.routes.js
const router = require("express").Router();
const licenseController = require("../controllers/license.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ⭐ ĐỊNH NGHĨA OWNER EMAIL
const OWNER_EMAIL = "buihaitrong.dev@gmail.com";

// ⭐ MIDDLEWARE KIỂM TRA OWNER
const isOwner = (req, res, next) => {
  if (!req.user || req.user.email.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return res.status(403).json({
      success: false,
      message:
        "🚫 Chỉ Owner (buihaitrong.dev@gmail.com) mới có quyền truy cập License Management!",
    });
  }
  next();
};

// ===== ADMIN ROUTES (CHỈ OWNER MỚI ĐƯỢC DÙNG) =====
router.post(
  "/generate",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  isOwner, // ⭐ THÊM MIDDLEWARE NÀY
  licenseController.generateLicenses,
);

router.get(
  "/list",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  isOwner, // ⭐ THÊM MIDDLEWARE NÀY
  licenseController.getLicenses,
);

router.get(
  "/stats",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  isOwner, // ⭐ THÊM MIDDLEWARE NÀY
  licenseController.getLicenseStats,
);

router.delete(
  "/:id",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  isOwner, // ⭐ THÊM MIDDLEWARE NÀY
  licenseController.revokeLicense,
);

// ===== PUBLIC ROUTES (Desktop App - KHÔNG CẦN AUTH) =====
router.post("/verify", licenseController.verifyLicense);
router.post("/qr/generate", licenseController.generateQR);
router.get("/qr/status/:sessionId", licenseController.checkQRStatus);

// ===== PROTECTED ROUTES (Mobile - CẦN AUTH NHƯNG KHÔNG CẦN OWNER) =====
router.post("/qr/verify", authMiddleware, licenseController.verifyQRScan);

module.exports = router;
