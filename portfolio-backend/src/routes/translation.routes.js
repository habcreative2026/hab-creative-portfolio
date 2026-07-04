const express = require("express");
const router = express.Router();
const transController = require("../controllers/translation.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/public", transController.getPublicTranslations);

router.get("/admin-list", authMiddleware, transController.getAdminTranslations);

router.put(
  "/bulk-update",
  authMiddleware,
  transController.bulkUpdateTranslations,
);

module.exports = router;
