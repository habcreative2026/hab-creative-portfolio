const express = require("express");
const router = express.Router();
const transController = require("../controllers/translation.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// ===================== PUBLIC =====================
router.get("/public", transController.getPublicTranslations);

// ===================== ADMIN =====================
router.get("/admin-list", authMiddleware, transController.getAdminTranslations);

router.put(
  "/bulk-update",
  authMiddleware,
  transController.bulkUpdateTranslations,
);

// 🆕 UPDATE STYLE cho 1 key
router.put(
  "/style/:key",
  authMiddleware,
  transController.updateTranslationStyle,
);

// 🆕 RESET STYLE cho 1 key
router.post(
  "/style/reset/:key",
  authMiddleware,
  transController.resetTranslationStyle,
);

module.exports = router;
