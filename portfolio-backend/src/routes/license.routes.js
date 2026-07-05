// backend/routes/license.routes.js

const router = require("express").Router();
const licenseController = require("../controllers/license.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const OWNER_EMAIL = "buihaitrong.dev@gmail.com";

const isOwner = (req, res, next) => {
  if (!req.user || req.user.email.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return res.status(403).json({
      success: false,
      message: "🚫 Chỉ Owner mới có quyền truy cập License Management!",
    });
  }
  next();
};

// ===== ADMIN ROUTES =====
router.post(
  "/generate",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  isOwner,
  licenseController.generateLicenses,
);

router.get(
  "/list",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  isOwner,
  licenseController.getLicenses,
);

router.get(
  "/stats",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  isOwner,
  licenseController.getLicenseStats,
);

router.delete(
  "/:id",
  authMiddleware,
  authMiddleware.isSuperAdmin,
  isOwner,
  licenseController.revokeLicense,
);

// ===== PUBLIC ROUTES =====
router.post("/verify", licenseController.verifyLicense);
router.post("/qr/generate", licenseController.generateQR);
router.get("/qr/status/:sessionId", licenseController.checkQRStatus);

// ===== PROTECTED ROUTES =====
router.post("/qr/verify", authMiddleware, licenseController.verifyQRScan);

// ===== ⭐ THÊM DESKTOP APP ROUTES =====
router.post("/device/register", licenseController.registerDevice);
router.post("/device/verify", licenseController.verifyDeviceSession);
router.get("/device/:deviceId", licenseController.getLicenseByDevice);

module.exports = router;
