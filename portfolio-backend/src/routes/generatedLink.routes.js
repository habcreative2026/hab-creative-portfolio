// backend/src/routes/generatedLink.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createGeneratedLink,
  getGeneratedLinkBySlug,
  getAllGeneratedLinks,
  deleteGeneratedLink,
} = require("../controllers/generatedLink.controller");

// Cấu hình multer (dùng memory storage để upload lên Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file hình ảnh"));
    }
  },
});

// Routes
router.post("/", authMiddleware, upload.single("image"), createGeneratedLink);
router.get("/", authMiddleware, getAllGeneratedLinks);
router.get("/:slug", getGeneratedLinkBySlug);
router.delete("/:id", authMiddleware, deleteGeneratedLink);

module.exports = router;
