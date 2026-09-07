// backend/src/routes/generatedLink.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { uploadImage } = require("../config/cloudinary"); // Dùng uploadImage có sẵn
const {
  createGeneratedLink,
  getGeneratedLinkBySlug,
  getAllGeneratedLinks,
  deleteGeneratedLink,
} = require("../controllers/generatedLink.controller");

// Routes
router.post(
  "/",
  authMiddleware,
  uploadImage.single("image"),
  createGeneratedLink,
);
router.get("/", authMiddleware, getAllGeneratedLinks);
router.get("/:slug", getGeneratedLinkBySlug);
router.delete("/:id", authMiddleware, deleteGeneratedLink);

module.exports = router;
