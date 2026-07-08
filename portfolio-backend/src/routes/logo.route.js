// backend/routes/logo.route.js
const express = require("express");
const router = express.Router();
const logoController = require("../controllers/logo.controller");
const { uploadImage } = require("../config/cloudinary");

router.get("/", logoController.getLogoInfo);

router.put("/", logoController.updateLogoInfo);

router.post(
  "/upload-image",
  uploadImage.single("logoImage"),
  logoController.updateLogoImage,
);

router.delete("/reset", logoController.resetLogoInfo);

module.exports = router;
